import React from 'react';
import { useTranslation } from 'react-i18next';
import { UserPlus, RotateCcw, Globe } from 'lucide-react';

interface WelcomeChoiceProps {
    onNewUser: () => void;
    onRestore: () => void;
}

const WelcomeChoice: React.FC<WelcomeChoiceProps> = ({ onNewUser, onRestore }) => {
    const { t, i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 20px',
            position: 'relative',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
            overflow: 'hidden'
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
                @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                .wc-card { animation: fadeUp 0.5s ease forwards; }
                .wc-btn { transition: all 0.2s ease; cursor: pointer; border: none; }
                .wc-btn:hover { filter: brightness(1.1); transform: translateY(-2px) scale(1.01); }
                .wc-btn:active { transform: scale(0.98); }
            `}</style>

            {/* BG glow */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-30%', right: '-20%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            {/* Language toggle */}
            <button
                className="wc-btn"
                onClick={toggleLanguage}
                style={{
                    position: 'absolute', top: 20, right: 20,
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 12px', borderRadius: 20,
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'rgba(148,163,184,0.9)', fontSize: 12, fontWeight: 700,
                    backdropFilter: 'blur(10px)'
                }}
            >
                <Globe size={13} /> {i18n.language.toUpperCase()}
            </button>

            <div className="wc-card" style={{ width: '100%', maxWidth: 380, zIndex: 1 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        width: 100, height: 100, borderRadius: 28,
                        overflow: 'hidden', margin: '0 auto 20px',
                        boxShadow: '0 12px 40px rgba(99,102,241,0.4)',
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                    }}>
                        <img
                            src="/logo.png"
                            alt="Facturador"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e: any) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:white">F</div>';
                            }}
                        />
                    </div>
                    <h1 style={{
                        fontSize: 32, fontWeight: 900, color: 'white',
                        margin: '0 0 8px', letterSpacing: '-1px'
                    }}>
                        {t('welcome.title')}
                    </h1>
                    <p style={{ fontSize: 14, color: 'rgba(148,163,184,0.8)', margin: 0, lineHeight: 1.6 }}>
                        {t('welcome.subtitle')}
                    </p>
                </div>

                {/* Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* New User */}
                    <button
                        className="wc-btn"
                        onClick={onNewUser}
                        style={{
                            width: '100%', padding: '18px 20px', borderRadius: 18, textAlign: 'left',
                            background: 'linear-gradient(135deg, #4f46e5, #6366f1)',
                            boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                            display: 'flex', alignItems: 'center', gap: 16
                        }}
                    >
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <UserPlus size={22} color="white" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'white' }}>{t('welcome.newUser')}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(199,210,254,0.85)' }}>{t('welcome.newUserDesc')}</p>
                        </div>
                    </button>

                    {/* Restore */}
                    <button
                        className="wc-btn"
                        onClick={onRestore}
                        style={{
                            width: '100%', padding: '18px 20px', borderRadius: 18, textAlign: 'left',
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.12)',
                            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                            display: 'flex', alignItems: 'center', gap: 16,
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <RotateCcw size={22} color="#a78bfa" />
                        </div>
                        <div>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 16, color: 'white' }}>{t('welcome.restore')}</p>
                            <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(148,163,184,0.8)' }}>{t('welcome.restoreDesc')}</p>
                        </div>
                    </button>
                </div>

                <p style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: 'rgba(100,116,139,0.6)' }}>
                    v1.0 · Facturador
                </p>
            </div>
        </div>
    );
};

export default WelcomeChoice;
