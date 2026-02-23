"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './auth-provider';
import axios from '@/lib/axios';

interface Notification {
    _id: string;
    type: 'CONTACT_MESSAGE' | 'ORDER_ALERT' | 'PAYMENT_ALERT' | 'SYSTEM_ALERT' | 'REPORT_GENERATED';
    title: string;
    message: string;
    data?: any;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    status: 'UNREAD' | 'READ' | 'ARCHIVED';
    actionUrl?: string;
    createdAt: string;
}

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    totalUnread: number;
    markAsRead: (notificationId: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearNotifications: () => void;
    fetchNotifications: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    notifications: [],
    totalUnread: 0,
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    clearNotifications: () => {},
    fetchNotifications: async () => {},
});

export const useSocket = () => useContext(SocketContext);

const getSocketServerUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!apiUrl) {
        return 'http://localhost:5000';
    }

    return apiUrl.replace(/\/api\/?$/, '');
};

const notificationEnabledRoles = ['SUPERADMIN', 'RESTAURANT_ADMIN', 'ADMIN', 'MANAGER'];

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [totalUnread, setTotalUnread] = useState(0);
    const hasHydratedRef = useRef(false);
    const unreadIdsRef = useRef<Set<string>>(new Set());

    const showBrowserNotification = (notification: Notification) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/logo.svg',
                tag: notification._id,
            });
        }
    };

    // Fetch notifications from database
    const fetchNotifications = async (options?: { notifyOnNew?: boolean }) => {
        try {
            const response = await axios.get('/notifications?limit=20');
            if (response.data.data) {
                const fetchedNotifications: Notification[] = response.data.data.notifications || [];
                setNotifications(fetchedNotifications);
                setTotalUnread(response.data.data.totalUnread || 0);

                const unreadNotifications = fetchedNotifications.filter((item) => item.status === 'UNREAD');
                const latestUnreadIds = new Set(unreadNotifications.map((item) => item._id));

                if (options?.notifyOnNew && hasHydratedRef.current) {
                    unreadNotifications.forEach((item) => {
                        if (!unreadIdsRef.current.has(item._id)) {
                            showBrowserNotification(item);
                        }
                    });
                }

                unreadIdsRef.current = latestUnreadIds;
                hasHydratedRef.current = true;
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId: string) => {
        try {
            await axios.put(`/notifications/${notificationId}/read`);
            setNotifications(prev => prev.map((n) => (
                n._id === notificationId ? { ...n, status: 'READ' } : n
            )));
            unreadIdsRef.current.delete(notificationId);
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put('/notifications/read-all');
            unreadIdsRef.current.clear();
            await fetchNotifications();
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    const clearNotifications = () => {
        setNotifications([]);
        setTotalUnread(0);
    };

    useEffect(() => {
        // Fetch initial notifications
        if (user && notificationEnabledRoles.includes(user.role)) {
            fetchNotifications({ notifyOnNew: false });
        }
    }, [user]);

    useEffect(() => {
        if (user && notificationEnabledRoles.includes(user.role)) {
            const intervalId = setInterval(() => {
                fetchNotifications({ notifyOnNew: true });
            }, 15000);

            return () => clearInterval(intervalId);
        }
    }, [user]);

    useEffect(() => {
        // Connect to socket if user has a notification-enabled role
        if (user && notificationEnabledRoles.includes(user.role)) {
            console.log('🔗 Connecting Socket.io for role:', user.role);
            
            const socketServerUrl = getSocketServerUrl();
            const socketInstance = io(socketServerUrl, {
                withCredentials: true,
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });

            socketInstance.on('connect', () => {
                console.log('✅ Socket connected! ID:', socketInstance.id);
                setIsConnected(true);
                // Join role-based notification room
                socketInstance.emit('join_notifications', user.role);
                console.log('📤 Emitted join_notifications for role:', user.role);
                fetchNotifications({ notifyOnNew: false });
            });

            socketInstance.on('disconnect', () => {
                console.log('❌ Socket disconnected');
                setIsConnected(false);
            });

            socketInstance.on('connect_error', (error) => {
                console.error('🔴 Socket connection error:', error);
            });

            // Listen for new notifications from any role
            socketInstance.on('new_notification', (notification: Notification) => {
                console.log('🔔 New notification received:', notification);
                // Add to beginning of list
                setNotifications(prev => [notification, ...prev]);
                setTotalUnread(prev => prev + 1);
                if (notification.status === 'UNREAD' && !unreadIdsRef.current.has(notification._id)) {
                    unreadIdsRef.current.add(notification._id);
                    showBrowserNotification(notification);
                }
                fetchNotifications({ notifyOnNew: false });
                
                // Show browser notification
                if (!('Notification' in window) || Notification.permission !== 'granted') {
                    console.log('⚠️  Browser notifications not granted');
                }
            });

            setSocket(socketInstance);

            return () => {
                console.log('🔌 Disconnecting socket...');
                socketInstance.disconnect();
            };
        }
    }, [user]);

    // Request notification permission on mount
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    return (
        <SocketContext.Provider value={{ 
            socket, 
            isConnected, 
            notifications, 
            totalUnread,
            markAsRead,
            markAllAsRead,
            clearNotifications,
            fetchNotifications,
        }}>
            {children}
        </SocketContext.Provider>
    );
};
