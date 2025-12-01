// Global notification utilities
// This file provides backward-compatible alert/confirm replacements

import { toast } from 'sonner';

// Temporary storage for notification context
let notificationContext: any = null;

export function setNotificationContext(context: any) {
  notificationContext = context;
}

// Professional toast notification (replaces alert)
export function showNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
  if (notificationContext) {
    notificationContext[type](message.split('\\n\\n')[0], message.split('\\n\\n')[1]);
  } else {
    // Fallback to toast
    const lines = message.split('\\n');
    const title = lines[0].replace(/^[❌✅⚠️🎉]\s*/, '');
    const description = lines.slice(1).join(' ');
    
    if (type === 'success') {
      toast.success(title, { description });
    } else if (type === 'error') {
      toast.error(title, { description });
    } else if (type === 'warning') {
      toast.warning(title, { description });
    } else {
      toast.info(title, { description });
    }
  }
}

// Professional confirm dialog (replaces confirm)
export async function showConfirm(
  message: string,
  options?: { 
    title?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info';
  }
): Promise<boolean> {
  if (notificationContext) {
    return notificationContext.showConfirm({
      title: options?.title || 'Confirm',
      message,
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      type: options?.type || 'info'
    });
  } else {
    // Fallback to browser confirm
    return confirm(message);
  }
}