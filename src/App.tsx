import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import MobileLayout from './presentation/MobileLayout';
import Dashboard from './presentation/pages/Dashboard';
import Catalog from './presentation/pages/Catalog';
import Sales from './presentation/pages/Sales';
import Facturas from './presentation/pages/Facturas';
import Credits from './presentation/pages/Credits';
import Expenses from './presentation/pages/Expenses';
import Finances from './presentation/pages/Finances';
import StockMovements from './presentation/pages/StockMovements';
import Security from './presentation/pages/Security';
import Quotes from './presentation/pages/Quotes';
import Clients from './presentation/pages/Clients';
import InvoiceEditor from './presentation/pages/InvoiceEditor';
import { AlertProvider } from './presentation/context/AlertContext';
import { AuthScreen } from './presentation/pages/AuthScreen';
import WelcomeChoice from './presentation/pages/WelcomeChoice';
import { useAds } from './application/hooks/useAds';

// Keys in localStorage
const SESSION_KEY = 'facturador_session_active';
const AUTH_KEY = 'sistema_facturacion_auth_v2';
const CURRENT_USER_KEY = 'current_user';
const FIRST_RUN_KEY = 'app_first_run_completed';

type AppScreen = 'welcome' | 'auth' | 'app';
type AuthMode = 'register' | 'login';

const getActiveSession = () => sessionStorage.getItem(SESSION_KEY) === 'true';
const setActiveSession = (value: boolean) => {
    if (value) {
        sessionStorage.setItem(SESSION_KEY, 'true');
    } else {
        sessionStorage.removeItem(SESSION_KEY);
    }
};

/** Determine the starting screen based on first-run state and the current session */
function getInitialScreen(): AppScreen {
    const isFirstRun = localStorage.getItem(FIRST_RUN_KEY) !== 'true';
    if (isFirstRun) {
        localStorage.setItem(FIRST_RUN_KEY, 'true');
        return 'welcome';
    }

    if (getActiveSession()) return 'app';
    return 'auth';
}

function App() {
    useAds();
    const [screen, setScreen] = useState<AppScreen>(getInitialScreen);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    // Used to open backup panel automatically after register (restore flow)
    const [openBackupAfterAuth, setOpenBackupAfterAuth] = useState(false);

    useEffect(() => {
        if (screen === 'app' && openBackupAfterAuth) {
            window.location.hash = '#/security';
            setOpenBackupAfterAuth(false);
        }
    }, [screen, openBackupAfterAuth]);

    /** Called when user picks "New User" on welcome screen */
    const handleWelcomeNewUser = () => {
        localStorage.setItem(FIRST_RUN_KEY, 'true');
        setActiveSession(false);
        setOpenBackupAfterAuth(false);
        setAuthMode('register');
        setScreen('auth');
    };

    /** Called when user picks "Restore Backup" on welcome screen */
    const handleWelcomeRestore = () => {
        localStorage.setItem(FIRST_RUN_KEY, 'true');
        setActiveSession(false);
        setOpenBackupAfterAuth(true);
        setAuthMode('register');
        setScreen('auth');
    };

    /** Called by AuthScreen when login/register succeeds */
    const handleLogin = () => {
        setActiveSession(true);
        setAuthMode('login');
        setScreen('app');
    };

    /** Called when user logs out */
    const handleLogout = () => {
        setActiveSession(false);
        localStorage.removeItem(CURRENT_USER_KEY);
        sessionStorage.clear();
        setAuthMode('login');
        setScreen('auth');
    };

    // ── Welcome choice screen (brand new install) ───────────────────────────
    if (screen === 'welcome') {
        return (
            <AlertProvider>
                <WelcomeChoice
                    onNewUser={handleWelcomeNewUser}
                    onRestore={handleWelcomeRestore}
                />
            </AlertProvider>
        );
    }

    // ── Auth screen (register or login) ─────────────────────────────────────
    if (screen === 'auth') {
        return (
            <AlertProvider>
                <AuthScreen onLogin={handleLogin} initialMode={authMode} allowDefaultReviewer={false} />
            </AlertProvider>
        );
    }

    // ── Main app ─────────────────────────────────────────────────────────────
    return (
        <AlertProvider>
            <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/*" element={
                        <MobileLayout onLogout={handleLogout}>
                            <Routes>
                                <Route path="/home" element={<Dashboard />} />
                                <Route path="/catalog" element={<Catalog />} />
                                <Route path="/sales" element={<Sales />} />
                                <Route path="/facturas" element={<Facturas />} />
                                <Route path="/invoice-editor" element={<InvoiceEditor />} />
                                <Route path="/clients" element={<Clients />} />
                                <Route path="/credits" element={<Credits />} />
                                <Route path="/expenses" element={<Expenses />} />
                                <Route path="/finances" element={<Finances />} />
                                <Route path="/stock" element={<StockMovements />} />
                                <Route path="/security" element={
                                    <Security openBackupOnMount={openBackupAfterAuth} />
                                } />
                                <Route path="/quotes" element={<Quotes />} />
                                <Route path="*" element={<Navigate to="/home" replace />} />
                            </Routes>
                        </MobileLayout>
                    } />
                </Routes>
            </HashRouter>
        </AlertProvider>
    );
}

export default App;
