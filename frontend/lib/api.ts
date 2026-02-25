export const apiBaseUrl =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, "") || "http://127.0.0.1:8001";

type ApiError = {
  detail?: string;
};

export async function apiRequest<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "DELETE" | "PATCH";
    accessToken: string;
    body?: unknown;
  }
): Promise<T> {
  const res = await fetch(`${apiBaseUrl}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      "Content-Type": "application/json",
    },
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    let detail = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as ApiError;
      if (data?.detail) detail = data.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}
