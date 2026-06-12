import { API_BASE_URL } from '../config';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

/**
 * Fetch wrapper. Attaches Telegram initData so the backend can
 * authenticate the request (validated server-side, never trusted here).
 */
export async function api<T>(
  path: string,
  options: { method?: 'GET' | 'POST'; body?: unknown } = {},
): Promise<T> {
  const initData = window.Telegram?.WebApp?.initData ?? '';

  const res = await fetch(`${API_BASE_URL}/api${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(initData ? { 'X-Telegram-Init-Data': initData } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.message) {
        message = Array.isArray(data.message)
          ? data.message.join(', ')
          : String(data.message);
      }
    } catch {
      /* keep default message */
    }
    throw new ApiError(res.status, message);
  }
  return (await res.json()) as T;
}
