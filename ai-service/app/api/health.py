from fastapi import APIRouter
from app.config import settings
from app.schemas.prediction import HealthResponse
from app.services.detector import get_detector
from app.services.department_mapping import VALID_DEPARTMENTS

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
async def check_health():
    """
    Health check endpoint reporting operational status, active hardware device,
    loaded model name, and supported civic issue classes.
    """
    detector = get_detector()
    
    return HealthResponse(
        status="healthy" if detector.is_loaded else "initializing",
        model_loaded=detector.is_loaded,
        model_name=detector.model_name,
        device=detector.device,
        supported_classes=detector.supported_classes,
        department_mapping_count=len(VALID_DEPARTMENTS)
    )
