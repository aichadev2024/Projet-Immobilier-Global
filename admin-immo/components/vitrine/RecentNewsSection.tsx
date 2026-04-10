"use client";

import { useRef } from "react";
import NewsCard from "./NewsCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function RecentNewsSection({ annonces }: { annonces: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const list = annonces.slice(0, 6);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = 340;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section id="actualites" className="py-16 md:py-24 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 uppercase tracking-tight">
            Actualités récentes
          </h2>
          <div className="mt-2 flex justify-center">
            <span className="block w-12 h-0.5 bg-slate-300" />
            <span className="block w-2 h-2 rounded-full bg-blue-600 -mt-1.5 ml-1" />
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
            style={{ scrollbarWidth: "thin" }}
          >
            {list.length > 0 ? (
              list.map((annonce) => (
                <div key={annonce.id} className="shrink-0 w-[320px] md:w-[340px]">
                  <NewsCard annonce={annonce} />
                </div>
              ))
            ) : (
              <p className="text-slate-500 py-8 w-full text-center">Aucune actualité pour le moment.</p>
            )}
          </div>
          {list.length > 2 && (
            <>
              <button
                type="button"
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hidden md:flex"
                aria-label="Défiler à gauche"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hidden md:flex"
                aria-label="Défiler à droite"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
