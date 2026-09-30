from datetime import datetime
from typing import List, Optional
from fastapi import HTTPException

from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleStatus
from app.core.db import supabase

class ArticleService:
    
    @staticmethod
    def create_article(author_id: str, data: ArticleCreate) -> ArticleResponse:
        now = datetime.utcnow().isoformat()
        
        insert_data = {
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
        
        # Insert into Supabase
        response = supabase.table("awareness_articles").insert(insert_data).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to create article in database")
            
        return ArticleResponse(**response.data[0])

    @staticmethod
    def get_articles(include_drafts: bool = False, skip: int = 0, limit: int = 50) -> List[ArticleResponse]:
        query = supabase.table("awareness_articles").select("*").order("created_at", desc=True).range(skip, skip + limit - 1)
        
        if not include_drafts:
            query = query.eq("status", ArticleStatus.PUBLISHED)
            
        response = query.execute()
        return [ArticleResponse(**item) for item in response.data]

    @staticmethod
    def get_article_by_slug(slug: str) -> Optional[ArticleResponse]:
        response = supabase.table("awareness_articles").select("*").eq("slug", slug).execute()
        if not response.data:
            return None
        return ArticleResponse(**response.data[0])

    @staticmethod
    def update_article(article_id: int, data: ArticleUpdate) -> ArticleResponse:
        # Fetch current to check status logic
        current_res = supabase.table("awareness_articles").select("status").eq("id", article_id).execute()
        if not current_res.data:
            raise HTTPException(status_code=404, detail="Article not found")
            
        current_status = current_res.data[0]["status"]
        update_data = data.model_dump(exclude_unset=True)
        
        if "status" in update_data:
            if update_data["status"] == ArticleStatus.PUBLISHED and current_status != ArticleStatus.PUBLISHED:
                update_data["published_at"] = datetime.utcnow().isoformat()
            elif update_data["status"] != ArticleStatus.PUBLISHED:
                update_data["published_at"] = None

        update_data["updated_at"] = datetime.utcnow().isoformat()
        
        response = supabase.table("awareness_articles").update(update_data).eq("id", article_id).execute()
        if not response.data:
            raise HTTPException(status_code=500, detail="Failed to update article")
            
        return ArticleResponse(**response.data[0])
        
    @staticmethod
    def delete_article(article_id: int):
        supabase.table("awareness_articles").delete().eq("id", article_id).execute()
