import { API_BASE_URL, apiFetch } from "@/services/api";
// Notification service for handling real-time notifications
const API_URL_BASE = "/api/notifications";

export interface Notification {
    id: number;
    type: "RESERVATION" | "CONFIRMATION" | "ANNULATION" | "NOUVEAU_BIEN" | "INFO" | "SUCCESS" | "WARNING";
    titre: string;
    message: string;
    date: string;
    isRead: boolean;
    lien?: string;
    entityId?: number;
}

class NotificationService {

    async getNotifications(): Promise<Notification[]> {
        try {
            return await apiFetch(`${API_URL_BASE}/me`);
        } catch (error) {
            console.error("❌ Failed to fetch notifications:", error);
            return []; // Return empty array instead of throwing to prevent UI crash
        }
    }

    async getUnreadCount(): Promise<number> {
        try {
            return await apiFetch(`${API_URL_BASE}/non-lues`);
        } catch (error) {
            console.error("❌ Erreur getUnreadCount:", error);
            return 0;
        }
    }

    async markAsRead(notificationId: number): Promise<void> {
        try {
            await apiFetch(`${API_URL_BASE}/${notificationId}/marquer-lu`, {
                method: "PUT"
            });
        } catch (error) {
            console.error(`❌ Erreur lors du marquage de la notification ${notificationId} comme lue:`, error);
        }
    }

    async markAllAsRead(): Promise<void> {
        try {
            await apiFetch(`${API_URL_BASE}/marquer-toutes-lues`, {
                method: "PUT"
            });
        } catch (error) {
            console.error("❌ Erreur lors du marquage de toutes les notifications comme lues:", error);
        }
    }

    getNotificationIcon(type: Notification["type"]): string {
        const icons: Record<string, string> = {
            RESERVATION: "📝",
            CONFIRMATION: "✅",
            ANNULATION: "❌",
            NOUVEAU_BIEN: "🏠",
            INFO: "ℹ️",
            SUCCESS: "🎉",
            WARNING: "⚠️"
        };
        return icons[type] || "🔔";
    }

    getNotificationColor(type: Notification["type"]): string {
        const colors: Record<string, string> = {
            RESERVATION: "bg-blue-500",
            CONFIRMATION: "bg-emerald-500",
            ANNULATION: "bg-rose-500",
            NOUVEAU_BIEN: "bg-indigo-500",
            INFO: "bg-slate-500",
            SUCCESS: "bg-green-500",
            WARNING: "bg-amber-500"
        };
        return colors[type] || "bg-gray-500";
    }
}

export const notificationService = new NotificationService();
