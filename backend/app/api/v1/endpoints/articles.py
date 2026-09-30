from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException

from app.schemas.article import ArticleCreate, ArticleUpdate, ArticleResponse, ArticleStatus
from app.schemas.user import UserResponse, UserRole
from app.api import deps
from app.services.article_service import ArticleService

router = APIRouter()

@router.get("/", response_model=List[ArticleResponse])
def list_articles(
    skip: int = 0,
    limit: int = 50,
    include_drafts: bool = False,
    current_user: UserResponse = Depends(deps.get_current_user) # Optional auth depending on setup
) -> Any:
    """
    List awareness articles.
    Only Admins can use `include_drafts=True` to see unpublished work.
    """
    if include_drafts and current_user.role not in [UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]:
        raise HTTPException(status_code=403, detail="Only admins can view draft articles")
        
    return ArticleService.get_articles(include_drafts=include_drafts, skip=skip, limit=limit)

@router.get("/{slug}", response_model=ArticleResponse)
def read_article(slug: str) -> Any:
    """
    Fetch a specific article by its URL slug.
    """
    article = ArticleService.get_article_by_slug(slug)
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("/", response_model=ArticleResponse, status_code=201)
def create_article(
    *,
    article_in: ArticleCreate,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]))
) -> Any:
    """
    Create a new blog / awareness article.
    Restricted to CITY_ADMIN and SYS_ADMIN.
    """
    # Ensure slug is unique
    existing = ArticleService.get_article_by_slug(article_in.slug)
    if existing:
        raise HTTPException(status_code=400, detail="An article with this slug already exists.")
        
    return ArticleService.create_article(author_id=current_user.id, data=article_in)

@router.patch("/{article_id}", response_model=ArticleResponse)
def update_article(
    *,
    article_id: int,
    article_in: ArticleUpdate,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]))
) -> Any:
    """
    Update an article or publish a draft.
    Restricted to CITY_ADMIN and SYS_ADMIN.
    """
    return ArticleService.update_article(article_id=article_id, data=article_in)

@router.delete("/{article_id}", status_code=204)
def delete_article(
    *,
    article_id: int,
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.CITY_ADMIN, UserRole.SYS_ADMIN]))
) -> None:
    """
    Delete an article.
    Restricted to CITY_ADMIN and SYS_ADMIN.
    """
    ArticleService.delete_article(article_id=article_id)
