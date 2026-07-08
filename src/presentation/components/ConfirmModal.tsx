import React from 'react';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'info' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'info'
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger': return <AlertCircle className="text-destructive" size={24} />;
            case 'warning': return <AlertTriangle className="text-yellow-500" size={24} />;
            default: return <Info className="text-blue-500" size={24} />;
        }
    };

    const getButtonClass = () => {
        switch (type) {
            case 'danger': return 'bg-destructive hover:bg-destructive/90';
            case 'warning': return 'bg-yellow-600 hover:bg-yellow-700';
            default: return 'bg-blue-600 hover:bg-blue-700';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="glass w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
                style={{
                    // Special handling for 420x240 and very small screens
                    maxHeight: 'calc(100vh - 2rem)',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                    <div className="flex items-center space-x-2">
                        {getIcon()}
                        <h3 className="text-lg font-bold text-white truncate max-w-[200px] sm:max-w-none">
                            {title}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <X size={20} className="text-white/60" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <p className="text-white/80 text-sm sm:text-base leading-relaxed">
                        {message}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-2 p-4 bg-white/5 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium border border-white/10 hover:bg-white/10 text-white transition-colors order-2 sm:order-1"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:scale-[1.02] active:scale-[0.98] ${getButtonClass()} order-1 sm:order-2`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>

            <style>{`
                @media (max-width: 420px) {
                    .glass {
                        border-radius: 0;
                        border: none;
                    }
                }
                @media (max-height: 400px) {
                    .p-6 { padding: 1rem; }
                    .p-4 { padding: 0.5rem; }
                }
            `}</style>
        </div>
    );
};

export default ConfirmModal;
