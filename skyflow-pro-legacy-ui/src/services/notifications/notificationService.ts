import apiClient from '@/services/api/apiClient';

export interface Notification {
    id: number;
    message: string;
    isRead: boolean;
    createdAt: string;
    bookingId?: number;
}

export const notificationService = {
    async getNotifications(): Promise<Notification[]> {
        const response = await apiClient.get<Notification[]>('/notifications');
        return response.data;
    },

    async markAsRead(_id: number): Promise<void> {
        // Backend doesn't have this specific endpoint yet, but usually it would
        // await apiClient.post(`/notifications/${id}/read`);
    }
};
