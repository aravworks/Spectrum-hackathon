from typing import List, Optional
from pydantic import BaseModel
from enum import Enum

class ChatRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class ChatMessage(BaseModel):
    role: ChatRole
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_id: Optional[str] = None # Used if we want to fetch user context

class ChatResponse(BaseModel):
    reply: str
    tokens_used: Optional[int] = None
    model_used: Optional[str] = None
