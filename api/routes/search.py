from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from core.db import get_db
from core.models import Item
from core.schemas import ItemResponse
from typing import List

router = APIRouter()

@router.get("/", response_model=List[ItemResponse])
async def search_items(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db)
):
    query_lower = q.lower()
    query = select(Item).where(
        Item.is_archived == False,
        or_(
            Item.search_text.contains(query_lower),
            Item.title.ilike(f"%{q}%"),
            Item.content.ilike(f"%{q}%"),
            Item.original_text.ilike(f"%{q}%")
        )
    ).order_by(Item.created_at.desc()).limit(50)
    
    result = await db.execute(query)
    items = result.scalars().all()
    return items
