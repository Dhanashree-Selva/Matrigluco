from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status
from fastapi.responses import FileResponse, Response
from sqlalchemy.orm import Session

from app.api.dependencies import get_db, get_current_user
from app.models.user import User
from app.services.file_service import FileService
from app.schemas.file import FileAssetResponse
from app.services.audit_service import AuditService

router = APIRouter(prefix="/files", tags=["Files"])


@router.post(
    "/upload",
    response_model=FileAssetResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload private file",
)
def upload_private_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Uploads file to private healthcare storage with content signature inspection."""
    file_service = FileService(db)
    asset = file_service.store_private_file(
        user_id=current_user.id,
        file_obj=file.file,
        category="medical_report",
        original_filename=file.filename,
        declared_mime=file.content_type,
    )
    db.commit()

    audit = AuditService(db)
    audit.record_event(
        event_type="PRIVATE_FILE_UPLOADED",
        actor_user_id=current_user.id,
        resource_type="file_asset",
        resource_id=asset.id,
        safe_metadata={"mime_type": asset.mime_type, "size_bytes": asset.size_bytes},
    )

    return FileAssetResponse.model_validate(asset)


@router.get("/{file_id}/download", summary="Download authorized private file")
@router.get("/download/{file_id}", include_in_schema=False)
def download_private_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Downloads authorized private file stream."""
    file_service = FileService(db)
    safe_path, safe_filename, mime_type, size_bytes = file_service.get_authorized_download(
        user_id=current_user.id, file_id=file_id
    )

    audit = AuditService(db)
    audit.record_event(
        event_type="PRIVATE_FILE_DOWNLOADED",
        actor_user_id=current_user.id,
        resource_type="file_asset",
        resource_id=file_id,
    )

    return FileResponse(
        path=safe_path,
        media_type=mime_type,
        filename=safe_filename,
        headers={
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
        },
    )


@router.delete(
    "/{file_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Soft-delete private file"
)
def delete_private_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Soft deletes owned private file, revoking future download access."""
    file_service = FileService(db)
    file_service.soft_delete_file(user_id=current_user.id, file_id=file_id)
    db.commit()

    audit = AuditService(db)
    audit.record_event(
        event_type="PRIVATE_FILE_ARCHIVED",
        actor_user_id=current_user.id,
        resource_type="file_asset",
        resource_id=file_id,
    )
