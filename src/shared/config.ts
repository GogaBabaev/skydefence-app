/** Base URL of the backend API. Empty string → same origin (/api/...). */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
  '';

/**
 * Whether to talk to the real backend. The API is reachable whenever
 * VITE_API_URL is *defined* — including an empty string, which means
 * "same origin" (the production Mini App is served from the same domain as
 * /api). Only a build with the var entirely absent runs in offline/static
 * mode (the 46-item fallback catalog). NB: `Boolean('')` is false, so we must
 * test for `undefined`, not truthiness — otherwise same-origin prod builds
 * wrongly fall back to static data and block order/quote submission.
 */
export const API_ENABLED = import.meta.env.VITE_API_URL !== undefined;
