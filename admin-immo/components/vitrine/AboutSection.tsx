"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Clock, Users, Award, ArrowRight, Phone, Home } from "lucide-react";

const features = [
  { icon: Shield, title: "Biens vérifiés", description: "Chaque propriété est inspectée et validée par nos experts" },
  { icon: Clock, title: "Disponible 24/7", description: "Notre équipe vous accompagne à tout moment" },
  { icon: Users, title: "Réseau d'agences", description: "Partenaires avec les meilleures agences du Mali" },
  { icon: Award, title: "Expertise locale", description: "Connaissance approfondie du marché malien" }
];

export default function AboutSection() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Pourquoi choisir BamakoHome ?</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Votre partenaire de confiance pour trouver votre bien idéal au Mali</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <f.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Prêt à trouver votre bien ?</h3>
          <p className="text-slate-400 mb-6">Rejoignez plus de 10 000 utilisateurs satisfaits</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#biens" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
              <Home className="w-5 h-5" /> Voir les biens <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="tel:+223XXXXXXXX" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/20">
              <Phone className="w-5 h-5" /> Nous appeler
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
