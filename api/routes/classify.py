from fastapi import APIRouter
from core.schemas import ClassificationRequest, ClassificationResponse
from core.classifier import classifier

router = APIRouter()

@router.post("/", response_model=ClassificationResponse)
async def classify_text(request: ClassificationRequest):
    result = await classifier.classify(request)
    return result
