import { env } from "@/lib/env";
import { loadStoredSession } from "@/lib/session-storage";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    const stored = loadStoredSession();
    if (stored?.accessToken) {
      accessToken = stored.accessToken;
      return accessToken;
    }
  }
  return null;
}

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  skipAuth?: boolean;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, skipAuth, headers, ...rest } = options;

  const authHeaders: Record<string, string> = {};
  if (!skipAuth) {
    const token = getAccessToken();
    if (token) authHeaders.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders,
      ...(headers as Record<string, string> | undefined),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let payload: { error?: { code?: string; message?: string; details?: unknown } } =
      {};
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    throw new ApiError(
      res.status,
      payload.error?.code ?? "UNKNOWN",
      payload.error?.message ?? res.statusText,
      payload.error?.details,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}