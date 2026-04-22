"use client";

import { useEffect } from "react";
import { AuthProvider } from "@/app/context/AuthContext";
import { API_BASE_URL } from "@/services/api";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Patch global pour mobile: remplace les URLs backend hardcodées.
    const originalFetch = window.fetch.bind(window);
    const legacyOrigins = [
      "http://localhost:8080",
      "http://127.0.0.1:8080",
      "http://192.168.1.18:8080",
    ];

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (typeof input === "string") {
        let patchedUrl = input;
        for (const legacyOrigin of legacyOrigins) {
          if (patchedUrl.startsWith(legacyOrigin)) {
            patchedUrl = patchedUrl.replace(legacyOrigin, API_BASE_URL);
            break;
          }
        }
        return originalFetch(patchedUrl, init);
      }
      return originalFetch(input, init);
    }) as typeof window.fetch;

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return <AuthProvider>{children}</AuthProvider>;
}