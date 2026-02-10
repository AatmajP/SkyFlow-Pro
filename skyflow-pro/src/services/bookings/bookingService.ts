import apiClient from '@/services/api/apiClient';

export interface BookingRequest {
    flightId: number;
    seatNumber: string;
    cabinClass: string;
}

export interface BookingResponse {
    id: number;
    pnr: string;
    status: string;
    bookingDate: string;
    totalAmount: number;
    flight: any;
    seat: any;
}

export const bookingService = {
    async createBooking(request: BookingRequest): Promise<BookingResponse> {
        const payload = {
            flightId: request.flightId,
            seatNumber: request.seatNumber,
            seatClass: request.cabinClass // Map frontend cabinClass to backend seatClass
        };
        const response = await apiClient.post<BookingResponse>('/bookings', payload);
        return response.data;
    },

    async getMyBookings(): Promise<BookingResponse[]> {
        const response = await apiClient.get<BookingResponse[]>('/bookings/my-bookings');
        return response.data;
    },

    async cancelBooking(id: number): Promise<void> {
        await apiClient.post(`/bookings/cancel/${id}`);
    }
};
