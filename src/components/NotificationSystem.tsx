import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from './Icons';
import { setNotificationContext } from '../utils/notifications';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

interface NotificationContextType {
  showNotification: (type: NotificationType, title: string, message?: string, duration?: number) => void;
  showConfirm: (options: ConfirmOptions) => Promise<boolean>;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const showNotification = (type: NotificationType, title: string, message?: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substring(7);
    const notification: Notification = { id, type, title, message, duration };
    
    setNotifications(prev => [...prev, notification]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const showConfirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmDialog({
        isOpen: true,
        options,
        resolve
      });
    });
  };

  const handleConfirmResponse = (response: boolean) => {
    if (confirmDialog) {
      confirmDialog.resolve(response);
      setConfirmDialog(null);
    }
  };

  const success = (title: string, message?: string) => showNotification('success', title, message);
  const error = (title: string, message?: string) => showNotification('error', title, message);
  const warning = (title: string, message?: string) => showNotification('warning', title, message);
  const info = (title: string, message?: string) => showNotification('info', title, message);

  // Set global notification context
  useEffect(() => {
    setNotificationContext({ showNotification, showConfirm, success, error, warning, info });
  }, []);

  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-600 to-emerald-600',
          border: 'border-green-400',
          icon: <CheckCircle className="w-6 h-6 text-white" />,
          glow: 'shadow-green-500/50'
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-600 to-rose-600',
          border: 'border-red-400',
          icon: <AlertCircle className="w-6 h-6 text-white" />,
          glow: 'shadow-red-500/50'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-600 to-orange-600',
          border: 'border-yellow-400',
          icon: <AlertTriangle className="w-6 h-6 text-white" />,
          glow: 'shadow-yellow-500/50'
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-600 to-cyan-600',
          border: 'border-blue-400',
          icon: <Info className="w-6 h-6 text-white" />,
          glow: 'shadow-blue-500/50'
        };
    }
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showConfirm, success, error, warning, info }}>
      {children}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none">
        {notifications.map((notification) => {
          const styles = getNotificationStyles(notification.type);
          return (
            <div
              key={notification.id}
              className="pointer-events-auto animate-in slide-in-from-right-5 fade-in duration-300"
            >
              <div className={`relative ${styles.bg} border-2 ${styles.border} rounded-xl p-4 shadow-2xl ${styles.glow} min-w-[320px] max-w-md`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {styles.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-sm mb-1">{notification.title}</h4>
                    {notification.message && (
                      <p className="text-white/90 text-xs whitespace-pre-wrap">{notification.message}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeNotification(notification.id)}
                    className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog?.isOpen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] p-4 animate-in fade-in duration-200">
          <div className="relative max-w-md w-full animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-2xl blur-2xl opacity-50 ${
              confirmDialog.options.type === 'danger' ? 'bg-red-600' :
              confirmDialog.options.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`} />
            
            {/* Dialog Content */}
            <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-4 border-blue-500 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className={`p-6 border-b-2 ${
                confirmDialog.options.type === 'danger' ? 'bg-red-900/30 border-red-600' :
                confirmDialog.options.type === 'warning' ? 'bg-yellow-900/30 border-yellow-600' :
                'bg-blue-900/30 border-blue-600'
              }`}>
                <div className="flex items-center gap-3">
                  {confirmDialog.options.type === 'danger' ? (
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-white" />
                    </div>
                  ) : confirmDialog.options.type === 'warning' ? (
                    <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Info className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <h3 className="text-white text-xl font-bold">{confirmDialog.options.title}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {confirmDialog.options.message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-6 bg-black/50 flex gap-3 justify-end">
                <button
                  onClick={() => handleConfirmResponse(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-lg"
                >
                  {confirmDialog.options.cancelText || 'Cancel'}
                </button>
                <button
                  onClick={() => handleConfirmResponse(true)}
                  className={`px-6 py-3 rounded-lg font-bold transition-all hover:scale-105 active:scale-95 shadow-lg ${
                    confirmDialog.options.type === 'danger' 
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white'
                      : confirmDialog.options.type === 'warning'
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white'
                  }`}
                >
                  {confirmDialog.options.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}
