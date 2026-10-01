from typing import List
from openai import OpenAI
from app.schemas.chatbot import ChatMessage, ChatResponse
from app.core.config import settings

# Initialize OpenAI client if key is provided
client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None

class ChatbotService:
    
    @staticmethod
    def ask_ai(messages: List[ChatMessage]) -> ChatResponse:
        """
        Sends the conversation history to OpenAI GPT-4.
        Falls back to a mock response if no API key is configured.
        """
        
        # -------------------------------------------------------------------
        # REAL IMPLEMENTATION (OpenAI API)
        # -------------------------------------------------------------------
        if client:
            formatted_messages = [{"role": m.role.value, "content": m.content} for m in messages]
            
            # Inject system prompt if not present
            if not any(m["role"] == "system" for m in formatted_messages):
                formatted_messages.insert(0, {
                    "role": "system", 
                    "content": "You are the EcoVerse AI. A helpful assistant for a waste management and recycling platform. Keep your advice concise, highly accurate, and focused on sustainability."
                })
                
            try:
                response = client.chat.completions.create(
                    model="gpt-4-turbo",
                    messages=formatted_messages,
                    temperature=0.7
                )
                
                return ChatResponse(
                    reply=response.choices[0].message.content,
                    tokens_used=response.usage.total_tokens,
                    model_used="gpt-4-turbo"
                )
            except Exception as e:
                print(f"OpenAI API failed: {e}")
                # Fall through to the mock implementation instead of returning an error string
                pass

        # -------------------------------------------------------------------
        # MOCK IMPLEMENTATION (Fallback)
        # -------------------------------------------------------------------
        last_message = messages[-1].content.lower()
        
        if "plastic" in last_message:
            reply = "Plastic should be rinsed and placed in the blue recycling bin. Did you know recycling 1kg of plastic saves 1.5kg of CO2 emissions?"
        elif "pickup" in last_message:
            reply = "You can schedule a waste pickup by navigating to the 'Pickup Request' page on your dashboard. Our AI routing engine will automatically assign a collector to your location!"
        elif "hazardous" in last_message or "battery" in last_message or "oil" in last_message:
            reply = "Hazardous materials like batteries or motor oil must NEVER be thrown in general waste. Please schedule a specialized Hazardous Waste pickup."
        elif "glass" in last_message:
            reply = "Glass bottles and jars can be recycled infinitely. Please separate them by color if possible and place them in the green bin."
        elif "compost" in last_message or "food" in last_message:
            reply = "Food scraps, coffee grounds, and yard waste can be composted. This keeps methane-producing organics out of the landfill!"
        elif "ewaste" in last_message or "electronic" in last_message or "laptop" in last_message:
            reply = "E-waste contains valuable metals and toxic chemicals. Please use the marketplace to sell working parts or schedule a specialized E-Waste pickup."
        else:
            reply = "Hello! I am the EcoVerse AI. (Running in local fallback mode because OpenAI is currently unavailable). I can help you figure out how to recycle items, schedule pickups, or understand your environmental footprint. What do you need help with?"
            
        return ChatResponse(
            reply=reply,
            tokens_used=42,
            model_used="mock-local-ai"
        )