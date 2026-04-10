"use client";

import React, { useState } from "react";
import {
    Settings, UserCircle, BellRing, Shield,
    CreditCard, Globe, Mail, Lock, SwitchCamera,
    Moon, Check, Star
} from "lucide-react";

export default function AgenceParametres() {
    const [activeTab, setActiveTab] = useState("general");
    const [saveSuccess, setSaveSuccess] = useState(false);

    const tabs = [
        { id: "general", label: "Général", icon: UserCircle },
        { id: "security", label: "Sécurité", icon: Shield },
        { id: "notifications", label: "Notifications", icon: BellRing },
        { id: "billing", label: "Abonnement", icon: CreditCard },
    ];

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="w-6 h-6 text-indigo-500" />
                        Paramètres du compte
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez vos préférences, la sécurité et votre abonnement.</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-64 flex-shrink-0">
                    <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium whitespace-nowrap ${activeTab === tab.id
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100/50"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? "text-indigo-600" : "text-slate-400"}`} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <form onSubmit={handleSave} className="p-6 sm:p-8">

                            {/* --- Tab: Général --- */}
                            {activeTab === "general" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-1">Paramètres Régionaux</h2>
                                        <p className="text-sm text-slate-500 mb-4">Définissez la langue et la devise par défaut de votre interface.</p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <Globe className="w-4 h-4 text-slate-400" /> Langue de l'interface
                                                </label>
                                                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium">
                                                    <option value="fr">Français</option>
                                                    <option value="en">English (US)</option>
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4 text-slate-400" /> Devise d'affichage
                                                </label>
                                                <select className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium">
                                                    <option value="XOF">FCFA (XOF)</option>
                                                    <option value="EUR">Euro (€)</option>
                                                    <option value="USD">Dollar ($)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-slate-100" />

                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-1">Apparence</h2>
                                        <p className="text-sm text-slate-500 mb-4">Personnalisez le thème visuel de votre Dashboard.</p>

                                        <div className="flex items-center gap-4">
                                            <label className="flex items-center justify-between p-4 border-2 border-indigo-500 bg-indigo-50 rounded-xl cursor-pointer w-48">
                                                <span className="font-semibold text-indigo-700">Clair</span>
                                                <div className="w-5 h-5 rounded-full border-4 border-indigo-500 bg-white"></div>
                                            </label>
                                            <label className="flex items-center justify-between p-4 border-2 border-slate-200 bg-slate-50 rounded-xl cursor-not-allowed opacity-60 w-48">
                                                <span className="font-semibold text-slate-700 flex items-center gap-2"><Moon className="w-4 h-4" /> Sombre</span>
                                                <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded">Bientôt</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Tab: Sécurité --- */}
                            {activeTab === "security" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-1">Changement de mot de passe</h2>
                                        <p className="text-sm text-slate-500 mb-4">Assurez-vous d'utiliser un mot de passe long et complexe.</p>

                                        <div className="space-y-4 max-w-md">
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                                    <Lock className="w-4 h-4 text-slate-400" /> Mot de passe actuel
                                                </label>
                                                <input type="password" placeholder="••••••••" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium placeholder:text-slate-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Nouveau mot de passe</label>
                                                <input type="password" placeholder="Le nouveau mot de passe" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium placeholder:text-slate-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-slate-700">Confirmer le nouveau mot de passe</label>
                                                <input type="password" placeholder="Retapez le mot de passe" className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium placeholder:text-slate-400" />
                                            </div>
                                        </div>
                                    </div>

                                    <hr className="border-slate-100" />

                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-1">Double Authentification (2FA)</h2>
                                        <p className="text-sm text-slate-500 mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>

                                        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                            <div>
                                                <h3 className="font-bold text-slate-800">Authentification par SMS/Email</h3>
                                                <p className="text-sm text-slate-500 mt-1">Non configuré. Mettez votre compte à l'abri des piratages.</p>
                                            </div>
                                            <button type="button" className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm">
                                                Activer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Tab: Notifications --- */}
                            {activeTab === "notifications" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div>
                                        <h2 className="text-lg font-bold text-slate-900 mb-1">Préférences de messagerie</h2>
                                        <p className="text-sm text-slate-500 mb-6">Choisissez quels emails vous souhaitez recevoir de notre plateforme.</p>

                                        <div className="space-y-4">
                                            {[
                                                { title: "Nouveaux messages clients", desc: "Recevoir un email quand un client vous écrit via la messagerie.", defaultChecked: true },
                                                { title: "Demandes de visite", desc: "Me notifier par email pour chaque demande de rendez-vous.", defaultChecked: true },
                                                { title: "Avis Clients", desc: "Être alerté dès qu'un nouvel avis est publié sur la page de mon agence.", defaultChecked: true },
                                                { title: "Validation d'annonces", desc: "Recevoir la confirmation ou le refus des modérateurs.", defaultChecked: false },
                                                { title: "Newsletter BamakoHome", desc: "Dernières actualités immobilières et mises à jour du site.", defaultChecked: false },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-start gap-4">
                                                    <div className="pt-1">
                                                        <input type="checkbox" defaultChecked={item.defaultChecked} className="w-5 h-5 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500" />
                                                    </div>
                                                    <div>
                                                        <label className="font-bold text-slate-800 cursor-pointer">{item.title}</label>
                                                        <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- Tab: Billing --- */}
                            {activeTab === "billing" && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 sm:p-8 rounded-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl mix-blend-screen" />
                                        <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl mix-blend-screen" />

                                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-indigo-200 text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                                                    <Star className="w-3.5 h-3.5 fill-indigo-200" /> Plan Agence Pro
                                                </div>
                                                <h2 className="text-2xl font-bold text-white mb-2">Abonnement Actif</h2>
                                                <p className="text-indigo-200 text-sm">Votre prochain renouvellement est prévu le <strong className="text-white">12 Avril 2024</strong>.</p>
                                            </div>
                                            <div className="text-left md:text-right w-full md:w-auto">
                                                <div className="text-3xl font-black text-white mb-1">50.000 <span className="text-lg font-medium text-indigo-200">FCFA / mois</span></div>
                                                <button type="button" className="w-full md:w-auto mt-4 px-6 py-2.5 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                                                    Gérer mon plan
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-slate-900 mb-4">Méthode de paiement</h3>
                                        <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-8 bg-white border border-slate-200 rounded flex items-center justify-center text-xs font-black text-indigo-900 italic shadow-sm">
                                                    VISA
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">•••• •••• •••• 4242</div>
                                                    <div className="text-xs text-slate-500">Expire le 12/26</div>
                                                </div>
                                            </div>
                                            <button type="button" className="text-sm font-bold text-indigo-600 hover:text-indigo-800">Modifier</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Form Actions */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-end gap-4">
                                {saveSuccess && (
                                    <span className="text-emerald-600 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                                        <Check className="w-5 h-5" /> Enregistré avec succès !
                                    </span>
                                )}
                                <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                                    Enregistrer les modifications
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
