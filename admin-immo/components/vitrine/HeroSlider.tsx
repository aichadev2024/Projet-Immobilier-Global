"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, MousePointer2 } from "lucide-react";

const localHeroImages = [
  "/images/maison bamako.webp",
  "/images/Villa à Yirimadjo Zerny.jpg",
  "/images/Faso canu.webp",
  "/images/Duplexe à Baco Djicoroni Aci.webp",
  "/images/Appartement a sotuba.jpg",
];

const defaultImage = "/images/hero-default.jpg";

function getImageUrl(bien: any, index: number = 0) {
  return localHeroImages[index % localHeroImages.length] || defaultImage;
}

type HeroSliderProps = {
  biens: any[];
};

export default function HeroSlider({ biens }: HeroSliderProps) {
  const [index, setIndex] = useState(0);
  const slides = (biens && biens.length > 0) ? biens.slice(0, 5) : [{ libelle: "L'Immobilier d'Excellence au Mali", status: "Welcome" }];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 8000);
    return () => clearInterval(t);
  }, [slides.length]);

  const current = slides[index];

  return (
    <section className="relative h-[90vh] md:h-screen w-full overflow-hidden bg-slate-900">
      {/* Dynamic Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <img
            src={getImageUrl(current, index)}
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
          {/* Multi-layered Overlays for depth and navbar legibility */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-slate-950/80" />
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 h-full container-custom flex items-center pt-24">
        <div className="max-w-4xl">
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <motion.div 
              initial={{ scaleX: 0 }} 
              animate={{ scaleX: 1 }} 
              transition={{ duration: 0.8, delay: 0.5 }}
              className="h-1 w-16 bg-blue-600 mb-8 rounded-full" 
            />
            
            <span className="inline-block text-blue-400 text-xs font-black uppercase tracking-[0.4em] mb-6">
              {current?.typeTransaction === 'LOCATION' ? 'Opportunité Location' : 'Exclusivité Vente'}
            </span>
            
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black text-white mb-8 leading-[1.05] tracking-tighter drop-shadow-2xl">
              {current?.libelle || "L'excellence Immobilière."}
            </h1>
            
            <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl font-medium leading-relaxed opacity-90">
              {current?.description?.substring(0, 160) || "Accédez aux adresses les plus prestigieuses de Bamako. Nos conseillers vous accompagnent dans l'acquisition de vos biens d'exception."}
              {current?.description?.length > 160 ? "..." : ""}
            </p>

            <div className="flex flex-wrap items-center gap-6">
              <Link
                href="#biens"
                className="group relative px-10 py-5 bg-white text-slate-900 font-black uppercase tracking-widest text-xs rounded-[2rem] overflow-hidden active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.25)]"
              >
                <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                <span className="relative z-10 group-hover:text-white flex items-center gap-3 transition-colors duration-300">
                  Découvrir la collection
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
              
              {current?.prixCalculer && (
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">À partir de</span>
                  <span className="text-3xl font-black text-white tracking-tight">
                    {new Intl.NumberFormat("fr-FR").format(current.prixCalculer)}
                    <span className="text-sm font-medium ml-2 text-slate-400">FCFA</span>
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Slide Indicator & Progress */}
      <div className="absolute bottom-12 left-6 md:left-12 z-20 flex items-center gap-6">
         <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-1.5 transition-all duration-500 rounded-full ${i === index ? "w-12 bg-white" : "w-4 bg-white/20 hover:bg-white/40"}`}
              />
            ))}
         </div>
         <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
           0{index + 1} / 0{slides.length}
         </span>
      </div>

      {/* Slide Navigation Buttons */}
      <div className="absolute bottom-12 right-6 md:right-12 z-20 flex gap-3">
        <button
          onClick={() => setIndex((index - 1 + slides.length) % slides.length)}
          className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 transition-all active:scale-90"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={() => setIndex((index + 1) % slides.length)}
          className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/10 transition-all active:scale-90"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-3 opacity-30 animate-bounce">
         <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Scroll</span>
         <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
      </div>

    </section>
  );
}
