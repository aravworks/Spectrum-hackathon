from typing import Optional
from app.schemas.user import UserResponse, UserRole
from app.core.security import verify_password

# -------------------------------------------------------------------
# MOCK DATABASE FOR DEVELOPMENT
# -------------------------------------------------------------------
# TODO (Teammate): Replace this mock database with real SQLAlchemy queries
# using the models you are building. The interface should stay roughly the same.

MOCK_USERS = {
    "admin@ecoverse.com": {
        "id": "usr-1",
        "email": "admin@ecoverse.com",
        "full_name": "System Admin",
        "role": UserRole.SYS_ADMIN,
        "is_active": True,
        # Password is 'admin123'
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW"
    },
    "collector@ecoverse.com": {
        "id": "usr-2",
        "email": "collector@ecoverse.com",
        "full_name": "John Collector",
        "role": UserRole.COLLECTOR,
        "is_active": True,
        # Password is 'collector123'
        "hashed_password": "$2b$12$G1B5l6XqP3P.nI5T6N9iZONaT7P/P/1M9G4wPzK/yLh8P9.0R6qjG" 
    },
    "consumer@ecoverse.com": {
        "id": "usr-3",
        "email": "consumer@ecoverse.com",
        "full_name": "Jane Consumer",
        "role": UserRole.CONSUMER,
        "is_active": True,
        # Password is 'consumer123'
        "hashed_password": "$2b$12$6qH/1G7Tq1O7z3rP1M5n5.O5m6q4tL5H7K8l9M0w2N3v5b7c9x1B2"
    }
}

class UserService:
    """
    Abstracts database operations for User accounts.
    Currently uses an in-memory dictionary.
    """
    
    @staticmethod
    def get_user_by_email(email: str) -> Optional[dict]:
        """Fetch a user record by email."""
        # TODO: return db.query(User).filter(User.email == email).first()
        return MOCK_USERS.get(email)
    
    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[UserResponse]:
        """Fetch a user record by ID and return a Pydantic schema."""
        # TODO: return db.query(User).filter(User.id == user_id).first()
        for user in MOCK_USERS.values():
            if user["id"] == user_id:
                return UserResponse(**user)
        return None

    @staticmethod
    def authenticate(email: str, password: str) -> Optional[UserResponse]:
        """Verify user credentials and return the user if valid."""
        user = UserService.get_user_by_email(email)
        if not user:
            return None
        if not verify_password(password, user["hashed_password"]):
            return None
        return UserResponse(**user)
