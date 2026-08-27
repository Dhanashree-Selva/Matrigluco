import logging
import math
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.exceptions import (
    PredictionNotFoundError,
    ModelVersionNotRegisteredError,
    AuthorizationError,
)
from app.models.user import User
from app.models.risk_assessment import RiskAssessment, RiskAssessmentFeature, Prediction
from app.models.model_version import ModelVersion
from app.repositories.risk_repository import RiskRepository
from app.repositories.model_repository import ModelRepository
from app.repositories.audit_repository import AuditRepository
from app.repositories.prediction_repository import PredictionRepository
from app.ml.inference.predictor import MLInferenceService, RawPrediction
from app.ml.inference.feature_contract import (
    MODEL_FEATURE_ORDER,
    FEATURE_UNITS,
    DiabetesRiskFeatures,
    PreparedInferenceInput,
)
from app.ml.inference.feature_mapper import prepare_inference_input
from app.schemas.prediction import (
    PredictionCreateRequest,
    PredictionDetailResponse,
    PredictionModelReference,
    PredictionListItem,
    PredictionListResponse,
    PredictionPaginationMeta,
    PredictionModelInfoResponse,
    PredictionRequest,
    FeatureContributionDTO,
    ExplainabilityPayloadDTO,
    PredictionResponse,
    PredictionSaveRequest,
    PredictionRead,
)
from app.cache.keys import user_dashboard_key
from app.cache.service import CacheService

logger = logging.getLogger("matrigluco.services.prediction")
settings = get_settings()


