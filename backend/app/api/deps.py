from typing import Generator, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError

from app.core.config import settings
from app.core import security
from app.schemas.token import TokenPayload
from app.schemas.user import UserResponse, UserRole
from app.services.user_service import UserService

# OAuth2 scheme for Swagger UI and token extraction
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

# Placeholder for DB dependency (Teammate will implement actual session generation)
def get_db() -> Generator:
    """Dependency to provide a database session."""
    # TODO: yield SessionLocal()
    yield None

def get_current_user(
    token: str = Depends(reusable_oauth2),
) -> UserResponse:
    """
    Dependency that decodes the JWT token and fetches the current user from Supabase.
    """
    from app.core.db import supabase
    
    try:
        # Securely validate the token with Supabase directly
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Could not validate credentials",
            )
            
        user_metadata = res.user.user_metadata
        return UserResponse(
            id=res.user.id,
            email=res.user.email,
            full_name=user_metadata.get("full_name", ""),
            role=UserRole(user_metadata.get("role", UserRole.CONSUMER.value)),
            is_active=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Could not validate credentials: {str(e)}",
        )

def get_current_active_user(
    current_user: UserResponse = Depends(get_current_user),
) -> UserResponse:
    """
    Dependency that ensures the current user is active.
    """
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

class RoleChecker:
    """
    Dependency generator for RBAC (Role-Based Access Control).
    
    Usage:
        @app.get("/admin-only")
        def admin_route(user = Depends(RoleChecker([UserRole.SYS_ADMIN]))):
            pass
    """
    def __init__(self, allowed_roles: List[UserRole]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: UserResponse = Depends(get_current_active_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {[r.value for r in self.allowed_roles]}"
            )
        return user
