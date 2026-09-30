from supabase import create_client, Client
from app.core.config import settings

# Initialize the Supabase Client if the URL and Key are provided in the environment
supabase: Client | None = None

if settings.SUPABASE_URL and settings.SUPABASE_KEY:
    supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
