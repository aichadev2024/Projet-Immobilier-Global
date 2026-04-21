// API Configuration - Stable & Simple
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.1.18:8080';

export const API_BASE_URL = API_URL;

export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  // Get token
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken")
    : null;

  // Build headers
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token && token !== "null" && token !== "undefined") {
    headers.Authorization = `Bearer ${token}`;
  }

  // Build full URL
  const fullUrl = url.startsWith("http") ? url : `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;

  // Call API
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Handle 401 - just throw error, let caller handle redirect
  if (response.status === 401) {
    throw new Error("Session expirée");
  }

  // Parse response
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: `Erreur ${response.status}` }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}