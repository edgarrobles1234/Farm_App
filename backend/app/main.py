import os

import jwt
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from jwt import InvalidTokenError
from pydantic import BaseModel, Field
from supabase import Client, create_client

load_dotenv()

supabase_url = os.getenv("SUPABASE_URL")
supabase_service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_KEY")
supabase_jwt_secret = os.getenv("SUPABASE_JWT_SECRET")

if not supabase_url or not supabase_service_role_key:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env")

supabase: Client = create_client(supabase_url, supabase_service_role_key)

app = FastAPI(title="Villam API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_bearer_token(request: Request) -> str:
    header = request.headers.get("authorization") or request.headers.get("Authorization")
    if not header or not header.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")
    return header.split(" ", 1)[1].strip()


def get_current_user_id(request: Request) -> str:
    if not supabase_jwt_secret:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="SUPABASE_JWT_SECRET not set")

    token = _get_bearer_token(request)
    try:
        payload = jwt.decode(token, supabase_jwt_secret, algorithms=["HS256"], options={"verify_aud": False})
    except InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    return str(user_id)


def _safe_count(resp) -> int:
    count = getattr(resp, "count", None)
    if isinstance(count, int):
        return count
    data = getattr(resp, "data", None)
    if isinstance(data, list):
        return len(data)
    return 0


class FollowRequest(BaseModel):
    following_id: str = Field(..., min_length=1)


class ProfileOut(BaseModel):
    id: str
    username: str | None = None
    full_name: str | None = None
    avatar_url: str | None = None
    description: str | None = None


class SearchUserOut(ProfileOut):
    is_following: bool


class CountsOut(BaseModel):
    followers: int
    following: int


class MeOut(BaseModel):
    profile: ProfileOut | None
    counts: CountsOut


class UpdateMeIn(BaseModel):
    description: str | None = Field(default=None, max_length=280)


class GroceryListItemIn(BaseModel):
    name: str = Field(..., min_length=1)
    quantity: float | None = None
    unit: str | None = None
    checked: bool = False
    category: str | None = None
    isPinned: bool = False
    sortOrder: int = 0


class GroceryListCreateIn(BaseModel):
    title: str = Field(..., min_length=1)
    isPinned: bool = False
    items: list[GroceryListItemIn] = Field(default_factory=list)


class GroceryListCreateOut(BaseModel):
    id: str


def _get_following_ids(user_id: str) -> set[str]:
    resp = (
        supabase.table("follows")
        .select("following_id")
        .eq("follower_id", user_id)
        .limit(1000)
        .execute()
    )
    return {
        row.get("following_id")
        for row in (getattr(resp, "data", []) or [])
        if row.get("following_id")
    }


def _get_profiles_by_ids(
    ids: list[str], q: str | None = None, limit: int = 100
) -> list[dict]:
    if not ids:
        return []

    query = (
        supabase.table("profiles")
        .select("id,username,full_name,avatar_url")
        .in_("id", ids)
        .limit(limit)
        .order("username", desc=False)
    )

    if q and q.strip():
        term = q.strip()
        query = query.or_(f"username.ilike.%{term}%,full_name.ilike.%{term}%")

    resp = query.execute()
    return getattr(resp, "data", []) or []


@app.get("/health")
def health_check() -> dict:
    return {"status": "ok"}


@app.get("/db-check")
def db_check() -> dict:
    response = supabase.table("profiles").select("id").limit(1).execute()
    return {"data": response.data}


@app.get("/me", response_model=MeOut)
def get_me(user_id: str = Depends(get_current_user_id)) -> MeOut:
    profile_resp = (
        supabase.table("profiles")
        .select("id,username,full_name,avatar_url,description")
        .eq("id", user_id)
        .maybe_single()
        .execute()
    )

    followers_resp = supabase.table("follows").select("*", count="exact").eq("following_id", user_id).execute()
    following_resp = supabase.table("follows").select("*", count="exact").eq("follower_id", user_id).execute()

    profile_data = getattr(profile_resp, "data", None)
    profile = ProfileOut(**profile_data) if isinstance(profile_data, dict) else None

    return MeOut(
        profile=profile,
        counts=CountsOut(followers=_safe_count(followers_resp), following=_safe_count(following_resp)),
    )


