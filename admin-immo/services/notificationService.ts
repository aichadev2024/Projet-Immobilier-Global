// Notification service for handling real-time notifications
const API_URL = "http://localhost:8080/api/notifications";

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
    private getToken(): string | null {
        if (typeof window !== "undefined") {
            return localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
        }
        return null;
    }

    private getHeaders() {
        const token = this.getToken();
        return {
            "Content-Type": "application/json",
            "Authorization": token ? `Bearer ${token}` : ""
        };
    }

    async getNotifications(): Promise<Notification[]> {
        try {
            const response = await fetch(`${API_URL}/me`, {
                headers: this.getHeaders()
            });
            if (!response.ok) {
                console.error("❌ getNotifications failed:", response.status, response.statusText);
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }
            return response.json();
        } catch (error) {
            console.error("❌ Failed to fetch notifications - is backend running on localhost:8080?", error);
            return []; // Return empty array instead of throwing to prevent UI crash
        }
    }

    async getUnreadCount(): Promise<number> {
        try {
            const response = await fetch(`${API_URL}/non-lues`, {
                headers: this.getHeaders()
            });
            if (!response.ok) {
                console.warn("⚠️ Impossible de récupérer le nombre de notifications non lues");
                return 0;
            }
            return await response.json();
        } catch (error) {
            console.error("❌ Erreur getUnreadCount - le backend est-il lancé ?", error);
            return 0;
        }
    }

    async markAsRead(notificationId: number): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/${notificationId}/marquer-lu`, {
                method: "PUT",
                headers: this.getHeaders()
            });
            if (!response.ok) throw new Error(`Erreur ${response.status}`);
        } catch (error) {
            console.error(`❌ Erreur lors du marquage de la notification ${notificationId} comme lue:`, error);
        }
    }

    async markAllAsRead(): Promise<void> {
        try {
            const response = await fetch(`${API_URL}/marquer-toutes-lues`, {
                method: "PUT",
                headers: this.getHeaders()
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ markAllAsRead error:", response.status, errorText);
            }
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
