import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket';
import toast from 'react-hot-toast';
import { Bell } from 'lucide-react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const addNotification = useCallback((notif) => {
        setNotifications(prev => [{ ...notif, id: Date.now(), read: false, time: new Date() }, ...prev.slice(0, 49)]);
        setUnreadCount(c => c + 1);
        // Show toast
        toast(notif.message, {
            icon: '🔔',
            duration: 5000,
        });
    }, []);

    useEffect(() => {
        if (!user) {
            disconnectSocket();
            return;
        }

        connectSocket(user._id);
        const socket = getSocket();

        // Listen for notification events
        socket.on('new_listing_pending', (data) => addNotification({ ...data, type: 'moderation' }));
        socket.on('listing_status_update', (data) => addNotification({ ...data, type: 'status' }));
        socket.on('inquiry_reply', (data) => addNotification({ ...data, type: 'inquiry' }));
        socket.on('new_matching_listing', (data) => addNotification({ ...data, type: 'recommendation' }));

        return () => {
            socket.off('new_listing_pending');
            socket.off('listing_status_update');
            socket.off('inquiry_reply');
            socket.off('new_matching_listing');
        };
    }, [user, addNotification]);

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <NotificationContext.Provider value={{ notifications, unreadCount, markAllRead, clearNotifications, addNotification }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error('useNotifications must be inside NotificationProvider');
    return ctx;
};
