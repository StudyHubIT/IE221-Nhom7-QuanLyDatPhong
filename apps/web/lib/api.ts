const publicApiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

const internalApiUrl = process.env.INTERNAL_API_URL ?? publicApiUrl;

export function getApiBaseUrl() {
  return typeof window === "undefined" ? internalApiUrl : publicApiUrl;
}
