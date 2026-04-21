"use client";
import { API_BASE_URL, apiFetch } from "@/services/api";


import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getBiens } from "@/services/bienService";
import VitrineNavbar from "@/components/vitrine/VitrineNavbar";
import HeroSlider from "@/components/vitrine/HeroSlider";
import FooterVitrine from "@/components/vitrine/FooterVitrine";
import TrustSection from "@/components/vitrine/TrustSection";
import { HeroSkeleton } from "@/components/vitrine/LoadingSkeletons";
import { Search, MapPin, ArrowRight, ArrowLeft, X, MessageCircle, Calendar, Loader2, Phone, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [biens, setBiens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // States pour les modals
  const [selectedBien, setSelectedBien] = useState<any>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [contactLoading, setContactLoading] = useState(false);
  
  // States des filtres
  const [search, setSearch] = useState("");
  const [ville, setVille] = useState("");
  const [typeTransaction, setTypeTransaction] = useState<"TOUS" | "LOCATION" | "VENTE">("TOUS");
  const [typeBien, setTypeBien] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    setIsAuthenticated(!!token && token !== "null" && token !== "undefined");
    
    async function loadData() {
      try {
        setLoading(true);
        const data = await getBiens();
        setBiens(data || []);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // 🕵️ Logique de Filtrage Hautement Robuste
  const constFilteredBiens = useMemo(() => {
        
    return biens.filter((bien) => {
            
      // 1. Recherche Textuelle (Multi-champs)
      const searchTerm = search.trim().toLowerCase();
      const matchSearch = !searchTerm || 
        (bien.libelle && bien.libelle.toLowerCase().includes(searchTerm)) ||
        (bien.description && bien.description.toLowerCase().includes(searchTerm)) ||
        (bien.libelleTypeBien && bien.libelleTypeBien.toLowerCase().includes(searchTerm));
      
      // 2. Ville / Localisation
      const villeTerm = ville.trim().toLowerCase();
      const matchVille = !villeTerm || 
        (bien.ville && bien.ville.toLowerCase().includes(villeTerm));
      
      // 3. Type de Bien (Catégorie)
      const matchType = !typeBien || 
        (bien.libelleTypeBien && bien.libelleTypeBien.toLowerCase() === typeBien.toLowerCase());
      
      // 4. Type de Transaction (Vente / Location) - Insensible à la casse
      const bienTransaction = (bien.typeTransaction || "").toString().trim().toUpperCase();
      const matchTransaction = typeTransaction === "TOUS" || 
        bienTransaction === typeTransaction;
      
      const match = matchSearch && matchVille && matchType && matchTransaction;
        
      return match;
    });
  }, [biens, search, ville, typeBien, typeTransaction]);

  // Pagination
  const totalPages = Math.ceil(constFilteredBiens.length / itemsPerPage);
  const currentBiens = constFilteredBiens.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  
  
  const uniqueTypes = [...new Set(biens.map(b => b.libelleTypeBien).filter(Boolean))];

  // 🔒 Gestion des actions protégées avec vérification d'expiration
  const checkAuth = () => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    
    if (!token || token === "null" || token === "undefined") {
      setIsAuthenticated(false);
      return false;
    }
    
    // Vérifier si le token est expiré
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convertir en millisecondes
      const now = Date.now();
      
      if (now > exp) {
        console.log("🔐 checkAuth - Token EXPIRÉ");
        // Nettoyer les tokens expirés
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        return false;
      }
      
      console.log("🔐 checkAuth - Token valide");
      setIsAuthenticated(true);
      return true;
    } catch (e) {
      console.log("🔐 checkAuth - Token invalide");
      setIsAuthenticated(false);
      return false;
    }
  };

  const handleContactClick = (bien: any) => {
    console.log("📞 handleContactClick - bien:", bien.id);
    // 🔒 Sur la vitrine, TOUJOURS rediriger vers login (même si connecté ailleurs)
    const redirectUrl = `/annonces?bien=${bien.id}`;
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
    console.log("🔒 Redirection vers login:", loginUrl);
    router.push(loginUrl);
  };

  const handleReservationClick = (bien: any) => {
    console.log("📅 handleReservationClick - bien:", bien.id);
    // 🔒 Sur la vitrine, TOUJOURS rediriger vers login (même si connecté ailleurs)
    const redirectUrl = `/annonces?bien=${bien.id}`;
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
    console.log("🔒 Redirection vers login:", loginUrl);
    router.push(loginUrl);
  };

  const handleReservationSubmit = async (dateDebut: string, dateFin: string) => {
    if (!selectedBien) return;
    
    try {
      setReservationLoading(true);
      
      await apiFetch("/api/reservations", {
        method: 'POST',
        body: JSON.stringify({
          idBien: selectedBien.id,
          dateDebut: new Date(dateDebut).toISOString(),
          dateFin: new Date(dateFin).toISOString(),
        }),
      });

      setShowReservationModal(false);
      alert('Réservation effectuée avec succès ! Elle est en attente de validation par l\'agence.');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la réservation');
    } finally {
      setReservationLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative selection:bg-blue-200">
      {/* Decorative Blur blobs */}
      <div className="absolute top-0 left-0 w-full h-[50vh] overflow-hidden -z-10 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-20 -left-20 w-72 h-72 bg-emerald-50/40 rounded-full blur-3xl opacity-50" />
      </div>
      <VitrineNavbar />

      {loading ? (
        <HeroSkeleton />
      ) : (
        <HeroSlider biens={biens} />
      )}

      {/* Main Content Area */}
      <main id="biens" className="relative py-20 md:py-32 container-custom z-10">
        <div className="flex flex-col items-center text-center mb-20 px-4 mt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50/80 border border-blue-100 mb-8 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-blue-700 font-bold text-[10px] uppercase tracking-widest">Collection Privée</span>
          </motion.div>
          <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tighter leading-[1.05]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500">L'immobilier</span> redéfini.
          </h2>
          <p className="text-slate-500 max-w-2xl text-base md:text-xl font-medium leading-relaxed">
            Trouvez la résidence qui correspond parfaitement à votre style de vie. Une sélection rigoureuse des biens les plus exclusifs en temps réel.
          </p>
        </div>

        {/* Floating Filter Bar */}
        <div className="sticky top-24 z-[40] mb-16 mx-auto max-w-6xl px-4">
          <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/60 rounded-[2rem] sm:rounded-[2.5rem] p-2 sm:p-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] transition-all duration-500 hover:shadow-[0_8px_50px_-12px_rgba(0,0,0,0.15)]">
            <div className="flex flex-col lg:flex-row items-center gap-2">
              <div className="relative w-full lg:flex-1">
                <Search className="absolute left-5 top-4 text-slate-400" size={20} />
                <input
                  type="text"
                  placeholder="Rechercher (ville, quartier)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 bg-slate-50/80 border border-slate-100 rounded-[1.5rem] sm:rounded-[2rem] text-sm font-bold text-slate-900 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all placeholder:text-slate-400 placeholder:font-medium outline-none"
                />
                
                {/* Mobile Filter Toggle */}
                <button 
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="absolute right-2 top-2 bottom-2 px-4 lg:hidden bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
                  {showMobileFilters ? "Fermer" : "Filtres"}
                </button>
              </div>

              {/* desktop filters (always visible) */}
              <div className="hidden lg:flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 border-l border-slate-200/60">
                   {["Bamako", "Kati", "Ségou"].map(v => (
                     <button 
                      key={v}
                      onClick={() => setVille(v === ville ? "" : v)}
                      className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${ville === v ? 'bg-slate-900 text-white shadow-md scale-105' : 'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                     >
                       {v}
                     </button>
                   ))}
                </div>

                <div className="flex items-center gap-2 px-4 border-l border-slate-200/60">
                  {["TOUS", "VENTE", "LOCATION"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTypeTransaction(type as any)}
                      className={`px-6 py-4 rounded-[1.75rem] text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
                        typeTransaction === type ? "bg-blue-600 text-white shadow-lg" : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      {type === "TOUS" ? "Tous" : type === "VENTE" ? "Vente" : "Location"}
                    </button>
                  ))}
                </div>

                <div className="w-48 bg-slate-50/80 rounded-[2rem] border border-slate-100 overflow-hidden pr-4 relative">
                  <select
                      value={typeBien}
                      onChange={(e) => setTypeBien(e.target.value)}
                      className="w-full pl-5 pr-8 py-4 bg-transparent border-none outline-none appearance-none text-[11px] font-black uppercase tracking-widest text-slate-700 cursor-pointer"
                  >
                      <option value="">Tous les types</option>
                      {uniqueTypes.map((t: any) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                     <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>

              {/* Mobile Filter Collapsible */}
              <AnimatePresence>
                {showMobileFilters && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="w-full lg:hidden flex flex-col gap-3 overflow-hidden border-t border-slate-100 mt-2 pt-4 pb-2 px-2"
                  >
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 ml-2">Villes</span>
                      <div className="flex flex-wrap gap-2">
                        {["Bamako", "Kati", "Ségou"].map(v => (
                          <button 
                            key={v}
                            onClick={() => setVille(v === ville ? "" : v)}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${ville === v ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 ml-2">Type de Transaction</span>
                      <div className="flex flex-wrap gap-2">
                        {["TOUS", "VENTE", "LOCATION"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setTypeTransaction(type as any)}
                            className={`flex-1 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                              typeTransaction === type ? "bg-blue-600 text-white shadow-lg" : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {type === "TOUS" ? "Tous" : type === "VENTE" ? "Vente" : "Location"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase text-slate-400 ml-2">Type de Bien</span>
                      <div className="w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden pr-4 relative">
                        <select
                            value={typeBien}
                            onChange={(e) => setTypeBien(e.target.value)}
                            className="w-full pl-4 pr-8 py-3 bg-transparent border-none outline-none appearance-none text-[10px] font-black uppercase tracking-widest text-slate-700 font-bold"
                        >
                            <option value="">Tous les types</option>
                            {uniqueTypes.map((t: any) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-8 px-2">
           <div className="flex items-center gap-3">
             <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
               Résultats ({constFilteredBiens.length})
             </h3>
             {search && (
               <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                 Recherche: "{search}"
               </span>
             )}
             {ville && (
               <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                 <MapPin className="w-3 h-3 inline mr-1" />
                 {ville}
               </span>
             )}
           </div>
           {(search || ville || typeBien || typeTransaction !== "TOUS") && (
             <button 
               onClick={() => { setSearch(""); setVille(""); setTypeBien(""); setTypeTransaction("TOUS"); }} 
               className="flex items-center gap-1 px-3 py-2 rounded-xl text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 transition-colors"
             >
                <X className="w-3 h-3" />
                Effacer filtres
             </button>
           )}
        </div>

        {/* Grid */}
        <div className="mb-20">
          {!loading && currentBiens.length > 0 ? (
            <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {currentBiens.map((bien, i) => {
                  return (
                    <PropertyCardWithActions 
                      key={bien.id} 
                      bien={bien} 
                      index={i} 
                      onContact={() => handleContactClick(bien)}
                      onReserve={() => handleReservationClick(bien)}
                      isAuthenticated={isAuthenticated}
                    />
                  );
                })}
              </motion.div>
            </AnimatePresence>
          ) : !loading && constFilteredBiens.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100"
            >
               <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                 <Search className="w-10 h-10 text-slate-400" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun résultat trouvé</h3>
               <p className="text-slate-500 mb-6 max-w-md mx-auto">
                 Aucun bien ne correspond à vos critères de recherche. Essayez de modifier vos filtres ou termes de recherche.
               </p>
               <div className="flex flex-wrap justify-center gap-2">
                 <button 
                   onClick={() => { setSearch(""); setVille(""); setTypeBien(""); setTypeTransaction("TOUS"); }}
                   className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                 >
                   Réinitialiser la recherche
                 </button>
               </div>
               {(search || ville) && (
                 <div className="mt-8 pt-8 border-t border-slate-100">
                   <p className="text-sm text-slate-400 mb-4">Suggestions populaires :</p>
                   <div className="flex flex-wrap justify-center gap-2">
                     {["Bamako", "Location", "Vente", "Appartement"].map((suggestion) => (
                       <button
                         key={suggestion}
                         onClick={() => {
                           if (["Bamako"].includes(suggestion)) setVille(suggestion);
                           else if (["Location", "Vente"].includes(suggestion)) setTypeTransaction(suggestion as any);
                           else setSearch(suggestion);
                         }}
                         className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm hover:bg-slate-200 transition-colors"
                       >
                         {suggestion}
                       </button>
                     ))}
                   </div>
                 </div>
               )}
            </motion.div>
          )}
        </div>

        {/* Pagination Logic */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 sm:gap-3 py-12 sm:py-16">
            <button
              onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              disabled={currentPage === 1}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center bg-white border border-slate-200 disabled:opacity-30 active:scale-95 transition-all shadow-sm"
              aria-label="Page précédente"
            >
              <ArrowLeft size={18} />
            </button>
            
            <div className="flex gap-1.5 sm:gap-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentPage(i + 1); window.scrollTo({top: 0, behavior: 'smooth'}); }}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all active:scale-95 ${
                    currentPage === i + 1 ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "bg-white text-slate-500 border border-slate-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({top: 0, behavior: 'smooth'}); }}
              disabled={currentPage === totalPages}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center bg-blue-600 text-white disabled:opacity-30 active:scale-95 transition-all shadow-lg shadow-blue-600/20"
              aria-label="Page suivante"
            >
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </main>

      <TrustSection biensCount={biens.length} agencesCount={5} />
      <FooterVitrine />

      {/* Modal de Contact */}
      {showContactModal && selectedBien && (
        <ContactModal
          bien={selectedBien}
          onClose={() => setShowContactModal(false)}
        />
      )}

      {/* Modal de Réservation */}
      {showReservationModal && selectedBien && (
        <ReservationModal
          bien={selectedBien}
          onClose={() => setShowReservationModal(false)}
          onSubmit={handleReservationSubmit}
          loading={reservationLoading}
        />
      )}
    </div>
  );
}

// Composant Carte avec boutons d'action protégés
function PropertyCardWithActions({ 
  bien, 
  index, 
  onContact, 
  onReserve,
  isAuthenticated 
}: { 
  bien: any; 
  index: number; 
  onContact: () => void;
  onReserve: () => void;
  isAuthenticated: boolean;
}) {
  console.log(`=== CARTE BIEN ${bien.id} ===`, {
    id: bien.id,
    libelle: bien.libelle,
    utilisateur: bien.utilisateur,
    agenceData: bien.utilisateur?.agence
  });
  
  const imageUrl = bien.images?.[0] ? 
    (bien.images[0].startsWith("http") ? bien.images[0] : `${API_BASE_URL}${bien.images[0]}`) 
    : "/images/maison bamako.webp";
  const category = bien.libelleTypeBien || "Bien Immobilier";
  const price = bien.prixCalculer ?? 0;
  const isLocation = bien.typeTransaction === "LOCATION";
  const imageCount = bien.images?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group"
    >
      <div className="bg-white rounded-[2rem] overflow-hidden border border-transparent shadow-[0_2px_20px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-500 h-full flex flex-col group/inner relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/5 opacity-0 group-hover/inner:opacity-100 transition-opacity duration-500 pointer-events-none" />
        {/* Image Section */}
        <a href={`/annonces?bien=${bien.id}`} className="block relative aspect-[4/3] overflow-hidden m-2 rounded-[1.5rem] bg-slate-100">
          <img
            src={imageUrl}
            alt={bien.libelle}
            className="w-full h-full object-cover group-hover/inner:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => ((e.target as HTMLImageElement).src = "/images/maison bamako.webp")}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover/inner:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-md backdrop-blur-md ${isLocation ? 'bg-emerald-600/90' : 'bg-blue-600/90'}`}>
              {isLocation ? 'À Louer' : 'À Vendre'}
            </span>
          </div>
          {imageCount > 1 && (
            <div className="absolute top-4 right-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/40 backdrop-blur-md rounded-full text-[10px] font-black text-white shadow-sm border border-white/10">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                {imageCount}
              </span>
            </div>
          )}
        </a>

        {/* Content Section */}
        <div className="p-5 flex flex-col flex-grow">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 opacity-80">
            {category}
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-2 line-clamp-1 group-hover/inner:text-blue-600 transition-colors leading-tight">
            {bien.libelle}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-3">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate">{bien.ville || "Bamako, Mali"}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-4 mb-4 pt-3 border-t border-slate-100/80 text-slate-500">
            {bien.nbChambres > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold">{bien.nbChambres} ch</span>
              </div>
            )}
            {bien.nbSalles > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold">{bien.nbSalles} sdb</span>
              </div>
            )}
            {bien.superficie > 0 && (
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold">{bien.superficie} m²</span>
              </div>
            )}
          </div>

          {/* Prix */}
          <div className="mb-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prix {isLocation ? 'mensuel' : 'demandé'}</span>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {new Intl.NumberFormat("fr-FR").format(price)}
              <span className="text-xs font-bold ml-1 text-slate-400">FCFA</span>
            </div>
                      </div>

          {/* Boutons d'action protégés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 mt-auto pt-4 border-t border-slate-100">
            <button
              onClick={onContact}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl transition-all duration-300 font-bold text-xs shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <MessageCircle size={14} className="sm:w-4 sm:h-4" />
              <span className="truncate">{isAuthenticated ? "Contacter" : "Se connecter"}</span>
            </button>
            
            <button
              onClick={onReserve}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 sm:py-2.5 px-4 rounded-xl sm:rounded-2xl transition-all duration-300 font-bold text-xs shadow-lg shadow-emerald-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Calendar size={14} className="sm:w-4 sm:h-4" />
              <span className="truncate">{isAuthenticated ? "Réserver" : "Réserver"}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Modal de Contact WhatsApp
function ContactModal({ bien, onClose }: { bien: any; onClose: () => void }) {
  // Extraction du numéro de l'agence (fallback sur un numéro par défaut)
  const phoneNumber = bien.utilisateur?.telephone || bien.telephone || "+22300000000";
  // Formatage du numéro pour l'URL WhatsApp (suppression des espaces et du +)
  const waNumber = phoneNumber.replace(/[^0-9]/g, '');
  const waMessage = encodeURIComponent(`Bonjour, je suis intéressé(e) par votre bien "${bien.libelle}" situé à ${bien.ville}. Pouvons-nous en discuter ?`);
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Décoration d'arrière-plan */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <MessageCircle size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Contacter</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors">
            <X size={18} />
          </button>
        </div>
        
        <div className="mb-8 relative">
          <p className="text-sm text-slate-500 font-medium mb-1">À propos de :</p>
          <p className="text-base font-bold text-slate-900 line-clamp-2 leading-snug">{bien.libelle}</p>
        </div>

        <div className="space-y-3 relative">
          {/* Appel Direct */}
          <a 
            href={`tel:${phoneNumber}`}
            className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3.5 px-4 rounded-xl transition-all duration-300 font-bold flex items-center justify-center gap-3 group"
          >
            <Phone size={18} className="text-slate-400 group-hover:text-slate-600" />
            <span>Appeler : {phoneNumber}</span>
          </a>

          {/* Bouton WhatsApp */}
          <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl shadow-lg shadow-green-600/20 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-2"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            Discussion WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

// Modal de Réservation
function ReservationModal({ 
  bien, 
  onClose, 
  onSubmit, 
  loading 
}: { 
  bien: any; 
  onClose: () => void; 
  onSubmit: (dateDebut: string, dateFin: string) => void;
  loading: boolean;
}) {
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  console.log("*** MODAL RÉSERVATION - BIEN DATA:", {
    bienId: bien.id,
    agenceData: bien.utilisateur?.agence,
    visitePayante: bien.utilisateur?.agence?.visitePayante,
    tarifVisite: bien.utilisateur?.agence?.tarifVisite,
    tarifType: typeof bien.utilisateur?.agence?.tarifVisite
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dateDebut && dateFin) {
      onSubmit(dateDebut, dateFin);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">Réserver {bien.libelle}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <p className="text-sm text-slate-600 mb-4">
          La demande sera soumise à l'agence pour validation.
        </p>

        {/* Affichage du tarif de visite si payant */}
        {bien.utilisateur?.agence?.visitePayante && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-amber-600" />
              <span className="text-sm font-bold text-amber-800">Visite payante</span>
            </div>
            <p className="text-sm text-amber-700 mt-1">
              Cette agence facture les visites à <strong>{bien.utilisateur.agence.tarifVisite?.toLocaleString()} FCFA</strong>
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Date de début</label>
            <input
              type="datetime-local"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Date de fin</label>
            <input
              type="datetime-local"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-medium"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !dateDebut || !dateFin}
              className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 font-medium flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
              {loading ? "Validation..." : "Confirmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
