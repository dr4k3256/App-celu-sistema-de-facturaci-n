import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { History, ArrowUpRight, ArrowDownRight, RefreshCw, Filter, Search, Trash2 } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';
import { useAlert } from '../context/AlertContext';
import ConfirmModal from '../components/ConfirmModal';

const MOVEMENT_TYPES: Record<string, { label: string; color: string }> = {
    CREATION: { label: 'Creación', color: 'bg-green-500/10 text-green-400' },
    DELETION: { label: 'Eliminación', color: 'bg-destructive/10 text-destructive' },
    SALE: { label: 'Venta', color: 'bg-blue-500/10 text-blue-400' },
    RETURN: { label: 'Devolución', color: 'bg-orange-500/10 text-orange-400' },
    ADJUSTMENT: { label: 'Ajuste', color: 'bg-accent text-muted-foreground' },
};

const StockMovements = () => {
    const { t } = useTranslation();
    const { stockUseCases } = useDependencies();
    const { showToast } = useAlert();
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showClearModal, setShowClearModal] = useState(false);

    const fetchMovements = async () => {
        setLoading(true);
        try {
            const data = await stockUseCases.getMovements();
            setMovements(data || []);
        } catch (error) {
            console.error('Error fetching movements:', error);
            showToast('Error al cargar movimientos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        try {
            await stockUseCases.deleteMovements();
            showToast('Historial limpiado correctamente', 'success');
            fetchMovements();
        } catch (error) {
            console.error('Error clearing history:', error);
            showToast('Error al limpiar el historial', 'error');
        } finally {
            setShowClearModal(false);
        }
    };

    useEffect(() => { fetchMovements(); }, []);

    const filtered = movements
        .filter(m => !search ||
            m.productName?.toLowerCase().includes(search.toLowerCase()) ||
            m.productId?.toLowerCase().includes(search.toLowerCase()))
        .filter(m => !typeFilter || m.type === typeFilter);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'S/F';
        try {
            const date = new Date(dateString);
            return date.toLocaleString('es-CO', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                    <History className="text-blue-500" /> Kardex de Inventario
                </h3>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowClearModal(true)}
                        className="glass px-4 py-2 hover:bg-destructive/10 text-destructive rounded-lg flex items-center gap-2 text-sm transition-all"
                        title="Limpiar Todo el Historial"
                    >
                        <Trash2 size={18} />
                        <span className="hidden md:inline">Limpiar Historial</span>
                    </button>
                    <button
                        onClick={fetchMovements}
                        className="glass p-2 hover:bg-accent rounded-lg"
                        title="Refrescar"
                    >
                        <RefreshCw size={20} className={`text-blue-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <input
                        type="text"
                        placeholder="Filtrar por producto o REF..."
                        className="w-full glass pl-10 pr-4 py-2 text-sm"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <select
                        className="w-full md:w-auto glass pl-10 pr-4 py-2 text-sm outline-none appearance-none"
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                    >
                        <option value="">Todos los Movimientos</option>
                        {Object.keys(MOVEMENT_TYPES).map(key => (
                            <option key={key} value={key}>{MOVEMENT_TYPES[key].label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="glass overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="text-muted-foreground text-[10px] uppercase font-bold border-b border-border bg-accent/10">
                                <th className="p-4">Producto</th>
                                <th className="p-4">Variante</th>
                                <th className="p-4 text-center">Tipo</th>
                                <th className="p-4 text-center">Cantidad</th>
                                <th className="p-4">Motivo / Referencia</th>
                                <th className="p-4">Fecha y Hora</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Cargando movimientos...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Sin movimientos registrados</td></tr>
                            ) : filtered.map((m: any) => {
                                const typeInfo = MOVEMENT_TYPES[m.type] || { label: m.type, color: 'bg-accent text-muted-foreground' };
                                return (
                                    <tr key={m.id} className="text-sm hover:bg-accent/20 transition-colors">
                                        <td className="p-4">
                                            <p className="font-bold text-xs truncate max-w-[200px]">{m.productName || 'Producto Eliminado'}</p>
                                            <p className="text-[10px] text-muted-foreground">REF: {m.productId}</p>
                                        </td>
                                        <td className="p-4 text-xs text-muted-foreground max-w-[150px] truncate">{m.variantInfo || '–'}</td>
                                        <td className="p-4 text-center">
                                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[9px] font-black ${typeInfo.color}`}>
                                                {m.quantity > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                                                {typeInfo.label}
                                            </span>
                                        </td>
                                        <td className={`p-4 text-center font-black text-sm ${m.quantity > 0 ? 'text-green-400' : 'text-destructive'}`}>
                                            {m.quantity > 0 ? '+' : ''}{m.quantity}
                                        </td>
                                        <td className="p-4 text-xs italic text-muted-foreground truncate max-w-[200px]">{m.reason || m.reference || '–'}</td>
                                        <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDate(m.movementDate || m.createdAt || m.date)}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmModal
                isOpen={showClearModal}
                onClose={() => setShowClearModal(false)}
                onConfirm={handleClearHistory}
                title="Limpiar Historial"
                message="¿Estás seguro de que deseas eliminar TODOS los movimientos del Kardex? Esta acción no se puede deshacer."
                type="danger"
            />
        </div>
    );
};

export default StockMovements;
