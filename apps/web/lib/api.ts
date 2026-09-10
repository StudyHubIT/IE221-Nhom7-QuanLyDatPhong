const publicApiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";


const internalApiUrl = process.env.INTERNAL_API_URL ?? publicApiUrl;

export function getApiBaseUrl() {
  return typeof window === "undefined" ? internalApiUrl : publicApiUrl;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string },
): Promise<T> {
  const { token, headers, ...rest } = options ?? {};
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      body?.detail ?? `Request failed (${res.status})`,
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
