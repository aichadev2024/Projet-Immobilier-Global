"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Home, 
  Building2, 
  FileText, 
  Shield, 
  Headphones,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Send
} from "lucide-react";

const quickLinks = [
  { label: "Mentions légales", href: "#" },
  { label: "Guide immobilier", href: "#" },
  { label: "Nos services", href: "#" },
  { label: "Contactez-nous", href: "#contact" },
];

const accountLinks = [
  { label: "Connexion", href: "/login" },
  { label: "Créer un compte", href: "/register" },
  { label: "Parcourir les biens", href: "#biens" },
  { label: "Publier une annonce", href: "/register" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export default function FooterVitrine() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  return (
    <footer id="contact" className="bg-[#020617] text-slate-400 relative border-t border-white/[0.02]">
      {/* Abstract Footer Gradient */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[40rem] h-[20rem] bg-blue-600/5 blur-[120px] pointer-events-none" />
      
      {/* Trust Banner */}
      <div className="border-b border-white/[0.05] py-8 sm:py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/10 via-slate-900 to-indigo-900/10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { icon: Building2, label: "Agences partenaires", value: "50+" },
              { icon: Shield, label: "Paiement sécurisé", value: "100%" },
              { icon: FileText, label: "Documents vérifiés", value: "Tous" },
              { icon: Headphones, label: "Support client", value: "24/7" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-3 sm:gap-4"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] bg-white/[0.03] border border-white/5 flex items-center justify-center backdrop-blur-md shrink-0">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <p className="text-white font-black text-lg sm:text-xl tracking-tight">{item.value}</p>
                  <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                Ika<span className="text-blue-500">Bayt</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Votre partenaire de confiance pour trouver le bien immobilier idéal au Mali. 
              Des milliers de propriétés sélectionnées pour vous.
            </p>
            
            {/* Contact Info */}
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3 text-slate-400 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <span className="mt-1">Bamako, Mali</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <span>+223 XX XX XX XX</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400 font-medium">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-400" />
                </div>
                <a href="mailto:contact@ikabayt.com" className="hover:text-blue-400 transition-colors">
                  contact@ikabayt.com
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-black text-[11px] uppercase tracking-[0.2em] mb-8 opacity-80">
              Informations
            </h4>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="group flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account Links */}
          <div>
            <h4 className="text-white font-black text-[11px] uppercase tracking-[0.2em] mb-8 opacity-80">
              Mon compte
            </h4>
            <ul className="space-y-4">
              {accountLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="group flex items-center gap-3 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-black text-[11px] uppercase tracking-[0.2em] mb-8 opacity-80">
              Newsletter
            </h4>
            <p className="text-sm font-medium text-slate-400 mb-6 leading-relaxed">
              Recevez nos meilleures offres et actualités immobilières en avant-première.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/20 rounded-[1.25rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <input
                  type="email"
                  placeholder="Votre adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="relative w-full rounded-[1.25rem] bg-white/[0.03] border border-white/10 px-5 py-4 pr-14 text-sm text-white placeholder-slate-500 focus:outline-none focus:bg-white/[0.05] transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center justify-center transition-colors shadow-lg"
                >
                  <Send className="w-4 h-4 text-white -ml-0.5" />
                </button>
              </div>
              {isSubscribed && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-emerald-400"
                >
                  Inscription réussie ! ✓
                </motion.p>
              )}
            </form>

            {/* Social Links */}
            <div className="mt-8">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4">Réseaux Sociaux</p>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-11 h-11 rounded-[1rem] bg-white/[0.03] border border-white/5 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <social.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-white/[0.05]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-xs font-medium text-slate-500">
              © {new Date().getFullYear()} IkaBayt. Tous droits réservés.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-slate-500">
              <Link href="#" className="hover:text-blue-400 transition-colors">Politique de confidentialité</Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">Conditions d'utilisation</Link>
              <Link href="#" className="hover:text-blue-400 transition-colors">Plan du site</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
