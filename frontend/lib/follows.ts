import { apiBaseUrl, apiRequest } from "@/lib/api";

export type FollowCounts = {
  followers: number;
  following: number;
};

export type ProfileRow = {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  description?: string | null;
};

export type MeResponse = {
  profile: ProfileRow | null;
  counts: FollowCounts;
};

export type SearchUser = ProfileRow & { is_following: boolean };

export async function getMe(accessToken: string): Promise<MeResponse> {
  return apiRequest<MeResponse>("/me", { accessToken });
}

export async function updateMyDescription(accessToken: string, description: string | null): Promise<MeResponse> {
  return apiRequest<MeResponse>("/me", { method: "PATCH", accessToken, body: { description } });
}

export async function updateMyAvatarUrl(accessToken: string, avatarUrl: string | null): Promise<MeResponse> {
  return apiRequest<MeResponse>("/me", { method: "PATCH", accessToken, body: { avatar_url: avatarUrl } });
}

export async function uploadMyAvatar(
  accessToken: string,
  file: { uri: string; name: string; type: string }
): Promise<MeResponse> {
  const form = new FormData();
  form.append("file", file as any);

  const res = await fetch(`${apiBaseUrl}/me/avatar`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data?.detail) detail = data.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  return (await res.json()) as MeResponse;
}

export async function searchUsers(accessToken: string, q: string, limit = 50): Promise<SearchUser[]> {
  const query = new URLSearchParams();
  if (q.trim()) query.set("q", q.trim());
  query.set("limit", String(limit));
  return apiRequest<SearchUser[]>(`/users/search?${query.toString()}`, { accessToken });
}

export async function listFollowers(accessToken: string, q: string, limit = 100): Promise<SearchUser[]> {
  const query = new URLSearchParams();
  if (q.trim()) query.set("q", q.trim());
  query.set("limit", String(limit));
  return apiRequest<SearchUser[]>(`/followers?${query.toString()}`, { accessToken });
}

export async function listFollowing(accessToken: string, q: string, limit = 100): Promise<SearchUser[]> {
  const query = new URLSearchParams();
  if (q.trim()) query.set("q", q.trim());
  query.set("limit", String(limit));
  return apiRequest<SearchUser[]>(`/following?${query.toString()}`, { accessToken });
}

export async function followUser(accessToken: string, followingId: string): Promise<void> {
  await apiRequest<void>("/follow", { method: "POST", accessToken, body: { following_id: followingId } });
}

export async function unfollowUser(accessToken: string, followingId: string): Promise<void> {
  await apiRequest<void>(`/follow/${encodeURIComponent(followingId)}`, { method: "DELETE", accessToken });
}
