from supabase import create_client, Client
from dotenv import load_dotenv
import os
from typing import Optional

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase: Optional[Client] = None
if url and key:
    try:
        supabase = create_client(url, key)
    except Exception as e:
        print(f"[WARN] Failed to initialize Supabase client: {e}")
        supabase = None
