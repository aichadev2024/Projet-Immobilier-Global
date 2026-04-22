// API Base URL (env > localhost > same LAN IP)
function resolveApiBaseUrl(): string {
  // 1) Priorite aux variables d'environnement
  const envUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  // 2) Cote navigateur: utiliser localhost en local, sinon meme host sur port 8080
  if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:8080";
    }
    // Permet l'acces mobile en utilisant l'IP/host qui sert le front
    return `${protocol}//${hostname}:8080`;
  }

  // 3) Fallback SSR/dev
  return "http://localhost:8080";
}

export const API_BASE_URL = resolveApiBaseUrl();

// 👇 Utiliser le proxy pour éviter CORS sur mobile
function getApiUrl(path: string): string {
  // Si on est sur localhost, appeler directement
  if (typeof window !== "undefined") {
    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return path;
    }
    // Sur mobile/LAN: utiliser le proxy Next.js pour éviter CORS
    return path.replace(`${API_BASE_URL}/api`, "/api/proxy");
  }
  return path;
}

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

  // 👇 Timeout pour mobile (10 secondes)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  // Utiliser le proxy si nécessaire
  const finalUrl = getApiUrl(url);

  try {
    const response = await fetch(finalUrl, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      // 👇 Erreur spécifique pour 401
      if (response.status === 401) {
        throw new Error("401: Token invalide ou expiré");
      }
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    // 👇 Gérer le timeout spécifiquement
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Timeout: Le serveur ne répond pas");
    }
    throw error;
  }
}