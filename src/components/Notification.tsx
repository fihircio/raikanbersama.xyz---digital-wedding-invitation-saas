import React from 'react';
import { useNotification } from '../contexts/NotificationContext';
import {
    CheckCircleIcon,
    XCircleIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

const Notification: React.FC = () => {
    const { notifications, removeNotification } = useNotification();

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-24 right-4 z-[300] space-y-3 w-full max-w-sm pointer-events-none">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`
            pointer-events-auto flex items-start gap-4 p-4 rounded-2xl shadow-xl border backdrop-blur-md animate-slide-in
            ${notification.type === 'success' ? 'bg-green-50/90 border-green-100 text-green-800' : ''}
            ${notification.type === 'error' ? 'bg-red-50/90 border-red-100 text-red-800' : ''}
            ${notification.type === 'warning' ? 'bg-amber-50/90 border-amber-100 text-amber-800' : ''}
            ${notification.type === 'info' ? 'bg-blue-50/90 border-blue-100 text-blue-800' : ''}
          `}
                >
                    <div className="flex-shrink-0 mt-0.5">
                        {notification.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-500" />}
                        {notification.type === 'error' && <XCircleIcon className="w-5 h-5 text-red-500" />}
                        {notification.type === 'warning' && <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />}
                        {notification.type === 'info' && <InformationCircleIcon className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold leading-relaxed">{notification.message}</p>
                    </div>
                    <button
                        onClick={() => removeNotification(notification.id)}
                        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition"
                    >
                        <XMarkIcon className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default Notification;
