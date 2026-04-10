import { Calendar, MapPin, Tag } from "lucide-react";

export default function AnnonceCard({ annonce }: { annonce: any }) {
    const fallbackImage =
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80";
    const getImageUrl = (url: string) => url.startsWith("http") ? url : `http://localhost:8080${url}`;
    const imageUrl = annonce.images?.length > 0 ? getImageUrl(annonce.images[0]) : fallbackImage;

    return (
        <div className="group bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-sky-500/50 flex flex-col h-full transform hover:-translate-y-1 transition-all duration-500 shadow-xl hover:shadow-sky-500/10">
            <div className="relative w-full h-52 overflow-hidden">
                <img
                    src={imageUrl}
                    alt={annonce.libelleBien || "Annonce"}
                    className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-110"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute top-4 left-4 rounded-full bg-white/95 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold text-slate-900 shadow-md tracking-widest uppercase">
                    {annonce.typeAnnonce === "VENTE" ? "VENTE" : "LOCATION"}
                </div>
            </div>
            <div className="p-5 flex flex-col flex-grow">
                <h4 className="font-bold text-lg text-white line-clamp-2 leading-snug group-hover:text-sky-300 transition-colors mb-2">
                    {annonce.libelleBien || annonce.titre || "Annonce Immobilière"}
                </h4>
                {annonce.adresse && (
                    <div className="flex items-center text-slate-400 mb-3 text-xs font-medium">
                        <MapPin size={14} className="mr-1.5 flex-shrink-0 text-sky-400" />
                        <span className="line-clamp-1">{annonce.adresse}</span>
                    </div>
                )}
                <p className="text-slate-400 text-xs mb-4 flex-grow line-clamp-3 leading-relaxed">
                    {annonce.description}
                </p>
                <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                        <Calendar size={12} className="mr-1.5 text-sky-400" />
                        Récent
                    </div>
                    {annonce.prix && (
                        <span className="text-lg font-extrabold text-sky-400 tracking-tight">
                            {new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(annonce.prix)}
                            <span className="text-xs font-bold text-slate-400 ml-1">FCFA</span>
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
