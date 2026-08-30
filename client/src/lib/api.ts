const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = 'Request failed';
    let errorData: Record<string, unknown> | null = null;
    try {
      errorData = await response.json();
      if (errorData?.error) message = errorData.error as string;
    } catch {
      // fall through with generic message
    }
    const err = new Error(message) as Error & { status?: number; code?: string };
    err.status = response.status;
    if (errorData?.code) err.code = errorData.code as string;
    throw err;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export const refreshAccessToken = async (): Promise<void> => {
  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const err = new Error('Token refresh failed') as Error & { status?: number };
    err.status = response.status;
    throw err;
  }
};

export const logout = async (): Promise<void> => {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });
};