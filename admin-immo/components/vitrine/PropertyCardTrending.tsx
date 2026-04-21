"use client";
import { API_BASE_URL } from "@/services/api";


import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, ArrowUpRight, Bed, Bath, Square } from "lucide-react";

const fallbackImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80";

// Images locales de maisons de Bamako
const localHeroImages = [
  "/images/maison bamako.webp",
  "/images/Villa à Yirimadjo Zerny.jpg",
  "/images/Faso canu.webp",
  "/images/Duplexe à Baco Djicoroni Aci.webp",
  "/images/Appartement a sotuba.jpg",
];

function getImageUrl(bien: any, index: number = 0) {
  if (bien.images?.length > 0) {
    const url = bien.images[0];
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  }
  // Fallback sur images locales
  return localHeroImages[index % localHeroImages.length] || fallbackImage;
}

export default function PropertyCardTrending({ bien, index = 0 }: { bien: any; index?: number }) {
  const imageUrl = getImageUrl(bien, index);
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
        <Link href={`/annonces?bien=${bien.id}`} className="block relative aspect-[4/3] overflow-hidden m-2 rounded-[1.5rem] bg-slate-100">
          <img
            src={imageUrl}
            alt={bien.libelle}
            className="w-full h-full object-cover group-hover/inner:scale-110 transition-transform duration-700 ease-out"
            onError={(e) => ((e.target as HTMLImageElement).src = fallbackImage)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent opacity-0 group-hover/inner:opacity-100 transition-opacity duration-500" />
          <div className="absolute top-4 left-4 flex gap-2">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-md backdrop-blur-md ${isLocation ? 'bg-emerald-600/90' : 'bg-blue-600/90'}`}>
              {isLocation ? 'À Louer' : 'À Vendre'}
            </span>
          </div>
          {/* Badge nombre d'images */}
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
        </Link>

        {/* Content Section */}
        <div className="p-6 flex flex-col flex-grow">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 opacity-80">
            {category}
          </div>
          <h3 className="text-lg font-black text-slate-900 mb-3 line-clamp-1 group-hover/inner:text-blue-600 transition-colors leading-tight">
            {bien.libelle}
          </h3>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-5">
            <MapPin size={14} className="text-slate-400" />
            <span className="truncate">{bien.ville || "Bamako, Mali"}</span>
          </div>

          {/* Specs */}
          <div className="flex items-center gap-5 mb-6 pt-4 border-t border-slate-100/80 text-slate-500">
            {bien.nbChambres > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed size={14} className="text-slate-400" />
                <span className="text-xs font-bold">{bien.nbChambres}</span>
              </div>
            )}
            {bien.nbSalles > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath size={14} className="text-slate-400" />
                <span className="text-xs font-bold">{bien.nbSalles}</span>
              </div>
            )}
            {bien.superficie > 0 && (
              <div className="flex items-center gap-1.5">
                <Square size={14} className="text-slate-400" />
                <span className="text-xs font-bold">{bien.superficie} m²</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-end justify-between pt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Prix {isLocation ? 'mensuel' : 'demandé'}</span>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                {new Intl.NumberFormat("fr-FR").format(price)}
                <span className="text-xs font-bold ml-1 text-slate-400">FCFA</span>
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover/inner:bg-blue-600 group-hover/inner:text-white transition-colors duration-300 shadow-sm border border-slate-100 group-hover/inner:border-transparent">
              <ArrowUpRight size={20} className="group-hover/inner:scale-110 transition-transform duration-300" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
