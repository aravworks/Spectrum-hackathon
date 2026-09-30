from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from app.core import security
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.user import UserResponse, UserRole
from app.services.user_service import UserService
from app.api import deps

router = APIRouter()

class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    role: UserRole = UserRole.CONSUMER

@router.post("/register", response_model=UserResponse)
def register_user(data: UserRegister):
    """Register a new user directly into Supabase Auth."""
    return UserService.create_user(
        email=data.email, 
        password=data.password, 
        full_name=data.full_name, 
        role=data.role
    )

@router.post("/login", response_model=Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
) -> Token:
    """
    Login using Supabase Auth. Returns the actual Supabase JWT access token.
    """
    auth_data = UserService.authenticate(
        email=form_data.username, password=form_data.password
    )
    if not auth_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    
    # We return the Supabase JWT so the frontend can use it directly!
    return Token(
        access_token=auth_data["session"].access_token,
        token_type="bearer",
    )

@router.post("/test-token", response_model=UserResponse)
def test_token(current_user: UserResponse = Depends(deps.get_current_user)) -> UserResponse:
    """
    Test access token (returns current user profile).
    """
    return current_user

# --- Example RBAC restricted route ---
@router.get("/admin-dashboard", response_model=dict)
def admin_only_data(
    current_user: UserResponse = Depends(deps.RoleChecker([UserRole.SYS_ADMIN, UserRole.CITY_ADMIN]))
):
    """
    Test RBAC: Only SYS_ADMIN and CITY_ADMIN can access this endpoint.
    """
    return {"msg": "Welcome to the admin dashboard", "user": current_user.email}
