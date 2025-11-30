"use client";

import * as React from "react";

// Simple toast implementation without external dependencies
interface Toast {
  id: string;
  message: string;
  type?: 'default' | 'success' | 'error' | 'info';
}

const toasts: Toast[] = [];
const listeners: Array<() => void> = [];

function notify() {
  listeners.forEach(listener => listener());
}

export const toast = {
  success: (message: string) => {
    const id = Math.random().toString(36);
    toasts.push({ id, message, type: 'success' });
    notify();
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        notify();
      }
    }, 3000);
  },
  error: (message: string) => {
    const id = Math.random().toString(36);
    toasts.push({ id, message, type: 'error' });
    notify();
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        notify();
      }
    }, 3000);
  },
  info: (message: string) => {
    const id = Math.random().toString(36);
    toasts.push({ id, message, type: 'info' });
    notify();
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        notify();
      }
    }, 3000);
  },
  message: (message: string) => {
    const id = Math.random().toString(36);
    toasts.push({ id, message, type: 'default' });
    notify();
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id);
      if (index > -1) {
        toasts.splice(index, 1);
        notify();
      }
    }, 3000);
  }
};

type ToasterProps = Record<string, unknown>;

const Toaster = ({ ...props }: ToasterProps) => {
  const [currentToasts, setCurrentToasts] = React.useState<Toast[]>([]);

  React.useEffect(() => {
    const listener = () => {
      setCurrentToasts([...toasts]);
    };
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-white font-medium
            animate-in slide-in-from-top-5 duration-300
            ${toast.type === 'success' ? 'bg-green-600' : ''}
            ${toast.type === 'error' ? 'bg-red-600' : ''}
            ${toast.type === 'info' ? 'bg-blue-600' : ''}
            ${toast.type === 'default' ? 'bg-gray-800' : ''}
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
};

export { Toaster };
