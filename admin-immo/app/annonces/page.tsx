"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getBiens } from "@/services/bienService";
import { 
  ArrowLeft, MapPin, Bed, Bath, Square, Car, 
  Wifi, Trees, CheckCircle, MessageCircle, Calendar, Phone, Share2, Loader2, X, Mail
} from "lucide-react";

export default function AnnonceDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bienId = searchParams.get("bien");
  
  const [bien, setBien] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationLoading, setReservationLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    setIsAuthenticated(!!token && token !== "null" && token !== "undefined");

    if (!bienId) {
      router.push("/");
      return;
    }

    async function fetchData() {
      try {
        const allBiens = await getBiens();
        const found = allBiens.find((b: any) => b.id.toString() === bienId);
        if (found) {
          setBien(found);
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [bienId, router]);

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const dateVisite = formData.get("dateVisite");

    try {
      setReservationLoading(true);
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const response = await fetch('http://localhost:8080/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          idBien: bien.id,
          dateVisite: new Date(dateVisite as string).toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Erreur de réservation');
      setShowReservationModal(false);
      alert('Demande de visite effectuée avec succès ! L\'agence vous contactera pour confirmer le rendez-vous.');
    } catch {
      alert('Erreur lors de la réservation');
    } finally {
      setReservationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!bien) return null;

  const images = bien.images?.length > 0 
    ? bien.images.map((img: string) => img.startsWith("http") ? img : `http://localhost:8080${img}`)
    : ["/images/maison bamako.webp"];

  const isLocation = bien.typeTransaction === "LOCATION";
  const price = bien.prixCalculer ?? 0;
  
  const phoneNumber = bien.utilisateur?.telephone || bien.telephone || "+22300000000";
  const waNumber = phoneNumber.replace(/[^0-9]/g, '');
  const waMessage = encodeURIComponent(`Bonjour, je suis intéressé(e) par le bien "${bien.libelle}" disponible sur BamakoHome.`);
  const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Navbar simplifiée */}
      <nav className="h-20 bg-white border-b border-slate-200 flex items-center px-4 md:px-8 sticky top-0 z-40">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium transition-colors">
            <ArrowLeft size={20} /> Retour
          </button>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
              <Share2 size={18} />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne Principale */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Galerie d'Images */}
            <div className="bg-white rounded-[2rem] p-3 shadow-sm border border-slate-100">
              <div className="relative aspect-[16/9] rounded-[1.5rem] overflow-hidden mb-3">
                <img src={images[activeImage]} alt={bien.libelle} className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4">
                  <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest text-white shadow-md backdrop-blur-md ${isLocation ? 'bg-emerald-600/90' : 'bg-blue-600/90'}`}>
                    {isLocation ? 'À Louer' : 'À Vendre'}
                  </span>
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                  {images.map((img: string, i: number) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(i)}
                      className={`relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 snap-start border-2 transition-all ${activeImage === i ? 'border-blue-600 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations du bien */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
              <div className="mb-6">
                <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-2">{bien.libelleTypeBien || "Bien Immobilier"}</p>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">{bien.libelle}</h1>
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <MapPin className="text-blue-500" size={20} />
                  <span>{bien.ville || "Adresse sur demande"}</span>
                </div>
              </div>

              {/* Specs rapides */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-slate-100 mb-8">
                {bien.nbChambres > 0 && (
                  <div className="flex flex-col gap-1 items-center justify-center p-4 bg-slate-50 rounded-2xl">
                    <Bed className="text-slate-400" size={24} />
                    <span className="font-black text-slate-900">{bien.nbChambres}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Chambres</span>
                  </div>
                )}
                {bien.nbSalles > 0 && (
                  <div className="flex flex-col gap-1 items-center justify-center p-4 bg-slate-50 rounded-2xl">
                    <Bath className="text-slate-400" size={24} />
                    <span className="font-black text-slate-900">{bien.nbSalles}</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Salles de bain</span>
                  </div>
                )}
                {bien.superficie > 0 && (
                  <div className="flex flex-col gap-1 items-center justify-center p-4 bg-slate-50 rounded-2xl">
                    <Square className="text-slate-400" size={24} />
                    <span className="font-black text-slate-900">{bien.superficie} m²</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">Surface</span>
                  </div>
                )}
                {(bien.parking || bien.jardin) && (
                  <div className="flex flex-col gap-1 items-center justify-center p-4 bg-slate-50 rounded-2xl">
                    {bien.parking ? <Car className="text-slate-400" size={24} /> : <Trees className="text-slate-400" size={24} />}
                    <span className="font-black text-slate-900">Inclus</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider font-bold">{bien.parking ? 'Parking' : 'Jardin'}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="text-xl font-black text-slate-900 mb-4">Description du bien</h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {bien.description || "Aucune description approfondie n'a été fournie pour ce bien. N'hésitez pas à contacter l'agence pour obtenir tous les détails."}
                </p>
              </div>

              {/* Localisation (Carte) */}
              {bien.latitude && bien.longitude && (
                <div className="mb-8 p-1 bg-slate-50 rounded-[2.5rem] border border-slate-100 overflow-hidden">
                  <div className="p-6 pb-2">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <MapPin className="text-blue-600" size={24} /> Localisation
                    </h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">Situé à {bien.ville || "l'adresse indiquée"}</p>
                  </div>
                  
                  <div className="relative h-[400px] w-full rounded-[2.2rem] overflow-hidden group shadow-inner">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }}
                      loading="lazy" 
                      allowFullScreen 
                      referrerPolicy="no-referrer-when-downgrade"
                      src={`https://maps.google.com/maps?q=${bien.latitude},${bien.longitude}&z=15&output=embed`}
                      className="grayscale-[0.2] contrast-[1.1] brightness-[1.05]"
                    ></iframe>
                    
                    <div className="absolute bottom-6 right-6">
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${bien.latitude},${bien.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/90 backdrop-blur-md border border-white hover:bg-blue-600 hover:text-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm shadow-xl transition-all duration-300 flex items-center gap-2 group-hover:scale-105"
                      >
                        <MapPin size={18} />
                        Itinéraire Google Maps
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Équipements */}
              <div>
                <h3 className="text-xl font-black text-slate-900 mb-4">Équipements & Caractéristiques</h3>
                <div className="grid grid-cols-2 gap-y-3">
                  {bien.meuble && <div className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="text-emerald-500" size={18} /> Entièrement meublé</div>}
                  {bien.wifi && <div className="flex items-center gap-2 text-slate-700 font-medium"><Wifi className="text-emerald-500" size={18} /> Connexion WiFi incluse</div>}
                  {bien.climatisation && <div className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="text-emerald-500" size={18} /> Climatisation (A/C)</div>}
                  {bien.cuisineEquipee && <div className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="text-emerald-500" size={18} /> Cuisine équipée</div>}
                  {bien.balcon && <div className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="text-emerald-500" size={18} /> Balcon / Loggia</div>}
                  {bien.terrasse && <div className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="text-emerald-500" size={18} /> Terrasse</div>}
                  {bien.jardin && <div className="flex items-center gap-2 text-slate-700 font-medium"><CheckCircle className="text-emerald-500" size={18} /> Jardin paysager</div>}
                  {bien.parking && <div className="flex items-center gap-2 text-slate-700 font-medium"><Car className="text-emerald-500" size={18} /> Espace de stationnement</div>}
                </div>
              </div>
            </div>

          </div>

          {/* Colonne Latérale (Actions Fixes) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 sticky top-28">
              <div className="mb-6 pb-6 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Prix {isLocation ? 'Mensuel' : 'Demandé'}
                </p>
                <div className="text-3xl font-black text-slate-900">
                  {new Intl.NumberFormat("fr-FR").format(price)} <span className="text-lg text-slate-500 font-bold">FCFA</span>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => isAuthenticated ? setShowContactModal(true) : router.push(`/login?redirect=/annonces?bien=${bienId}`)}
                   className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-4 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-2"
                >
                  <Phone size={20} />
                  {isAuthenticated ? "Contacter l'agence" : "Se connecter pour contacter"}
                </button>
                
                <button
                  onClick={() => isAuthenticated ? setShowReservationModal(true) : router.push(`/login?redirect=/annonces?bien=${bienId}`)}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 px-4 rounded-xl shadow-lg shadow-slate-900/20 active:scale-95 transition-all duration-300 font-bold flex items-center justify-center gap-2"
                >
                  <Calendar size={20} />
                  {isAuthenticated ? "Réserver une visite" : "Se connecter pour réserver"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500 mb-3">Besoin d'aide immédiate ?</p>
                <div className="flex items-center justify-center gap-2 text-slate-900 font-bold">
                  <Phone size={16} /> {phoneNumber}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal WhatsApp Fixe */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                  <MessageCircle size={20} />
                </div>
                <h3 className="text-xl font-black text-slate-900">Coordonnées</h3>
              </div>
              <button onClick={() => setShowContactModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative">
              <h4 className="text-sm font-black text-blue-600 uppercase tracking-widest mb-1">Agence Immobilière</h4>
              <p className="text-lg font-bold text-slate-900 mb-2">{bien.utilisateur?.nom || "Agence Immobilière"}</p>
              {bien.utilisateur?.adresse && (
                <div className="flex items-start gap-2 text-slate-500 text-sm">
                  <MapPin size={16} className="mt-0.5 text-slate-400 flex-shrink-0" />
                  <span>{bien.utilisateur.adresse}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 relative">
              <a href={`tel:${phoneNumber}`} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors">
                <Phone size={18} className="text-blue-600" /> Appeler : {phoneNumber}
              </a>
              {bien.utilisateur?.email && (
                <a href={`mailto:${bien.utilisateur.email}`} className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-colors">
                  <Mail size={18} className="text-blue-600" /> Email : {bien.utilisateur.email}
                </a>
              )}
              <div className="h-px bg-slate-100 my-2" />
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all active:scale-[0.98]">
                <MessageCircle size={20} />
                Discussion WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Modal Réservation */}
      {showReservationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-900">Programmer une visite</h3>
              <button onClick={() => setShowReservationModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleReservationSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-700 mb-2 font-display">Date et heure de visite souhaitée</label>
                <input 
                  type="datetime-local" 
                  name="dateVisite" 
                  required 
                  className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white outline-none transition-all font-medium" 
                />
                <p className="text-xs text-slate-500 mt-2 italic">L'agence vous contactera pour confirmer la disponibilité.</p>
              </div>
              <button type="submit" disabled={reservationLoading} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-xl font-bold flex justify-center items-center">
                {reservationLoading ? <Loader2 className="animate-spin" size={20} /> : "Confirmer la visite"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
