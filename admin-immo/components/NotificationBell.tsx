"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { notificationService, Notification } from "@/services/notificationService";
import { useRouter } from "next/navigation";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        try {
            // notificationService.getNotifications() et getUnreadCount() ont maintenant leurs propres try-catch
            const [notifs, count] = await Promise.all([
                notificationService.getNotifications(),
                notificationService.getUnreadCount()
            ]);
            
            setNotifications(notifs || []);
            setUnreadCount(count || 0);
        } catch (error) {
            // Ce bloc ne devrait plus être atteint souvent car le service gère ses propres erreurs,
            // mais on le garde par sécurité pour éviter de casser le cycle useEffect.
            console.error("Erreur critique chargement notifications:", error);
            setNotifications([]);
            setUnreadCount(0);
        }
    }, []);

    // Poll for new notifications every 30 seconds
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Mark single notification as read
    const handleMarkAsRead = async (e: React.MouseEvent, notif: Notification) => {
        e.stopPropagation();
        try {
            await notificationService.markAsRead(notif.id);
            setNotifications(prev => 
                prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Erreur marquage lu:", error);
        }
    };

    // Mark all as read
    const handleMarkAllAsRead = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Erreur marquage tout lu:", error);
        }
    };

    // Handle notification click
    const handleNotificationClick = async (notif: Notification) => {
        // Mark as read if not already
        if (!notif.isRead) {
            await notificationService.markAsRead(notif.id);
            setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        // Navigate to linked page if exists
        if (notif.lien) {
            router.push(notif.lien);
        }
        
        setIsOpen(false);
    };

    // Get notification styles based on type
    const getNotificationStyles = (type: Notification["type"]) => {
        const styles: Record<string, { bg: string; border: string; icon: string }> = {
            RESERVATION: { bg: "bg-blue-50", border: "border-blue-200", icon: "📝" },
            CONFIRMATION: { bg: "bg-emerald-50", border: "border-emerald-200", icon: "✅" },
            ANNULATION: { bg: "bg-rose-50", border: "border-rose-200", icon: "❌" },
            NOUVEAU_BIEN: { bg: "bg-indigo-50", border: "border-indigo-200", icon: "🏠" },
            INFO: { bg: "bg-slate-50", border: "border-slate-200", icon: "ℹ️" },
            SUCCESS: { bg: "bg-green-50", border: "border-green-200", icon: "🎉" },
            WARNING: { bg: "bg-amber-50", border: "border-amber-200", icon: "⚠️" }
        };
        return styles[type] || { bg: "bg-gray-50", border: "border-gray-200", icon: "🔔" };
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-rose-500 rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <>
                    {/* Overlay to close on outside click */}
                    <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsOpen(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-800">
                                Notifications ({notifications.length})
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                                >
                                    <Check className="w-3 h-3" />
                                    Tout marquer lu
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-slate-500">
                                    <Bell className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                                    <p>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map((notif) => {
                                    const styles = getNotificationStyles(notif.type);
                                    return (
                                        <div
                                            key={notif.id}
                                            onClick={() => handleNotificationClick(notif)}
                                            className={`group p-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
                                                !notif.isRead ? `${styles.bg} border-l-4 ${styles.border}` : ""
                                            }`}
                                        >
                                            <div className="flex gap-3">
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.bg} ${styles.border} border`}>
                                                    <span className="text-lg">{styles.icon}</span>
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`font-medium text-sm ${!notif.isRead ? "text-slate-900" : "text-slate-600"}`}>
                                                        {notif.titre}
                                                    </p>
                                                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                                                        {notif.message}
                                                    </p>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {notif.date}
                                                    </p>
                                                </div>
                                                
                                                {/* Actions */}
                                                <div className="flex-shrink-0 flex flex-col gap-1">
                                                    {!notif.isRead && (
                                                        <button
                                                            onClick={(e) => handleMarkAsRead(e, notif)}
                                                            className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-emerald-600 transition-colors"
                                                            title="Marquer comme lu"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 text-center">
                                <button
                                    onClick={() => {
                                        setIsOpen(false);
                                        router.push("/notifications");
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                >
                                    Voir toutes les notifications
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
