"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, apiGetMe, apiLogin, apiLogout } from '@/features/auth/services/auth-service';
import { setCookie, deleteCookie, getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const token = getCookie('token');
            if (token) {
                try {
                    const response = await apiGetMe();
                    if (response.success) {
                        setUser(response.data.user);
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
            const response = await apiLogin(credentials);
            if (response.success) {
                const loggedInUser = response.data.user;
                setUser(loggedInUser);
                setCookie('token', response.data.token, { maxAge: 60 * 60 * 24 }); // 1 day

                if (loggedInUser.role === 'WAITER') {
                    router.push('/waiter');
                } else if (loggedInUser.role === 'CASHIER') {
                    router.push('/cashier');
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
            await apiLogout();
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            deleteCookie('token');
            router.push('/auth/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
