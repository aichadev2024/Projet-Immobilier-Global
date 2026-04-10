import { apiFetch } from "@/services/api";

export async function getCurrentUser() {
  return apiFetch("http://localhost:8080/api/utilisateurs/me");
}