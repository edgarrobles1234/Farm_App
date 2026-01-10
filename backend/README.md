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

Fill in `SUPABASE_URL` and `SUPABASE_KEY`. (Dont actually push yet need to hide key )

## Run

```bash
uvicorn app.main:app --reload
```
or if it says port is in use
```bash
uvicorn app.main:app --reload --port 8001
```
