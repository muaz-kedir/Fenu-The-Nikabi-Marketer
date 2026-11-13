export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export const isLocalApiConfigured = Boolean(apiBaseUrl || typeof window !== 'undefined');

export async function localApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('portfolio-admin-token');
  
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers ?? {}),
      },
      ...options,
    });
  } catch (netErr) {
    throw new Error(
      `Network Error: Unable to reach the backend service at ${apiBaseUrl || window.location.origin}${path}. Please ensure your backend is running.`
    );
  }

  const payload = await response.json().catch(() => ({}));

  if (response.status === 401 && !path.includes('/login')) {
    window.dispatchEvent(new CustomEvent('admin:unauthorized', { detail: { path } }));
  }

  if (response.status === 405) {
    throw new Error(
      'Backend API not reachable (HTTP 405 Method Not Allowed). The frontend is running on a static host. Please set VITE_API_BASE_URL to your backend API URL (e.g., on Render or Vercel) or configure Supabase credentials (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).'
    );
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload as T;
}
