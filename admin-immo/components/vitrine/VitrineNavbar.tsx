"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Menu, X, ChevronRight, Sparkles } from "lucide-react";
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
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ease-in-out flex justify-center ${
        scrolled ? "pt-4 px-4" : "pt-6 px-4 md:px-8"
      }`}
    >
      <div className={`w-full max-w-7xl transition-all duration-500 ease-out flex items-center justify-between ${
        scrolled
          ? "h-16 bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] px-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.4)]"
          : "h-16 bg-transparent px-2"
      }`}>
        {/* Brand/Logo */}
        <div className="flex items-center gap-3 group">
          <BrandMark variant={scrolled ? "light" : "dark"} onClick={() => setMobileOpen(false)} />
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
        <div className="flex items-center gap-4">
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
            className="group relative flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.1em] px-6 py-3 rounded-full transition-all duration-500 hover:-translate-y-0.5 shadow-[0_8px_30px_-8px_rgba(255,255,255,0.2)] hover:shadow-[0_12px_40px_-8px_rgba(255,255,255,0.3)] bg-white text-slate-900 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
            <Sparkles size={14} className="text-blue-600 relative z-10 group-hover:rotate-12 transition-transform duration-500" />
            <span className="relative z-10">S'inscrire</span>
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
      <div 
        className={`fixed inset-0 bg-slate-950/40 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer UI */}
      <aside
        className={`fixed top-0 right-0 w-[280px] h-full bg-white z-[110] lg:hidden transition-transform duration-500 ease-out ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 flex flex-col h-full">
          <div className="flex justify-between items-center mb-12">
            <BrandMark variant="light" onClick={() => setMobileOpen(false)} />
            <button onClick={() => setMobileOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-900">
              <X size={18} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className="py-4 text-slate-900 font-black uppercase tracking-widest text-[13px] border-b border-slate-50 hover:text-blue-600 transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="mt-auto grid grid-cols-1 gap-4">
             <Link href="/login" className="py-4 text-center font-black uppercase tracking-widest text-xs text-slate-600 bg-slate-50 rounded-2xl">
                Connexion
             </Link>
             <Link href="/register" className="py-4 text-center font-black uppercase tracking-widest text-xs text-white bg-blue-600 rounded-2xl shadow-xl shadow-blue-500/20">
                S'inscrire
             </Link>
          </div>
        </div>
      </aside>
    </nav>
  );
}
