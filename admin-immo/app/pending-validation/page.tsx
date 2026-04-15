"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, FileText, CheckCircle, ArrowRight, LogOut } from "lucide-react";
import BrandMark from "@/components/vitrine/BrandMark";

export default function PendingValidationPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    const pendingValidation = localStorage.getItem("pendingValidation") || sessionStorage.getItem("pendingValidation");
    
    if (!token || pendingValidation !== "true") {
      router.push("/login");
      return;
    }

    // Récupérer les infos utilisateur
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:8080/api/utilisateurs/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          setUser(await res.json());
        }
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <BrandMark variant="light" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Status Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200 p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-amber-600" />
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
              Compte en attente de validation
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
              Bonjour <span className="font-semibold text-slate-900">{user?.prenom || user?.nom}</span>,
              votre compte agence est actuellement en cours de vérification par notre équipe.
            </p>

            {/* Info Cards */}
            <div className="grid md:grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Documents vérifiés</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Nos administrateurs examinent vos documents (registre de commerce, pièce d'identité, etc.)
                </p>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">Accès complet</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Une fois validé, vous pourrez publier des annonces et gérer vos biens
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-medium border border-amber-200 mb-8">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              En attente de validation admin
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-left">
              <p className="text-sm text-blue-800">
                <strong>⏱ Délais :</strong> La validation prend généralement entre 24 et 48 heures ouvrées. 
                Vous recevrez un email de confirmation dès que votre compte sera activé.
              </p>
            </div>

            {/* Contact */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-slate-600 text-sm mb-3">
                Une question ? Contactez notre support
              </p>
              <a 
                href="mailto:support@bamakohome.ml" 
                className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
              >
                support@bamakohome.ml
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-slate-400 text-sm mt-6">
            Merci de votre patience et bienvenue sur BamakoHome !
          </p>
        </div>
      </main>
    </div>
  );
}
