import uuid
import os
import shutil
import tempfile
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, Depends, HTTPException
import pymupdf as fitz
from app.models.schemas import SaveReportRequest
from app.services.report_service import ReportService
from app.api.dependencies import get_report_service, get_storage_service
from app.integrations.storage.service import StorageIntegrationService
from app.core.security import get_current_user_id
from app.ml.inference.predictor import MLInferenceService
from app.ml.inference.feature_contract import DiabetesRiskFeatures

router = APIRouter()
_ml_service = MLInferenceService()


@router.post("/upload-file")
async def upload_file_local(
    file: UploadFile = File(...),
    storage: StorageIntegrationService = Depends(get_storage_service),
):
    """Legacy file upload adapter."""
    ext = file.filename.split(".")[-1] if "." in file.filename else "bin"
    unique_filename = f"{uuid.uuid4()}.{ext}"
    content = await file.read()
    storage.save_file(content, f"reports/{unique_filename}")

    return {
        "fileName": unique_filename,
        "publicUrl": f"/uploads/{unique_filename}",
        "message": "File uploaded successfully",
    }


@router.post("/")
def save_report(
    data: SaveReportRequest,
    current_user_id: Optional[str] = Depends(get_current_user_id),
    service: ReportService = Depends(get_report_service),
):
    """Legacy save report endpoint delegating to ReportService."""
    if current_user_id and not data.user_id:
        data.user_id = current_user_id

    saved = service.process_and_save_report(data)

    return {
        "message": "Report saved successfully",
        "data": {
            "id": saved.id,
            "user_id": saved.user_id,
            "file_url": saved.file_url,
            "extracted_values": saved.extracted_values,
            "prediction_result": saved.prediction_result,
            "risk_level": saved.risk_level,
            "uploaded_at": saved.uploaded_at.isoformat() if saved.uploaded_at else None,
        },
    }


@router.get("/")
def get_reports(
    user_id: Optional[str] = None,
    current_user_id: Optional[str] = Depends(get_current_user_id),
    service: ReportService = Depends(get_report_service),
):
    """Legacy get reports endpoint delegating to ReportService."""
    target_user_id = user_id or current_user_id
    if not target_user_id:
        return []

    records = service.get_user_reports(user_id=target_user_id)
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "file_url": r.file_url,
            "extracted_values": r.extracted_values,
            "prediction_result": r.prediction_result,
            "risk_level": r.risk_level,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in records
    ]


@router.post("/extract-and-predict")
async def extract_and_predict(
    file: UploadFile = File(...),
    service: ReportService = Depends(get_report_service),
):
    """Legacy extract and predict endpoint delegating OCR and ML to domain services."""
    file_bytes = await file.read()
    if len(file_bytes) == 0:
        return {
            "message": "Empty file uploaded",
            "health_data": {},
            "prediction_result": "Unknown",
            "risk_level": "Unknown",
            "probability_score": 0,
        }

    raw_text = ""
    if file.filename.lower().endswith(".pdf"):
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as temp_pdf:
            temp_pdf.write(file_bytes)
            temp_pdf_path = temp_pdf.name
        try:
            pdf_document = fitz.open(temp_pdf_path)
            for page in pdf_document:
                pix = page.get_pixmap()
                with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as temp_img:
                    pix.save(temp_img.name)
                    img_bytes = open(temp_img.name, "rb").read()
                    raw_text += " " + service.ocr_client.extract_text_from_image(img_bytes)
                    try:
                        os.unlink(temp_img.name)
                    except Exception:
                        pass
        finally:
            try:
                os.unlink(temp_pdf_path)
            except Exception:
                pass
    else:
        raw_text = service.ocr_client.extract_text_from_image(file_bytes, filename=file.filename)

    extracted = service.extract_biomarkers_from_text(raw_text)

    # ML Inference if glucose & BMI present
    glucose = extracted.get("glucose")
    bmi = extracted.get("bmi")
    prediction_result = "Unknown"
    risk_level = "Unknown"
    probability_score = 0.0

    if glucose is not None and bmi is not None:
        try:
            features = DiabetesRiskFeatures(
                pregnancies=0.0,
                glucose=float(glucose),
                blood_pressure=float(extracted.get("blood_pressure") or 80.0),
                skin_thickness=20.0,
                insulin=85.0,
                bmi=float(bmi),
                diabetes_pedigree_function=0.45,
                age=float(extracted.get("age") or 28.0),
            )
            ml_res = _ml_service.predict_diabetes_risk(features)
            prediction_result = ml_res["prediction_result"]
            risk_level = ml_res["risk_level"]
            probability_score = ml_res["probability_score"]
        except Exception:
            pass

    return {
        "message": "Report analyzed successfully",
        "health_data": extracted,
        "prediction_result": prediction_result,
        "risk_level": risk_level,
        "probability_score": probability_score,
    }
