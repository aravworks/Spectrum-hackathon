from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core import security
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.user import UserResponse, UserRole
from app.services.user_service import UserService
from app.api import deps

router = APIRouter()

@router.post("/login", response_model=Token)
def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    # db: Session = Depends(deps.get_db) # Teammate to uncomment
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = UserService.authenticate(
        email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user account",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
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
