"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { loginApi, logoutApi, getMeApi, updateProfileApi } from '@/api/auth.api';
import type { User, UpdateProfileData } from '@/api/auth.api';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const response = await getMeApi();
            if (response.data.success) {
                setUser(response.data.data.user);
            }
        } catch (error) {
            console.error('Failed to refresh user', error);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const token = getCookie('token');
            if (token) {
                try {
                    const response = await getMeApi();
                    if (response.data.success) {
                        setUser(response.data.data.user);
                    }
                } catch (error) {
                    console.error('Auth verification failed', error);
                    deleteCookie('token');
                }
            }
            setIsLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials: any) => {
        try {
            const response = await loginApi(credentials);
            if (response.data.success) {
                const loggedInUser = response.data.data.user;
                setUser(loggedInUser);
                setCookie('token', response.data.data.token, { maxAge: 60 * 60 * 24 }); // 1 day
                toast.success(`Welcome back, ${loggedInUser.name}!`);

                if (loggedInUser.role === 'WAITER') {
                    router.push('/waiter');
                } else if (loggedInUser.role === 'CASHIER') {
                    router.push('/cashier');
                } else if (loggedInUser.role === 'SUPERADMIN') {
                    router.push('/superadmin');
                } else {
                    router.push('/admin');
                }
            }
        } catch (error: any) {
            throw error.response?.data?.message || 'Login failed';
        }
    };

    const logout = async () => {
        try {
            await logoutApi();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            deleteCookie('token');
            router.push('/auth/login');
        }
    };

    const updateProfile = async (data: UpdateProfileData) => {
        const response = await updateProfileApi(data);
        if (response.data.success) {
            setUser(response.data.data.user);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateProfile, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
