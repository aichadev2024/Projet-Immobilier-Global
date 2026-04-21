import { apiFetch } from "@/services/api";

export async function getCurrentUser() {
  return apiFetch("/api/utilisateurs/me");
}