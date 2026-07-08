import { formatMoney } from '../../infrastructure/invoiceTemplates';
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { DollarSign, Package, ShoppingBag, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';
import { Sale } from '../../domain/models';
import { useTranslation } from 'react-i18next';

const StatCard = ({ title, value, subtext, icon, trend }: any) => (
    <div className="glass p-3 sm:p-5 flex flex-col justify-between min-w-0 overflow-hidden">
        <div className="flex justify-between items-start min-w-0">
            <div className="min-w-0 flex-1">
                <p className="text-[9px] sm:text-[11px] text-muted-foreground font-medium uppercase tracking-wider truncate">{title}</p>
                <h3 className="text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 truncate">{value}</h3>
            </div>
            <div className="p-2 sm:p-3 bg-blue-500/10 text-blue-400 rounded-xl shrink-0 ml-2">
                {icon}
            </div>
        </div>
        <div className="mt-2 sm:mt-4 flex items-center space-x-2">
            <span className={`flex items-center text-[10px] sm:text-xs font-medium ${trend >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                {trend >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {Math.abs(trend)}%
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">{subtext}</span>
        </div>
    </div>
);

const TIMEZONES = [
    { label: '🇨🇴 Colombia', value: 'America/Bogota' },
    { label: '🇲🇽 México (Ciudad)', value: 'America/Mexico_City' },
    { label: '🇲🇽 México (Cancún)', value: 'America/Cancun' },
    { label: '🇵🇪 Perú', value: 'America/Lima' },
    { label: '🇪🇨 Ecuador', value: 'America/Guayaquil' },
    { label: '🇻🇪 Venezuela', value: 'America/Caracas' },
    { label: '🇧🇴 Bolivia', value: 'America/La_Paz' },
    { label: '🇨🇱 Chile', value: 'America/Santiago' },
    { label: '🇦🇷 Argentina', value: 'America/Argentina/Buenos_Aires' },
    { label: '🇺🇾 Uruguay', value: 'America/Montevideo' },
    { label: '🇧🇷 Brasil (Brasilia)', value: 'America/Sao_Paulo' },
    { label: '🇵🇦 Panamá', value: 'America/Panama' },
    { label: '🇨🇷 Costa Rica', value: 'America/Costa_Rica' },
    { label: '🇬🇹 Guatemala', value: 'America/Guatemala' },
    { label: '🇸🇻 El Salvador', value: 'America/El_Salvador' },
    { label: '🇭🇳 Honduras', value: 'America/Tegucigalpa' },
    { label: '🇳🇮 Nicaragua', value: 'America/Managua' },
    { label: '🇩🇴 Rep. Dominicana', value: 'America/Santo_Domingo' },
    { label: '🇵🇷 Puerto Rico', value: 'America/Puerto_Rico' },
    { label: '🇺🇸 USA (Nueva York)', value: 'America/New_York' },
    { label: '🇺🇸 USA (Los Ángeles)', value: 'America/Los_Angeles' },
    { label: '🇺🇸 USA (Chicago)', value: 'America/Chicago' },
    { label: '🇺🇸 USA (Miami)', value: 'America/New_York' },
    { label: '🇪🇸 España (Madrid)', value: 'Europe/Madrid' },
    { label: '🌍 UTC', value: 'UTC' },
];

const ColombiaClock = () => {
    const [time, setTime] = useState(new Date());
    const { t, i18n } = useTranslation();
    const [showPicker, setShowPicker] = useState(false);
    const [timezone, setTimezone] = useState<string>(
        () => localStorage.getItem('app_timezone') || 'America/Bogota'
    );

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const handleSelectTimezone = (tz: string) => {
        setTimezone(tz);
        localStorage.setItem('app_timezone', tz);
        setShowPicker(false);
    };

    const formattedTime = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'es-CO', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    }).format(time);

    const formattedDate = new Intl.DateTimeFormat(i18n.language === 'en' ? 'en-US' : 'es-CO', {
        timeZone: timezone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    }).format(time);

    const tzLabel = TIMEZONES.find(tz => tz.value === timezone)?.label || timezone;

    return (
        <div className="relative">
            <button
                onClick={() => setShowPicker(p => !p)}
                className="glass px-3 sm:px-4 py-2 flex items-center border-l-4 border-blue-500 hover:border-purple-500 transition-colors cursor-pointer group"
                title={t('dashboard.changeTimezone')}
            >
                <div className="flex flex-col text-left">
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-tighter flex items-center gap-1">
                        {tzLabel.split(' ').slice(1).join(' ') || t('dashboard.timezoneLabel')}
                        <span className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">✎</span>
                    </span>
                    <span className="text-[11px] sm:text-sm font-mono font-bold text-blue-400">{formattedTime}</span>
                    <span className="text-[9px] text-muted-foreground">{formattedDate}</span>
                </div>
            </button>

            {showPicker && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden min-w-[220px] max-h-72 overflow-y-auto">
                    <div className="p-2 border-b border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider px-2">{t('dashboard.changeTimezone')}</p>
                    </div>
                    {TIMEZONES.map(tz => (
                        <button
                            key={tz.value + tz.label}
                            onClick={() => handleSelectTimezone(tz.value)}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors flex items-center gap-2 ${timezone === tz.value ? 'bg-blue-500/10 text-blue-400 font-semibold' : ''}`}
                        >
                            {tz.label}
                            {timezone === tz.value && <span className="ml-auto text-blue-400 text-xs">✓</span>}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    const { saleUseCases, financeUseCases } = useDependencies();
    const { t } = useTranslation();
    const [latestSales, setLatestSales] = useState<Sale[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [salesFetchStatus, setSalesFetchStatus] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [salesData, statsData] = await Promise.all([
                    saleUseCases.getSales(0, 5),
                    financeUseCases.getDashboardStats()
                ]);
                console.debug('Dashboard - raw salesData:', salesData);
                const salesList = Array.isArray(salesData) ? salesData : (salesData?.content || []);
                setLatestSales(salesList.slice(0, 5));
                setSalesFetchStatus({ ok: true, count: salesList.length });
                setStats(statsData);
            } catch (error) {
                console.error('Dashboard - error fetching sales:', error);
                setSalesFetchStatus({ ok: false, message: (error as any)?.message || String(error) });
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Products sold today: [{name, quantity}]
    const dailySource = stats?.topProductsTodayList ?? stats?.topProductsToday ?? [];
    const dailyChartData: { name: string; quantity: number }[] = (dailySource.length ? dailySource : [{ name: 'Sin datos', quantity: 0 }]).slice(0, 8);
    const dailyTopItems = dailySource.slice(0, 3) || [];
    const hasDailyChartData = Boolean(dailySource.some((item: any) => (item.quantity ?? item.value ?? 0) > 0));

    // Top products this week: [{name, value}] for PieChart
    const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];
    const weeklySource = stats?.topProductsWeekList ?? stats?.topProductsWeek ?? [];
    const weeklyChartData: { name: string; value: number }[] = (weeklySource.length ? weeklySource.map((it: any) => ({ name: it.name, value: it.quantity ?? it.value ?? 0 })) : [{ name: 'Sin datos', value: 0 }]).slice(0, 8);
    const weeklyTopItems = (weeklySource.map((it: any) => ({ name: it.name, value: it.quantity ?? it.value ?? 0 })) || []).slice(0, 3);
    const hasWeeklyChartData = Boolean(weeklySource.some((item: any) => (item.quantity ?? item.value ?? 0) > 0));

    return (
        <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 min-w-0">
                <h2 className="text-xl sm:text-3xl font-bold tracking-tight">{t('dashboard.title')}</h2>
                <div className="flex items-center gap-2 p-3">
                    <ColombiaClock />
                    {salesFetchStatus && (
                        <span className={`text-xs ${salesFetchStatus.ok ? 'text-green-400' : 'text-destructive'}`}>
                            {salesFetchStatus.ok ? `${t('dashboard.salesCount')}: ${salesFetchStatus.count}` : t('dashboard.salesError')}
                        </span>
                    )}
                </div>
            </div>

            {/* Summary Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 min-w-0">
                <StatCard
                    title={t('dashboard.todaySales')}
                    value={`${formatMoney((stats?.todaySales || 0))}`}
                    subtext={t('dashboard.today')}
                    icon={<DollarSign size={18} />}
                    trend={0}
                />
                <StatCard title={t('dashboard.productsSoldToday')} value={stats?.totalProductsSoldToday || 0} subtext={t('dashboard.today')} icon={<Package size={18} />} trend={0} />
                <StatCard title={t('dashboard.monthlyExpenses')} value={`${formatMoney((stats?.totalExpenses || 0))}`} subtext={t('dashboard.accumulated')} icon={<ShoppingBag size={18} />} trend={0} />
                <StatCard title={t('dashboard.profitMargin')} value={`${formatMoney((stats?.utility || 0))}`} subtext={t('dashboard.currentMonth')} icon={<CreditCard size={18} />} trend={0} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Daily Chart */}
                <div className="glass p-3 sm:p-5 min-w-0 overflow-hidden max-w-full">
                    <h4 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-5 truncate">{t('dashboard.soldToday')}</h4>
                    <div className="min-h-[180px] h-full">
                        <div className="block sm:hidden">
                            {loading ? (
                                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">Cargando...</div>
                            ) : !hasDailyChartData ? (
                                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">{t('dashboard.noDataToday')}</div>
                            ) : (
                                <div className="space-y-2">
                                    {dailyTopItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between bg-background/20 rounded-xl px-3 py-2">
                                            <span className="text-xs truncate">{item.name}</span>
                                            <span className="text-xs font-semibold text-green-400">{item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:block h-44 sm:h-64">
                            {hasDailyChartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={dailyChartData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#2e3c51" horizontal={false} />
                                        <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} width={70} />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(v: any) => [v, 'Vendidos']}
                                        />
                                        <Bar dataKey="quantity" name="Vendidos" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">{t('dashboard.noDataToday')}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Weekly Top Products PieChart */}
                <div className="glass p-3 sm:p-5 min-w-0 overflow-hidden max-w-full">
                    <h4 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-5 truncate">{t('dashboard.topWeekly')}</h4>
                    <div className="min-h-[180px] h-full">
                        <div className="block sm:hidden">
                            {loading ? (
                                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">Cargando...</div>
                            ) : !hasWeeklyChartData ? (
                                <div className="h-44 flex items-center justify-center text-sm text-muted-foreground">{t('dashboard.noDataWeek')}</div>
                            ) : (
                                <div className="space-y-2">
                                    {weeklyTopItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between bg-background/20 rounded-xl px-3 py-2">
                                            <span className="text-xs truncate">{item.name}</span>
                                            <span className="text-xs font-semibold text-blue-400">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="hidden sm:block h-44 sm:h-64">
                            {hasWeeklyChartData ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={weeklyChartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={35}
                                            outerRadius={65}
                                            paddingAngle={3}
                                            dataKey="value"
                                            nameKey="name"
                                            label={false}
                                        >
                                            {weeklyChartData.map((_: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: '11px' }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(v: any) => [v, 'Unidades']}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '9px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">{t('dashboard.noDataWeek')}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Latest Sales */}
                <div className="glass p-3 sm:p-5 lg:col-span-2 min-w-0 overflow-hidden max-w-full">
                    <h4 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 truncate">{t('dashboard.latestSales')}</h4>

                    {/* Mobile: cards */}
                    <div className="overflow-x-auto">
                        <table className="min-w-[620px] w-full text-left text-sm">
                            <thead>
                                <tr className="text-muted-foreground text-sm border-b border-border">
                                    <th className="pb-3 font-medium">{t('dashboard.invoiceId')}</th>
                                    <th className="pb-3 font-medium">{t('dashboard.client')}</th>
                                    <th className="pb-3 font-medium">{t('dashboard.total')}</th>
                                    <th className="pb-3 font-medium">{t('dashboard.type')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">{t('dashboard.loading')}</td></tr>
                                ) : latestSales.length === 0 ? (
                                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-xs">{t('dashboard.noSales')}</td></tr>
                                ) : latestSales.map((sale) => (
                                    <tr key={sale.id} className="text-sm hover:bg-accent/30">
                                        <td className="py-3 font-medium font-mono text-xs">{sale.id}</td>
                                        <td className="py-3">{sale.clientName || 'Cliente General'}</td>
                                        <td className="py-3 font-bold text-green-400">{formatMoney((sale.total ?? 0))}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-md text-xs ${sale.type === 'POS' ? 'bg-green-500/10 text-green-400' :
                                                sale.type === 'ELECTRONIC' ? 'bg-blue-500/10 text-blue-400' :
                                                    'bg-amber-500/10 text-amber-400'
                                                }`}>
                                                {sale.type}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
