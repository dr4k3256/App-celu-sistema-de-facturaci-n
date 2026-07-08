import { formatMoney } from '../../infrastructure/invoiceTemplates';
import React from 'react';
import { useTranslation } from 'react-i18next';
import  { useEffect, useState, useRef } from 'react';
import { Eye, Edit, Trash2, Printer, ArrowLeft, Share2, MessageCircle, Image as ImageIcon } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';
import { useAlert } from '../context/AlertContext';
import DateField from '../components/DateField';
import { buildInvoiceHtml, buildPOSTicket } from '../../infrastructure/invoiceTemplates';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';

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
                                        <p className="font-mono text-xs text-blue-400">{formatMoney(((item.unitPrice ?? 0) * item.quantity))}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between items-center text-lg sm:text-xl font-bold">
                        <span>Total cobrado:</span>
                        <span className="text-blue-400">{formatMoney((sale.total ?? 0))}</span>
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

// ─── Full-screen in-app invoice viewer ─────────────────────────────────────
const InvoiceViewerModal = ({ mode, sale, onClose }: { mode: 'pdf'|'pos'|null, sale: any, onClose: () => void }) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [isFabOpen, setIsFabOpen] = useState(false);
    
    if (!mode || !sale) return null;

    const isPDF = mode === 'pdf';
    const htmlContent = isPDF ? buildInvoiceHtml(sale) : null;
    const posText = !isPDF ? buildPOSTicket(sale) : null;

    const handleSaveImage = async () => {
        try {
            let captureElement: HTMLElement | null = null;
            
            if (isPDF) {
                const iframe = iframeRef.current;
                if (iframe && iframe.contentDocument) {
                    captureElement = iframe.contentDocument.body;
                }
            } else {
                captureElement = document.getElementById('pos-receipt-container');
            }

            if (!captureElement) {
                alert('No se pudo encontrar la factura para capturar.');
                return;
            }

            // Añadir un fondo blanco explícito antes de capturar si es necesario
            const originalBg = captureElement.style.backgroundColor;
            captureElement.style.backgroundColor = '#ffffff';

            const canvas = await html2canvas(captureElement, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            
            captureElement.style.backgroundColor = originalBg;

            const base64Data = canvas.toDataURL('image/png');

            if (window.Capacitor?.isNativePlatform()) {
                // Remove the "data:image/png;base64," prefix for Capacitor
                const base64String = base64Data.split(',')[1];
                const fileName = `factura_${sale.id}_${Date.now()}.png`;

                const savedFile = await Filesystem.writeFile({
                    path: fileName,
                    data: base64String,
                    directory: Directory.Cache
                });

                await Share.share({
                    title: `Factura ${sale.id}`,
                    text: `Factura ${sale.id} adjunta.`,
                    url: savedFile.uri,
                    dialogTitle: 'Compartir/Guardar Factura'
                });
            } else {
                // Web fallback
                const link = document.createElement('a');
                link.download = `factura_${sale.id}.png`;
                link.href = base64Data;
                link.click();
            }
        } catch (error) {
            console.error('Error capturando la imagen:', error);
            alert('Hubo un error al intentar generar la imagen de la factura.');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col bg-white" style={{overscrollBehavior:'contain'}}>
            {/* Content — takes all available space */}
            <div className="flex-1 overflow-auto bg-white" onClick={() => setIsFabOpen(false)}>
                {isPDF ? (
                    <iframe
                        ref={iframeRef}
                        className="w-full h-full border-0"
                        srcDoc={htmlContent!}
                        title="Factura PDF"
                    />
                ) : (
                    <div className="flex justify-center p-4 min-h-full bg-gray-100">
                        <div id="pos-receipt-container" style={{ backgroundColor: '#ffffff', padding: '10mm', boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
                            <pre
                                style={{
                                    fontFamily: "'Courier New', Courier, monospace",
                                fontSize: '11px',
                                lineHeight: 1.3,
                                width: '72mm',
                                margin: '0 auto',
                                color: '#000',
                                background: '#fff',
                                padding: '8mm',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-all',
                            }}
                        >{posText}</pre>
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Action Button (FAB) Menu - Moved higher to avoid footer overlapping entirely */}
            <div className="absolute bottom-24 right-6 flex flex-col-reverse items-end gap-3 z-[300]">
                {/* Main FAB Toggle */}
                <button
                    onClick={() => setIsFabOpen(!isFabOpen)}
                    className="w-14 h-14 bg-blue-600 rounded-full shadow-[0_4px_20px_rgba(37,99,235,0.4)] flex items-center justify-center text-white active:scale-95 transition-transform"
                >
                    {isFabOpen ? <span className="text-2xl font-bold">×</span> : <span className="text-2xl font-bold">⋮</span>}
                </button>

                {/* FAB Actions */}
                <div className={`flex flex-col-reverse items-end gap-3 transition-all duration-300 origin-bottom ${isFabOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-50 pointer-events-none'}`}>
                    <button
                        onClick={handleSaveImage}
                        className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-lg border border-slate-100 active:bg-slate-50 transition-colors"
                    >
                        <span className="text-sm font-bold text-slate-700">Compartir / Guardar Imagen</span>
                        <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600">
                            <ImageIcon size={18} />
                        </div>
                    </button>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-3 bg-white px-4 py-3 rounded-full shadow-lg border border-slate-100 active:bg-slate-50 transition-colors"
                    >
                        <span className="text-sm font-bold text-slate-700">Volver</span>
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                            <ArrowLeft size={18} />
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};
// ─────────────────────────────────────────────────────────────────────────────

const Facturas = () => {
    const { t } = useTranslation();
    const { saleUseCases, productUseCases } = useDependencies();
    const { showToast, confirm } = useAlert();
    const [latestSales, setLatestSales] = useState<any[]>([]);
    const [salesFetchStatus, setSalesFetchStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [selectedSaleForView, setSelectedSaleForView] = useState<any>(null);
    const [viewerMode, setViewerMode] = useState<'pdf'|'pos'|null>(null);
    const [viewerSale, setViewerSale] = useState<any>(null);
    const [filterDate, setFilterDate] = useState<string>(''); // yyyy-mm-dd
    const [filterMonth, setFilterMonth] = useState<string>(''); // yyyy-mm

    const fetchLatestSales = async () => {
        setLoading(true);
        try {
            const data = await saleUseCases.getSales(0, 100);
            const salesList = Array.isArray(data) ? data : (data?.content || []);
            setSalesFetchStatus({ ok: true, count: salesList.length });
            setLatestSales(salesList);
        } catch (error) {
            console.error('Facturas - error fetching sales:', error);
            setSalesFetchStatus({ ok: false, message: (error as any)?.message || String(error) });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestSales();
    }, []);

    const salesInColombianDate = (sale: any) => {
        try {
            const d = new Date(sale.registrationDate);
            const parts = d.toLocaleString('es-ES', { timeZone: 'America/Bogota' });
            return new Date(parts);
        } catch (e) {
            return new Date(sale.registrationDate);
        }
    };

    const filterByDate = (dateStr: string) => {
        if (!dateStr) return latestSales;
        return latestSales.filter(s => {
            const d = salesInColombianDate(s);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}` === dateStr;
        });
    };

    const filterByMonth = (monthStr: string) => {
        if (!monthStr) return latestSales;
        return latestSales.filter(s => {
            const d = salesInColombianDate(s);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            return `${yyyy}-${mm}` === monthStr;
        });
    };

    const downloadBlob = (filename: string, blob: Blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const exportToExcel = async (rows: any[], filename: string) => {
        try {
            const XLSX = await import('xlsx');
            const prepared = rows.map(r => ({
                ID: r.id,
                Cliente: r.clientName || '',
                Fecha: new Date(r.registrationDate).toLocaleString('es-CO', { timeZone: 'America/Bogota' }),
                Tipo: r.type,
                Total: Number(r.total) || 0,
                Estado: r.isReverted ? 'Anulada' : 'Activa',
                Items: (r.items || []).map((it: any) => `${it.productName || it.productId} x${it.quantity} @${it.unitPrice}`).join(' ; ')
            }));

            const worksheet = XLSX.utils.json_to_sheet(prepared, { header: ['ID',t('sales.client') || 'Client',t('common.date') || 'Date','Tipo',t('common.total') || 'Total','Estado','Items'] });
            // Auto-width columns (approx)
            const cols = [{wpx:60},{wpx:160},{wpx:140},{wpx:80},{wpx:80},{wpx:80},{wpx:300}];
            worksheet['!cols'] = cols;
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');
            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            downloadBlob(filename, blob);
        } catch (error) {
            console.error('Error exporting to Excel:', error);
            showToast('Error al exportar a Excel', 'error');
        }
    };

    const exportToPDF = (rows: any[], title: string) => {
        try {
            const total = rows.reduce((acc, r) => acc + (Number(r.total) || 0), 0);
            const styles = `
                <style>
                    body{font-family:Arial,Helvetica,sans-serif;color:#111}
                    table{width:100%;border-collapse:collapse;margin-top:12px}
                    th,td{border:1px solid #ddd;padding:6px;font-size:12px}
                    th{background:#f3f4f6;text-align:left}
                    h1{font-size:18px;margin:0}
                    .meta{margin-top:8px;font-size:13px}
                </style>`;

            const rowsHtml = rows.map(r => `<tr>
                <td>${r.id}</td>
                <td>${(r.clientName||'')}</td>
                <td>${new Date(r.registrationDate).toLocaleString('es-CO', { timeZone: 'America/Bogota' })}</td>
                <td>${r.type}</td>
                <td style="text-align:right">${Number(r.total)||0}</td>
                <td>${r.isReverted ? 'Anulada' : 'Activa'}</td>
                <td>${(r.items||[]).map((it:any)=>`${it.productName||it.productId} x${it.quantity}`).join('<br/>')}</td>
            </tr>`).join('');

            const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>${styles}</head><body>
                <h1>${title}</h1>
                <div class="meta">Total: <strong>${total}</strong></div>
                <table>
                    <thead><tr><th>ID</th><th>{t('sales.client') || 'Client'}</th><th>{t('common.date') || 'Date'}</th><th>Tipo</th><th>{t('common.total') || 'Total'}</th><th>Estado</th><th>Items</th></tr></thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </body></html>`;

            const win = window.open('', '_blank');
            if (!win) {
                showToast('Permita ventanas emergentes para exportar a PDF', 'error');
                return;
            }
            win.document.open();
            win.document.write(html);
            win.document.close();
            win.focus();
            // wait a bit for render then print
            setTimeout(() => { win.print(); }, 500);
        } catch (error) {
            console.error('Error exporting to PDF:', error);
            showToast('Error al exportar a PDF', 'error');
        }
    };

    const exportSalesForDate = (dateStr: string, format: 'xlsx'|'pdf') => {
        const rows = filterByDate(dateStr);
        if (format === 'xlsx') {
            exportToExcel(rows, `ventas_${dateStr}.xlsx`);
        } else {
            exportToPDF(rows, `Ventas - ${dateStr}`);
        }
    };

    const exportSalesForMonth = (monthStr: string, format: 'xlsx'|'pdf') => {
        const rows = filterByMonth(monthStr);
        if (format === 'xlsx') {
            exportToExcel(rows, `ventas_${monthStr}.xlsx`);
        } else {
            exportToPDF(rows, `Ventas - ${monthStr}`);
        }
    };

    const handlePrintPDF = (saleId: string) => {
        const sale = latestSales.find(s => s.id === saleId);
        if (!sale) return showToast('No se encontró la factura', 'error');
        setSelectedSaleForView(null);
        setViewerSale(sale);
        setViewerMode('pdf');
    };

    const handlePrintPOS = (saleId: string) => {
        const sale = latestSales.find(s => s.id === saleId);
        if (!sale) return showToast('No se encontró la tirilla', 'error');
        setSelectedSaleForView(null);
        setViewerSale(sale);
        setViewerMode('pos');
    };

    const handleEditSale = async (sale: any) => {
        const confirmed = await confirm({
            title: 'Editar Venta',
            message: '¿Desea editar esta venta? Se anulará la venta actual y se cargarán sus productos en el carrito para que los modifiques.',
            type: 'warning',
            confirmText: 'Editar'
        });
        if (!confirmed) return;

        try {
            await saleUseCases.revertSale(sale.id);
            // Note: editing will create a new sale flow in Sales after redirect/user action
            showToast('Venta anulada. Abra Ventas para editar manualmente.', 'success');
            fetchLatestSales();
        } catch (error) {
            console.error('Error editing sale:', error);
            showToast('Error al editar la venta', 'error');
        }
    };

    const handleRevertSale = async (id: string) => {
        const confirmed = await confirm({
            title: 'Anular Venta',
            message: '¿Desea anular esta venta? El stock será devuelto.',
            type: 'danger',
            confirmText: 'Anular'
        });
        if (!confirmed) return;
        try {
            await saleUseCases.revertSale(id);
            showToast('Venta anulada con éxito', 'success');
            fetchLatestSales();
        } catch (error) {
            console.error('Error reverting sale:', error);
            showToast('Error al anular la venta', 'error');
        }
    };

    return (
        <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h3 className="text-xl font-bold">Facturas (Ventas del Día)</h3>
                    {salesFetchStatus && (
                        <span className={`text-xs ${salesFetchStatus.ok ? 'text-green-400' : 'text-destructive'}`}>
                            {salesFetchStatus.ok ? `(${salesFetchStatus.count} registros)` : '(error al obtener)'}
                        </span>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-xs">Fecha:</label>
                        <DateField value={filterDate} onChange={setFilterDate} type="date" />
                        <button disabled={!filterDate} onClick={() => exportSalesForDate(filterDate, 'xlsx')} className="text-xs px-3 py-1 bg-emerald-600 text-white rounded">Exportar día (Excel)</button>
                        <button disabled={!filterDate} onClick={() => exportSalesForDate(filterDate, 'pdf')} className="text-xs px-3 py-1 bg-blue-600 text-white rounded">Exportar día (PDF)</button>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs">Mes:</label>
                        <DateField value={filterMonth} onChange={setFilterMonth} type="month" />
                        <button disabled={!filterMonth} onClick={() => exportSalesForMonth(filterMonth, 'xlsx')} className="text-xs px-3 py-1 bg-emerald-600 text-white rounded">Exportar mes (Excel)</button>
                        <button disabled={!filterMonth} onClick={() => exportSalesForMonth(filterMonth, 'pdf')} className="text-xs px-3 py-1 bg-blue-600 text-white rounded">Exportar mes (PDF)</button>
                    </div>
                    <button onClick={fetchLatestSales} className="text-xs text-blue-400 hover:underline">Actualizar</button>
                </div>
            </div>

            <div className="glass p-4 sm:p-6">
                <div className="sm:hidden space-y-3">
                    {loading ? (
                        <p className="py-6 text-center text-muted-foreground text-sm">Cargando ventas...</p>
                    ) : latestSales.length === 0 ? (
                        <p className="py-8 text-center text-muted-foreground text-sm">No hay ventas registradas hoy</p>
                    ) : latestSales.map((sale) => (
                        <div key={sale.id} className={`bg-accent/20 rounded-xl p-3 space-y-2 ${sale.isReverted ? 'opacity-50 border border-red-500/20' : ''}`}>
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="font-mono text-[10px] text-muted-foreground truncate">#{sale.id}</p>
                                    <p className="font-bold text-sm truncate">{sale.clientName || t('sales.generalClient')}</p>
                                </div>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sale.type === 'ELECTRONIC' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                    {sale.type}
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-green-400 font-bold">{formatMoney((sale.total || 0))}</span>
                                <span className={`text-xs font-semibold ${sale.isReverted ? 'text-destructive' : 'text-green-400'}`}>
                                    {sale.isReverted ? 'Anulada' : 'Activa'}
                                </span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => setSelectedSaleForView(sale)} className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold">Ver</button>
                                {!sale.isReverted && (
                                    <button onClick={() => handleRevertSale(sale.id)} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold">Anular</button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="hidden sm:block overflow-x-auto">
                    <table className="min-w-[680px] w-full text-left text-sm">
                        <thead>
                            <tr className="text-muted-foreground border-b border-border">
                                <th className="pb-3 font-bold">ID</th>
                                <th className="pb-3 font-bold">{t('sales.client') || 'Client'}</th>
                                <th className="pb-3 font-bold">{t('common.total') || 'Total'}</th>
                                <th className="pb-3 font-bold">Tipo</th>
                                <th className="pb-3 font-bold">Estado</th>
                                <th className="pb-3 font-bold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">Cargando ventas...</td></tr>
                            ) : latestSales.length === 0 ? (
                                <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No hay ventas registradas hoy</td></tr>
                            ) : latestSales.map((sale) => (
                                <tr key={sale.id} className={`hover:bg-accent/10 ${sale.isReverted ? 'opacity-50' : ''}`}>
                                    <td className="py-3 font-mono text-xs">{sale.id}</td>
                                    <td className="py-3">{sale.clientName || t('sales.generalClient')}</td>
                                    <td className="py-3 font-bold text-green-400">{formatMoney((sale.total || 0))}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sale.type === 'ELECTRONIC' ? 'bg-blue-500/10 text-blue-400' : 'bg-green-500/10 text-green-400'}`}>
                                            {sale.type}
                                        </span>
                                    </td>
                                    <td className="py-3 text-xs">
                                        <span className={`font-semibold ${sale.isReverted ? 'text-destructive' : 'text-green-400'}`}>
                                            {sale.isReverted ? 'Anulada' : 'Activa'}
                                        </span>
                                    </td>
                                    <td className="py-3 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button onClick={() => setSelectedSaleForView(sale)} className="p-2 hover:bg-accent rounded-lg text-blue-400" title="Ver Detalle">
                                                <Eye size={16} />
                                            </button>
                                            {!sale.isReverted && (
                                                <>
                                                    <button onClick={() => handleEditSale(sale)} className="p-2 hover:bg-accent rounded-lg text-amber-400" title="Editar Venta">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleRevertSale(sale.id)} className="p-2 hover:bg-accent rounded-lg text-destructive" title="Anular Venta">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ViewSaleModal
                isOpen={!!selectedSaleForView}
                onClose={() => setSelectedSaleForView(null)}
                sale={selectedSaleForView}
                onPrintPDF={handlePrintPDF}
                onPrintPOS={handlePrintPOS}
            />

            {/* Full-screen invoice/pos viewer — rendered on top of everything */}
            <InvoiceViewerModal
                mode={viewerMode}
                sale={viewerSale}
                onClose={() => { setViewerMode(null); setViewerSale(null); }}
            />
        </div>
    );
};

export default Facturas;
