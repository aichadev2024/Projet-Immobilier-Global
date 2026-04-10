const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

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
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async getStats(): Promise<AgenceDashboardStats> {
    const response = await fetch(`${API_BASE_URL}/api/agence/dashboard/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  async getProprietes(): Promise<AgenceProperty[]> {
    const response = await fetch(`${API_BASE_URL}/api/agence/dashboard/proprietes`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }

  async getBiensLoues(): Promise<BienLoue[]> {
    const response = await fetch(`${API_BASE_URL}/api/agence/dashboard/biens-loues`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    return response.json();
  }
}

export const agenceDashboardAPI = new AgenceDashboardAPI();
