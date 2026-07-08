import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { UserPlus, RotateCcw, Globe } from 'lucide-react';

const Welcome = () => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();

    useEffect(() => {
        const hasSeen = localStorage.getItem('has_seen_welcome');
        if (hasSeen === 'true') {
            navigate('/home', { replace: true });
        }
    }, [navigate]);

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    const handleNewUser = () => {
        localStorage.setItem('has_seen_welcome', 'true');
        navigate('/home', { replace: true });
    };

    const handleRestore = () => {
        localStorage.setItem('has_seen_welcome', 'true');
        navigate('/security', { state: { openBackup: true }, replace: true });
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Language toggle top-right */}
            <button
                onClick={toggleLanguage}
                className="absolute top-6 right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass text-muted-foreground hover:text-foreground transition-colors text-xs font-bold"
            >
                <Globe size={14} />
                {i18n.language.toUpperCase()}
            </button>

            {/* Logo & Title */}
            <div className="flex flex-col items-center mb-10 text-center">
                <div className="h-20 w-20 bg-gradient-to-tr from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center text-white font-black text-3xl shadow-2xl shadow-blue-500/30 mb-5">
                    SF
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
                    {t('welcome.title')}
                </h1>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                    {t('welcome.subtitle')}
                </p>
            </div>

            {/* Buttons */}
            <div className="w-full max-w-sm space-y-4">
                {/* New User */}
                <button
                    onClick={handleNewUser}
                    className="w-full group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                            <UserPlus size={24} className="text-white" />
                        </div>
                        <div>
                            <p className="text-white font-black text-lg leading-tight">{t('welcome.newUser')}</p>
                            <p className="text-blue-200 text-xs mt-0.5 leading-snug">{t('welcome.newUserDesc')}</p>
                        </div>
                    </div>
                </button>

                {/* Restore Backup */}
                <button
                    onClick={handleRestore}
                    className="w-full group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 glass border border-border hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
                    <div className="relative flex items-center gap-4">
                        <div className="h-12 w-12 bg-purple-500/15 border border-purple-500/25 rounded-xl flex items-center justify-center shrink-0">
                            <RotateCcw size={24} className="text-purple-400" />
                        </div>
                        <div>
                            <p className="font-black text-lg leading-tight text-foreground">{t('welcome.restore')}</p>
                            <p className="text-muted-foreground text-xs mt-0.5 leading-snug">{t('welcome.restoreDesc')}</p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Bottom version note */}
            <p className="absolute bottom-6 text-[10px] text-muted-foreground/50">v1.0 · Local Mode</p>
        </div>
    );
};

export default Welcome;
