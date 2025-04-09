import { useContext } from 'react';
import { NotificationContext } from '@/components/ui/notification';

export function useNotification() {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  
  return {
    notify: {
      success: (message: string, description?: string) => {
        context.addNotification(message, { description, type: 'success' });
      },
      error: (message: string, description?: string) => {
        context.addNotification(message, { description, type: 'error' });
      },
      info: (message: string, description?: string) => {
        context.addNotification(message, { description, type: 'info' });
      }
    },
    notifications: context.notifications,
    removeNotification: context.removeNotification
  };
}
