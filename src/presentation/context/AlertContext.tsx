import React, { createContext, useContext, useState, ReactNode } from 'react';
import ConfirmModal from '../components/ConfirmModal';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'warning';
}

interface ToastItem {
    id: number;
    message: string;
    type: 'success' | 'error' | 'loading';
}

interface AlertContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'loading') => void;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
    const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const showToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        window.setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, 2400);
    };

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        setConfirmOptions(options);
        return new Promise((resolve) => {
            setConfirmResolver(() => resolve);
        });
    };

    const handleConfirm = (result: boolean) => {
        if (confirmResolver) confirmResolver(result);
        setConfirmOptions(null);
        setConfirmResolver(null);
    };

    return (
        <AlertContext.Provider value={{ showToast, confirm }}>
            {children}
            <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
                {toasts.map((toast) => {
                    const baseStyle: React.CSSProperties = {
                        minWidth: 220,
                        maxWidth: 320,
                        padding: '12px 14px',
                        borderRadius: 12,
                        color: '#fff',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        backdropFilter: 'blur(8px)',
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: 1.4,
                        pointerEvents: 'auto',
                    };

                    const colors = toast.type === 'error'
                        ? { background: 'linear-gradient(135deg, #ef4444, #dc2626)' }
                        : toast.type === 'loading'
                            ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
                            : { background: 'linear-gradient(135deg, #10b981, #059669)' };

                    return (
                        <div key={toast.id} style={{ ...baseStyle, ...colors }}>
                            {toast.message}
                        </div>
                    );
                })}
            </div>
            {confirmOptions && (
                <ConfirmModal
                    isOpen={!!confirmOptions}
                    onClose={() => handleConfirm(false)}
                    onConfirm={() => handleConfirm(true)}
                    {...confirmOptions}
                />
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) throw new Error('useAlert must be used within an AlertProvider');
    return context;
};
