import { formatMoney } from '../../infrastructure/invoiceTemplates';
import React from 'react';
import { useTranslation } from 'react-i18next';
import  { useState, useEffect } from 'react';
import { CreditCard, Search, PlusCircle, Calendar, User, DollarSign, Package, ShoppingCart, Trash2, Plus, Minus, CheckCircle, X } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';
import { useAlert } from '../context/AlertContext';
import { Product } from '../../domain/models';

const VariantSelectorModal = ({ isOpen, onClose, product, onSelect }: any) => {
    const { t } = useTranslation();
    if (!isOpen || !product) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-md p-6 border-t-4 border-blue-500">
                <h3 className="text-xl font-bold mb-4">Seleccionar Variante</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {product.variants?.map((v: any) => (
                        <button
                            key={v.id}
                            disabled={v.stock <= 0}
                            onClick={() => onSelect(v)}
                            className="w-full flex justify-between items-center p-4 bg-accent/20 hover:bg-blue-600/10 border border-border rounded-xl transition-all disabled:opacity-30"
                        >
                            <div className="text-left font-bold text-sm">
                                {Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(' | ')}
                            </div>
                            <div className="text-right text-xs font-bold text-orange-400">{v.stock} disp.</div>
                        </button>
                    ))}
                </div>
                <button onClick={onClose} className="w-full mt-6 py-2 glass rounded-lg font-medium">Cancelar</button>
            </div>
        </div>
    );
};

