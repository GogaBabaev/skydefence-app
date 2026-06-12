/** Base URL of the backend API. Empty string → same origin (/api/...). */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  '';

export const API_ENABLED = Boolean(import.meta.env.VITE_API_URL);
