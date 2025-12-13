'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X } from 'lucide-react';

type Toast = {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
};

const ToastContext = createContext<{
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}>({
  toasts: [],
  addToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg backdrop-blur-sm ${
              toast.type === 'success'
                ? 'border-green-500/40 bg-green-500/10 text-green-300'
                : toast.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-300'
                : 'border-sky-500/40 bg-sky-500/10 text-sky-300'
            }`}
          >
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 text-current opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

