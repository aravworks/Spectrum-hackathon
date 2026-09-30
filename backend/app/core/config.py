from typing import List, Union, Optional
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator

class Settings(BaseSettings):
    PROJECT_NAME: str = "EcoVerse Backend API"
    API_V1_STR: str = "/api/v1"
    
    # CORS setup
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database Settings
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/waste"
    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None  # Anon or Service Role key
    
    # AI Config
    OPENAI_API_KEY: Optional[str] = None

    # JWT Auth
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_TO_A_SECURE_KEY"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
