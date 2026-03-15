import { useState, useCallback, createContext, useContext } from 'react';

interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'trade';
  icon?: string;
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastItem['type'], icon?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({ addToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((message: string, type: ToastItem['type'] = 'info', icon?: string) => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const typeColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    success: { bg: 'rgba(57,255,20,0.08)', border: 'rgba(57,255,20,0.25)', text: '#39ff14', glow: 'rgba(57,255,20,0.2)' },
    error:   { bg: 'rgba(255,45,91,0.08)', border: 'rgba(255,45,91,0.25)', text: '#ff2d5b', glow: 'rgba(255,45,91,0.2)' },
    info:    { bg: 'rgba(0,240,255,0.08)', border: 'rgba(0,240,255,0.25)', text: '#00f0ff', glow: 'rgba(0,240,255,0.2)' },
    trade:   { bg: 'rgba(255,215,0,0.08)', border: 'rgba(255,215,0,0.25)', text: '#ffd700', glow: 'rgba(255,215,0,0.2)' },
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm">
        {toasts.map(toast => {
          const colors = typeColors[toast.type];
          return (
            <div
              key={toast.id}
              className="slide-down rounded-xl border px-4 py-3 font-mono text-sm flex items-start gap-3 backdrop-blur-lg"
              style={{
                backgroundColor: colors.bg,
                borderColor: colors.border,
                color: colors.text,
                boxShadow: `0 0 20px ${colors.glow}, 0 8px 32px rgba(0,0,0,0.3)`,
                textShadow: `0 0 8px ${colors.glow}`,
              }}
            >
              {toast.icon && <span className="text-lg flex-shrink-0">{toast.icon}</span>}
              <span className="flex-1 text-xs tracking-wide">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-current opacity-50 hover:opacity-100 ml-2 flex-shrink-0 transition-opacity"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
