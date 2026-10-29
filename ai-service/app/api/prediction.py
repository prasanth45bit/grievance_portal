from typing import Optional
from fastapi import APIRouter, File, UploadFile, Query, HTTPException, status
from fastapi.responses import JSONResponse

from app.schemas.prediction import PredictionResponse
from app.utils.image_validation import validate_image_file
from app.services.image_preprocessing import preprocess_image
from app.services.detector import get_detector
from app.utils.logging_config import logger

router = APIRouter(tags=["Prediction"])

@router.post(
    "/predict",
    response_model=PredictionResponse,
    summary="Detect civic issues from uploaded image"
)
async def predict_image(
    file: UploadFile = File(..., description="Uploaded civic complaint image (JPEG, PNG, WEBP)"),
    confidence: Optional[float] = Query(
        None,
        ge=0.05,
        le=1.0,
        description="Minimum detection confidence threshold (defaults to server config: 0.35)"
    )
):
    """
    Analyzes an uploaded photograph of a civic problem.
    Returns:
    - Detected issue classes (e.g. pothole, damaged_road, garbage)
    - Confidence score for each detection
    - Bounding-box coordinates (x1, y1, x2, y2)
    - Department recommendation derived from detected civic issues
    - Status: 'completed' if issue detected, 'no_reliable_detection' if no issue identified
    - Optional extracted signboard / landmark OCR text
    """
    logger.info("Received image prediction request for file: %s", file.filename)
    
    # 1. Validation
    image_bytes, orig_w, orig_h, img_format = await validate_image_file(file)
    
    # 2. Preprocessing
    try:
        img_np, w, h = preprocess_image(image_bytes)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error("Preprocessing error: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decode and prepare image for detection."
        )

    # 3. Model Inference
    try:
        detector = get_detector()
        prediction_result = detector.predict(
            image_np=img_np,
            orig_width=w,
            orig_height=h,
            conf_threshold=confidence
        )
        return prediction_result
    except Exception as e:
        logger.error("Inference execution error: %s", str(e), exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Image inference model encountered an unexpected error."
        )
