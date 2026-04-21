"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Menu, X, ChevronRight, Sparkles, Home } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BrandMark from "./BrandMark";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "#biens", label: "Découvrir" },
  { href: "#confiance", label: "Confiance" },
];

export default function VitrineNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out flex justify-center ${
        scrolled ? "pt-2 px-2 sm:pt-4 sm:px-4" : "pt-4 px-2 sm:pt-6 sm:px-4 md:px-8"
      }`}
    >
      <div className={`w-full max-w-7xl transition-all duration-500 ease-out flex items-center justify-between overflow-hidden ${
        scrolled
          ? "h-14 sm:h-16 bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] px-3 sm:px-6 shadow-xl"
          : "h-14 sm:h-16 bg-transparent px-2"
      }`}>
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 group">
          <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-1.5 xs:gap-2 shrink">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shrink-0">
              <Home className="w-4 h-4 text-white" />
            </div>
            <span className={`text-sm sm:text-lg font-black tracking-tight text-white truncate`}>
              Ika<span className="text-blue-500">Bayt</span>
            </span>
          </Link>
        </div>

        {/* Dynamic Desktop Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative group ${
                scrolled ? "text-white/80 hover:text-white" : "text-white/80 hover:text-white"
              }`}
            >
              {label}
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${scrolled ? 'bg-blue-600' : 'bg-white'}`} />
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className={`hidden sm:flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              scrolled ? "text-white/80 hover:text-white" : "text-white hover:text-blue-200"
            }`}
          >
            <User size={16} />
            Connexion
          </Link>
          
          <Link
            href="/register"
            className="group relative flex items-center gap-2 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.1em] px-2.5 py-2.5 sm:px-6 sm:py-3 rounded-full transition-all duration-500 hover:-translate-y-0.5 shadow-lg bg-white text-slate-900 overflow-hidden shrink-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <Sparkles size={14} className="text-blue-600 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
            <span className="hidden xs:inline relative z-10">S'inscrire</span>
          </Link>

          {/* Mobile UI Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`lg:hidden p-2 rounded-xl transition-all ${
              scrolled ? "bg-slate-100 text-slate-900" : "bg-white/10 text-white backdrop-blur-md"
            }`}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Modern Mobile Backdrop Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm lg:hidden z-[110]"
              onClick={() => setMobileOpen(false)}
            />

            {/* Mobile Drawer UI */}
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[300px] h-full bg-white/95 backdrop-blur-xl z-[120] lg:hidden shadow-2xl"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <BrandMark variant="light" onClick={() => setMobileOpen(false)} />
                  <button 
                    onClick={() => setMobileOpen(false)} 
                    className="p-3 bg-slate-100 rounded-2xl text-slate-900 active:scale-90 transition-transform"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex flex-col gap-4">
                  {navLinks.map(({ href, label }, idx) => (
                    <motion.div
                      key={href}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 + idx * 0.05 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center justify-between py-4 text-slate-900 font-black uppercase tracking-[0.2em] text-[13px] border-b border-slate-100 hover:text-blue-600 transition-colors group"
                      >
                        {label}
                        <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-auto grid grid-cols-1 gap-4"
                >
                  <Link 
                    href="/login" 
                    onClick={() => setMobileOpen(false)}
                    className="py-5 text-center font-black uppercase tracking-widest text-[11px] text-slate-600 bg-slate-50 rounded-[1.25rem] active:scale-95 transition-all"
                  >
                    Connexion
                  </Link>
                  <Link 
                    href="/register" 
                    onClick={() => setMobileOpen(false)}
                    className="py-5 text-center font-black uppercase tracking-widest text-[11px] text-white bg-blue-600 rounded-[1.25rem] shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                  >
                    S'inscrire
                  </Link>
                </motion.div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
