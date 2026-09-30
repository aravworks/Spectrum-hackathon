from typing import Any
from fastapi import APIRouter, Depends

from app.schemas.chatbot import ChatRequest, ChatResponse
from app.schemas.user import UserResponse
from app.api import deps
from app.services.chatbot_service import ChatbotService

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
def ask_chatbot(
    *,
    request_in: ChatRequest,
    current_user: UserResponse = Depends(deps.get_current_active_user)
) -> Any:
    """
    Send a message to the EcoVerse AI Chatbot.
    Maintains conversation history by accepting a list of previous messages.
    """
    # We can inject user context into the system prompt here if needed
    # e.g., "You are talking to John, a Collector in Mumbai."
    
    response = ChatbotService.ask_ai(messages=request_in.messages)
    return response
