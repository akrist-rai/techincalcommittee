import type {
  Club, EventItem, Member, MediaItem, Section, SiteData, User,
} from './types';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: init?.body && !(init.body instanceof Blob) && !(init.body instanceof File)
      ? { 'content-type': 'application/json', ...(init?.headers ?? {}) }
      : init?.headers,
    ...init,
  });

  const contentType = res.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json') ? await res.json() : undefined;

  if (!res.ok) {
    const message = body && typeof body === 'object' && 'error' in body ? String(body.error) : res.statusText;
    throw new ApiError(res.status, message || 'Request failed');
  }
  return body as T;
}

function jsonBody(data: unknown): RequestInit {
  return { body: JSON.stringify(data) };
}

// -- auth --
export const AuthApi = {
  me: () => request<{ user: User | null }>('/api/auth/me'),
  login: (email: string, password: string) =>
    request<User>('/api/auth/login', { method: 'POST', ...jsonBody({ email, password }) }),
  logout: () => request<{ ok: true }>('/api/auth/logout', { method: 'POST' }),
};

// -- public aggregate --
export const SiteApi = {
  get: () => request<SiteData>('/api/site'),
};

// -- members --
export const MembersApi = {
  list: () => request<Member[]>('/api/members'),
  create: (data: Partial<Member>) => request<Member>('/api/members', { method: 'POST', ...jsonBody(data) }),
  update: (id: string, data: Partial<Member>) =>
    request<Member>(`/api/members/${id}`, { method: 'PUT', ...jsonBody(data) }),
  remove: (id: string) => request<{ ok: true }>(`/api/members/${id}`, { method: 'DELETE' }),
};

// -- events --
export const EventsApi = {
  list: () => request<EventItem[]>('/api/events'),
  create: (data: Partial<EventItem>) => request<EventItem>('/api/events', { method: 'POST', ...jsonBody(data) }),
  update: (id: string, data: Partial<EventItem>) =>
    request<EventItem>(`/api/events/${id}`, { method: 'PUT', ...jsonBody(data) }),
  remove: (id: string) => request<{ ok: true }>(`/api/events/${id}`, { method: 'DELETE' }),
};

// -- clubs --
export const ClubsApi = {
  list: () => request<Club[]>('/api/clubs'),
  create: (data: Partial<Club>) => request<Club>('/api/clubs', { method: 'POST', ...jsonBody(data) }),
  update: (id: string, data: Partial<Club>) =>
    request<Club>(`/api/clubs/${id}`, { method: 'PUT', ...jsonBody(data) }),
  remove: (id: string) => request<{ ok: true }>(`/api/clubs/${id}`, { method: 'DELETE' }),
};

// -- sections --
export const SectionsApi = {
  list: () => request<Section[]>('/api/sections'),
  create: (data: unknown) => request<Section>('/api/sections', { method: 'POST', ...jsonBody(data) }),
  update: (id: string, data: unknown) => request<Section>(`/api/sections/${id}`, { method: 'PUT', ...jsonBody(data) }),
  remove: (id: string) => request<{ ok: true }>(`/api/sections/${id}`, { method: 'DELETE' }),
  reorder: (order: string[]) =>
    request<Section[]>('/api/sections/reorder', { method: 'POST', ...jsonBody({ order }) }),
};

// -- media --
export const MediaApi = {
  list: () => request<MediaItem[]>('/api/media'),
  upload: (file: File) =>
    request<MediaItem>(`/api/media?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      headers: { 'content-type': file.type },
      body: file,
    }),
  updateAlt: (id: string, alt_text: string) =>
    request<MediaItem>(`/api/media/${id}`, { method: 'PUT', ...jsonBody({ alt_text }) }),
  remove: (id: string) => request<{ ok: true }>(`/api/media/${id}`, { method: 'DELETE' }),
};

// -- users --
export const UsersApi = {
  list: () => request<User[]>('/api/users'),
  create: (data: { email: string; name: string; password: string; role: 'admin' | 'editor' }) =>
    request<User>('/api/users', { method: 'POST', ...jsonBody(data) }),
  update: (id: string, data: { name?: string; role?: 'admin' | 'editor'; password?: string }) =>
    request<User>(`/api/users/${id}`, { method: 'PUT', ...jsonBody(data) }),
  remove: (id: string) => request<{ ok: true }>(`/api/users/${id}`, { method: 'DELETE' }),
};
