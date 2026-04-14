import type { AdminStats, Course, CourseFormValues } from '../types/course';
import type { LoginResponse, User } from '../types/user';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
const TOKEN_KEY = 'pdf_academy_admin_token';

type ApiErrorBody = {
  detail?: string;
};

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getFileUrl(pdfUrl: string): string {
  if (pdfUrl.startsWith('http')) {
    return pdfUrl;
  }

  const apiRoot = API_BASE_URL.replace(/\/api\/?$/, '');
  return `${apiRoot}${pdfUrl}`;
}

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.detail || 'Une erreur est survenue.';
  } catch {
    return response.statusText || 'Une erreur est survenue.';
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function buildCourseForm(values: CourseFormValues): FormData {
  const formData = new FormData();
  formData.append('title', values.title);
  formData.append('description', values.description);

  if (values.file) {
    formData.append('file', values.file);
  }

  return formData;
}

export const api = {
  login(username: string, password: string) {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  me() {
    return request<User>('/auth/me');
  },

  getCourses() {
    return request<Course[]>('/courses');
  },

  getCourse(id: number) {
    return request<Course>(`/courses/${id}`);
  },

  createCourse(values: CourseFormValues) {
    return request<Course>('/courses', {
      method: 'POST',
      body: buildCourseForm(values),
    });
  },

  updateCourse(id: number, values: CourseFormValues) {
    return request<Course>(`/courses/${id}`, {
      method: 'PUT',
      body: buildCourseForm(values),
    });
  },

  deleteCourse(id: number) {
    return request<void>(`/courses/${id}`, {
      method: 'DELETE',
    });
  },

  getStats() {
    return request<AdminStats>('/admin/stats');
  },
};
