import api from '@/lib/axios';

export interface RestaurantInquiry {
    _id: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    restaurantName: string;
    restaurantAddress: string;
    restaurantPhone?: string;
    cuisineType?: string;
    numberOfTables?: number;
    message?: string;
    status: 'PENDING' | 'CONTACTED' | 'ONBOARDED' | 'REJECTED';
    contactedAt?: string;
    onboardedAt?: string;
    createdAt: string;
}

export const getInquiriesApi = () =>
    api.get<{ success: boolean; data: RestaurantInquiry[] }>('/inquiries');

export const markInquiryContactedApi = (id: string) =>
    api.put(`/inquiries/${id}/mark-contacted`);

export const onboardInquiryApi = (id: string) =>
    api.post(`/inquiries/${id}/onboard`);

export const resendCredentialsApi = (id: string) =>
    api.post(`/inquiries/${id}/resend-credentials`);

export const rejectInquiryApi = (id: string) =>
    api.put(`/inquiries/${id}/reject`);
