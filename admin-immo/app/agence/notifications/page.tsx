"use client";

import React from "react";
import {
    Bell, CheckCircle2, AlertCircle, MessageSquare,
    Calendar, Info, ShieldCheck, Clock
} from "lucide-react";

interface Notification {
    id: string;
    type: "SUCCESS" | "WARNING" | "INFO" | "MESSAGE" | "APPOINTMENT";
    titre: string;
    message: string;
    date: string;
    isRead: boolean;
}

// Replaced mockNotifications with API state

export default function AgenceNotifications() {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [filter, setFilter] = React.useState<"ALL" | "UNREAD">("ALL");

    const fetchNotifications = async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
        if (!token) return;
        try {
            const response = await fetch("http://localhost:8080/api/notifications/me", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.map((n: any) => ({
                    id: n.id.toString(),
                    type: n.type || "INFO",
                    titre: n.titre,
                    message: n.message,
                    date: n.date,
                    isRead: n.isRead
                })));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
        try {
            await fetch(`http://localhost:8080/api/notifications/${id}/marquer-lu`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllAsRead = async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken") : null;
        try {
            await fetch(`http://localhost:8080/api/notifications/marquer-toutes-lues`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            });
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error(error);
        }
    };

    const displayNotifications = filter === "ALL" ? notifications : notifications.filter(n => !n.isRead);
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const getIcon = (type: string) => {
        switch (type) {
            case 'SUCCESS': return <div className="p-2 bg-emerald-100 rounded-full"><ShieldCheck className="w-5 h-5 text-emerald-600" /></div>;
            case 'WARNING': return <div className="p-2 bg-amber-100 rounded-full"><AlertCircle className="w-5 h-5 text-amber-600" /></div>;
            case 'MESSAGE': return <div className="p-2 bg-blue-100 rounded-full"><MessageSquare className="w-5 h-5 text-blue-600" /></div>;
            case 'APPOINTMENT': return <div className="p-2 bg-purple-100 rounded-full"><Calendar className="w-5 h-5 text-purple-600" /></div>;
            default: return <div className="p-2 bg-slate-100 rounded-full"><Info className="w-5 h-5 text-slate-600" /></div>;
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-6 h-6 text-indigo-500" />
                        Centre de Notifications
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Restez informé de l'activité de votre agence.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={markAllAsRead}
                        className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" />
                        Tout marquer comme lu
                    </button>
                </div>
            </div>

            {/* Notifications Actions */}
            <div className="flex items-center gap-4 pb-2 border-b border-slate-200">
                <button
                    onClick={() => setFilter("ALL")}
                    className={`px-4 py-2 text-sm font-bold ${filter === "ALL" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
                >
                    Toutes
                </button>
                <button
                    onClick={() => setFilter("UNREAD")}
                    className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 transition-colors ${filter === "UNREAD" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-800"}`}
                >
                    Non lues {unreadCount > 0 && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs">{unreadCount}</span>}
                </button>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100">
                    {displayNotifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-5 hover:bg-slate-50 transition-colors flex gap-4 ${!notification.isRead ? 'bg-indigo-50/30' : ''}`}
                        >
                            {/* Status Dot */}
                            <div className="flex-shrink-0 pt-2 w-2">
                                {!notification.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                )}
                            </div>

                            {/* Icon */}
                            <div className="flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1 gap-4">
                                    <h3 className={`text-sm md:text-base truncate ${!notification.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                        {notification.titre}
                                    </h3>
                                    <span className="text-xs font-medium text-slate-400 flex items-center gap-1 flex-shrink-0">
                                        <Clock className="w-3 h-3" />
                                        {notification.date}
                                    </span>
                                </div>
                                <p className={`text-sm line-clamp-2 md:line-clamp-none ${!notification.isRead ? 'text-slate-700' : 'text-slate-500'}`}>
                                    {notification.message}
                                </p>

                                {/* Optional Actions inside notification */}
                                {!notification.isRead && (
                                    <div className="mt-3 flex gap-3">
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
                                        >
                                            Consulter
                                        </button>
                                        <button
                                            onClick={() => markAsRead(notification.id)}
                                            className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                                        >
                                            Marquer comme lu
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {displayNotifications.length === 0 && (
                        <div className="p-8 text-center text-slate-500">
                            Aucune notification disponible.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
