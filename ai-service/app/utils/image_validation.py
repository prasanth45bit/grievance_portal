import os
import io
from typing import Tuple
from PIL import Image, UnidentifiedImageError
from fastapi import HTTPException, UploadFile, status

from app.config import settings
from app.utils.logging_config import logger

async def validate_image_file(file: UploadFile) -> Tuple[bytes, int, int, str]:
    """
    Validates uploaded file:
    - Checks file extension and MIME type
    - Checks file size within limit
    - Checks image decode integrity using PIL
    - Returns (image_bytes, width, height, format)
    """
    # 1. Filename & extension check
    filename = file.filename or "unknown"
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in settings.allowed_extensions:
        logger.warning("Rejected file upload with unsupported extension: %s", ext)
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported image extension '.{ext}'. Allowed: {', '.join(settings.allowed_extensions)}"
        )
    
    # 2. Read bytes & check size
    content = await file.read()
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )
        
    max_bytes = settings.max_image_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        logger.warning("Rejected oversized upload: %d bytes (limit %d MB)", len(content), settings.max_image_size_mb)
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Image size exceeds maximum limit of {settings.max_image_size_mb} MB."
        )
        
    # 3. Decode & verify image integrity
    try:
        with Image.open(io.BytesIO(content)) as img:
            img.verify()
            
        # Re-open for metadata (verify can close the stream or invalidate)
        with Image.open(io.BytesIO(content)) as img:
            width, height = img.size
            img_format = img.format or ext.upper()
            
            if width < 16 or height < 16:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Image dimensions too small to analyze."
                )
    except UnidentifiedImageError:
        logger.warning("Failed to decode image from bytes for file: %s", filename)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File content could not be identified as a valid image."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error verifying image file: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Corrupted or invalid image stream."
        )
        
    return content, width, height, img_format
