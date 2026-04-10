export async function apiFetch(
  url: string,
  options: RequestInit = {}
) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken") ||
        sessionStorage.getItem("accessToken")
      : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // 👇 Ajouter Content-Type seulement si body JSON
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error("Erreur API");
  }

  return response.json();
}