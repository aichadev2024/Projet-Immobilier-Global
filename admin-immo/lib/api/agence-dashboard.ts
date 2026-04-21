import { apiFetch } from "@/services/api";

export interface AgenceDashboardStats {
  biensTotal: number;
  biensDisponibles: number;
  biensLoues: number;
  biensVendus: number;
}

export interface AgenceProperty {
  id: number;
  libelle: string;
  adresse: string;
  prixCalculer: number;
  statutBien: string;
}

export interface BienLoue {
  id: number;
  libelle: string;
  adresse: string;
  prix: number;
}

class AgenceDashboardAPI {
  async getStats(): Promise<AgenceDashboardStats> {
    return apiFetch("/api/agence/dashboard/stats");
  }

  async getProprietes(): Promise<AgenceProperty[]> {
    return apiFetch("/api/agence/dashboard/proprietes");
  }

  async getBiensLoues(): Promise<BienLoue[]> {
    return apiFetch("/api/agence/dashboard/biens-loues");
  }
}

export const agenceDashboardAPI = new AgenceDashboardAPI();
