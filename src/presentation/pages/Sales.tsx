import React from 'react';
import { useTranslation } from 'react-i18next';
import  { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, CreditCard, Trash2, Plus, Minus, CheckCircle, Package, Eye, Edit, Printer } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';
import { Product, Client } from '../../domain/models';
import { useAlert } from '../context/AlertContext';
import { formatMoney } from '../../infrastructure/invoiceTemplates';

const VariantSelectorModal = ({ isOpen, onClose, product, onSelect }: any) => {
    const { t } = useTranslation();
    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-md p-6 border-t-4 border-blue-500">
                <h3 className="text-xl font-bold mb-4">Seleccionar Variante</h3>
                <p className="text-sm text-muted-foreground mb-6">{product.name} - REF: {product.id}</p>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {product.variants?.map((v: any) => (
                        <button
                            key={v.id}
                            disabled={v.stock <= 0}
                            onClick={() => onSelect(v)}
                            className="w-full flex justify-between items-center p-4 bg-accent/20 hover:bg-blue-600/10 border border-border rounded-xl transition-all disabled:opacity-30 disabled:grayscale"
                        >
                            <div className="text-left">
                                <p className="font-bold text-sm">
                                    {Object.entries(v.attributes).map(([k, val]) => `${k}: ${val}`).join(' | ')}
                                </p>
                                <p className="text-[10px] text-muted-foreground">SKU: {v.sku || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <span className={`text-xs font-bold ${v.stock > 5 ? 'text-green-400' : 'text-orange-400'}`}>
                                    {v.stock} disp.
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                <button onClick={onClose} className="w-full mt-6 py-2 glass rounded-lg font-medium">{t('common.cancel')}</button>
            </div>
        </div>
    );
};

const ConfirmSaleModal = ({ isOpen, onClose, onConfirm, saleData, loading }: any) => {
    const { t } = useTranslation();
    const [isElectronic, setIsElectronic] = useState(false);
    const [elecData, setElecData] = useState({ document: '', email: '', address: '' });
    if (!isOpen) return null;

    // Cada item ya viene con unitPrice calculado según priceType
    const total = saleData.items.reduce((acc: number, item: any) => acc + ((item.unitPrice ?? 0) * item.quantity), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg p-5 sm:p-8 border-t-4 border-green-500 max-h-[90dvh] overflow-y-auto">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                    <CheckCircle className="text-green-400 shrink-0" size={22} /> Confirmar Venta
                </h3>

                <div className="space-y-3 sm:space-y-4 mb-5 sm:mb-8">
                    <div className="flex justify-between border-b border-border pb-2">
                        <span className="text-muted-foreground text-sm">Cliente:</span>
                        <span className="font-bold text-sm">{saleData.clientName}</span>
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Resumen de Productos:</p>
                        <div className="max-h-36 overflow-y-auto pr-1 space-y-1">
                            {saleData.items.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-sm gap-2">
                                    <span className="truncate flex-1 text-xs sm:text-sm">{item.name} (x{item.quantity})</span>
                                    <span className="font-mono text-xs sm:text-sm shrink-0">{formatMoney((item.unitPrice ?? 0) * item.quantity)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="pt-3 sm:pt-4 border-t border-border flex justify-between items-center text-lg sm:text-xl font-bold">
                        <span>Total a Pagar:</span>
                        <span className="text-blue-400">{formatMoney(total)}</span>
                    </div>
                </div>

                <div className="flex flex-col space-y-4 mb-5 sm:mb-8">
                    <div className="flex items-center space-x-3 p-3 sm:p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                        <input
                            type="checkbox"
                            id="electronic"
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0"
                            checked={isElectronic}
                            onChange={(e) => setIsElectronic(e.target.checked)}
                        />
                        <label htmlFor="electronic" className="text-sm font-medium cursor-pointer">Emitir Factura Electrónica</label>
                    </div>

                    {isElectronic && (
                        <div className="space-y-3 p-4 border border-blue-500/30 rounded-xl bg-blue-500/5 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">NIT / Cédula</label>
                                <input type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={elecData.document} onChange={e => setElecData({...elecData, document: e.target.value})} placeholder="Ej. 123456789" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Correo Electrónico</label>
                                <input type="email" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={elecData.email} onChange={e => setElecData({...elecData, email: e.target.value})} placeholder="correo@ejemplo.com" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Dirección</label>
                                <input type="text" className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" value={elecData.address} onChange={e => setElecData({...elecData, address: e.target.value})} placeholder="Ej. Calle 123 #45-67" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 glass rounded-xl font-bold text-sm">{t('common.cancel')}</button>
                    <button
                        onClick={() => onConfirm(isElectronic, elecData)}
                        disabled={loading || (isElectronic && (!elecData.document || !elecData.email))}
                        className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 text-sm"
                    >
                        {loading ? 'PROCESANDO...' : 'CONFIRMAR Y PAGAR'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ViewSaleModal = ({ isOpen, onClose, sale, onPrintPDF, onPrintPOS }: any) => {
    const { t } = useTranslation();
    if (!isOpen || !sale) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg p-5 sm:p-8 border-t-4 border-blue-500 max-h-[90dvh] overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold">Detalle de Venta</h3>
                        <p className="font-mono text-xs text-muted-foreground mt-1">ID: {sale.id}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white text-lg">✕</button>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-2 gap-4 border-b border-border pb-3 text-sm">
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase font-bold">{t('sales.client') || 'Client'}</span>
                            <span className="font-semibold">{sale.clientName}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase font-bold">Tipo</span>
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${sale.type === 'ELECTRONIC' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                {sale.type}
                            </span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase font-bold">{t('common.date') || 'Date'}</span>
                            <span>{new Date(sale.registrationDate).toLocaleString()}</span>
                        </div>
                        <div>
                            <span className="text-muted-foreground block text-xs uppercase font-bold">Estado</span>
                            <span className={`font-semibold ${sale.isReverted ? 'text-destructive' : 'text-green-400'}`}>
                                {sale.isReverted ? 'Anulada' : 'Activa'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase text-muted-foreground">Productos vendidos:</p>
                        <div className="max-h-40 overflow-y-auto pr-1 space-y-2">
                            {sale.items?.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between items-center bg-accent/10 p-2 sm:p-2.5 rounded-lg text-sm gap-2">
                                    <div className="min-w-0 flex-1">
                                        <p className="font-bold truncate text-xs sm:text-sm">{item.productName}</p>
                                        <p className="text-[10px] text-muted-foreground truncate">{item.variantDescription}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-semibold">x{item.quantity}</p>
                                        <p className="font-mono text-xs text-blue-400">{formatMoney((item.unitPrice ?? 0) * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between items-center text-lg sm:text-xl font-bold">
                        <span>Total cobrado:</span>
                        <span className="text-blue-400">{formatMoney(sale.total ?? 0)}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex gap-2">
                        <button
                            onClick={() => onPrintPOS(sale.id)}
                            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/20"
                        >
                            <Printer size={14} /> Tirilla P80
                        </button>
                        <button
                            onClick={() => onPrintPDF(sale.id)}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20"
                        >
                            <Printer size={14} /> Factura PDF
                        </button>
                    </div>
                    <button onClick={onClose} className="w-full py-2.5 glass rounded-xl font-medium text-xs">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

const Sales = () => {
    const { t } = useTranslation();
    const { productUseCases, saleUseCases, clientUseCases } = useDependencies();
    const { showToast, confirm } = useAlert();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<any[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [clientName, setClientName] = useState(t('sales.generalClient'));
    const [priceType, setPriceType] = useState('Mayorista');
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);



    useEffect(() => {
        const fetchInitialProducts = async () => {
            setLoading(true);
            try {
                // Load a larger page to include all/most products from catálogo
                const data = await productUseCases.getProducts(0, 1000);
                setAvailableProducts(data?.content || []);
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialProducts();
    }, []);

    const handleSearch = async (val: string) => {
        setSearchTerm(val);
        if (val.length > 2) {
            try {
                const results = await productUseCases.searchProducts(val);
                setAvailableProducts(results || []);
            } catch (error) {
                console.error('Search error', error);
            }
        }
    };

    const addToCart = (product: Product) => {
        setSelectedProduct(product);
    };

    const onVariantSelected = (variant: any) => {
        if (!selectedProduct) return;

        const cartId = `${selectedProduct.id}-${variant.id}`;
        const existing = cart.find(item => item.cartId === cartId);

        if (existing) {
            if (existing.quantity >= variant.stock) {
                showToast('No hay más stock disponible para esta variante', 'error');
                return;
            }
            setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, {
                cartId,
                id: selectedProduct.id,
                variantId: variant.id,
                name: `${selectedProduct.name} (${Object.values(variant.attributes).join('/')})`,
                price: selectedProduct.normalPrice,
                wholesalePrice: selectedProduct.wholesalePrice,
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
                const newQty = Math.min(item.stock, Math.max(1, currentQty + delta));
                if (delta > 0 && newQty === currentQty && currentQty >= item.stock) {
                    showToast('Stock máximo alcanzado', 'error');
                }
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

        setCart(cart.map(item => {
            if (item.cartId === cartId) {
                const newQty = Math.min(item.stock, qty);
                if (qty > item.stock) {
                    showToast(`Stock máximo alcanzado (${item.stock} disponible)`, 'error');
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }));
    };

    const handleQuantityBlur = (cartId: string, currentVal: any) => {
        if (currentVal === '' || isNaN(parseInt(currentVal)) || parseInt(currentVal) <= 0) {
            setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: 1 } : item));
        }
    };

    const removeFromCart = (cartId: string) => {
        setCart(cart.filter(item => item.cartId !== cartId));
    };

    const total = cart.reduce((acc, item) => acc + (priceType === 'Normal' ? item.price : item.wholesalePrice) * (Number(item.quantity) || 0), 0);

    

    

    const fetchClients = async () => {
        try {
            const data = await clientUseCases.getClients();
            setClients(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching clients:', error);
        }
    };
    useEffect(() => {
        fetchClients();
    }, []);

    const handleFinalizeSale = async (isElectronic: boolean, elecData?: any) => {
        setLoading(true);
        try {
            const resolvedClientName = clientName?.trim() ? clientName : t('sales.generalClient');
            let sellerName = 'Sistema';
            try {
                const rawUser = localStorage.getItem('current_user');
                if (rawUser) sellerName = JSON.parse(rawUser).name || JSON.parse(rawUser).username || 'Sistema';
            } catch { /* ignore */ }

            const saleData = {
                clientName: resolvedClientName,
                sellerName,
                type: isElectronic ? 'ELECTRONIC' : 'POS',
                electronicData: isElectronic ? elecData : undefined,
                items: cart.map(item => ({
                    productId: item.id,
                    variantId: item.variantId,
                    quantity: Number(item.quantity) || 1,
                    unitPrice: priceType === 'Normal' ? item.price : item.wholesalePrice
                }))
            };
            await saleUseCases.processSale(saleData);
            showToast(`Venta ${isElectronic ? 'Electrónica ' : ''}realizada con éxito`, 'success');
            setCart([]);
            setShowConfirm(false);
        } catch (error) {
            showToast('Error al procesar la venta', 'error');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Items del carrito enriquecidos con unitPrice según priceType (para el modal)
    const cartItemsForModal = cart.map(item => ({
        ...item,
        quantity: Number(item.quantity) || 1,
        unitPrice: priceType === 'Normal' ? item.price : item.wholesalePrice
    }));

    

    return (
        <div className="space-y-4 sm:space-y-6 pb-20 max-w-full min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                {/* Product Selection */}
                <div className="lg:col-span-2 flex flex-col space-y-3 sm:space-y-4 h-full min-h-0">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder={t('catalog.search') || "Buscar o escanear producto..."}
                            className="w-full glass pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50"
                            value={searchTerm}
                            onChange={(e) => handleSearch(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto min-h-0 border border-border rounded-lg sm:glass sm:border-0 px-3 sm:px-0 py-3 sm:py-0 max-h-[400px] sm:max-h-[70vh]">
                        <div className="product-grid grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 px-0 sm:p-4">
                            {loading && availableProducts.length === 0 ? (
                                <div className="col-span-2 sm:col-span-4 py-20 text-center text-muted-foreground">Cargando productos...</div>
                            ) : availableProducts.map(product => (
                                <div key={product.id} className="sm:glass p-3 sm:p-4 hover:border-blue-500/50 cursor-pointer transition-all active:scale-95 group border border-border rounded-lg bg-background sm:bg-transparent"
                                        onClick={() => addToCart(product)}>
                                        <div className="aspect-square bg-accent/20 rounded-lg mb-2 sm:mb-3 flex items-center justify-center relative overflow-hidden" style={{ aspectRatio: '1 / 1' }}>
                                            <Package className="text-muted-foreground group-hover:scale-110 transition-transform" size={28} />
                                            <div className="absolute top-1 right-1 px-1 py-0.5 bg-blue-600 text-[7px] font-bold rounded">#{product.id}</div>
                                        </div>
                                    <p className="font-bold text-xs truncate leading-tight">{product.name}</p>
                                    <div className="mt-1 sm:mt-2 flex justify-between items-center">
                                        <span className="text-blue-400 font-bold text-xs sm:text-sm">{formatMoney(product.normalPrice || 0)}</span>
                                        <Plus size={12} className="text-blue-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Shopping Cart */}
                <div className="flex flex-col sm:glass overflow-hidden h-fit border border-border rounded-lg bg-background sm:bg-transparent">
                    <div className="p-3 sm:p-4 border-b border-border flex justify-between items-center bg-accent/10">
                        <div className="flex items-center space-x-2">
                            <ShoppingCart size={18} className="text-blue-400" />
                            <h4 className="font-bold text-sm">Carrito ({cart.length})</h4>
                        </div>
                        <button onClick={() => setCart([])} className="text-[10px] text-destructive hover:underline">Vaciar</button>
                    </div>

                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 border-b border-border">
                        <div className="flex flex-col space-y-1">
                            <label className="text-[10px] uppercase font-bold text-muted-foreground">{t('sales.client') || 'Client'}</label>
                            <select
                                className="bg-transparent border-b border-border py-2 text-sm outline-none focus:border-blue-500"
                                value={selectedClientId}
                                onChange={(e) => {
                                    const selectedId = e.target.value;
                                    setSelectedClientId(selectedId);
                                    if (!selectedId) {
                                        setClientName(t('sales.generalClient'));
                                    } else {
                                        const client = clients.find(c => c.id === selectedId);
                                        setClientName(client?.name || t('sales.generalClient'));
                                    }
                                }}
                            >
                                <option value="">{t('sales.generalClient')}</option>
                                {clients.map((client) => (
                                    <option key={client.id} value={client.id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-xs font-medium text-muted-foreground">{t('sales.priceList') || 'Lista de Precio:'}</span>
                            <div className="flex bg-accent rounded-lg p-0.5">
                                <button onClick={() => setPriceType('Normal')} className={`px-2 sm:px-3 py-1 text-[10px] rounded-md transition-all ${priceType === 'Normal' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground'}`}>{t('catalog.normalPrice') || 'Normal'}</button>
                                <button onClick={() => setPriceType('Mayorista')} className={`px-2 sm:px-3 py-1 text-[10px] rounded-md transition-all ${priceType === 'Mayorista' ? 'bg-blue-600 text-white shadow-sm' : 'text-muted-foreground'}`}>{t('catalog.wholesalePrice') || 'Mayorista'}</button>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="max-h-48 sm:max-h-60 overflow-y-auto p-3 sm:p-4 space-y-2 sm:space-y-3">
                        {cart.length === 0 ? (
                            <div className="py-8 flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                                <Package size={28} />
                                <p className="text-xs text-center">{t('sales.emptyCartDesc') || 'Seleccione un producto y su variante para comenzar'}</p>
                            </div>
                        ) : cart.map((item) => (
                            <div key={item.cartId} className="flex justify-between items-center border-b border-border/50 pb-2 group">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] font-bold truncate pr-2 leading-tight">{item.name}</p>
                                    <p className="text-[10px] text-blue-400 font-mono mt-0.5">{formatMoney(priceType === 'Normal' ? item.price : item.wholesalePrice)}</p>
                                </div>
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    <div className="flex items-center bg-accent/30 rounded-lg">
                                        <button className="p-1 hover:bg-accent rounded" onClick={() => updateQuantity(item.cartId, -1)}><Minus size={10} /></button>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            className="text-[10px] font-bold w-6 text-center bg-transparent border-none outline-none focus:ring-0 p-0"
                                            value={item.quantity}
                                            onChange={(e) => handleQuantityChange(item.cartId, e.target.value)}
                                            onBlur={() => handleQuantityBlur(item.cartId, item.quantity)}
                                        />
                                        <button className="p-1 hover:bg-accent rounded" onClick={() => updateQuantity(item.cartId, 1)}><Plus size={10} /></button>
                                    </div>
                                    <button className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors" onClick={() => removeFromCart(item.cartId)}><Trash2 size={12} className="text-destructive" /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer / Summary */}
                    <div className="p-4 sm:p-6 bg-accent/20 space-y-3 sm:space-y-4">
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-muted-foreground">{t('dashboard.productsSoldToday') || 'Productos:'}</span>
                                <span>{cart.length}</span>
                            </div>
                            <div className="flex justify-between text-lg font-black">
                                <span>{t('common.total') || 'TOTAL'}</span>
                                <span className="text-blue-400">{formatMoney(total)}</span>
                            </div>
                        </div>
                        <button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 rounded-xl font-black text-sm tracking-widest flex items-center justify-center space-x-2 transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-blue-500/20"
                            disabled={cart.length === 0 || loading}
                            onClick={() => setShowConfirm(true)}
                        >
                            <CheckCircle size={18} />
                            <span>{t('sales.process') || 'FINALIZE SALE'}</span>
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

            <ConfirmSaleModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                saleData={{ clientName, items: cartItemsForModal }}
                onConfirm={handleFinalizeSale}
                loading={loading}
            />

            
        </div>
    );
};

export default Sales;
