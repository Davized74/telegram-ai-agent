from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from core.models import ItemType, ItemStatus, Priority

class ItemBase(BaseModel):
    title: str
    content: Optional[str] = None
    type: ItemType
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ItemStatus] = None
    priority: Optional[Priority] = Priority.MEDIUM
    tags: List[str] = []
    categories: List[str] = []
    metadata: Dict[str, Any] = {}
    original_text: Optional[str] = None
    source: str = "web"

class ItemCreate(ItemBase):
    pass

class ItemUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    type: Optional[ItemType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ItemStatus] = None
    priority: Optional[Priority] = None
    tags: Optional[List[str]] = None
    categories: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None
    is_archived: Optional[bool] = None

class ItemResponse(ItemBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    is_archived: bool
    search_text: Optional[str] = None
    
    class Config:
        from_attributes = True

class ClassificationRequest(BaseModel):
    text: str
    source: str = "web"

class ClassificationProposal(BaseModel):
    type: ItemType
    title: str
    content: Optional[str] = None
    start_date: Optional[datetime] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    location: Optional[str] = None
    status: Optional[ItemStatus] = None
    priority: Optional[Priority] = Priority.MEDIUM
    tags: List[str] = []
    confidence: float = 0.0
    needs_confirmation: bool = True
    missing_fields: List[str] = []
    reasoning: Optional[str] = None
    original_text: str

class ClassificationResponse(BaseModel):
    proposals: List[ClassificationProposal]
    needs_clarification: bool = False
    clarification_question: Optional[str] = None
    original_text: str
