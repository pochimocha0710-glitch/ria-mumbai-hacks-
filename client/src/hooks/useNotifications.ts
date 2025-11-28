import { useState, useEffect } from 'react';

export const useNotifications = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSupported, setIsSupported] = useState(false);

    useEffect(() => {
        // Check if notifications are supported
        if ('Notification' in window) {
            setIsSupported(true);
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async (): Promise<NotificationPermission> => {
        if (!isSupported) {
            console.warn('Notifications are not supported in this browser');
            return 'denied';
        }

        try {
            const result = await Notification.requestPermission();
            setPermission(result);
            console.log(`Notification permission: ${result}`);
            return result;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    };

    const showNotification = (title: string, options?: NotificationOptions) => {
        if (!isSupported) {
            console.warn('Notifications are not supported');
            return null;
        }

        if (permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        try {
            const notificationOptions: NotificationOptions = {
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                ...options,
            };
            
            const notification = new Notification(title, notificationOptions);
            
            // Vibrate if supported (mobile devices)
            if ('vibrate' in navigator && notificationOptions.data?.vibrate !== false) {
                navigator.vibrate([200, 100, 200]);
            }

            // Handle notification click
            notification.onclick = () => {
                window.focus();
                notification.close();
            };

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
            return null;
        }
    };

    const scheduleNotification = (
        title: string,
        scheduledTime: Date,
        options?: NotificationOptions
    ) => {
        const now = new Date().getTime();
        const scheduledTimestamp = scheduledTime.getTime();
        const delay = scheduledTimestamp - now;

        if (delay <= 0) {
            // If time has passed, show immediately
            return showNotification(title, options);
        }

        // Schedule the notification
        const timeoutId = setTimeout(() => {
            showNotification(title, options);
        }, delay);

        return () => clearTimeout(timeoutId);
    };

    return {
        permission,
        isSupported,
        requestPermission,
        showNotification,
        scheduleNotification,
    };
};
