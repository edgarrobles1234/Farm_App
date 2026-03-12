import Constants from "expo-constants";
import { Platform } from "react-native";


function getDevHostIp() {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.hostUri;
  return typeof hostUri === "string" ? hostUri.split(":")[0] : undefined;
}

function normalizeBaseUrl(url: string) {
  return url.trim().replace(/\/+$/, "");
}

function computeBaseUrl() {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) return normalizeBaseUrl(envUrl);

  // DEV defaults
  if (__DEV__) {
    const ip = getDevHostIp();
    if (ip) return `http://${ip}:8001`;

    // If hostUri isn't available, fall back by platform
    if (Platform.OS === "android") return "http://10.0.2.2:8001"; // Android emulator -> host machine
    return "http://localhost:8001"; // iOS simulator / web / other
  }

  // Production should set EXPO_PUBLIC_API_URL; this is a last-resort fallback
  return "http://127.0.0.1:8001";
}

export const apiBaseUrl = computeBaseUrl();

console.log("apiBaseUrl =", apiBaseUrl);

type ApiError = {
  detail?: string;
};

function joinUrl(base: string, path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export async function apiRequest<T>(
  path: string,
  opts: {
    method?: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
    accessToken: string;
    body?: unknown;
    timeoutMs?: number; // default 8s
    signal?: AbortSignal; // optional external cancel signal
    headers?: Record<string, string>;
  }
): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? 8000;

  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  if (opts.signal) {
    if (opts.signal.aborted) controller.abort();
    else opts.signal.addEventListener("abort", () => controller.abort(), { once: true });
  }

  try {
    const res = await fetch(joinUrl(apiBaseUrl, path), {
      method: opts.method ?? "GET",
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        "Content-Type": "application/json",
        ...(opts.headers ?? {}),
      },
      body: opts.body != null ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });

    if (!res.ok) {
      let detail = `Request failed (${res.status})`;
      try {
        const data = (await res.json()) as ApiError;
        if (data?.detail) detail = data.detail;
      } catch {
      }
      throw new Error(detail);
    }

    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}