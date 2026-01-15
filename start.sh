#!/usr/bin/env bash
set -euo pipefail

# Start backend
if [[ -x "backend/.venv/bin/uvicorn" ]]; then
  backend_cmd=("backend/.venv/bin/uvicorn" app.main:app --reload --app-dir backend)
else
  backend_cmd=(uvicorn app.main:app --reload --app-dir backend)
fi

# Start frontend (Expo)
frontend_cmd=(npm --prefix frontend run start)

"${backend_cmd[@]}" &
backend_pid=$!

"${frontend_cmd[@]}" &
frontend_pid=$!

trap 'kill "$backend_pid" "$frontend_pid"' INT TERM
wait "$backend_pid" "$frontend_pid"
