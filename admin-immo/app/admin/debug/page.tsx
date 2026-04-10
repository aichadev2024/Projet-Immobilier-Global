"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DebugPage() {
  const [token, setToken] = useState<string>("");
  const [testResults, setTestResults] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    setToken(storedToken || "");
  }, []);

  const addResult = (test: string, success: boolean, message: string, data?: any) => {
    setTestResults(prev => [...prev, { test, success, message, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testTokenValidity = async () => {
    if (!token) {
      addResult("Token Check", false, "Aucun token trouvé");
      return;
    }

    try {
      // Test 1: Profil utilisateur
      const profileResponse = await fetch("http://localhost:8080/api/utilisateurs/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (profileResponse.ok) {
        const userData = await profileResponse.json();
        addResult("Profil (/api/utilisateurs/me)", true, "✅ Profil récupéré", userData);
      } else {
        const error = await profileResponse.text();
        addResult("Profil (/api/utilisateurs/me)", false, `❌ ${profileResponse.status}: ${error}`);
      }

      // Test 2: Stats dashboard
      const statsResponse = await fetch("http://localhost:8080/api/admin/dashboard/stats", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        addResult("Stats (/api/admin/dashboard/stats)", true, "✅ Stats récupérées", statsData);
      } else {
        const error = await statsResponse.text();
        addResult("Stats (/api/admin/dashboard/stats)", false, `❌ ${statsResponse.status}: ${error}`);
      }

      // Test 4: Liste des agences (pour debug)
      const agencesResponse = await fetch("http://localhost:8080/api/admin/validation/agences", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (agencesResponse.ok) {
        const agencesData = await agencesResponse.json();
        addResult("Agences List (/api/admin/validation/agences)", true, "✅ Liste des agences récupérée", agencesData);
      } else {
        const error = await agencesResponse.text();
        addResult("Agences List (/api/admin/validation/agences)", false, `❌ ${agencesResponse.status}: ${error}`);
      }

    } catch (error) {
      addResult("Network Error", false, `❌ Erreur réseau: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const testBackendConnection = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/utilisateurs/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      addResult("Backend Connection", response.ok, 
        response.ok ? "✅ Backend accessible" : `❌ Backend répond avec ${response.status}`,
        { status: response.status, statusText: response.statusText }
      );
    } catch (error) {
      addResult("Backend Connection", false, `❌ Backend inaccessible: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const clearToken = () => {
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setToken("");
    addResult("Clear Token", true, "✅ Token supprimé du stockage");
  };

  const goToLogin = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">🔍 Debug Admin Panel</h1>

        {/* Token Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🔑 Token Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Token trouvé:</span>
              <span className={`font-medium ${token ? "text-green-600" : "text-red-600"}`}>
                {token ? "✅ Oui" : "❌ Non"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Longueur:</span>
              <span className="font-medium">{token?.length || 0} caractères</span>
            </div>
            <div>
              <span className="text-gray-600">Début du token:</span>
              <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-sm break-all">
                {token ? token.substring(0, 50) + "..." : "Aucun token"}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Tests</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={testBackendConnection}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Test Backend
            </button>
            <button
              onClick={testTokenValidity}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Test Token
            </button>
            <button
              onClick={clearToken}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Clear Token
            </button>
            <button
              onClick={goToLogin}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Résultats des tests</h2>
          <div className="space-y-2">
            {testResults.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Aucun test effectué</p>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.success 
                      ? "bg-green-50 border-green-200" 
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{result.test}</div>
                      <div className="text-sm text-gray-600 mt-1">{result.message}</div>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-sm text-blue-600 cursor-pointer">Détails</summary>
                          <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 ml-4">
                      {result.timestamp}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">📖 Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-800">
            <li>Assurez-vous que le backend Spring Boot tourne sur localhost:8080</li>
            <li>Connectez-vous d'abord via la page de login</li>
            <li>Cliquez sur "Test Token" pour vérifier la validité du token</li>
            <li>Cliquez sur "Test Backend" pour vérifier la connexion au backend</li>
            <li>Si vous avez une erreur 401, le token est probablement expiré</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
