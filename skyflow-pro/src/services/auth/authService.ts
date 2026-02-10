import apiClient from '@/services/api/apiClient';
import { useAuth, type UserProfile } from '@/stores';

export interface AuthResponse {
    accessToken: string;
    username: string;
    role: string;
    fullName: string;
    email: string;
}

export const authService = {
    async login(emailOrUsername: string, password: string): Promise<void> {
        const response = await apiClient.post<any>('/auth/login', {
            username: emailOrUsername,
            password,
        });

        const { token, username } = response.data;

        const userProfile: UserProfile = {
            id: username,
            email: emailOrUsername.includes('@') ? emailOrUsername : `${username}@skyflow.com`,
            name: username.charAt(0).toUpperCase() + username.slice(1),
        };

        useAuth.getState().login(token, userProfile);
    },

    async register(data: any): Promise<void> {
        await apiClient.post('/auth/register', data);
    },

    async getProfile(): Promise<void> {
        // Optional: sync profile if needed
    }
};
