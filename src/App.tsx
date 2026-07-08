import React, { useState } from 'react';
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
const WELCOME_KEY = 'has_seen_welcome';

type AppScreen = 'welcome' | 'auth' | 'app';

/** Determine the starting screen based on persisted state */
function getInitialScreen(): AppScreen {
    // Active session → go straight into app
    if (localStorage.getItem(SESSION_KEY) === 'true') return 'app';
    // Has credentials but no session → ask for login
    if (localStorage.getItem(AUTH_KEY)) return 'auth';
    // Brand new install → show welcome choice
    return 'welcome';
}

function App() {
    useAds();
    const [screen, setScreen] = useState<AppScreen>(getInitialScreen);
    // Used to open backup panel automatically after register (restore flow)
    const [openBackupAfterAuth, setOpenBackupAfterAuth] = useState(false);

    /** Called when user picks "New User" on welcome screen */
    const handleWelcomeNewUser = () => {
        localStorage.setItem(WELCOME_KEY, 'true');
        setScreen('auth');
    };

    /** Called when user picks "Restore Backup" on welcome screen */
    const handleWelcomeRestore = () => {
        localStorage.setItem(WELCOME_KEY, 'true');
        setOpenBackupAfterAuth(true);
        setScreen('auth');
    };

    /** Called by AuthScreen when login/register succeeds */
    const handleLogin = () => {
        localStorage.setItem(SESSION_KEY, 'true');
        setScreen('app');
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
                <AuthScreen onLogin={handleLogin} />
            </AlertProvider>
        );
    }

    // ── Main app ─────────────────────────────────────────────────────────────
    return (
        <AlertProvider>
            <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                    <Route path="/*" element={
                        <MobileLayout>
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