@app.patch("/me", response_model=MeOut)
def update_me(body: UpdateMeIn, user_id: str = Depends(get_current_user_id)) -> MeOut:
    supabase.table("profiles").upsert(
        {"id": user_id, "description": body.description},
        on_conflict="id",
    ).execute()
    return get_me(user_id)


@app.get("/followers", response_model=list[SearchUserOut])
def list_followers(
    q: str | None = None, limit: int = 100, user_id: str = Depends(get_current_user_id)
) -> list[SearchUserOut]:
    limit = max(1, min(limit, 200))

    rel_resp = (
        supabase.table("follows")
        .select("follower_id")
        .eq("following_id", user_id)
        .limit(limit)
        .execute()
    )
    follower_ids = [
        row.get("follower_id")
        for row in (getattr(rel_resp, "data", []) or [])
        if row.get("follower_id")
    ]

    following_ids = _get_following_ids(user_id)
    profiles = _get_profiles_by_ids(follower_ids, q=q, limit=limit)

    results: list[SearchUserOut] = []
    for row in profiles:
        profile = ProfileOut(**row)
        results.append(
            SearchUserOut(**profile.model_dump(), is_following=profile.id in following_ids)
        )
    return results


@app.get("/following", response_model=list[SearchUserOut])
def list_following(
    q: str | None = None, limit: int = 100, user_id: str = Depends(get_current_user_id)
) -> list[SearchUserOut]:
    limit = max(1, min(limit, 200))

    rel_resp = (
        supabase.table("follows")
        .select("following_id")
        .eq("follower_id", user_id)
        .limit(limit)
        .execute()
    )
    following_list = [
        row.get("following_id")
        for row in (getattr(rel_resp, "data", []) or [])
        if row.get("following_id")
    ]

    profiles = _get_profiles_by_ids(following_list, q=q, limit=limit)

    results: list[SearchUserOut] = []
    for row in profiles:
        profile = ProfileOut(**row)
        results.append(SearchUserOut(**profile.model_dump(), is_following=True))
    return results


@app.get("/users/search", response_model=list[SearchUserOut])
def search_users(
    q: str | None = None, limit: int = 50, user_id: str = Depends(get_current_user_id)
) -> list[SearchUserOut]:
    limit = max(1, min(limit, 100))

    query = (
        supabase.table("profiles")
        .select("id,username,full_name,avatar_url")
        .neq("id", user_id)
        .limit(limit)
    )

    if q and q.strip():
        term = q.strip()
        query = query.or_(f"username.ilike.%{term}%,full_name.ilike.%{term}%")

    profiles_resp = query.execute()
    profiles = getattr(profiles_resp, "data", []) or []

    following_resp = supabase.table("follows").select("following_id").eq("follower_id", user_id).execute()
    following_ids = {
        row.get("following_id")
        for row in (getattr(following_resp, "data", []) or [])
        if row.get("following_id")
    }

    results: list[SearchUserOut] = []
    for row in profiles:
        profile = ProfileOut(**row)
        results.append(SearchUserOut(**profile.model_dump(), is_following=profile.id in following_ids))
    return results


@app.post("/follow", status_code=204)
def follow(body: FollowRequest, user_id: str = Depends(get_current_user_id)) -> None:
    if body.following_id == user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot follow yourself")

    supabase.table("follows").upsert(
        {"follower_id": user_id, "following_id": body.following_id},
        on_conflict="follower_id,following_id",
    ).execute()


@app.delete("/follow/{following_id}", status_code=204)
def unfollow(following_id: str, user_id: str = Depends(get_current_user_id)) -> None:
    supabase.table("follows").delete().match({"follower_id": user_id, "following_id": following_id}).execute()
