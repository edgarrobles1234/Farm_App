import os

from dotenv import load_dotenv
from fastapi import FastAPI
from supabase import Client, create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY in backend/.env")

supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI(title="Villam API")


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/db-check")
def db_check() -> dict:
    response = supabase.table("Users").select("*").limit(1).execute()
    return {"data": response.data}
