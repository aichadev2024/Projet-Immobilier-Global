"use client";
import { API_BASE_URL } from "@/services/api";


import Link from "next/link";

const fallbackImage = "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80";

function getImageUrl(annonce: any) {
  if (annonce.images?.length > 0) {
    const url = annonce.images[0];
    return url.startsWith("http") ? url : `${API_BASE_URL}${url}`;
  }
  return fallbackImage;
}

function formatDate(dateStr: string | undefined) {
  if (!dateStr) return "Récent";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return "Récent";
  }
}

export default function NewsCard({ annonce }: { annonce: any }) {
  const imageUrl = getImageUrl(annonce);
  const date = formatDate(annonce.datePublication ?? annonce.dateCreation ?? annonce.date);
  const title = annonce.libelleBien || annonce.titre || "Actualité";
  const excerpt = annonce.description
    ? annonce.description.slice(0, 120) + (annonce.description.length > 120 ? "..." : "")
    : "Découvrez cette annonce et nos dernières opportunités immobilières.";

  return (
    <Link href={`/client/annonces/${annonce.id}`} className="block h-full">
      <div className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 h-full flex flex-col">
        <div className="relative h-52 overflow-hidden">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => ((e.target as HTMLImageElement).src = fallbackImage)}
          />
          <div className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded">
            {date}
          </div>
        </div>
        <div className="p-5 flex flex-col grow">
          <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-grow">{excerpt}</p>
          <span className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm uppercase tracking-wider px-5 py-2.5 rounded-md transition-colors w-fit">
            Lire la suite
          </span>
        </div>
      </div>
    </Link>
  );
}
