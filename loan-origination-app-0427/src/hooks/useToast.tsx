import { createContext, useCallback, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ToastContextValue {
  toast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastState {
  message: string;
  visible: boolean;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ToastState>({ message: '', visible: false });

  const toast = useCallback((message: string) => {
    setState({ message, visible: true });
    window.setTimeout(() => {
      setState((s) => ({ ...s, visible: false }));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        role="status"
        aria-live="polite"
        className={`fixed bottom-5 right-5 z-50 px-4 py-2 rounded-lg border text-sm transition-all duration-300 ${
          state.visible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
        style={{
          background: 'var(--surface)',
          color: 'var(--fg)',
          borderColor: 'var(--border)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {state.message}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
