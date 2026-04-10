"use client";

import { Search, MapPin, DollarSign, ArrowRight, Shield, Sparkles } from "lucide-react";
import Image from "next/image";

export default function HeroSection({
  search,
  setSearch,
  ville,
  setVille,
  prixMax,
  setPrixMax,
}: {
  search: string;
  setSearch: (val: string) => void;
  ville: string;
  setVille: (val: string) => void;
  prixMax: string;
  setPrixMax: (val: string) => void;
}) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Fond immersif */}
      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2075&q=80"
          alt=""
          fill
          className="object-cover scale-105"
          priority
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-900/75 to-slate-950/90"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(14,165,233,0.15),transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="max-w-4xl">
          {/* Badge confiance */}
          <div
            className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-2 mb-8 animate-fade-in-up text-sky-200"
            style={{ animationDelay: "0ms" }}
          >
            <Shield className="h-4 w-4 text-sky-400" />
            <span className="text-sm font-semibold tracking-wide">Plateforme N°1 au Mali · Transactions sécurisées</span>
          </div>

          {/* Titre percutant */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-white leading-[1.05] mb-6 animate-fade-in-up delay-100">
            Votre futur
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-400">
              chez-vous
            </span>
            <br />
            commence ici.
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-xl mb-10 font-light leading-relaxed animate-fade-in-up delay-200">
            Biens de prestige, démarches simplifiées. Trouvez ou proposez en toute confiance.
          </p>

          {/* CTA secondaire */}
          <div className="flex flex-wrap gap-4 mb-12 animate-fade-in-up delay-300">
            <a
              href="#biens"
              className="group inline-flex items-center gap-2 rounded-full bg-white text-slate-900 px-6 py-3.5 font-bold shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300"
            >
              Explorer les biens
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#annonces"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/50 bg-white/5 text-white px-6 py-3.5 font-semibold backdrop-blur-sm hover:bg-white/15 hover:border-white/70 transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 text-sky-400" />
              Dernières opportunités
            </a>
          </div>
        </div>

        {/* Barre de recherche – style vitrine */}
        <div className="max-w-5xl animate-fade-in-up delay-400">
          <p className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
            <Search className="h-4 w-4" />
            Recherche rapide
          </p>
          <div className="rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-2 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-50/80">
                <Search className="h-5 w-5 text-sky-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Type de bien, mot-clé..."
                  className="w-full bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-50/80 border-t md:border-t-0 md:border-l border-slate-200/50">
                <MapPin className="h-5 w-5 text-sky-600 shrink-0" />
                <input
                  type="text"
                  placeholder="Ville ou quartier"
                  className="w-full bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-50/80 border-t md:border-t-0 md:border-l border-slate-200/50 md:max-w-[180px]">
                <DollarSign className="h-5 w-5 text-sky-600 shrink-0" />
                <input
                  type="number"
                  placeholder="Budget max"
                  className="w-full bg-transparent text-slate-800 font-medium placeholder-slate-400 focus:outline-none"
                  value={prixMax}
                  onChange={(e) => setPrixMax(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white px-6 py-3.5 font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-sky-500/30"
                aria-label="Lancer la recherche"
              >
                Rechercher
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Chiffres clés – bandeau design */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 animate-fade-in-up delay-500">
          {[
            { value: "5K+", label: "Biens exclusifs" },
            { value: "98%", label: "Clients satisfaits" },
            { value: "24/7", label: "Support dédié" },
            { value: "100%", label: "Transactions sécurisées" },
          ].map((stat) => (
            <div key={stat.label} className="text-center md:text-left">
              <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <div className="text-sm font-medium text-slate-400 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
