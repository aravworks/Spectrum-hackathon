from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleStatus

# -------------------------------------------------------------------
# MOCK DATABASE FOR DEVELOPMENT
# -------------------------------------------------------------------
# TODO (Teammate): Replace with SQLAlchemy query for `awareness_articles` table.

MOCK_ARTICLES = {}
_id_counter = 1

class ArticleService:
    
    @staticmethod
    def create_article(author_id: str, data: ArticleCreate) -> ArticleResponse:
        global _id_counter
        now = datetime.utcnow()
        
        article_dict = {
            "id": _id_counter,
            "author_id": author_id,
            "title": data.title,
            "slug": data.slug,
            "category_id": data.category_id,
            "body": data.body,
            "emissions_summary": data.emissions_summary,
            "disposal_guidance": data.disposal_guidance,
            "status": data.status,
            "published_at": now if data.status == ArticleStatus.PUBLISHED else None,
            "created_at": now,
            "updated_at": now
        }
        
        MOCK_ARTICLES[_id_counter] = article_dict
        _id_counter += 1
        return ArticleResponse(**article_dict)

    @staticmethod
    def get_articles(include_drafts: bool = False, skip: int = 0, limit: int = 50) -> List[ArticleResponse]:
        all_articles = list(MOCK_ARTICLES.values())
        
        if not include_drafts:
            all_articles = [a for a in all_articles if a["status"] == ArticleStatus.PUBLISHED]
            
        # Sort by newest first
        all_articles.sort(key=lambda x: x["created_at"], reverse=True)
        
        return [ArticleResponse(**a) for a in all_articles[skip : skip + limit]]

    @staticmethod
    def get_article_by_slug(slug: str) -> Optional[ArticleResponse]:
        for article in MOCK_ARTICLES.values():
            if article["slug"] == slug:
                return ArticleResponse(**article)
        return None

    @staticmethod
    def update_article(article_id: int, data: ArticleUpdate) -> ArticleResponse:
        article = MOCK_ARTICLES.get(article_id)
        if not article:
            raise HTTPException(status_code=404, detail="Article not found")
            
        update_data = data.model_dump(exclude_unset=True)
        
        # Handle publishing timestamp logic
        if "status" in update_data:
            if update_data["status"] == ArticleStatus.PUBLISHED and article["status"] != ArticleStatus.PUBLISHED:
                article["published_at"] = datetime.utcnow()
            elif update_data["status"] != ArticleStatus.PUBLISHED:
                article["published_at"] = None

        for key, value in update_data.items():
            article[key] = value
            
        article["updated_at"] = datetime.utcnow()
        return ArticleResponse(**article)
        
    @staticmethod
    def delete_article(article_id: int):
        if article_id in MOCK_ARTICLES:
            del MOCK_ARTICLES[article_id]
