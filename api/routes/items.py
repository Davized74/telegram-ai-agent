from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from core.db import get_db
from core.models import Item
from core.schemas import ItemCreate, ItemUpdate, ItemResponse
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[ItemResponse])
async def list_items(
    skip: int = 0,
    limit: int = 100,
    type: str = None,
    db: AsyncSession = Depends(get_db)
):
    query = select(Item).where(Item.is_archived == False)
    if type:
        query = query.where(Item.type == type)
    query = query.order_by(Item.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    items = result.scalars().all()
    return items

@router.post("/", response_model=ItemResponse)
async def create_item(item: ItemCreate, db: AsyncSession = Depends(get_db)):
    db_item = Item(**item.model_dump())
    # Build search text
    search_parts = [db_item.title or "", db_item.content or "", db_item.original_text or ""]
    if db_item.tags:
        search_parts.extend(db_item.tags)
    db_item.search_text = " ".join(filter(None, search_parts)).lower()
    
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.get("/{item_id}", response_model=ItemResponse)
async def get_item(item_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}", response_model=ItemResponse)
async def update_item(item_id: str, item_update: ItemUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    if item_update.status and item_update.status.value == 'done' and not item.completed_at:
        item.completed_at = datetime.now()
    
    # Update search text
    search_parts = [item.title or "", item.content or "", item.original_text or ""]
    if item.tags:
        search_parts.extend(item.tags)
    item.search_text = " ".join(filter(None, search_parts)).lower()
    
    await db.commit()
    await db.refresh(item)
    return item

@router.delete("/{item_id}")
async def delete_item(item_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    await db.delete(item)
    await db.commit()
    return {"message": "Item deleted"}
