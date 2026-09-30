from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from enum import Enum

class ArticleStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"
    ARCHIVED = "ARCHIVED"

class ArticleBase(BaseModel):
    title: str
    slug: str
    category_id: Optional[int] = None
    body: str
    emissions_summary: Optional[str] = None
    disposal_guidance: Optional[str] = None
    status: ArticleStatus = ArticleStatus.DRAFT

class ArticleCreate(ArticleBase):
    """Payload to create a new awareness article"""
    pass

class ArticleUpdate(BaseModel):
    """Payload to update an existing article"""
    title: Optional[str] = None
    slug: Optional[str] = None
    category_id: Optional[int] = None
    body: Optional[str] = None
    emissions_summary: Optional[str] = None
    disposal_guidance: Optional[str] = None
    status: Optional[ArticleStatus] = None

class ArticleResponse(ArticleBase):
    """Response model for awareness articles"""
    id: int
    author_id: str
    published_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
