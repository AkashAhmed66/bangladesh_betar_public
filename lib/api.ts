/**
 * Thin fetch client for the Bangladesh Betar public API.
 * - Attaches the Sanctum bearer token when the listener is signed in.
 * - Normalises errors into ApiError with field-level validation messages.
 */

/**
 * API base URL resolution — resilient to the server's LAN IP changing.
 *
 * Priority:
 *   1. NEXT_PUBLIC_API_BASE when explicitly set (e.g. a production domain).
 *   2. Otherwise DERIVE from the address the portal was opened on: open the app
 *      at http://<host>:15001 and it calls the API at http://<host>:15000. So
 *      whether that's localhost, 192.168.x.y, or a DHCP-reassigned IP, the API
 *      follows automatically — no IP is ever hard-coded.
 *   3. SSR fallback (no window) — localhost.
 *
 * The API port defaults to 15000; override with NEXT_PUBLIC_API_PORT if needed.
 */
const API_PORT = (process.env.NEXT_PUBLIC_API_PORT || "15000").trim();

export function resolveApiBase(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE?.trim();
  // Ignore the build-time sentinel (present only if the Docker entrypoint that
  // rewrites it did not run, e.g. under `npm run dev`).
  if (explicit && !explicit.includes("__RT_")) return explicit;
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.hostname}:${API_PORT}/api/v1`;
  }
  return `http://localhost:${API_PORT}/api/v1`;
}

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
  const res = await fetch(`${resolveApiBase()}${path}`, {
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
