from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException, status
from app.schemas.report import SaveReportRequest, UpdateReportRequest, ReportResponse
from app.services.report_service import ReportService
from app.api.dependencies import get_report_service, get_current_user
from app.models.user import User

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("", response_model=List[ReportResponse], summary="List patient medical reports")
def list_reports(
    limit: int = Query(50, ge=1, le=100),
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """Retrieves uploaded medical reports for authenticated patient."""
    return service.get_user_reports(user_id=current_user.id, actor=current_user, limit=limit)


@router.post(
    "",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create medical report record",
)
@router.post(
    "/save-report",
    response_model=ReportResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def save_report(
    payload: SaveReportRequest,
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """Saves processed medical report metadata with verified actor context."""
    return service.process_and_save_report(payload, actor=current_user)


@router.get(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Get single medical report detail",
)
def get_report_detail(
    report_id: str,
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """Retrieves single owned medical report by ID."""
    report = service.repo.get_owned(report_id=report_id, owner_user_id=current_user.id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found.",
        )
    return ReportResponse.model_validate(report)


@router.patch(
    "/{report_id}",
    response_model=ReportResponse,
    summary="Update medical report extracted values and review state",
)
def update_report(
    report_id: str,
    payload: UpdateReportRequest,
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """Updates owned medical report review data and biomarkers."""
    report = service.repo.get_owned(report_id=report_id, owner_user_id=current_user.id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found.",
        )
    if payload.extracted_values is not None:
        report.extracted_values = payload.extracted_values
    if payload.prediction_result is not None:
        report.prediction_result = payload.prediction_result
    if payload.risk_level is not None:
        report.risk_level = payload.risk_level
    service.db.commit()
    service.db.refresh(report)
    return ReportResponse.model_validate(report)


@router.delete(
    "/{report_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete owned medical report",
)
def delete_report(
    report_id: str,
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """Deletes an owned medical report record."""
    report = service.repo.get_owned(report_id=report_id, owner_user_id=current_user.id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found.",
        )
    service.repo.delete(report_id)


@router.get(
    "/{report_id}/pdf",
    summary="Download professional Jinja2 HTML/CSS PDF report",
)
def download_report_pdf(
    report_id: str,
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """Generates and streams a high-fidelity clinical PDF report using Jinja2 templates."""
    from fastapi.responses import Response
    from app.services.pdf_report_generator import PDFReportGenerator

    report = service.repo.get_owned(report_id=report_id, owner_user_id=current_user.id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report '{report_id}' not found.",
        )

    patient_name = "Gestational Patient"
    if hasattr(current_user, "name") and current_user.name:
        patient_name = current_user.name
    elif hasattr(current_user, "email") and current_user.email:
        patient_name = current_user.email.split("@")[0].title()

    uploaded_at = report.uploaded_at.strftime("%d-%b-%Y") if report.uploaded_at else "18-Aug-2026"
    uploaded_time = report.uploaded_at.strftime("%H:%M") if report.uploaded_at else "14:00"

    pdf_bytes = PDFReportGenerator.generate_pdf(
        report_id=report.id[:8].upper(),
        extracted_values=report.extracted_values or {},
        patient_name=patient_name,
        date_str=uploaded_at,
        time_str=uploaded_time,
        status="Verified by Patient" if (report.extracted_values or {}).get("_is_reviewed") else "Recorded in Vault",
    )

    filename = f"Medical_Report_{report.id[:8]}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'inline; filename="{filename}"',
            "Cache-Control": "private, no-store",
        },
    )


@router.get(
    "/user/{user_id}",
    response_model=List[ReportResponse],
    include_in_schema=False,
)
def get_user_reports_legacy(
    user_id: str,
    limit: int = Query(50, ge=1, le=100),
    service: ReportService = Depends(get_report_service),
    current_user: User = Depends(get_current_user),
):
    """Backward compatibility route for reports."""
    return service.get_user_reports(user_id=user_id, actor=current_user, limit=limit)
