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
    # db: Session = Depends(get_db)  # Uncomment when DB is ready
) -> UserResponse:
    """
    Dependency that decodes the JWT token and fetches the current user.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    
    # Fetch user using the mock service (pass db in future)
    user = UserService.get_user_by_id(user_id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

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
