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

Fill in `SUPABASE_URL` and `SUPABASE_KEY`.
DO NOT COMMIT `.env` .

## Run

```bash
uvicorn app.main:app --reload
```

If port is in use:

```bash
uvicorn app.main:app --reload --port 8001
```

## Verify

```bash
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/db-check
```