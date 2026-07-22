/**
 * Thin fetch client for the Bangladesh Betar public API.
 * - Attaches the Sanctum bearer token when the listener is signed in.
 * - Normalises errors into ApiError with field-level validation messages.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }

  /** First field-level validation message, else the top-level message. */
  get firstError(): string {
    if (this.errors) {
      const first = Object.values(this.errors)[0];
      if (first?.length) return first[0];
    }
    return this.message;
  }
}

/**
 * Default token source reads the persisted auth state directly so requests
 * fired during store rehydration (before the auth store wires itself in)
 * still carry the bearer token.
 */
let tokenGetter: () => string | null = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("betar.auth");
    return raw ? ((JSON.parse(raw) as { state?: { token?: string | null } }).state?.token ?? null) : null;
  } catch {
    return null;
  }
};

/** Wired once by the auth store so the client stays framework-agnostic. */
export function setTokenGetter(fn: () => string | null) {
  tokenGetter = fn;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

export async function api<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const token = tokenGetter();
  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? "GET",
    headers: {
      Accept: "application/json",
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
  });

  if (res.status === 204) return undefined as T;

  let payload: unknown = null;
  try {
    payload = await res.json();
  } catch {
    // non-JSON response (should not happen for API routes)
  }

  if (!res.ok) {
    const data = payload as { message?: string; errors?: Record<string, string[]> } | null;
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status})`, data?.errors);
  }

  return payload as T;
}

export const get = <T>(path: string, signal?: AbortSignal) => api<T>(path, { signal });
export const post = <T>(path: string, body?: unknown) => api<T>(path, { method: "POST", body });
export const put = <T>(path: string, body?: unknown) => api<T>(path, { method: "PUT", body });
export const destroy = <T>(path: string) => api<T>(path, { method: "DELETE" });
