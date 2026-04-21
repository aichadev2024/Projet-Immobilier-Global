import { API_BASE_URL } from "@/services/api";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  nom: string;
  prenom: string;
  telephone?: string;
  roleType: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  username: string;
  role: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===============================
// 📝 VALIDATION DES FORMULAIRES
// ===============================

export class AuthValidator {
  
  // Validation du login
  static validateLogin(credentials: LoginCredentials): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (!credentials.username || credentials.username.trim().length < 3) {
      errors.push({
        field: 'username',
        message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
      });
    }
    
    if (!credentials.password || credentials.password.length < 6) {
      errors.push({
        field: 'password',
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }
    
    return errors;
  }
  
  // Validation de l'inscription
  static validateRegister(data: RegisterData): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Username
    if (!data.username || data.username.trim().length < 3) {
      errors.push({
        field: 'username',
        message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères'
      });
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push({
        field: 'username',
        message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres et underscores'
      });
    }
    
    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push({
        field: 'email',
        message: 'Veuillez entrer une adresse email valide'
      });
    }
    
    // Mot de passe
    if (!data.password || data.password.length < 8) {
      errors.push({
        field: 'password',
        message: 'Le mot de passe doit contenir au moins 8 caractères'
      });
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(data.password)) {
      errors.push({
        field: 'password',
        message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
      });
    }
    
    // Confirmation du mot de passe
    if (data.password !== data.confirmPassword) {
      errors.push({
        field: 'confirmPassword',
        message: 'Les mots de passe ne correspondent pas'
      });
    }
    
    // Nom
    if (!data.nom || data.nom.trim().length < 2) {
      errors.push({
        field: 'nom',
        message: 'Le nom doit contenir au moins 2 caractères'
      });
    }
    
    // Prénom
    if (!data.prenom || data.prenom.trim().length < 2) {
      errors.push({
        field: 'prenom',
        message: 'Le prénom doit contenir au moins 2 caractères'
      });
    }
    
    // Téléphone (optionnel mais si fourni, doit être valide)
    if (data.telephone && !/^[+]?[\d\s-()]+$/.test(data.telephone)) {
      errors.push({
        field: 'telephone',
        message: 'Le numéro de téléphone n\'est pas valide'
      });
    }
    
    // Rôle
    if (!data.roleType || !['PROPRIETAIRE', 'CLIENT'].includes(data.roleType)) {
      errors.push({
        field: 'roleType',
        message: 'Veuillez sélectionner un rôle valide'
      });
    }
    
    return errors;
  }
}

// ===============================
// 🔐 GESTION DES TOKENS
// ===============================

export class TokenManager {
  private static readonly ACCESS_TOKEN_KEY = 'access_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private static readonly USER_KEY = 'user_data';
  
  // Sauvegarder les tokens
  static saveTokens(authResponse: AuthResponse): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, authResponse.access_token);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refresh_token);
      localStorage.setItem(this.USER_KEY, JSON.stringify({
        username: authResponse.username,
        role: authResponse.role
      }));
    }
  }
  
  // Récupérer le access token
  static getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }
  
  // Récupérer le refresh token
  static getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }
  
  // Vérifier si l'utilisateur est connecté
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    
    try {
      // Vérifier si le token n'est pas expiré
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }
  
  // Récupérer les infos utilisateur
  static getUserData(): { username: string; role: string } | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }
  
  // Vérifier si l'utilisateur a un rôle spécifique
  static hasRole(role: string): boolean {
    const userData = this.getUserData();
    return userData?.role === role;
  }
  
  // Nettoyer les tokens (déconnexion)
  static clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }
  
  // Rafraîchir le token
  static async refreshToken(): Promise<AuthResponse | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;
    
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });
      
      if (response.ok) {
        const authResponse = await response.json();
        this.saveTokens(authResponse);
        return authResponse;
      }
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
    }
    
    return null;
  }
}

// ===============================
// 🌐 API CLIENT SÉCURISÉ
// ===============================

export class SecureApiClient {
  private static baseURL = `${API_BASE_URL}`;
  
  // Requête avec authentification automatique
  static async authenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    let token = TokenManager.getAccessToken();
    
    // Si le token est expiré, essayer de le rafraîchir
    if (token && !TokenManager.isAuthenticated()) {
      const refreshResult = await TokenManager.refreshToken();
      if (refreshResult) {
        token = refreshResult.access_token;
      } else {
        // Si le rafraîchissement échoue, déconnecter l'utilisateur
        TokenManager.clearTokens();
        window.location.href = '/login';
        throw new Error('Session expirée');
      }
    }
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });
    
    // Gérer les erreurs d'authentification
    if (response.status === 401) {
      TokenManager.clearTokens();
      window.location.href = '/login';
      throw new Error('Non authentifié');
    }
    
    if (response.status === 403) {
      throw new Error('Accès refusé');
    }
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur serveur' }));
      throw new Error(error.message || 'Erreur lors de la requête');
    }
    
    return response.json();
  }
  
  // Login
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const errors = AuthValidator.validateLogin(credentials);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }
    
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur de connexion' }));
      throw new Error(error.message || 'Identifiants invalides');
    }
    
    const authResponse = await response.json();
    TokenManager.saveTokens(authResponse);
    return authResponse;
  }
  
  // Register
  static async register(data: RegisterData): Promise<void> {
    const errors = AuthValidator.validateRegister(data);
    if (errors.length > 0) {
      throw new Error(errors[0].message);
    }
    
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erreur d\'inscription' }));
      throw new Error(error.message || 'Erreur lors de l\'inscription');
    }
  }
  
  // Logout
  static async logout(): Promise<void> {
    try {
      await this.authenticatedRequest('/auth/logout', { method: 'POST' });
    } finally {
      TokenManager.clearTokens();
    }
  }
}

export default {
  AuthValidator,
  TokenManager,
  SecureApiClient,
};
