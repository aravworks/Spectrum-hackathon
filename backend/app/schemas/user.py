from typing import Optional
from pydantic import BaseModel, EmailStr
from enum import Enum

class UserRole(str, Enum):
    CONSUMER = "CONSUMER"
    COLLECTOR = "COLLECTOR"
    CITY_ADMIN = "CITY_ADMIN"
    SYS_ADMIN = "SYS_ADMIN"
    RECYCLER = "RECYCLER"
    ANALYST = "ANALYST"
    RESEARCHER = "RESEARCHER"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    role: UserRole = UserRole.CONSUMER
    is_active: Optional[bool] = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True
