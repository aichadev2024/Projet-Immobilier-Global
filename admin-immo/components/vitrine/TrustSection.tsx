"use client";

import { Shield, Building2, FileCheck, Users, TrendingUp, Award, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type TrustSectionProps = {
  biensCount: number;
  agencesCount: number;
};

export default function TrustSection({ biensCount, agencesCount }: TrustSectionProps) {
  const [animatedValues, setAnimatedValues] = useState({
    biens: 0,
    agences: 0,
    satisfaction: 0,
    experience: 0
  });
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setAnimatedValues({
        biens: Math.floor(biensCount * easeOutQuart),
        agences: Math.floor(agencesCount * easeOutQuart),
        satisfaction: Math.floor(98 * easeOutQuart),
        experience: Math.floor(7 * easeOutQuart)
      });
      
      if (currentStep >= steps) clearInterval(timer);
    }, interval);
    
    return () => clearInterval(timer);
  }, [biensCount, agencesCount]);
  
  const stats = [
    {
      icon: Building2,
      value: animatedValues.biens,
      targetValue: biensCount,
      label: "Biens disponibles",
      sub: "Catalogue mis à jour",
      color: "blue"
    },
    {
      icon: Building2,
      value: animatedValues.agences,
      targetValue: agencesCount,
      label: "Agences partenaires",
      sub: "Réseau national",
      color: "green"
    },
    {
      icon: Award,
      value: animatedValues.satisfaction,
      targetValue: 98,
      label: "Clients satisfaits",
      sub: "Taux de satisfaction",
      suffix: "%",
      color: "purple"
    },
    {
      icon: Clock,
      value: animatedValues.experience,
      targetValue: 7,
      label: "Années d'expérience",
      sub: "Au service du Mali",
      color: "orange"
    },
  ];

  return (
    <section id="confiance" className="py-24 md:py-32 bg-[#020617] text-white relative overflow-hidden">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[40rem] h-[40rem] bg-blue-600/15 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-0 right-1/4 w-[35rem] h-[35rem] bg-indigo-600/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[30rem] bg-purple-900/20 rounded-full blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay border-[none]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            Pourquoi nous faire <span className="text-blue-400">confiance</span>
          </h2>
          <div className="mt-6 flex justify-center items-center gap-2">
            <span className="block w-16 h-1 bg-gradient-to-r from-blue-400 to-transparent rounded-full" />
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="block w-16 h-1 bg-gradient-to-l from-blue-400 to-transparent rounded-full" />
          </div>
          <p className="text-slate-300 max-w-2xl mx-auto mt-6 text-lg">
            La référence immobilière au Mali. Des biens vérifiés, des démarches simples et un accompagnement de A à Z.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative"
            >
              <div className="relative rounded-[2rem] bg-white/[0.02] backdrop-blur-2xl border border-white/[0.05] p-8 md:p-10 text-center hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 hover:-translate-y-2 group overflow-hidden shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]">
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${
                  item.color === 'blue' ? 'from-blue-500 to-cyan-500' :
                  item.color === 'green' ? 'from-green-500 to-emerald-500' :
                  item.color === 'purple' ? 'from-purple-500 to-pink-500' :
                  'from-orange-500 to-yellow-500'
                }`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20 border border-white/5 ${
                    item.color === 'blue' ? 'from-blue-500 to-blue-600 text-blue-100' :
                    item.color === 'green' ? 'from-green-500 to-green-600 text-green-100' :
                    item.color === 'purple' ? 'from-purple-500 to-purple-600 text-purple-100' :
                    'from-orange-500 to-orange-600 text-orange-100'
                  }`}>
                    <item.icon className="w-8 h-8" />
                  </div>
                  
                  <div className="text-4xl md:text-5xl font-black text-white mb-3 tabular-nums drop-shadow-md tracking-tight">
                    {typeof item.value === "number" ? item.value.toLocaleString("fr-FR") : item.value}
                    {item.suffix && <span className="text-3xl font-bold opacity-80">{item.suffix}</span>}
                  </div>
                  
                  <div className="text-white/80 font-bold uppercase tracking-widest text-[11px] mb-2">
                    {item.label}
                  </div>
                  
                  <div className="text-slate-400 text-sm font-medium">{item.sub}</div>
                </div>

                {/* Subtle bottom line indicator */}
                <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 rounded-t-full transition-all duration-500 group-hover:w-1/2 opacity-50 ${
                  item.color === 'blue' ? 'bg-blue-500' :
                  item.color === 'green' ? 'bg-green-500' :
                  item.color === 'purple' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`} />
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Additional trust indicators */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-6 bg-white/5 backdrop-blur-sm rounded-full px-8 py-4 border border-white/10">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              <span className="text-white font-medium">Garantie 100% sécurisée</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white font-medium">Meilleur prix garanti</span>
            </div>
            <div className="w-px h-6 bg-white/20" />
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400" />
              <span className="text-white font-medium">Expertise locale</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
