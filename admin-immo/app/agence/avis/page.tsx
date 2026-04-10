"use client";

import React, { useState } from "react";
import {
    Star, MessageSquare, Filter, ShieldCheck,
    CornerDownRight, XCircle
} from "lucide-react";

interface Review {
    id: string;
    clientName: string;
    propertyName: string;
    rating: number;
    comment: string;
    date: string;
    status: "PUBLISHED" | "PENDING" | "REJECTED";
    reply: string | null;
}

const mockReviews: Review[] = [
    {
        id: "1",
        clientName: "Sékou Samaké",
        propertyName: "Villa de Luxe ACI 2000",
        rating: 5,
        comment: "Excellent service ! L'agent Amadou a été très professionnel et a répondu à toutes mes questions. La visite s'est très bien passée et le bien correspondait exactement à la description.",
        date: "12 Mars 2024",
        status: "PUBLISHED",
        reply: "Merci beaucoup M. Samaké pour ce retour très positif ! Nous sommes ravis d'avoir pu vous accompagner dans votre projet."
    },
    {
        id: "2",
        clientName: "Awa Diarra",
        propertyName: "Appartement Centre-Ville",
        rating: 4,
        comment: "Très bel appartement, mais un peu bruyant côté rue. L'agence a été très réactive pour la constitution du dossier de location.",
        date: "10 Mars 2024",
        status: "PENDING",
        reply: null
    },
    {
        id: "3",
        clientName: "Anonyme",
        propertyName: "Terrain Sogoniko",
        rating: 2,
        comment: "L'agent est arrivé avec 30 minutes de retard à la visite et n'avait pas les clés du portail. Très déçu du professionnalisme.",
        date: "05 Mars 2024",
        status: "REJECTED",
        reply: null
    }
];

export default function AgenceAvis() {
    const [filterRating, setFilterRating] = useState("ALL");
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [replyText, setReplyText] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const filteredReviews = mockReviews.filter(review => {
        const matchesRating = filterRating === "ALL" || review.rating.toString() === filterRating;
        const matchesStatus = filterStatus === "ALL" || review.status === filterStatus;
        return matchesRating && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PUBLISHED": return <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded border border-emerald-200 flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Public</span>;
            case "PENDING": return <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded border border-amber-200">En attente</span>;
            case "REJECTED": return <span className="bg-rose-100 text-rose-800 text-xs font-bold px-2 py-1 rounded border border-rose-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> Masqué</span>;
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-100 text-slate-200'}`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Star className="w-6 h-6 text-indigo-500 fill-indigo-500" />
                        Avis Clients
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez la réputation de votre agence et répondez aux avis.</p>
                </div>

                {/* Moyenne Globale */}
                <div className="flex items-center gap-4 bg-slate-50 px-6 py-3 rounded-xl border border-slate-200">
                    <div className="text-3xl font-black text-slate-900">4.5</div>
                    <div>
                        {renderStars(4)}
                        <div className="text-xs font-medium text-slate-500 mt-1">Sur 42 avis authentifiés</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-bold text-slate-700">Filtrer par :</span>
                </div>

                <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium"
                >
                    <option value="ALL">Toutes les notes</option>
                    <option value="5">5 Étoiles</option>
                    <option value="4">4 Étoiles</option>
                    <option value="3">3 Étoiles</option>
                    <option value="2">2 Étoiles</option>
                    <option value="1">1 Étoile</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-slate-900 font-medium"
                >
                    <option value="ALL">Tous les statuts</option>
                    <option value="PUBLISHED">Publics</option>
                    <option value="PENDING">En attente de réponse</option>
                    <option value="REJECTED">Masqués/Signalés</option>
                </select>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6">
                            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-slate-900">{review.clientName}</h3>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-sm font-medium text-slate-500">{review.date}</span>
                                        {getStatusBadge(review.status)}
                                    </div>
                                    {renderStars(review.rating)}
                                </div>

                                <div className="text-sm font-medium text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 self-start">
                                    Concernant : <span className="font-bold">{review.propertyName}</span>
                                </div>
                            </div>

                            <p className="text-slate-700 leading-relaxed">"{review.comment}"</p>

                            {/* Action Buttons */}
                            <div className="mt-6 flex flex-wrap gap-3">
                                {review.status === "PENDING" && (
                                    <button className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors">
                                        Publier l'avis
                                    </button>
                                )}
                                {review.status === "PUBLISHED" && !review.reply && (
                                    <button
                                        onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                                        className="px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Répondre publiquement
                                    </button>
                                )}
                                {(review.status === "PENDING" || review.status === "PUBLISHED") && (
                                    <button className="px-4 py-2 bg-rose-50 text-rose-700 text-sm font-bold border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors ml-auto flex items-center gap-2">
                                        <XCircle className="w-4 h-4" /> Signaler / Masquer
                                    </button>
                                )}
                            </div>

                            {/* Reply Box Logic */}
                            {replyingTo === review.id && (
                                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                                    <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                                        <CornerDownRight className="w-4 h-4 text-slate-400" />
                                        Votre réponse publique :
                                    </h4>
                                    <textarea
                                        value={replyText}
                                        onChange={(e) => setReplyText(e.target.value)}
                                        className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium min-h-[100px] placeholder:text-slate-400"
                                        placeholder="Rédigez une réponse professionnelle pour remercier le client ou adresser le problème..."
                                    />
                                    <div className="flex justify-end gap-2 mt-3">
                                        <button
                                            onClick={() => setReplyingTo(null)}
                                            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
                                        >
                                            Annuler
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-md text-sm"
                                        >
                                            Envoyer la réponse
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Existing Reply Display */}
                        {review.reply && (
                            <div className="bg-slate-50 p-6 border-t border-slate-100 flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md flex-shrink-0">
                                    AG
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                                        Votre réponse
                                        <span className="text-xs font-semibold px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded border border-indigo-200">Directeur d'Agence</span>
                                    </h4>
                                    <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-indigo-200 pl-3 py-1">
                                        "{review.reply}"
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {filteredReviews.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                        <p className="text-slate-500">Aucun avis ne correspond à vos filtres.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