const CreditModal = ({ isOpen, onClose, onSave, products, onSearch, loading }: any) => {
    const { t } = useTranslation();
    const { showToast } = useAlert();
    const [cart, setCart] = useState<any[]>([]);
    const [clientName, setClientName] = useState('');
    const [installments, setInstallments] = useState(1);
    const [priceType, setPriceType] = useState<'Normal'|'Mayorista'>('Mayorista');
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    if (!isOpen) return null;

    const total = cart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    const onVariantSelected = (variant: any) => {
        if (!selectedProduct) return;
        const cartId = `${selectedProduct.id}-${variant.id}`;
        const existing = cart.find(item => item.cartId === cartId);
        if (existing) {
            setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, {
                cartId,
                id: selectedProduct.id,
                variantId: variant.id,
                name: `${selectedProduct.name} (${Object.values(variant.attributes).join('/')})`,
                price: priceType === 'Normal' ? selectedProduct.normalPrice : (selectedProduct.wholesalePrice ?? selectedProduct.normalPrice),
                quantity: 1,
                stock: variant.stock
            }]);
        }
        setSelectedProduct(null);
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart(cart.map(item => {
            if (item.cartId === cartId) {
                const currentQty = Number(item.quantity) || 0;
                const newQty = Math.max(1, currentQty + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleQuantityChange = (cartId: string, val: string) => {
        if (val === '') {
            setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: '' } : item));
            return;
        }

        const qty = parseInt(val);
        if (isNaN(qty) || qty <= 0) return;

        setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: Math.min(item.stock || qty, qty) } : item));
    };

    const handleQuantityBlur = (cartId: string, currentVal: any) => {
        if (currentVal === '' || isNaN(parseInt(currentVal)) || parseInt(currentVal) <= 0) {
            setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: 1 } : item));
        }
    };

    const removeFromCart = (cartId: string) => setCart(cart.filter((c: any) => c.cartId !== cartId));

    const handleProcess = () => {
        if (!clientName || cart.length === 0) return showToast('Complete los datos', 'error');
        onSave({ clientName, installments, items: cart });
        setCart([]);
        setClientName('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-t-4 border-blue-500">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-blue-500" /> Nuevo Crédito</h3>
                    <button onClick={onClose} className="p-2 hover:bg-accent rounded-full"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2">
                    {/* Catalog Side */}
                    <div className="p-6 border-r border-border flex flex-col space-y-4 overflow-hidden">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                className="w-full glass pl-10 pr-4 py-2 text-xs"
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 product-grid">
                            {products.map((p: any) => (
                                <div key={p.id} onClick={() => setSelectedProduct(p)} className="p-3 glass hover:border-blue-500/50 cursor-pointer flex justify-between items-center transition-all active:scale-[0.98]">
                                    <div>
                                        <p className="font-bold text-xs">{p.name}</p>
                                        <p className="text-[10px] text-muted-foreground">REF: {p.id}</p>
                                    </div>
                                    <p className="font-bold text-blue-400 text-xs">{formatMoney(p.normalPrice)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cart Side */}
                    <div className="p-6 bg-accent/5 flex flex-col space-y-4 overflow-hidden">
                        <div className="space-y-4">
                            <div className="flex flex-col space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">{t('sales.client') || 'Client'}</label>
                                <input type="text" className="bg-transparent border-b border-border py-1 text-sm outline-none" placeholder="Nombre completo" value={clientName} onChange={e => setClientName(e.target.value)} />
                            </div>
                            <div className="flex justify-start items-center gap-3">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Lista de Precio</label>
                                <div className="flex bg-accent rounded-lg p-0.5">
                                    <button onClick={() => setPriceType('Normal')} className={`px-2 py-1 text-[10px] rounded-md ${priceType === 'Normal' ? 'bg-blue-600 text-white' : 'text-muted-foreground'}`}>Normal</button>
                                    <button onClick={() => setPriceType('Mayorista')} className={`px-2 py-1 text-[10px] rounded-md ${priceType === 'Mayorista' ? 'bg-blue-600 text-white' : 'text-muted-foreground'}`}>Mayorista</button>
                                </div>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <label className="text-[10px] font-bold text-muted-foreground uppercase">Cuotas</label>
                                <input type="number" min="1" className="bg-transparent border-b border-border py-1 text-sm outline-none" value={installments} onChange={e => setInstallments(parseInt(e.target.value))} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2">
                            {cart.map((item: any) => (
                                <div key={item.cartId} className="flex justify-between items-center text-xs border-b border-border/50 pb-2">
                                    <div className="truncate flex-1 pr-2">{item.name}</div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center bg-accent/30 rounded-lg">
                                            <button className="p-1 hover:bg-accent rounded" onClick={() => updateQuantity(item.cartId, -1)}><Minus size={12} /></button>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                className="text-[10px] font-bold w-10 text-center bg-transparent border-none outline-none focus:ring-0 p-0"
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item.cartId, e.target.value)}
                                                onBlur={() => handleQuantityBlur(item.cartId, item.quantity)}
                                            />
                                            <button className="p-1 hover:bg-accent rounded" onClick={() => updateQuantity(item.cartId, 1)}><Plus size={12} /></button>
                                        </div>
                                        <span className="font-bold text-blue-400">{formatMoney((item.price * (Number(item.quantity) || 1)))}</span>
                                        <button onClick={() => removeFromCart(item.cartId)} className="text-destructive"><Trash2 size={12} className="text-destructive" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-4 border-t border-border">
                            <div className="flex justify-between font-black text-lg mb-4">
                                <span>{t('common.total') || 'TOTAL'}</span>
                                <span className="text-blue-500">{formatMoney(total)}</span>
                            </div>
                            <button
                                onClick={handleProcess}
                                disabled={loading || cart.length === 0}
                                className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {loading ? 'PROCESANDO...' : 'CREAR CRÉDITO'}
                            </button>
                        </div>
                    </div>
                </div>

                <VariantSelectorModal
                    isOpen={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    product={selectedProduct}
                    onSelect={onVariantSelected}
                />
            </div>
        </div>
    );
};

const PaymentModal = ({ isOpen, onClose, onSave, credit, loading }: any) => {
    const { t } = useTranslation();
    const [amount, setAmount] = useState(0);
    const [method, setMethod] = useState('Efectivo');

    if (!isOpen || !credit) return null;

    const balance = credit.amount - credit.paidAmount;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-sm p-8 border-t-4 border-green-500">
                <h3 className="text-xl font-bold mb-2">Registrar Abono</h3>
                <p className="text-xs text-muted-foreground mb-6">Saldo pendiente: <span className="font-bold text-destructive">{formatMoney(balance)}</span></p>

                <div className="space-y-4">
                    <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold opacity-50 uppercase">Monto a Pagar</label>
                        <input type="number" className="bg-transparent border-b border-green-500/50 py-2 text-lg font-bold outline-none" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <label className="text-[10px] font-bold opacity-50 uppercase">Método</label>
                        <select className="bg-transparent border-b border-border py-2 text-sm outline-none" value={method} onChange={e => setMethod(e.target.value)}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                        </select>
                    </div>
                </div>

                <div className="flex gap-3 mt-8">
                    <button onClick={onClose} className="flex-1 py-2 glass rounded-lg text-sm">Cancelar</button>
                    <button
                        onClick={() => onSave(credit.id, amount, method)}
                        disabled={loading || amount <= 0 || amount > balance}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                    >
                        {loading ? '...' : 'PAGAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const Credits = () => {
    const { t } = useTranslation();
    const { creditUseCases, productUseCases, saleUseCases, clientUseCases } = useDependencies();
    const { showToast, confirm } = useAlert();
    const [clients, setClients] = useState<any[]>([]);
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    const [credits, setCredits] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedCredit, setSelectedCredit] = useState<any>(null);
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);

    useEffect(() => {
        const loadProductsOnOpen = async () => {
            if (!isCreditModalOpen) return;
            try {
                const data = await productUseCases.getProducts(0, 1000);
                // Adapter returns { content, totalElements } for paged responses
                setAvailableProducts((data && data.content) ? data.content : (data || []));
            } catch (err) {
                console.error('Error loading products for credit modal', err);
            }
        };
        loadProductsOnOpen();
    }, [isCreditModalOpen]);

    const fetchCredits = async () => {
        setLoading(true);
        try {
            const data = selectedClientId ? await creditUseCases.getCreditsByClient(selectedClientId) : await creditUseCases.getCredits();
            setCredits(data || []);
        } catch (error) {
            console.error('Error fetching credits:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, []);

    useEffect(() => {
        // load clients for selector
        const loadClients = async () => {
            try {
                const c = await (clientUseCases && clientUseCases.getClients ? clientUseCases.getClients() : Promise.resolve([]));
                setClients(c || []);
            } catch (err) {
                console.error('Error loading clients', err);
            }
        };
        loadClients();
    }, [clientUseCases]);

    useEffect(() => {
        // refetch when client filter changes
        fetchCredits();
    }, [selectedClientId]);

    const handleSearchProducts = async (q: string) => {
        if (q.length < 2) return;
        const res = await productUseCases.searchProducts(q);
        setAvailableProducts(res || []);
    };

    const handleCreateCredit = async (creditData: any) => {
        setActionLoading(true);
        try {
            await creditUseCases.createCredit(creditData);
            setIsCreditModalOpen(false);
            fetchCredits();
            showToast('Crédito creado con éxito', 'success');
        } catch (error) {
            showToast('Error al crear crédito', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handlePayment = async (id: string, amount: number, method: string) => {
        setActionLoading(true);
        try {
            const updated: any = await creditUseCases.payInstallment(id, amount, method);
            setIsPaymentModalOpen(false);
            fetchCredits();
            showToast('Pago registrado', 'success');

            // Si el crédito queda pagado en su totalidad, generar factura automáticamente
            const paidCredit = updated || credits.find((c: any) => c.id === id);
            if (paidCredit && Number(paidCredit.paidAmount) >= Number(paidCredit.amount)) {
                try {
                    const saleData = {
                        clientName: paidCredit.clientName,
                        type: 'POS',
                        items: (paidCredit.items || []).map((it: any) => ({
                            productId: it.productId || it.id,
                            variantId: it.variantId,
                            quantity: it.quantity,
                            unitPrice: it.price || it.unitPrice || 0
                        }))
                    };
                    await saleUseCases.processSale(saleData);
                    showToast('Factura generada por pago completo', 'success');
                } catch (err) {
                    console.error('Error generando factura automática:', err);
                    showToast('Error al generar factura tras pago completo', 'error');
                }
            }
        } catch (error) {
            showToast('Error al registrar pago', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCredit = async (id: string) => {
        const confirmed = await confirm({
            title: 'Anular Crédito',
            message: '¿Anular crédito? Se restaurará el stock.',
            type: 'danger',
            confirmText: 'Anular'
        });
        if (!confirmed) return;
        try {
            await creditUseCases.removeCredit(id);
            showToast('Crédito anulado con éxito', 'success');
            fetchCredits();
        } catch (error) {
            console.error(error);
            showToast('Error al anular crédito', 'error');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PAID': return 'bg-green-500/10 text-green-400';
            case 'PENDING': return 'bg-blue-500/10 text-blue-400';
            case 'OVERDUE': return 'bg-destructive/10 text-destructive';
            default: return 'bg-accent text-muted-foreground';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold flex items-center gap-2"><CreditCard className="text-blue-500" /> Gestión de Créditos</h3>
                <button
                    onClick={() => setIsCreditModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-black text-xs tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20"
                >
                    <Plus size={16} /> NUEVO CRÉDITO
                </button>
            </div>

            <div className="flex items-center gap-4">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Filtrar por Cliente</label>
                <select value={selectedClientId} onChange={e => setSelectedClientId(e.target.value)} className="bg-transparent border border-border rounded px-3 py-2 text-sm">
                    <option value="">Todos</option>
                    {clients.map((c: any) => (
                        <option key={c.id || c.name} value={c.id}>{c.name || c.fullName || c.username}</option>
                    ))}
                </select>
                {selectedClientId && (
                    <button onClick={() => setSelectedClientId('')} className="text-xs text-muted-foreground">Clear</button>
                )}
            </div>

            {/* Credits Table */}
            <div className="glass overflow-hidden w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[700px]">
                        <thead>
                            <tr className="text-muted-foreground text-[10px] uppercase font-bold border-b border-border bg-accent/10">
                                <th className="p-4">ID</th>
                                <th className="p-4">{t('sales.client') || 'Client'}</th>
                                <th className="p-4">{t('common.total') || 'Total'}</th>
                                <th className="p-4">Pagado</th>
                                <th className="p-4">Saldo</th>
                                <th className="p-4 text-center">{t('credits.status')}</th>
                                <th className="p-4 text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Cargando créditos...</td></tr>
                            ) : credits.length === 0 ? (
                                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No hay créditos registrados</td></tr>
                            ) : credits.map((c: any) => (
                                <tr key={c.id} className="text-sm hover:bg-accent/30 transition-all group">
                                    <td className="p-4 font-mono text-xs">{c.id}</td>
                                    <td className="p-4 font-bold">{c.clientName}</td>
                                    <td className="p-4 font-bold">{formatMoney(c.amount)}</td>
                                    <td className="p-4 text-green-400 font-bold">{formatMoney(c.paidAmount)}</td>
                                    <td className="p-4 text-destructive font-black">{formatMoney((c.amount - c.paidAmount))}</td>
                                    <td className="p-4 text-center">
                                        <span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-wider ${getStatusColor(c.status)}`}>
                                            {(c.status || 'PENDING')}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => { setSelectedCredit(c); setIsPaymentModalOpen(true); }}
                                            className="bg-green-600/20 text-green-400 hover:bg-green-600/40 p-2 rounded-lg"
                                            title={t('credits.addInstallment')}
                                        >
                                            <DollarSign size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCredit(c.id)}
                                            className="bg-destructive/20 text-destructive hover:bg-destructive/40 p-2 rounded-lg"
                                            title="Anular"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <CreditModal
                isOpen={isCreditModalOpen}
                onClose={() => setIsCreditModalOpen(false)}
                onSave={handleCreateCredit}
                products={availableProducts}
                onSearch={handleSearchProducts}
                loading={actionLoading}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSave={handlePayment}
                credit={selectedCredit}
                loading={actionLoading}
            />
        </div>
    );
};

export default Credits;
