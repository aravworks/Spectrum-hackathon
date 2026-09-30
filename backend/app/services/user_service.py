from typing import Optional
from fastapi import HTTPException
from app.schemas.user import UserResponse, UserRole
from app.core.db import supabase

class UserService:
    """
    Abstracts database operations for User accounts using Supabase Auth.
    """
    
    @staticmethod
    def create_user(email: str, password: str, full_name: str, role: UserRole) -> UserResponse:
        """Register a new user via Supabase Auth."""
        res = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {
                    "full_name": full_name,
                    "role": role.value
                }
            }
        })
        if not res.user:
            raise HTTPException(status_code=400, detail="Failed to register user")
            
        user_metadata = res.user.user_metadata
        return UserResponse(
            id=res.user.id,
            email=res.user.email,
            full_name=user_metadata.get("full_name", ""),
            role=UserRole(user_metadata.get("role", UserRole.CONSUMER.value)),
            is_active=True
        )
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[UserResponse]:
        """Fetch a user record from the custom users table or auth endpoint (Requires Admin or RLS logic).
        Since Supabase admin API requires service_role, we can decode JWT instead in deps.py.
        For now, we return a shell or fetch from a 'profiles' table if it exists."""
        # Using Supabase auth.admin.get_user_by_id requires service_role key.
        # Assuming we have service role initialized in db.py:
        try:
            res = supabase.auth.admin.get_user_by_id(user_id)
            user_metadata = res.user.user_metadata
            return UserResponse(
                id=res.user.id,
                email=res.user.email,
                full_name=user_metadata.get("full_name", ""),
                role=UserRole(user_metadata.get("role", UserRole.CONSUMER.value)),
                is_active=True
            )
        except Exception:
            return None

    @staticmethod
    def authenticate(email: str, password: str) -> Optional[dict]:
        """Verify user credentials with Supabase Auth."""
        try:
            res = supabase.auth.sign_in_with_password({"email": email, "password": password})
            if not res.user:
                return None
                
            user_metadata = res.user.user_metadata
            user = UserResponse(
                id=res.user.id,
                email=res.user.email,
                full_name=user_metadata.get("full_name", ""),
                role=UserRole(user_metadata.get("role", UserRole.CONSUMER.value)),
                is_active=True
            )
            return {"user": user, "session": res.session}
        except Exception:
            return None
