import React, { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, Smartphone, RefreshCw, AlertTriangle } from 'lucide-react';

interface AuthScreenProps {
    onLogin: () => void;
    initialMode?: 'register' | 'login';
    allowDefaultReviewer?: boolean;
}

const AUTH_KEY = 'sistema_facturacion_auth_v2';
const CURRENT_USER_KEY = 'current_user';
// Remove old broken key from previous installs
const OLD_AUTH_KEY = 'sistema_facturacion_auth_pin';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, initialMode = 'login', allowDefaultReviewer }) => {
    const [mode, setMode] = useState<'loading' | 'register' | 'login' | 'reset'>('loading');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [secretQuestion, setSecretQuestion] = useState('');
    const [secretAnswer, setSecretAnswer] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const persistCurrentUser = (username: string, role: 'ADMIN' | 'CASHIER' = 'ADMIN') => {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username, role }));
    };

    useEffect(() => {
        // Always remove old key from previous app versions
        localStorage.removeItem(OLD_AUTH_KEY);

        const storedAuth = localStorage.getItem(AUTH_KEY);
        if (storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                if (parsed && parsed.username && parsed.password) {
                    setUsername(parsed.username);
                    setSecretQuestion(parsed.secretQuestion || '');
                    setSecretAnswer(parsed.secretAnswer || '');
                    setMode(initialMode === 'register' ? 'register' : 'login');
                    return;
                }
            } catch {
                // ignore and fall through to register/login selection below
            }
        }

        setUsername('');
        setSecretQuestion('');
        setSecretAnswer('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setMode(initialMode === 'register' ? 'register' : 'login');
    }, [initialMode]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim()) {
            setError('Please enter a username / Ingresa un nombre de usuario');
            return;
        }
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters / Mínimo 3 caracteres');
            return;
        }
        if (!password) {
            setError('Please enter a password / Ingresa una contraseña');
            return;
        }
        if (password.length < 4) {
            setError('Password must be at least 4 characters / Mínimo 4 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match / Las contraseñas no coinciden');
            return;
        }
        if (!secretQuestion.trim()) {
            setError('Please enter a secret question / Ingresa una pregunta secreta');
            return;
        }
        if (!secretAnswer.trim()) {
            setError('Please enter the secret answer / Ingresa la respuesta secreta');
            return;
        }

        setLoading(true);
        await new Promise(r => setTimeout(r, 700));
        const credentials = {
            username: username.trim(),
            password,
            secretQuestion: secretQuestion.trim(),
            secretAnswer: secretAnswer.trim().toLowerCase()
        };
        localStorage.setItem(AUTH_KEY, JSON.stringify(credentials));
        persistCurrentUser(credentials.username, 'ADMIN');
        localStorage.setItem('has_seen_welcome', 'true');
        setSuccess(true);
        await new Promise(r => setTimeout(r, 900));
        onLogin();
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !password) {
            setError('Both fields are required / Ambos campos son requeridos');
            return;
        }

        setLoading(true);
        await new Promise(r => setTimeout(r, 600));

        const storedAuth = localStorage.getItem(AUTH_KEY);
        if (storedAuth) {
            try {
                const parsed = JSON.parse(storedAuth);
                if (parsed.username === username.trim() && parsed.password === password) {
                    setSuccess(true);
                    persistCurrentUser(parsed.username, 'ADMIN');
                    localStorage.setItem('has_seen_welcome', 'true');
                    await new Promise(r => setTimeout(r, 800));
                    onLogin();
                    return;
                }
            } catch {
                setError('Error reading credentials. Resetting...');
                localStorage.removeItem(AUTH_KEY);
                setTimeout(() => setMode('register'), 1500);
                setLoading(false);
                return;
            }
        } else {
            setMode('register');
            setLoading(false);
            return;
        }

        // Intentar login como cajero (local_users)
        try {
            const rawUsers = localStorage.getItem('local_users');
            if (rawUsers) {
                const localUsers: any[] = JSON.parse(rawUsers);
                const cashier = localUsers.find(
                    (u: any) => u.username === username.trim() && u.password === password
                );
                if (cashier) {
                    setSuccess(true);
                    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
                        username: cashier.username,
                        name: cashier.name || cashier.username,
                        role: cashier.role || 'CASHIER'
                    }));
                    localStorage.setItem('has_seen_welcome', 'true');
                    await new Promise(r => setTimeout(r, 800));
                    onLogin();
                    return;
                }
            }
        } catch { /* ignorar */ }

        setError('Incorrect username or password / Usuario o contraseña incorrectos');
        setLoading(false);
    };

    const handlePasswordRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!username.trim() || !secretAnswer.trim() || !password || !confirmPassword) {
            setError('Complete username, secret answer and the new password / Completa usuario, respuesta secreta y nueva contraseña');
            return;
        }

        if (password.length < 4) {
            setError('Password must be at least 4 characters / Mínimo 4 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match / Las contraseñas no coinciden');
            return;
        }

        setLoading(true);
        await new Promise(r => setTimeout(r, 600));
        const storedAuth = localStorage.getItem(AUTH_KEY);
        if (!storedAuth) {
            setError('No account found / No existe una cuenta guardada');
            setLoading(false);
            return;
        }

        try {
            const parsed = JSON.parse(storedAuth);
            if (parsed.username === username.trim() && parsed.secretAnswer?.toLowerCase() === secretAnswer.trim().toLowerCase()) {
                const updated = { ...parsed, password };
                localStorage.setItem(AUTH_KEY, JSON.stringify(updated));
                persistCurrentUser(parsed.username, 'ADMIN');
                setSuccess(true);
                setTimeout(() => {
                    setMode('login');
                    setPassword('');
                    setConfirmPassword('');
                    setSecretAnswer('');
                    setSuccess(false);
                    setLoading(false);
                }, 1200);
            } else {
                setError('The secret answer is incorrect / La respuesta secreta es incorrecta');
                setLoading(false);
            }
        } catch {
            setError('Could not read the account / No se pudo leer la cuenta');
            setLoading(false);
        }
    };

    const cardStyle: React.CSSProperties = {
        width: '100%',
        maxWidth: 400,
        background: 'rgba(15,23,42,0.92)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: 24,
        padding: '36px 28px',
        position: 'relative',
        zIndex: 1,
        boxShadow: '0 25px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
        animation: 'fadeIn 0.5s ease forwards'
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        boxSizing: 'border-box' as const,
        background: 'rgba(30,41,59,0.8)',
        border: '1.5px solid rgba(71,85,105,0.6)',
        borderRadius: 12,
        padding: '13px 16px',
        fontSize: 15,
        color: 'white',
        outline: 'none',
        transition: 'all 0.2s ease',
        fontFamily: "'Inter', sans-serif"
    };

    const labelStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 12,
        fontWeight: 600,
        color: 'rgba(148,163,184,1)',
        marginBottom: 8,
        letterSpacing: '0.8px',
        textTransform: 'uppercase' as const
    };

    if (mode === 'loading') {
        return (
            <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 44, height: 44, border: '3px solid rgba(99,102,241,0.3)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 16px',
            fontFamily: "'Inter', 'Segoe UI', sans-serif"
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
                @keyframes shake { 0%,100%{ transform:translateX(0); } 25%,75%{ transform:translateX(-6px); } 50%{ transform:translateX(6px); } }
                .auth-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.2); }
                .auth-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
                .auth-btn:active:not(:disabled) { transform: translateY(0); }
                .auth-link:hover { color: #a5b4fc !important; }
                .error-msg { animation: shake 0.4s ease; }
            `}</style>

            {/* BG glow */}
            <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '-30%', left: '-20%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-30%', right: '-20%', width: '70%', height: '70%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
            </div>

            <div style={cardStyle}>
                {/* Icon / Logo */}
                <div style={{ textAlign: 'center', marginBottom: 28 }}>
                    <div style={{
                        width: 80,
                        height: 80,
                        borderRadius: 22,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 18,
                        boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
                        overflow: 'hidden',
                        background: success ? 'linear-gradient(135deg, #10b981, #059669)' : 'transparent',
                        transition: 'all 0.4s ease'
                    }}>
                        {success ? (
                            <ShieldCheck size={32} color="white" />
                        ) : (
                            <img
                                src="/logo.png"
                                alt="Facturador"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 22 }}
                                onError={(e: any) => {
                                    // Fallback if logo doesn't load
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #6366f1, #8b5cf6)';
                                    e.currentTarget.parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>';
                                }}
                            />
                        )}
                    </div>

                    <h1 style={{ fontSize: 24, fontWeight: 800, color: 'white', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                        {mode === 'register' ? '👋 Create Account' :
                         mode === 'login' ? 'Welcome Back' :
                         '🔑 Recover Account'}
                    </h1>
                    <p style={{ fontSize: 13, color: 'rgba(148,163,184,0.85)', margin: 0, lineHeight: 1.5, maxWidth: 280, marginLeft: 'auto', marginRight: 'auto' }}>
                        {mode === 'register' ? 'Create your account and keep your secret answer in a safe place.' :
                         mode === 'login' ? 'Enter your credentials to access the system.' :
                         'Use your secret answer to recover the password.'}
                    </p>
                </div>

                {/* Reset warning */}
                {mode === 'reset' && (
                    <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '12px 14px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <AlertTriangle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 1 }} />
                        <span style={{ fontSize: 12, color: '#fde68a', lineHeight: 1.5 }}>
                            Only app credentials will be reset. Your business data (products, sales, clients) will NOT be deleted.
                        </span>
                    </div>
                )}

                <form onSubmit={mode === 'login' ? handleLogin : mode === 'reset' ? handlePasswordRecovery : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {/* Username */}
                    <div>
                        <label style={labelStyle}>
                            <User size={13} /> Username / Usuario
                        </label>
                        <input
                            className="auth-input"
                            type="text"
                            value={username}
                            onChange={e => { setUsername(e.target.value); setError(''); }}
                            placeholder={mode === 'register' ? 'e.g. admin' : 'Your username'}
                            autoComplete="username"
                            autoCapitalize="none"
                            style={inputStyle}
                        />
                    </div>

                    {/* Password */}
                    {(mode === 'login' || mode === 'register' || mode === 'reset') && (
                        <div>
                            <label style={labelStyle}>
                                <Lock size={13} /> {mode === 'reset' ? 'New Password / Nueva contraseña' : 'Password / Contraseña'}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    className="auth-input"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    placeholder="••••••••"
                                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                                    style={{ ...inputStyle, paddingRight: 46 }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)}
                                    style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.7)', padding: 4, display: 'flex' }}>
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Confirm Password (register/reset only) */}
                    {(mode === 'register' || mode === 'reset') && (
                        <div>
                            <label style={labelStyle}>
                                <ShieldCheck size={13} /> {mode === 'reset' ? 'Confirm New Password / Confirmar nueva contraseña' : 'Confirm Password / Confirmar'}
                            </label>
                            <input
                                className="auth-input"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                                placeholder={mode === 'reset' ? 'Repeat new password' : 'Repeat password'}
                                autoComplete="new-password"
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Secret question and answer (register only) */}
                    {mode === 'register' && (
                        <>
                            <div>
                                <label style={labelStyle}>
                                    <ShieldCheck size={13} /> Secret Question / Pregunta secreta
                                </label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    value={secretQuestion}
                                    onChange={e => { setSecretQuestion(e.target.value); setError(''); }}
                                    placeholder="Example: Name of your first pet"
                                    style={inputStyle}
                                />
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    <ShieldCheck size={13} /> Secret Answer / Respuesta secreta
                                </label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    value={secretAnswer}
                                    onChange={e => { setSecretAnswer(e.target.value); setError(''); }}
                                    placeholder="Write it down somewhere safe"
                                    style={inputStyle}
                                />
                            </div>
                            <div style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#fde68a', lineHeight: 1.45 }}>
                                Write the secret answer somewhere safe. It will be used to recover your password later.
                            </div>
                        </>
                    )}

                    {mode === 'reset' && (
                        <div>
                            <label style={labelStyle}>
                                <ShieldCheck size={13} /> Secret Answer / Respuesta secreta
                            </label>
                            <input
                                className="auth-input"
                                type="text"
                                value={secretAnswer}
                                onChange={e => { setSecretAnswer(e.target.value); setError(''); }}
                                placeholder="Your secret answer"
                                style={inputStyle}
                            />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="error-msg" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#fca5a5', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Success */}
                    {success && (
                        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', borderRadius: 10, padding: '11px 14px', fontSize: 13, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span>✅</span> {mode === 'login' ? 'Access granted! Loading...' : 'Account created! Entering...'}
                        </div>
                    )}

                    {/* Submit */}
                    <button className="auth-btn" type="submit" disabled={loading || success}
                        style={{
                            width: '100%',
                            background: success ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            border: 'none', borderRadius: 14, padding: '15px',
                            fontSize: 15, fontWeight: 700, color: 'white',
                            cursor: loading || success ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            marginTop: 4, opacity: loading || success ? 0.85 : 1,
                            boxShadow: '0 4px 15px rgba(99,102,241,0.3)',
                            transition: 'all 0.2s ease'
                        }}>
                        {loading ? (
                            <><div style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Please wait...</>
                        ) : success ? (
                            <><ShieldCheck size={18} /> Entering...</>
                        ) : mode === 'login' ? (
                            <><Lock size={18} /> Login / Ingresar</>
                        ) : mode === 'reset' ? (
                            <><ShieldCheck size={18} /> Recover Password</>
                        ) : (
                            <><ShieldCheck size={18} /> Create Account / Crear Cuenta</>
                        )}
                    </button>
                </form>

                {/* Footer links */}
                <div style={{ textAlign: 'center', marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
                    {mode === 'login' && (
                        <button className="auth-link" type="button" onClick={() => { setMode('reset'); setPassword(''); setConfirmPassword(''); setSecretAnswer(''); setError(''); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.65)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.2s' }}>
                            <RefreshCw size={13} /> Forgot password / Olvidé mi contraseña
                        </button>
                    )}
                    {mode === 'reset' && (
                        <button className="auth-link" type="button" onClick={() => { setMode('login'); setUsername(''); setPassword(''); setConfirmPassword(''); setSecretAnswer(''); setError(''); }}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,0.65)', fontSize: 13, transition: 'color 0.2s' }}>
                            ← Back to login
                        </button>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Smartphone size={13} color="rgba(100,116,139,0.6)" />
                        <span style={{ fontSize: 12, color: 'rgba(100,116,139,0.6)' }}>Local storage · No internet required</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
