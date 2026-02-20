import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    duration?: number;
}

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType) => void;
    notifications: Notification[];
    removeNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const showNotification = useCallback((message: string, type: NotificationType = 'info') => {
        const id = Math.random().toString(36).substring(2, 9);
        const newNotification: Notification = { id, message, type };

        setNotifications(prev => [...prev, newNotification]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    }, [removeNotification]);

    return (
        <NotificationContext.Provider value={{ showNotification, notifications, removeNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};
