import { formatMoney } from '../../infrastructure/invoiceTemplates';
import React from 'react';
import { useTranslation } from 'react-i18next';
import  { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Target, Award } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';

const Finances = () => {
    const { t } = useTranslation();
    const { financeUseCases } = useDependencies();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = async () => {
        setLoading(true);
        try {
            const now = new Date();
            const data = await financeUseCases.getReport(now.getMonth() + 1, now.getFullYear());
            setReport(data);
        } catch (error) {
            console.error('Error fetching finance report:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const chartData = report?.monthlyDetails || [
        { name: 'Ene', sales: 0, expenses: 0, profit: 0 },
        { name: 'Feb', sales: 0, expenses: 0, profit: 0 },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold">Estado Financiero</h3>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium border border-blue-500/30">
                        {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 glass p-6">
                    <h4 className="text-lg font-semibold mb-6">Balance Mensual: Ventas vs Gastos</h4>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2e3c51" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="sales" name="Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Line type="monotone" dataKey="profit" name="Utilidad" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="glass p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <div className={`p-3 rounded-full ${report?.utility >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {report?.utility >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Utilidad Neta (Mes)</p>
                        <p className={`text-2xl font-bold mt-1 ${report?.utility >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {loading ? '...' : `${formatMoney(report?.utility || 0)}`}
                        </p>
                        {!loading && report && (
                            <p className={`text-[10px] mt-2 font-medium px-2 py-1 rounded ${report.utility >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                {report.utility >= 0 ? '¡Buen trabajo! Las ventas superan los gastos.' : 'Alerta: Los gastos son mayores que las ventas.'}
                            </p>
                        )}
                    </div>

                    <div className="glass p-6 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-full">
                                <Target size={24} />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground uppercase font-bold">Total Ventas (Mes)</p>
                        <p className="text-2xl font-bold mt-1 text-blue-400">
                            {loading ? '...' : `${formatMoney(report?.totalSales || 0)}`}
                        </p>
                    </div>

                    <div className="glass p-6 text-center border-t-4 border-destructive/30">
                        <p className="text-xs text-muted-foreground uppercase font-bold">Total Gastos (Mes)</p>
                        <p className="text-xl font-bold mt-1 text-destructive">
                            {loading ? '...' : `${formatMoney(report?.totalExpenses || 0)}`}
                        </p>
                    </div>
                </div>
            </div>

            <div className="glass p-6">
                <h4 className="text-lg font-semibold mb-4">Detalle de Utilidad Mensual</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {loading ? (
                        <div className="col-span-6 py-10 text-center text-muted-foreground">Cargando detalles...</div>
                    ) : chartData.map((m: any) => (
                        <div key={m.name} className="p-4 bg-accent/20 rounded-lg text-center">
                            <p className="text-xs font-bold text-muted-foreground mb-1">{m.name}</p>
                            <p className={`text-sm font-semibold ${m.profit >= 0 ? 'text-green-400' : 'text-destructive'}`}>
                                {formatMoney((m.profit || 0))}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Finances;
