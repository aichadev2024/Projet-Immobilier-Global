"use client";

import { useState, useRef } from "react";
import PropertyCardTrending from "./PropertyCardTrending";
import { ChevronLeft, ChevronRight, TrendingUp, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Tab = "featured" | "latest" | "premium";

export default function TrendingProjects({ biens }: { biens: any[] }) {
  const [tab, setTab] = useState<Tab>("featured");
  const scrollRef = useRef<HTMLDivElement>(null);

  const featured = biens.slice(0, 8);
  const latest = [...biens].sort((a, b) => (b.id ?? 0) - (a.id ?? 0)).slice(0, 8);
  const premium = biens.filter(b => b.prixCalculer && b.prixCalculer > 50000000).slice(0, 8);
  const list = tab === "featured" ? featured : tab === "latest" ? latest : premium;

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const step = 320;
    scrollRef.current.scrollBy({ left: dir === "left" ? -step : step, behavior: "smooth" });
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 border-t border-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }} />
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 uppercase tracking-tight mb-4">
            Propriétés d'Exception
          </h2>
          <div className="mt-4 flex justify-center items-center gap-2">
            <span className="block w-16 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
            <span className="block w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/50" />
            <span className="block w-16 h-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full" />
          </div>
          <p className="mt-6 text-slate-600 max-w-2xl mx-auto">
            Découvrez notre sélection exclusive des plus belles propriétés au Mali.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: "featured" as Tab, label: "Vedettes", icon: TrendingUp, color: "blue" },
            { id: "latest" as Tab, label: "Récents", icon: Clock, color: "green" },
            { id: "premium" as Tab, label: "Premium", icon: Sparkles, color: "purple" },
          ].map(({ id, label, icon: Icon, color }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold uppercase tracking-wider text-sm transition-all duration-300 ${
                tab === id
                  ? `bg-${color}-600 text-white shadow-lg shadow-${color}-600/30`
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {tab === id && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-1 w-2 h-2 bg-white rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 scroll-smooth scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {list.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={tab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-6"
                >
                  {list.map((bien, i) => (
                    <motion.div
                      key={`${tab}-${bien.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <PropertyCardTrending
                        bien={bien}
                        discountPercent={
                          tab === "premium" ? 15 : 
                          i % 3 === 0 ? 10 : 
                          i % 3 === 1 ? 20 : 
                          undefined
                        }
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full text-center py-16"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {tab === "premium" ? (
                    <Sparkles className="w-10 h-10 text-slate-400" />
                  ) : tab === "latest" ? (
                    <Clock className="w-10 h-10 text-slate-400" />
                  ) : (
                    <TrendingUp className="w-10 h-10 text-slate-400" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {tab === "premium" ? "Aucun bien premium" : tab === "latest" ? "Aucun bien récent" : "Aucune vedette"}
                </h3>
                <p className="text-slate-600">
                  Revenez bientôt pour découvrir nouvelles propriétés.
                </p>
              </motion.div>
            )}
          </div>
          
          {/* Navigation arrows */}
          {list.length > 2 && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll("left")}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors z-10"
                aria-label="Défiler à gauche"
              >
                <ChevronLeft className="w-6 h-6" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scroll("right")}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full bg-white shadow-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors z-10"
                aria-label="Défiler à droite"
              >
                <ChevronRight className="w-6 h-6" />
              </motion.button>
            </>
          )}
        </div>
        
        {/* Call to action */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <a
            href="/client/annonces"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold uppercase tracking-wider px-8 py-3.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Voir toutes les propriétés
            <ChevronRight className="w-5 h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