class PredictionService:
    """
    Authoritative application service orchestrating clinical diabetes risk assessment:
    Authentication / Ownership Enforcement -> Domain Mapping & Provenance -> Canonical Validation ->
    ML Inference -> Atomic Persistence (Assessment + Exact Input Snapshot + 8 Provenance Feature Rows + Audit Log) ->
    Dashboard Cache Invalidation -> Typed DTO Responses.
    """

    def __init__(
        self,
        db: Session,
        ml_service: Optional[MLInferenceService] = None,
        cache: Optional[CacheService] = None,
    ):
        self.db = db
        self.risk_repo = RiskRepository(db)
        self.model_repo = ModelRepository(db)
        self.audit_repo = AuditRepository(db)
        self.legacy_pred_repo = PredictionRepository(db)
        self.ml_service = ml_service or MLInferenceService()
        self.cache = cache or CacheService()

    def _resolve_model_version(self, model_key: str, version: str) -> ModelVersion:
        """Resolves registered model version or registers active bundle in MySQL."""
        mv = self.model_repo.get_by_key_and_version(model_key, version)
        if not mv:
            bundle = self.ml_service.loader.get_bundle(model_key, version)
            mv = self.model_repo.register_model_version(
                model_key=model_key,
                version=version,
                framework=bundle.metadata.get("framework", "scikit-learn"),
                model_class=bundle.metadata.get("model_class"),
                preprocessor_class=bundle.metadata.get("preprocessor_class"),
                feature_contract_version=bundle.metadata.get("feature_contract_version", "1.0"),
                artifact_path=str(self.ml_service.loader.artifact_base_path / model_key / version),
                metadata_path=str(
                    self.ml_service.loader.artifact_base_path
                    / model_key
                    / version
                    / "metadata.json"
                ),
                model_checksum=bundle.model_sha256,
                preprocessor_checksum=bundle.preprocessor_sha256,
                feature_schema_sha256=bundle.feature_schema_sha256,
                feature_order_json=list(MODEL_FEATURE_ORDER),
                thresholds_json=bundle.metadata.get("risk_thresholds"),
                metrics_json=bundle.metadata.get("metrics"),
                imputation_policy_json=bundle.metadata.get("imputation_policy"),
                is_active=True,
            )
            self.db.flush()
        return mv

    # ─── Production Risk Assessment CRUD ──────────────────────────────────────

    def create_assessment(
        self,
        payload: PredictionCreateRequest,
        actor: User,
        source: str = "manual",
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> PredictionDetailResponse:
        """
        Executes clinical ML inference and transactionally persists the assessment
        with an immutable pre-preprocessor input snapshot, granular feature provenance, and audit logs.
        """
        # 1. Map input with full lineage and governance checks
        input_data = payload.model_dump(exclude_unset=True)
        prepared_input: PreparedInferenceInput = prepare_inference_input(
            raw_features=input_data,
            source_type=source,
        )

        # 2. Run deterministic inference pipeline
        raw_pred: RawPrediction = self.ml_service.evaluate_prepared(prepared_input)

        # 3. Resolve database model version entity
        model_ver = self._resolve_model_version(raw_pred.model_key, raw_pred.model_version)

        try:
            # 4. Build persistent RiskAssessment record with immutable normalized snapshot
            feat_dict = raw_pred.canonical_features.to_canonical_dict()

            assessment = RiskAssessment(
                user_id=actor.id,
                model_version_id=model_ver.id,
                source=source,
                probability=raw_pred.probability,
                risk_band=raw_pred.risk_band,
                prediction_result=raw_pred.prediction_result,
                assessment_status="completed",
                feature_contract_version=prepared_input.feature_contract_version,
                mapping_version=prepared_input.mapping_version,
                input_snapshot_json=feat_dict,
                contains_imputed_values=prepared_input.contains_imputed_values,
            )

            # 5. Build exact 8 canonical feature rows with full provenance
            feature_rows: List[RiskAssessmentFeature] = []

            for feat in prepared_input.features:
                feature_rows.append(
                    RiskAssessmentFeature(
                        feature_name=feat.name,
                        feature_value=feat.normalized_value,
                        normalized_value=feat.normalized_value,
                        raw_value=feat.raw_value,
                        feature_order=feat.order,
                        unit=feat.unit,
                        source_type=feat.provenance.source_type,
                        source_reference=feat.provenance.source_reference,
                        is_derived=feat.provenance.is_derived,
                        derivation_method=feat.provenance.derivation_method,
                        is_imputed=feat.provenance.is_imputed,
                        imputation_strategy=feat.provenance.imputation_strategy,
                        imputation_policy_version=feat.provenance.imputation_policy_version,
                    )
                )

            # 6. Atomically persist assessment and feature rows
            self.risk_repo.create_assessment_with_features(assessment, feature_rows)

            # 7. Record audit event
            self.audit_repo.record_event(
                event_type="RISK_ASSESSMENT_CREATED",
                user_id=actor.id,
                details={
                    "assessment_public_id": assessment.public_id,
                    "model_key": raw_pred.model_key,
                    "model_version": raw_pred.model_version,
                    "risk_band": raw_pred.risk_band,
                    "source": source,
                    "contains_imputed_values": prepared_input.contains_imputed_values,
                },
                ip_address=ip_address,
                user_agent=user_agent,
            )

            # 8. Commit database transaction
            self.db.commit()

            # 9. Invalidate transient dashboard cache
            self.cache.delete(user_dashboard_key(actor.id))

            logger.info(
                f"Successfully persisted risk assessment '{assessment.public_id}' "
                f"for user '{actor.id}' (risk: {raw_pred.risk_band}, prob: {raw_pred.probability:.4f})."
            )

            explainability_payload = None
            if raw_pred.explainability:
                explainability_payload = ExplainabilityPayloadDTO(
                    method=raw_pred.explainability.get("method", "Linear Log-Odds Attribution"),
                    version=raw_pred.explainability.get("version", "1.0.0"),
                    contributions=[
                        FeatureContributionDTO(**c)
                        for c in raw_pred.explainability.get("contributions", [])
                    ],
                )

            return PredictionDetailResponse(
                id=assessment.public_id,
                probability=raw_pred.probability,
                probability_score=raw_pred.probability_score,
                risk_band=raw_pred.risk_band,
                prediction_result=raw_pred.prediction_result,
                source=source,
                model=PredictionModelReference(
                    key=raw_pred.model_key,
                    version=raw_pred.model_version,
                    algorithm=raw_pred.algorithm,
                    framework=model_ver.framework,
                ),
                features_snapshot=feat_dict,
                contains_imputed_values=prepared_input.contains_imputed_values,
                mapping_version=prepared_input.mapping_version,
                created_at=assessment.created_at,
                explainability=explainability_payload,
            )
        except Exception:
            self.db.rollback()
            raise

    def get_assessment_detail(self, assessment_id: str, actor: User) -> PredictionDetailResponse:
        """Retrieves specific assessment with 8 canonical features, strictly scoped to owner."""
        assessment = self.risk_repo.get_owned_assessment_by_id(
            assessment_id=assessment_id,
            user_id=actor.id,
        )
        if not assessment:
            raise PredictionNotFoundError(identifier=assessment_id)

        # Reconstruct canonical feature snapshot from ordered feature rows (or input_snapshot_json)
        features_snapshot: Dict[str, float] = assessment.input_snapshot_json or {}
        if not features_snapshot:
            for feat in assessment.features:
                features_snapshot[feat.feature_name] = feat.feature_value

        mv = assessment.model_version
        prob_score = round(assessment.probability * 100.0, 2)

        # Compute explainability from features snapshot using active model bundle
        explainability_payload = None
        if features_snapshot:
            try:
                evaluated = self.ml_service.evaluate(
                    raw_features=features_snapshot,
                    version=mv.version if mv else "1.0.0",
                )
                if evaluated.explainability:
                    explainability_payload = ExplainabilityPayloadDTO(
                        method=evaluated.explainability.get("method", "Linear Log-Odds Attribution"),
                        version=evaluated.explainability.get("version", "1.0.0"),
                        contributions=[
                            FeatureContributionDTO(**c)
                            for c in evaluated.explainability.get("contributions", [])
                        ],
                    )
            except Exception as ex_err:
                logger.warning(f"Could not compute explainability on detail retrieval: {ex_err}")

        return PredictionDetailResponse(
            id=assessment.public_id,
            probability=assessment.probability,
            probability_score=prob_score,
            risk_band=assessment.risk_band,
            prediction_result=assessment.prediction_result,
            source=assessment.source,
            model=PredictionModelReference(
                key=mv.model_key if mv else "diabetes-risk",
                version=mv.version if mv else "1.0.0",
                algorithm=mv.framework if mv else "scikit-learn",
                framework=mv.framework if mv else "scikit-learn",
            ),
            features_snapshot=features_snapshot,
            contains_imputed_values=bool(assessment.contains_imputed_values),
            mapping_version=getattr(assessment, "mapping_version", "1.0") or "1.0",
            created_at=assessment.created_at,
            explainability=explainability_payload,
        )

    def list_user_assessments(
        self,
        actor: User,
        page: int = 1,
        page_size: int = 20,
        risk_band: Optional[str] = None,
        source: Optional[str] = None,
    ) -> PredictionListResponse:
        """Queries paginated risk evaluations strictly owned by the authenticated user."""
        skip = (page - 1) * page_size
        items, total = self.risk_repo.list_owned_assessments(
            user_id=actor.id,
            skip=skip,
            limit=page_size,
            risk_band=risk_band,
            source=source,
        )

        pages = math.ceil(total / page_size) if total > 0 else 0
        list_items = [
            PredictionListItem(
                id=item.public_id,
                probability=item.probability,
                probability_score=round(item.probability * 100.0, 2),
                risk_band=item.risk_band,
                prediction_result=item.prediction_result,
                source=item.source,
                model_version=item.model_version.version if item.model_version else "1.0.0",
                contains_imputed_values=bool(item.contains_imputed_values),
                created_at=item.created_at,
            )
            for item in items
        ]

        return PredictionListResponse(
            items=list_items,
            pagination=PredictionPaginationMeta(
                page=page,
                page_size=page_size,
                total=total,
                pages=pages,
            ),
        )

    def delete_assessment(self, assessment_id: str, actor: User) -> None:
        """Soft-deletes / archives a risk assessment owned by the authenticated user."""
        assessment = self.risk_repo.get_owned_assessment_by_id(
            assessment_id=assessment_id,
            user_id=actor.id,
        )
        if not assessment:
            raise PredictionNotFoundError(identifier=assessment_id)

        try:
            self.risk_repo.soft_delete_assessment(assessment)
            self.audit_repo.record_event(
                event_type="RISK_ASSESSMENT_ARCHIVED",
                user_id=actor.id,
                details={"assessment_public_id": assessment.public_id},
            )
            self.db.commit()
            self.cache.delete(user_dashboard_key(actor.id))
        except Exception:
            self.db.rollback()
            raise

    def get_model_info(
        self, model_key: str = "diabetes-risk", version: str = "1.0.0"
    ) -> PredictionModelInfoResponse:
        """Retrieves safe educational Model Card and evaluation metrics."""
        bundle = self.ml_service.loader.get_bundle(model_key, version)
        meta = bundle.metadata
        return PredictionModelInfoResponse(
            model_key=bundle.model_key,
            version=bundle.version,
            framework=meta.get("framework", "scikit-learn"),
            algorithm=meta.get("algorithm", "LogisticRegression"),
            feature_contract_version=meta.get("feature_contract_version", "1.0"),
            feature_order=meta.get("feature_order", list(MODEL_FEATURE_ORDER)),
            metrics=meta.get("metrics"),
            evaluation_dataset=meta.get("evaluation_dataset"),
            imputation_policy=meta.get("imputation_policy"),
            clinical_positioning=meta.get("clinical_positioning"),
        )

    # ─── Backward Compatibility Methods ───────────────────────────────────────

    def run_prediction(self, request: PredictionRequest) -> PredictionResponse:
        """Executes pure ML inference without persisting state."""
        features = request.model_dump()
        result = self.ml_service.predict_diabetes_risk(features)
        return PredictionResponse(**result)

    def save_prediction(
        self, request: PredictionSaveRequest, actor: Optional[User] = None
    ) -> PredictionRead:
        """Legacy persistence adapter into predictions table."""
        target_user_id = actor.id if actor else request.user_id

        pred = Prediction(
            user_id=target_user_id,
            glucose=request.glucose,
            bmi=request.bmi,
            pregnancies=request.pregnancies or 0,
            blood_pressure=request.blood_pressure or 0.0,
            skin_thickness=request.skin_thickness or 0.0,
            insulin=request.insulin or 0.0,
            diabetes_pedigree=request.diabetes_pedigree or 0.0,
            age=request.age or 0,
            prediction_result=request.prediction_result,
            risk_level=request.risk_level,
            probability_score=request.probability_score,
            prediction_score=request.probability_score,
        )

        try:
            saved = self.legacy_pred_repo.create(pred)
            if target_user_id:
                self.cache.delete(user_dashboard_key(target_user_id))
            return PredictionRead.model_validate(saved)
        except Exception as e:
            logger.error(f"Failed to persist legacy prediction: {e}")
            self.db.rollback()
            raise

    def get_user_history(
        self, user_id: str, actor: Optional[User] = None, skip: int = 0, limit: int = 50
    ) -> List[PredictionRead]:
        """Legacy history query with ownership check."""
        if actor and actor.id != user_id:
            raise AuthorizationError(
                "Access denied: cannot view another patient's medical history."
            )

        records = self.legacy_pred_repo.list_owned(user_id, skip=skip, limit=limit)
        return [PredictionRead.model_validate(r) for r in records]
