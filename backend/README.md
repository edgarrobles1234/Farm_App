# Backend (FastAPI)

## Prereqs

- Python 3.11+ recommended

## Setup 

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Environment

```bash
cp .env.example .env
```

Fill in 
`SUPABASE_URL`
`SUPABASE_SERVICE_ROLE_KEY`
`SUPABASE_JWT_SECRET`

DO NOT COMMIT `.env` .

## Run

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```