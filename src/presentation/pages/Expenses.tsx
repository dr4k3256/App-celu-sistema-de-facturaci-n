import { formatMoney } from '../../infrastructure/invoiceTemplates';
import React from 'react';
import { useTranslation } from 'react-i18next';
import  { useState, useEffect } from 'react';
import { Receipt, Plus, Trash2, X, TrendingDown } from 'lucide-react';
import DateField from '../components/DateField';
import { useDependencies } from '../../application/DependenciesContext';
import { useAlert } from '../context/AlertContext';

const CATEGORIES = ['Arriendo', 'Servicios', 'Nómina', 'Proveedor', 'Publicidad', 'Transporte', 'Mantenimiento', 'Varios'];

const ExpenseModal = ({ isOpen, onClose, onSave, loading }: any) => {
    const { t } = useTranslation();
    const { showToast } = useAlert();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Varios');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (!description || !amount) return showToast('Complete todos los campos', 'error');
        onSave({ description, amount: parseFloat(amount), category, date });
        setDescription(''); setAmount(''); setCategory('Varios');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-md p-8 border-t-4 border-red-500">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold flex items-center gap-2"><TrendingDown className="text-destructive" /> Registrar Gasto</h3>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full"><X size={20} /></button>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('expenses.description') || 'Description'}</label>
                        <input type="text" className="bg-transparent border-b border-border py-2 text-sm outline-none focus:border-red-500" placeholder="Ej: Pago de arriendo" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase">Monto ($)</label>
                        <input type="number" className="bg-transparent border-b border-border py-2 text-lg font-bold outline-none focus:border-red-500" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('catalog.category')}</label>
                            <select className="bg-transparent border-b border-border py-2 text-sm outline-none" value={category} onChange={e => setCategory(e.target.value)}>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('common.date') || 'Date'}</label>
                            <DateField value={date} onChange={setDate} type="date" />
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-3 glass rounded-xl font-bold">Cancelar</button>
                    <button onClick={handleSave} disabled={loading} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold disabled:opacity-50">
                        {loading ? 'GUARDANDO...' : 'REGISTRAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Expenses = () => {
    const { t } = useTranslation();
    const { expenseUseCases } = useDependencies();
    const { showToast, confirm } = useAlert();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filterDate, setFilterDate] = useState('');

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const data = await expenseUseCases.getExpenses();
            setExpenses(data || []);
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExpenses(); }, []);

    const handleSave = async (expenseData: any) => {
        setActionLoading(true);
        try {
            await expenseUseCases.registerExpense(expenseData);
            showToast('Gasto registrado con éxito', 'success');
            setIsModalOpen(false);
            fetchExpenses();
        } catch (error) {
            showToast('Error al registrar gasto', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await confirm({
            title: 'Eliminar Gasto',
            message: '¿Eliminar este gasto?',
            type: 'danger',
            confirmText: t('common.delete')
        });
        if (!confirmed) return;
        try {
            await expenseUseCases.removeExpense(id);
            showToast('Gasto eliminado', 'success');
            fetchExpenses();
        } catch (error) {
            showToast('Error al eliminar gasto', 'error');
        }
    };

    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7);
    const filteredExpenses = filterDate
        ? expenses.filter(e => e.date?.startsWith(filterDate))
        : expenses;

    const totalMonth = expenses
        .filter(e => e.date?.startsWith(thisMonth))
        .reduce((acc, e) => acc + (e.amount || 0), 0);

    const totalFixed = expenses
        .filter(e => ['Arriendo', 'Servicios', 'Nómina'].includes(e.category) && e.date?.startsWith(thisMonth))
        .reduce((acc, e) => acc + (e.amount || 0), 0);

    const totalVariable = totalMonth - totalFixed;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2"><Receipt className="text-destructive" /> Registro de Gastos</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl font-black text-xs tracking-widest shadow-lg shadow-red-500/20"
                >
                    <Plus size={16} /><span>{t('expenses.addExpense') || 'REGISTER EXPENSE'}</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass p-6 border-l-4 border-red-500">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Total Mes Actual</p>
                    <p className="text-2xl font-bold mt-2 text-destructive">{formatMoney(totalMonth)}</p>
                </div>
                <div className="glass p-6 border-l-4 border-orange-500">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Gastos Fijos</p>
                    <p className="text-2xl font-bold mt-2">{formatMoney(totalFixed)}</p>
                </div>
                <div className="glass p-6 border-l-4 border-yellow-500">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Gastos Variables</p>
                    <p className="text-2xl font-bold mt-2">{formatMoney(totalVariable)}</p>
                </div>
            </div>

            {/* History */}
            <div className="glass overflow-hidden w-full">
                <div className="p-4 border-b border-border flex justify-between items-center bg-accent/10">
                    <h4 className="font-semibold text-sm">Historial de Gastos</h4>
                    <div className="flex items-center gap-2">
                        <DateField value={filterDate} onChange={setFilterDate} type="month" />
                        {filterDate && <button onClick={() => setFilterDate('')} className="text-xs text-blue-400 hover:underline">Clear</button>}
                    </div>
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[600px]">
                        <thead>
                            <tr className="text-muted-foreground text-[10px] uppercase font-bold border-b border-border bg-accent/5">
                                <th className="p-4">{t('expenses.description') || 'Description'}</th>
                                <th className="p-4">{t('catalog.category')}</th>
                                <th className="p-4">{t('common.date') || 'Date'}</th>
                                <th className="p-4">{t('expenses.amount')}</th>
                                <th className="p-4 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Cargando gastos...</td></tr>
                            ) : filteredExpenses.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No hay gastos registrados</td></tr>
                            ) : filteredExpenses.map((e: any) => (
                                <tr key={e.id} className="text-sm hover:bg-accent/20 transition-colors group">
                                    <td className="p-4 font-medium">{e.description}</td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-accent rounded text-[10px] font-bold">{e.category || 'VARIOS'}</span>
                                    </td>
                                    <td className="p-4 text-muted-foreground text-xs">{e.date || 'S/F'}</td>
                                    <td className="p-4 font-bold text-destructive">{formatMoney(e.amount || 0)}</td>
                                    <td className="p-4 text-right">
                                        <button onClick={() => handleDelete(e.id)} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ExpenseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} loading={actionLoading} />
        </div>
    );
};

export default Expenses;
