"use client";
import { API_BASE_URL } from "@/services/api";


import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, Bed, Bath, Square, Calendar, 
  ChevronLeft, Share2, Heart, ShieldCheck, 
  Phone, Mail, ArrowRight, CheckCircle2, AlertCircle 
} from "lucide-react";
import { motion } from "framer-motion";

export default function AnnonceDetails() {
  const params = useParams();
  const router = useRouter();
  const [bien, setBien] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [message, setMessage] = useState("Bonjour, je suis intéressé par ce bien. J'aimerais avoir plus de détails et éventuellement planifier une visite.");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!params.id) return;

    const fetchBien = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/biens/${params.id}`);
        if (!res.ok) throw new Error("Bien introuvable ou erreur serveur");
        const data = await res.json();
        setBien(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBien();
  }, [params.id]);

  const handleContactClick = () => {
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!token) {
      // Rediriger vers login avec paramètre de retour
      router.push(`/login?redirect=/annonces/${params.id}`);
      return;
    }
    setIsContactModalOpen(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    
    try {
      // POST vers l'API de contacts
      // C'est un endpoint hypothétique, à adapter selon le backend exact
      const res = await fetch(`${API_BASE_URL}/api/contacts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          bienId: bien.id,
          message: message
        }),
      });

      if (!res.ok) throw new Error("Erreur lors de l'envoi du message");
      
      setSuccess(true);
      setTimeout(() => {
        setIsContactModalOpen(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      alert("Une erreur est survenue lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !bien) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-rose-50 text-rose-600 p-6 rounded-2xl max-w-md text-center">
          <p className="font-bold text-lg mb-2">Oups !</p>
          <p>{error || "Ce bien n'existe pas ou n'est plus disponible."}</p>
          <button 
            onClick={() => router.push("/")}
            className="mt-6 px-6 py-2 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition"
          >
            Retourner à l'accueil
          </button>
        </div>
      </div>
    );
  }

  const imageUrl = bien.images && bien.images.length > 0 
    ? (bien.images[0].startsWith("http") ? bien.images[0] : `${API_BASE_URL}${bien.images[0]}`)
    : "/images/Appartement a sotuba.jpg"; // Fallback image premium

  return (
    <div className="bg-slate-50 min-h-screen lg:pt-24 pt-20 pb-20">
      
      {/* Container Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Actions Top */}
        <div className="flex justify-between items-center py-4 mb-4">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ChevronLeft size={18} />
            Retour aux annonces
          </button>
          
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-medium transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Share2 size={18} />
              <span className="hidden sm:inline">Partager</span>
            </button>
            <button className="flex items-center gap-2 text-slate-500 hover:text-rose-600 font-medium transition-colors bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
              <Heart size={18} />
              <span className="hidden sm:inline">Sauvegarder</span>
            </button>
          </div>
        </div>

        {/* Grille principale (Image large + Sidebar collante) */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Section Gauche : Images et Détails */}
          <div className="lg:w-2/3 space-y-8">
            
            {/* Héro Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="w-full h-[400px] md:h-[500px] bg-slate-200 rounded-[2.5rem] overflow-hidden shadow-xl"
            >
              <img 
                src={imageUrl} 
                alt={bien.libelle} 
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* En-tête Titre & Prix (Mobile visible, Desktop parfois masqué si dans sidebar) */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-white shadow-sm ${bien.typeTransaction === 'LOCATION' ? 'bg-emerald-600' : 'bg-blue-600'}`}>
                  À {bien.typeTransaction === 'LOCATION' ? 'Louer' : 'Vendre'}
                </span>
                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-slate-200 text-slate-600 shadow-sm">
                  {bien.libelleTypeBien || 'Appartement'}
                </span>
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
                {bien.libelle}
              </h1>
              
              <div className="flex items-center gap-2 text-slate-500 text-lg font-medium">
                <MapPin size={22} className="text-indigo-500" />
                <span>{bien.adresse || "Adresse non spécifiée"}, {bien.ville || "Mali"}</span>
              </div>
            </div>

            {/* Caractéristiques Clés */}
            <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-wrap gap-y-6 justify-between items-center divide-x divide-slate-100">
              <div className="px-4 flex flex-col items-center flex-1">
                <Bed size={28} className="text-slate-400 mb-2" />
                <span className="text-2xl font-black text-slate-900">{bien.nbChambres || "-"}</span>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Chambres</span>
              </div>
              <div className="px-4 flex flex-col items-center flex-1">
                <Bath size={28} className="text-slate-400 mb-2" />
                <span className="text-2xl font-black text-slate-900">{bien.nbSalles || "-"}</span>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Salles de bain</span>
              </div>
              <div className="px-4 flex flex-col items-center flex-1">
                <Square size={28} className="text-slate-400 mb-2" />
                <span className="text-2xl font-black text-slate-900">{bien.superficie || "-"} <span className="text-lg">m²</span></span>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Surface</span>
              </div>
              <div className="px-4 flex flex-col items-center flex-1">
                <Calendar size={28} className="text-slate-400 mb-2" />
                <span className="text-2xl font-black text-slate-900">{bien.anneeConstruction || "-"}</span>
                <span className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">Année</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6">À propos de ce bien</h2>
              <div className="prose prose-lg prose-slate max-w-none text-slate-600 leading-relaxed space-y-4 whitespace-pre-line">
                {bien.description || "Aucune description fournie pour ce bien."}
              </div>
            </div>

            {/* Commodités */}
            <div className="bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 mb-6">Commodités & Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {["Climatisation", "Garage", "Jardin", "Piscine", "Sécurité 24/7", "Fibre Optique"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <CheckCircle2 size={20} className="text-emerald-500" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section Droite : Sidebar Collante (Prix et Contact) */}
          <div className="lg:w-1/3">
            <div className="sticky top-28 space-y-8">
              
              {/* Carte d'Action */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)]">
                <div className="mb-6">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Prix {bien.typeTransaction === 'LOCATION' ? 'mensuel' : 'demandé'}</span>
                  <div className="text-4xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                    {new Intl.NumberFormat("fr-FR").format(bien.prixCalculer || 0)}
                    <span className="text-lg font-bold text-slate-500">FCFA</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {bien.utilisateur?.agence?.visitePayante ? (
                     <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
                       <AlertCircle size={24} className="text-amber-600 mt-0.5 flex-shrink-0" />
                       <div className="flex-1">
                         <p className="text-sm font-bold text-amber-900">Visite payante</p>
                         <p className="text-sm font-medium text-amber-700 mt-1">
                           Frais de visite: <span className="font-black">{bien.utilisateur.agence.tarifVisite?.toLocaleString()} FCFA</span>
                         </p>
                         <p className="text-xs text-amber-600 mt-1">À prévoir lors de la visite sur place</p>
                       </div>
                     </div>
                  ) : (
                     <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border-2 border-emerald-200">
                       <CheckCircle2 size={24} className="text-emerald-600 mt-0.5 flex-shrink-0" />
                       <div className="flex-1">
                         <p className="text-sm font-bold text-emerald-900">Visite gratuite</p>
                         <p className="text-sm font-medium text-emerald-700 mt-1">
                           Aucuns frais de visite requis
                         </p>
                         <p className="text-xs text-emerald-600 mt-1">Profitez d'une visite sans engagement</p>
                       </div>
                     </div>
                  )}
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <ShieldCheck size={24} className="text-indigo-600" />
                    <div>
                      <p className="text-sm font-bold text-slate-900">Contact sécurisé</p>
                      <p className="text-xs font-medium text-slate-500">Agences vérifiées par Immo Global</p>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleContactClick}
                  className="w-full py-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg shadow-xl shadow-indigo-600/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-3 group"
                >
                  Contacter l'agence
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Info Agence */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-indigo-50 rounded-full mb-4 overflow-hidden border-4 border-white shadow-md flex items-center justify-center text-indigo-600 font-black text-3xl">
                  {bien.utilisateur?.nom?.[0] || 'A'}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{bien.utilisateur?.nom || "Agence Immobilière"}</h3>
                
                {bien.createdByNom ? (
                  <p className="text-[10px] font-black text-indigo-600 mb-6 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full">
                     Publié par {bien.createdByPrenom} {bien.createdByNom}
                  </p>
                ) : (
                  <p className="text-[10px] font-black text-indigo-600 mb-6 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-full">
                     Partenaire vérifié
                  </p>
                )}
                
                <div className="w-full flex gap-3">
                  <button onClick={handleContactClick} className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-slate-700 font-bold">
                    <Phone size={18} /> Appel
                  </button>
                  <button onClick={handleContactClick} className="flex-1 py-3 px-4 rounded-xl border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-slate-700 font-bold">
                    <Mail size={18} /> Email
                  </button>
                </div>
              </div>
              
            </div>
          </div>

        </div>
      </div>

      {/* Modal Contact */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl relative"
          >
            <button 
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
            
            <h2 className="text-2xl font-black text-slate-900 mb-2">Envoyer un message</h2>
            <p className="text-slate-500 font-medium mb-6">L'agence vous recontactera rapidement.</p>

            {success ? (
              <div className="bg-emerald-50 text-emerald-600 p-6 rounded-2xl flex flex-col items-center text-center">
                <CheckCircle2 size={48} className="mb-4 text-emerald-500" />
                <p className="font-bold text-lg">Message envoyé avec succès !</p>
                <p className="text-emerald-700/80 mt-2 font-medium">L'agence a bien reçu votre demande.</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Votre Message</label>
                  <textarea 
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900 transition-all resize-none"
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit"
                  disabled={sending}
                  className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {sending ? "Envoi en cours..." : "Envoyer ma demande"}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
