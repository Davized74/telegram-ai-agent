from sqlalchemy import Column, String, DateTime, Text, Boolean, Integer, JSON, Enum as SQLEnum
from sqlalchemy.sql import func
from core.db import Base
import enum
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class ItemType(str, enum.Enum):
    ACTIVITY = "activity"
    APPOINTMENT = "appointment"
    IDEA = "idea"
    NOTE = "note"
    TODO_ORGANIZE = "todo_organize"

class ItemStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    DONE = "done"
    NEW = "new"
    TO_EVALUATE = "to_evaluate"
    IN_DEVELOPMENT = "in_development"
    ARCHIVED = "archived"

class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class Item(Base):
    __tablename__ = "items"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    type = Column(SQLEnum(ItemType), nullable=False, index=True)
    title = Column(String, nullable=False)
    content = Column(Text)
    
    # Per appuntamenti/attività calendarizzate
    start_date = Column(DateTime(timezone=True), index=True)
    end_date = Column(DateTime(timezone=True))
    start_time = Column(String)  # HH:MM
    end_time = Column(String)    # HH:MM
    location = Column(String)
    
    status = Column(SQLEnum(ItemStatus), default=ItemStatus.TODO)
    priority = Column(SQLEnum(Priority), default=Priority.MEDIUM)
    
    # Metadati
    tags = Column(JSON, default=list)
    categories = Column(JSON, default=list)
    metadata = Column(JSON, default=dict)  # extra data
    
    # Tracciamento origine
    original_text = Column(Text)
    source = Column(String, default="web")  # web, voice, telegram
    
    # Ricerca
    search_text = Column(Text)  # testo concatenato per ricerca
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True))
    
    is_archived = Column(Boolean, default=False)
