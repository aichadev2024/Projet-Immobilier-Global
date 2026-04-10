"use client";

import React, { useState, useMemo } from "react";
import {
    Calendar as CalendarIcon, ChevronLeft, ChevronRight,
    MapPin, Clock, User, Plus, Filter
} from "lucide-react";

interface Appointment {
    id: string;
    clientName: string;
    propertyName: string;
    location: string;
    dateVisite: string;
    status: "CONFIRMED" | "PENDING" | "CANCELLED" | "EN_ATTENTE" | "ANNULEE" | "CONFIRMEE";
}

export default function AgenceRendezVous() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [filterStatus, setFilterStatus] = useState("TOUS");
    const [reservations, setReservations] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);

    // Format mois/année pour l'affichage
    const monthYearLabel = useMemo(() => {
        return new Intl.DateTimeFormat('fr-FR', {
            month: 'long',
            year: 'numeric'
        }).format(currentDate);
    }, [currentDate]);

    // Navigation mois
    const goToPreviousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const goToNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    // Calcul des jours du calendrier
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();
        
        // 0 = Dimanche, 1 = Lundi... on veut 0 = Lundi
        const startDay = firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1;
        
        const days = [];
        
        // Jours vides avant le 1er
        for (let i = 0; i < startDay; i++) {
            days.push(null);
        }
        
        // Jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            days.push(date);
        }
        
        return days;
    }, [currentDate]);

    // Vérifie si un jour a des réservations
    const hasReservationOnDate = (date: Date) => {
        if (!date || isNaN(date.getTime())) return false;
        const dateStr = date.toISOString().split('T')[0];
        return reservations.some(res => {
            if (!res.dateVisite) return false;
            const visiteDate = new Date(res.dateVisite);
            if (isNaN(visiteDate.getTime())) return false;
            const visite = visiteDate.toISOString().split('T')[0];
            return dateStr === visite;
        });
    };

    // Vérifie si c'est aujourd'hui
    const isToday = (date: Date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    // Vérifie si le jour est sélectionné
    const isSelected = (date: Date) => {
        return selectedDate?.toDateString() === date.toDateString();
    };

    const formattedDate = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(selectedDate || currentDate);

    React.useEffect(() => {
        const fetchReservations = async () => {
            const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
            if (!token) return;

            try {
                const response = await fetch("http://localhost:8080/api/reservations/agence", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const data = await response.json();
                    
                    const mapped: Appointment[] = data.map((res: any) => ({
                        id: res.id?.toString() || Math.random().toString(),
                        clientName: res.prenomClient && res.nomClient ? `${res.prenomClient} ${res.nomClient}` : (res.nomClient || "Client Inconnu"),
                        propertyName: res.libelleBien || "Bien Inconnu",
                        location: res.adresseBien || "Localisation non précisée",
                        dateVisite: res.dateVisite,
                        status: res.statut || "EN_ATTENTE"
                    }));
                    
                    setReservations(mapped);
                }
            } catch (error) {
                console.error("Erreur reservations", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReservations();
    }, []);

    // Confirmer une réservation
    const handleConfirm = async (id: string) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:8080/api/reservations/${id}/confirmer`, {
                method: 'POST',
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                // Rafraîchir la liste
                setReservations(prev => prev.map(r => 
                    r.id === id ? { ...r, status: 'CONFIRMED' as const } : r
                ));
                alert('Réservation confirmée !');
            } else {
                alert('Erreur lors de la confirmation');
            }
        } catch (error) {
            console.error("Erreur confirmation", error);
            alert('Erreur lors de la confirmation');
        }
    };

    // Annuler une réservation
    const handleCancel = async (id: string) => {
        if (!confirm('Voulez-vous vraiment annuler cette réservation ?')) return;
        
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:8080/api/reservations/${id}`, {
                method: 'DELETE',
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (response.ok) {
                setReservations(prev => prev.map(r => 
                    r.id === id ? { ...r, status: 'CANCELLED' as const } : r
                ));
                alert('Réservation annulée !');
            } else {
                alert('Erreur lors de l\'annulation');
            }
        } catch (error) {
            console.error("Erreur annulation", error);
            alert('Erreur lors de l\'annulation');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "CONFIRMED":
            case "CONFIRMEE": return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">Confirmé</span>;
            case "PENDING":
            case "EN_ATTENTE": return <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-lg border border-amber-200">En attente</span>;
            case "CANCELLED":
            case "ANNULEE": return <span className="px-2.5 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-lg border border-rose-200">Annulé</span>;
            default: return null;
        }
    };

    // Filtrage des réservations
    const filteredAppointments = useMemo(() => {
        return reservations.filter(app => {
            // Filtre par statut
            if (filterStatus !== "TOUS" && app.status !== filterStatus) {
                return false;
            }
            // Filtre par date sélectionnée
            if (selectedDate) {
                const selected = selectedDate.toISOString().split('T')[0];
                const visite = new Date(app.dateVisite).toISOString().split('T')[0];
                return selected === visite;
            }
            return true;
        });
    }, [reservations, filterStatus, selectedDate]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <CalendarIcon className="w-6 h-6 text-indigo-500" />
                        Agenda des Rendez-vous
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Gérez vos visites et rencontres clients.</p>
                </div>
                <button className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Nouveau rendez-vous
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Column - Calendar Control & Filters */}
                <div className="space-y-6">
                    {/* Calendar */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-slate-900 capitalize">{monthYearLabel}</h2>
                            <div className="flex gap-2">
                                <button 
                                    onClick={goToPreviousMonth}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={goToNextMonth}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Days header */}
                        <div className="grid grid-cols-7 gap-1 text-center mb-2">
                            {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map(day => (
                                <div key={day} className="text-xs font-bold text-slate-400">{day}</div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {calendarDays.map((date, i) => {
                                if (!date) {
                                    return <div key={`empty-${i}`} className="w-8 h-8" />;
                                }
                                
                                const day = date.getDate();
                                const today = isToday(date);
                                const hasEvent = hasReservationOnDate(date);
                                const selected = isSelected(date);

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(selected ? null : date)}
                                        className={`relative w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-all ${
                                            selected 
                                                ? 'bg-indigo-600 text-white shadow-md' 
                                                : today 
                                                    ? 'bg-emerald-500 text-white shadow-md'
                                                    : 'hover:bg-slate-100 text-slate-700'
                                        }`}
                                    >
                                        {day}
                                        {hasEvent && (
                                            <div className={`absolute -bottom-0.5 w-1.5 h-1.5 rounded-full ${
                                                selected || today ? 'bg-white' : 'bg-indigo-400'
                                            }`} />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        {selectedDate && (
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <button 
                                    onClick={() => setSelectedDate(null)}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Voir toutes les réservations
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Filter className="w-5 h-5 text-indigo-500" />
                            Filtres
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Statut</label>
                                <select
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 font-medium"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="TOUS">Toutes les réservations</option>
                                    <option value="CONFIRMEE">Confirmées</option>
                                    <option value="EN_ATTENTE">En attente</option>
                                    <option value="ANNULEE">Annulées</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Appointments List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h2 className="text-lg font-bold text-slate-900 capitalize">
                            {formattedDate}
                        </h2>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-700 font-bold text-xs rounded-full">
                            {filteredAppointments.length} événements
                        </span>
                    </div>

                    {filteredAppointments.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl text-center border border-dashed border-slate-300">
                            <CalendarIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun rendez-vous</h3>
                            <p className="text-slate-500">Vous n'avez aucun événement prévu pour cette sélection.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAppointments.map((app) => (
                                <div key={app.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                                    {/* Left priority border */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${app.status === 'CONFIRMED' ? 'bg-emerald-500' :
                                        app.status === 'PENDING' ? 'bg-amber-500' : 'bg-rose-500'
                                        }`} />

                                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-slate-900 text-sm flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                    <Clock className="w-5 h-5 text-indigo-500" />
                                                    <span>
                                                        Le {new Date(app.dateVisite).toLocaleDateString()} à {new Date(app.dateVisite).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </span>
                                                {getStatusBadge(app.status)}
                                            </div>

                                            <div>
                                                <h3 className="font-bold text-slate-800">{app.clientName}</h3>
                                                <p className="text-sm font-medium text-slate-500 flex items-center gap-1.5 mt-1">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    {app.propertyName} - {app.location}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-3 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 border border-slate-200">
                                                    {app.clientName.charAt(0)}
                                                </div>
                                            </div>

                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleConfirm(app.id)}
                                                    disabled={app.status !== 'EN_ATTENTE' && app.status !== 'PENDING'}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                                        app.status === 'EN_ATTENTE' || app.status === 'PENDING'
                                                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    Confirmer
                                                </button>
                                                <button 
                                                    onClick={() => handleCancel(app.id)}
                                                    disabled={app.status !== 'EN_ATTENTE' && app.status !== 'PENDING'}
                                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                                                        app.status === 'EN_ATTENTE' || app.status === 'PENDING'
                                                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    Annuler
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
