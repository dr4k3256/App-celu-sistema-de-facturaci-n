import React, { createContext, useContext, useState, ReactNode } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'warning';
}

interface AlertContextType {
    showToast: (message: string, type?: 'success' | 'error' | 'loading') => void;
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [confirmOptions, setConfirmOptions] = useState<ConfirmOptions | null>(null);
    const [confirmResolver, setConfirmResolver] = useState<((value: boolean) => void) | null>(null);

    const showToast = (message: string, type: 'success' | 'error' | 'loading' = 'success') => {
        switch (type) {
            case 'success': toast.success(message); break;
            case 'error': toast.error(message); break;
            case 'loading': toast.loading(message); break;
            default: toast(message);
        }
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
            <Toaster
                position="top-right"
                toastOptions={{
                    className: 'glass text-white border border-white/10',
                    style: {
                        background: 'rgba(30, 41, 59, 0.9)',
                        color: '#ffffff',
                        backdropFilter: 'blur(8px)',
                    },
                }}
            />
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
