import { formatMoney } from '../../infrastructure/invoiceTemplates';
import React from 'react';
import { useTranslation } from 'react-i18next';
import  { useState, useEffect } from 'react';
import { Search, Package, Plus, Minus, CheckCircle } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';
import { Product } from '../../domain/models';
import { useAlert } from '../context/AlertContext';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import html2canvas from 'html2canvas';

const VariantSelectorModal = ({ isOpen, onClose, product, onSelect }: any) => {
    const { t } = useTranslation();
    if (!isOpen || !product) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                <button onClick={onClose} className="w-full mt-6 py-2 glass rounded-lg font-medium">{t('common.cancel')}</button>
            </div>
        </div>
    );
};

const ConfirmQuoteModal = ({ isOpen, onClose, quoteData }: any) => {
    const { t } = useTranslation();
    const { showToast } = useAlert();
    if (!isOpen) return null;
    const total = quoteData.items.reduce((acc: number, it: any) => acc + (it.unitPrice || 0) * (it.quantity || 0), 0);

    const buildQuoteHtml = () => {
        return `<!doctype html><html><head><meta charset="utf-8"><title>Cotización</title><style>body{font-family:Arial,Helvetica,sans-serif;background:#f7f9fc;color:#111;margin:0;padding:24px}.wrapper{max-width:720px;margin:0 auto;border:1px solid #e5e7eb;border-radius:16px;padding:24px;background:#fff}h1{font-size:24px;margin-bottom:12px}p{margin:0 0 12px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:10px;border:1px solid #e5e7eb;text-align:left}th{background:#f8fafc;font-weight:700}.total{text-align:right;margin-top:18px;font-size:18px;font-weight:700}</style></head><body><div class="wrapper"><h1>Cotización</h1><p><strong>Cliente:</strong> ${quoteData.clientName}</p><p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p><table><thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>${quoteData.items.map((it: any) => `<tr><td>${it.name}</td><td>${it.quantity}</td><td style="text-align:right">${formatMoney(it.unitPrice)}</td><td style="text-align:right">${formatMoney((it.unitPrice || 0) * (it.quantity || 0))}</td></tr>`).join('')}</tbody></table><div class="total">Total: ${formatMoney(total)}</div></div></body></html>`;
    };

    const renderQuoteImage = async (html: string) => {
        const captureContainer = document.createElement('div');
        captureContainer.style.position = 'fixed';
        captureContainer.style.left = '-9999px';
        captureContainer.style.top = '0';
        captureContainer.style.width = '720px';
        captureContainer.style.backgroundColor = '#ffffff';
        captureContainer.innerHTML = html;
        document.body.appendChild(captureContainer);

        const canvas = await html2canvas(captureContainer, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
        document.body.removeChild(captureContainer);
        return canvas.toDataURL('image/png');
    };

    const downloadPDF = async () => {
        const lines = quoteData.items.map((it: any) => `${it.name} x${it.quantity} - ${formatMoney(it.unitPrice)} = ${formatMoney((it.unitPrice || 0) * (it.quantity || 0))}`);
        const message = `Cotización para ${quoteData.clientName}\n\n${lines.join('\n')}\n\nTotal: ${formatMoney(total)}`;

        try {
            const html = buildQuoteHtml();
            const imageDataUrl = await renderQuoteImage(html);

            if (Capacitor.isNativePlatform()) {
                const base64String = imageDataUrl.split(',')[1];
                const fileName = `cotizacion_${Date.now()}.png`;
                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64String,
                    directory: Directory.Cache,
                });

                await Share.share({
                    title: `Cotización ${quoteData.clientName}`,
                    text: `Adjunto cotización para ${quoteData.clientName}`,
                    url: savedFile.uri,
                    dialogTitle: 'Compartir Cotización',
                });
                return;
            }

            const response = await fetch(imageDataUrl);
            const blob = await response.blob();
            const file = new File([blob], `cotizacion_${Date.now()}.png`, { type: 'image/png' });

            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: `Cotización ${quoteData.clientName}`,
                    text: `Adjunto cotización para ${quoteData.clientName}`,
                    files: [file],
                });
                return;
            }

            const link = document.createElement('a');
            link.download = `cotizacion_${Date.now()}.png`;
            link.href = imageDataUrl;
            link.click();
        } catch (error) {
            console.error('Share failed', error);
            showToast('No se pudo compartir la cotización', 'error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-lg p-6 border-t-4 border-blue-500">
                <h3 className="text-xl font-bold mb-4">Cotización lista</h3>
                <p className="mb-4">Cliente: <strong>{quoteData.clientName}</strong></p>
                <div className="mb-4">
                    <div className="flex justify-between font-bold text-sm"><span>Items</span><span>{t('common.total') || 'Total'}</span></div>
                    <div className="mt-2 max-h-40 overflow-y-auto pr-2 text-sm">
                        {quoteData.items.map((it: any, i: number) => (
                            <div key={i} className="flex justify-between py-1 border-b border-border">
                                <div className="truncate pr-2">{it.name} x{it.quantity}</div>
                                <div className="font-mono">{((it.unitPrice||0) * (it.quantity||0)).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={downloadPDF} className="flex-1 py-2 bg-emerald-600 text-white rounded">Compartir / Descargar Cotización</button>
                    <button onClick={onClose} className="flex-1 py-2 glass rounded">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

const Quotes = () => {
    const { t } = useTranslation();
    const { productUseCases, saleUseCases } = useDependencies();
    const { showToast } = useAlert();
    const [searchTerm, setSearchTerm] = useState('');
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [cart, setCart] = useState<any[]>([]);
    const [clientName, setClientName] = useState(t('sales.generalClient'));
    const [priceType, setPriceType] = useState<'Normal'|'Mayorista'>('Mayorista');
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        const fetchInitial = async () => {
            setLoading(true);
            try {
                const data: any = await productUseCases.getProducts(0, 1000);
                setAvailableProducts(data?.content || data || []);
            } catch (err) {
                console.error(err);
            } finally { setLoading(false); }
        };
        fetchInitial();
    }, []);

    const handleSearch = async (q: string) => {
        setSearchTerm(q);
        if (q.length > 2) {
            const res = await productUseCases.searchProducts(q);
            setAvailableProducts(res || []);
        }
    };

    const addToCart = (p: Product) => setSelectedProduct(p);
    const onVariantSelected = (variant: any) => {
        if (!selectedProduct) return;
        const cartId = `${selectedProduct.id}-${variant.id}`;
        const existing = cart.find(c => c.cartId === cartId);
        const unitPrice = priceType === 'Normal' ? selectedProduct.normalPrice : (selectedProduct.wholesalePrice ?? selectedProduct.normalPrice);
        if (existing) setCart(cart.map(c => c.cartId === cartId ? { ...c, quantity: c.quantity + 1 } : c));
        else setCart([...cart, { cartId, id: selectedProduct.id, variantId: variant.id, name: `${selectedProduct.name} (${Object.values(variant.attributes).join('/')})`, unitPrice, quantity: 1 }]);
        setSelectedProduct(null);
    };

    const updateQuantity = (cartId: string, delta: number) => {
        setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
    };

    const handleQuantityChange = (cartId: string, val: string) => {
        if (val === '') {
            setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: '' } : item));
            return;
        }
        const qty = parseInt(val);
        if (isNaN(qty) || qty <= 0) return;
        setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: qty } : item));
    };

    const handleQuantityBlur = (cartId: string, currentVal: any) => {
        if (currentVal === '' || isNaN(parseInt(currentVal)) || parseInt(currentVal) <= 0) {
            setCart(cart.map(item => item.cartId === cartId ? { ...item, quantity: 1 } : item));
        }
    };

    const removeFromCart = (cartId: string) => setCart(cart.filter(c => c.cartId !== cartId));

    const total = cart.reduce((acc, it) => acc + (it.unitPrice || 0) * (it.quantity || 0), 0);

    const handleGenerateQuote = () => {
        if (cart.length === 0) return showToast('Añada productos a la cotización', 'error');
        setShowConfirm(true);
    };

    const handleCreateInvoice = async () => {
        if (cart.length === 0) return showToast('Añada productos', 'error');
        try {
            let sellerName = 'Sistema';
            try {
                const rawUser = localStorage.getItem('current_user');
                if (rawUser) sellerName = JSON.parse(rawUser).name || JSON.parse(rawUser).username || 'Sistema';
            } catch { /* ignore */ }

            const saleData = {
                clientName,
                sellerName,
                type: 'POS',
                items: cart.map((it: any) => ({ productId: it.id, variantId: it.variantId, quantity: it.quantity, unitPrice: it.unitPrice }))
            };
            await saleUseCases.processSale(saleData);
            showToast('Factura creada', 'success');
            setCart([]);
        } catch (err) {
            console.error(err);
            showToast('Error al crear factura', 'error');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold">{t('quotes.title')}</h3>
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex bg-accent rounded-lg p-0.5">
                        <button onClick={() => setPriceType('Normal')} className={`px-2 py-1 text-[10px] rounded-md ${priceType === 'Normal' ? 'bg-blue-600 text-white' : 'text-muted-foreground'}`}>Normal</button>
                        <button onClick={() => setPriceType('Mayorista')} className={`px-2 py-1 text-[10px] rounded-md ${priceType === 'Mayorista' ? 'bg-blue-600 text-white' : 'text-muted-foreground'}`}>Mayorista</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 flex flex-col space-y-3 h-full min-h-0">
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input type="text" placeholder="Buscar producto..." className="w-full glass pl-10 py-2" value={searchTerm} onChange={e => handleSearch(e.target.value)} />
                    </div>
                    <div className="flex-1 overflow-y-auto min-h-0 border border-border rounded-lg sm:glass sm:border-0 px-3 sm:px-0 py-3 sm:py-0 max-h-[400px] sm:max-h-[70vh]">
                        <div className="product-grid grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 px-0 sm:p-4">
                            {loading ? <div className="col-span-4 py-10 text-center text-muted-foreground">Cargando...</div> : availableProducts.map(p => (
                                <div key={p.id} className="sm:glass p-3 sm:p-4 cursor-pointer border border-border rounded-lg bg-background sm:bg-transparent" onClick={() => addToCart(p)}>
                                    <div className="aspect-square bg-accent/20 rounded-lg mb-2 flex items-center justify-center" style={{ aspectRatio: '1 / 1' }}><Package size={28} /></div>
                                    <p className="font-bold text-xs truncate">{p.name}</p>
                                    <div className="mt-1 flex justify-between items-center"><span className="text-blue-400 font-bold text-xs">{formatMoney(p.normalPrice)}</span><Plus size={12} /></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="glass p-3">
                    <div className="flex justify-between items-center mb-3"><h4 className="font-bold">Cotización</h4></div>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                        {cart.length === 0 ? (
                            <div className="text-xs text-muted-foreground">Agrega productos para cotizar</div>
                        ) : cart.map(it => (
                            <div key={it.cartId} className="flex justify-between items-center">
                                <div className="flex-1 min-w-0 pr-2">
                                    <div className="font-bold text-sm truncate">{it.name}</div>
                                    <div className="text-[10px] text-muted-foreground">{it.unitPrice}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => updateQuantity(it.cartId, -1)} className="p-1">-</button>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        className="text-sm font-bold w-10 text-center bg-transparent border-none outline-none p-0"
                                        value={it.quantity}
                                        onChange={(e) => handleQuantityChange(it.cartId, e.target.value)}
                                        onBlur={() => handleQuantityBlur(it.cartId, it.quantity)}
                                    />
                                    <button onClick={() => updateQuantity(it.cartId, 1)} className="p-1">+</button>
                                    <button onClick={() => removeFromCart(it.cartId)} className="p-1 text-destructive">x</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 border-t border-border pt-3">
                        <div className="flex justify-between font-black text-lg"><span>{t('common.total') || 'Total'}</span><span className="text-blue-400">{formatMoney(total)}</span></div>
                        <div className="flex gap-2 mt-3">
                            <button onClick={handleGenerateQuote} className="flex-1 py-2 bg-emerald-600 text-white rounded">Generar Cotización (PDF)</button>
                            <button onClick={handleCreateInvoice} className="flex-1 py-2 bg-blue-600 text-white rounded">Crear Factura (debe descontar stock)</button>
                        </div>
                    </div>
                </div>
            </div>

            <VariantSelectorModal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} product={selectedProduct} onSelect={onVariantSelected} />
            <ConfirmQuoteModal isOpen={showConfirm} onClose={() => setShowConfirm(false)} quoteData={{ clientName, items: cart }} />
        </div>
    );
};

export default Quotes;
