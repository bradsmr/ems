import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

type NotificationType = 'success' | 'error' | 'info';

type Notification = {
  id: string;
  message: string;
  description?: string;
  type: NotificationType;
};

type NotificationContextType = {
  notifications: Notification[];
  addNotification: (message: string, options?: { description?: string; type?: NotificationType }) => void;
  removeNotification: (id: string) => void;
};

export const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {}
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (
    message: string,
    options: { description?: string; type?: NotificationType } = {}
  ) => {
    const id = Math.random().toString(36).substring(2, 9);
    const notification: Notification = {
      id,
      message,
      description: options.description,
      type: options.type || 'info',
    };

    setNotifications((prev) => [...prev, notification]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center space-y-2 p-4 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'w-full max-w-full bg-white border shadow-md rounded-none pointer-events-auto flex items-center justify-between p-4',
            notification.type === 'success' && 'border-green-500 bg-green-50',
            notification.type === 'error' && 'border-red-500 bg-red-50',
            notification.type === 'info' && 'border-blue-500 bg-blue-50'
          )}
        >
          <div>
            <h5 className={cn(
              'font-medium',
              notification.type === 'success' && 'text-green-700',
              notification.type === 'error' && 'text-red-700',
              notification.type === 'info' && 'text-blue-700'
            )}>
              {notification.message}
            </h5>
            {notification.description && (
              <p className="text-sm text-gray-600">{notification.description}</p>
            )}
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-4 p-1 rounded-full hover:bg-gray-200 focus:outline-none"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      ))}
    </div>
  );
}
