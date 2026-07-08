import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, CreditCard, Receipt, TrendingUp, History, ClipboardList, Lock, LogOut, User, FilePenLine, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileLayout = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/home');
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'es' ? 'en' : 'es';
        i18n.changeLanguage(newLang);
    };

    // Para la barra inferior solo mostraremos unos cuantos elementos principales,
    // y quizá un menú para el resto, pero para simplicidad mostraremos 4 o 5 principales
    // con un scroll horizontal si son muchos o un menú de hamburguesa. 
    // Usaremos un scroll horizontal en la barra inferior para tener todos a la mano.
    const menuItems = [
        { name: t('menu.home'), path: '/home', icon: <LayoutDashboard size={20} /> },
        { name: t('menu.catalog'), path: '/catalog', icon: <Package size={20} /> },
        { name: t('menu.sales'), path: '/sales', icon: <ShoppingCart size={20} /> },
        { name: t('menu.invoices'), path: '/facturas', icon: <Receipt size={20} /> },
        { name: t('menu.invoiceEditor'), path: '/invoice-editor', icon: <FilePenLine size={20} /> },
        { name: t('menu.clients'), path: '/clients', icon: <User size={20} /> },
        { name: t('menu.credits'), path: '/credits', icon: <CreditCard size={20} /> },
        { name: t('menu.expenses'), path: '/expenses', icon: <Receipt size={20} /> },
        { name: t('menu.finances'), path: '/finances', icon: <TrendingUp size={20} /> },
        { name: t('menu.stock'), path: '/stock', icon: <History size={20} /> },
        { name: t('menu.quotes'), path: '/quotes', icon: <ClipboardList size={20} /> },
        { name: t('menu.security'), path: '/security', icon: <Lock size={20} /> },
    ];

    const currentMenu = menuItems.find(m => m.path === location.pathname);

    return (
        <div className="flex flex-col min-h-screen w-full overflow-hidden bg-background">
            {/* Header */}
            <header className="h-16 glass z-10 px-4 flex items-center justify-between shadow-sm shrink-0">
                <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xs">
                        SF
                    </div>
                    <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        {currentMenu?.name || t('common.appName')}
                    </h1>
                </div>
                
                <div className="flex items-center space-x-3">
                    <button 
                        onClick={toggleLanguage}
                        className="p-2 text-muted-foreground hover:bg-accent rounded-full transition-colors"
                        title={t('common.language')}
                    >
                        <Globe size={20} />
                        <span className="text-xs font-bold ml-1">{i18n.language.toUpperCase()}</span>
                    </button>
                    <button 
                            onClick={handleLogout}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
                            title={t('common.logout')}
                        >
                        <LogOut size={20} />
                    </button>
                    <div className="h-8 w-8 glass rounded-full flex items-center justify-center text-xs font-bold text-blue-400">
                        AD
                    </div>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 overflow-y-auto w-full p-3 sm:p-4 pb-[calc(5rem+env(safe-area-inset-bottom))] relative z-0 max-w-full bg-background">
                <div className="min-h-full w-full max-w-full">
                    {children}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="h-16 glass fixed bottom-0 left-0 right-0 z-20 flex items-center px-2 pb-[env(safe-area-inset-bottom)] overflow-x-auto overflow-y-hidden hide-scrollbar shadow-[0_-4px_20px_rgba(0,0,0,0.1)] border-t border-border">
                <div className="flex w-max mx-auto space-x-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.path}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center min-w-[72px] h-12 rounded-xl transition-all duration-300 ${
                                    isActive 
                                    ? 'text-blue-400 bg-blue-500/10 -translate-y-1' 
                                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                }`}
                            >
                                <div className={`${isActive ? 'scale-110' : 'scale-100'} transition-transform duration-300`}>
                                    {item.icon}
                                </div>
                                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                    {item.name}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </nav>

            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

export default MobileLayout;
