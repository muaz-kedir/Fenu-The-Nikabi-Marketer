export const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
export const isLocalApiConfigured = true;

export async function localApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('portfolio-admin-token');
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (response.status === 401 && !path.includes('/login')) {
    window.dispatchEvent(new CustomEvent('admin:unauthorized', { detail: { path } }));
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Request failed with status ${response.status}`);
  }

  return payload as T;
}
