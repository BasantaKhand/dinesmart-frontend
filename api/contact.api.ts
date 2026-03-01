import api from '@/lib/axios';

export interface ContactMessage {
    _id: string;
    fullName: string;
    restaurantName: string;
    email: string;
    phone: string;
    message: string;
    createdAt: string;
    inviteSentAt?: string;
    inviteAcceptedAt?: string;
    onboardedAt?: string;
}

export interface LeadInfo {
    fullName: string;
    email: string;
    restaurantName: string;
    phone: string;
}

export const getContactMessagesApi = () =>
    api.get<{ success: boolean; data: { messages: ContactMessage[] } }>('/contact/messages');

export const deleteContactMessageApi = (id: string) =>
    api.delete(`/contact/messages/${id}`);

export const sendContactInviteApi = (id: string, data: { customMessage: string }) =>
    api.post(`/contact/messages/${id}/send-invite`, data);

export const validateInviteApi = (token: string) =>
    api.get<{ success: boolean; data: { lead: LeadInfo } }>('/contact/invite/validate', { params: { token } });

export const activateInviteApi = (data: {
    token: string;
    password: string;
    restaurantAddress: string;
    restaurantPhone?: string;
    cuisineType?: string;
    numberOfTables?: number;
}) =>
    api.post('/contact/invite/activate', data);
