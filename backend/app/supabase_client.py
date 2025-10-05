from supabase import create_client, Client
import os
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
_supa: Client | None = None
def supa() -> Client:
    global _supa
    if _supa is None:
        _supa = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _supa

