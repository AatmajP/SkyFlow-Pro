import apiClient from '@/services/api/apiClient';

export interface FAQItem {
    question: string;
    answer: string;
}

export interface SupportData {
    faqs: FAQItem[];
    supportEmail: string;
    supportPhone: string;
    chatHours: string;
}

export const chatService = {
    async getSupportData(): Promise<SupportData> {
        const response = await apiClient.get<SupportData>('/chat/support');
        return response.data;
    }
};
