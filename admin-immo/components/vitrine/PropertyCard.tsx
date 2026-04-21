import { API_BASE_URL } from "@/services/api";
import Link from "next/link";
import { MapPin, Maximize } from "lucide-react";

export default function PropertyCard({ bien }: { bien: any }) {
    // Use property images if available, otherwise high-quality fallback
    const fallbackImage =
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
    const getImageUrl = (url: string) => url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
    const imageUrl = bien.images?.length > 0 ? getImageUrl(bien.images[0]) : bien.imageUrl || fallbackImage;

    return (
        <Link href={`/client/annonces?bien=${bien.id}`} className="block h-full">
            <div className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgba(14,165,233,0.12)] transition-all duration-500 border border-slate-100 hover:border-sky-200 flex flex-col h-full transform hover:-translate-y-1.5 relative">
                <div className="relative w-full h-52 overflow-hidden">
                    <img
                        src={imageUrl}
                        alt={bien.libelle}
                        className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-4 left-4 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold text-slate-900 shadow-md tracking-widest uppercase">
                        {bien.statutBien === "A_VENDRE" ? "À VENDRE" : "À LOUER"}
                    </div>
                    {bien.libelleTypeBien && (
                        <div className="absolute top-4 right-4 rounded-full bg-sky-600 px-3 py-1.5 text-[10px] font-bold text-white shadow-md tracking-widest uppercase">
                            {bien.libelleTypeBien}
                        </div>
                    )}
                </div>
                <div className="p-5 flex flex-col flex-grow bg-white">
                    <h4 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-sky-600 transition-colors duration-300 mb-2">
                        {bien.libelle}
                    </h4>
                    <div className="flex items-start text-slate-500 mb-4 min-h-[2.5rem]">
                        <MapPin size={16} className="mr-1.5 flex-shrink-0 text-sky-500 mt-0.5" />
                        <p className="text-xs line-clamp-2 leading-relaxed font-medium">
                            {bien.adresse && `${bien.adresse}, `}{bien.ville}
                        </p>
                    </div>
                    {bien.superficie && (
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-4 bg-slate-50 py-2.5 px-3 rounded-xl">
                            <Maximize size={14} className="text-sky-500" />
                            <span>{bien.superficie} m²</span>
                        </div>
                    )}
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-0.5">Prix</p>
                            <p className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(bien.prixCalculer)}
                                <span className="text-xs font-bold text-sky-600 ml-1">FCFA</span>
                            </p>
                        </div>
                        <span className="text-sky-600 font-bold text-sm group-hover:underline">Voir →</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
