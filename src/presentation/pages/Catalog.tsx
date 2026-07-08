import { formatMoney } from '../../infrastructure/invoiceTemplates';
import React from 'react';
import { useTranslation } from 'react-i18next';
import  { useState, useEffect } from 'react';
import { Package, Search, Plus, Trash2, Edit2, Archive, DollarSign } from 'lucide-react';
import { useDependencies } from '../../application/DependenciesContext';
import { Product } from '../../domain/models';
import { useAlert } from '../context/AlertContext';

const ProductModal = ({ isOpen, onClose, onSave, categories, onAddCategory, initialData }: any) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState<any>({
        id: '', name: '', category: null, normalPrice: 0, wholesalePrice: 0,
        variants: [{ id: Math.random().toString(36).substr(2, 9), sku: '', attributeList: [{ key: '', value: '' }], stock: 0 }]
    });
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        if (initialData) {
            // Normalise: if coming from API with { attributes: { Talla: 'M' } } -> attributeList
            const normalised = {
                ...initialData,
                variants: (initialData.variants || []).map((v: any) => ({
                    ...v,
                    attributeList: v.attributeList ?? Object.entries(v.attributes || {}).map(([key, value]) => ({ key, value }))
                }))
            };
            setFormData(normalised);
        } else setFormData({
            id: '', name: '', category: null, normalPrice: 0, wholesalePrice: 0,
            variants: [{ id: Math.random().toString(36).substr(2, 9), sku: '', attributeList: [{ key: '', value: '' }], stock: 0 }]
        });
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { id: Math.random().toString(36).substr(2, 9), sku: '', attributeList: [{ key: '', value: '' }], stock: 0 }]
        });
    };

    const removeVariant = (index: number) => {
        const newVariants = [...formData.variants];
        newVariants.splice(index, 1);
        setFormData({ ...formData, variants: newVariants });
    };

    const addAttribute = (variantIndex: number) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].attributeList = [...newVariants[variantIndex].attributeList, { key: '', value: '' }];
        setFormData({ ...formData, variants: newVariants });
    };

    const removeAttribute = (variantIndex: number, attrIndex: number) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].attributeList.splice(attrIndex, 1);
        setFormData({ ...formData, variants: newVariants });
    };

    const updateAttribute = (variantIndex: number, attrIndex: number, field: 'key' | 'value', val: string) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].attributeList[attrIndex][field] = val;
        setFormData({ ...formData, variants: newVariants });
    };

    const updateVariantStock = (variantIndex: number, val: number) => {
        const newVariants = [...formData.variants];
        newVariants[variantIndex].stock = val;
        setFormData({ ...formData, variants: newVariants });
    };

    const handleSave = () => {
        const prepared = {
            ...formData,
            variants: formData.variants.map((v: any) => ({
                ...v,
                attributes: Object.fromEntries((v.attributeList || []).filter((a: any) => a.key).map((a: any) => [a.key, a.value]))
            }))
        };
        onSave(prepared);
    };

    const handleSaveCategory = async () => {
        if (!newCategoryName) return;
        const saved = await onAddCategory(newCategoryName);
        setFormData({ ...formData, category: saved });
        setIsAddingCategory(false);
        setNewCategoryName('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 border-t-4 border-blue-500">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">{initialData ? 'Editar Producto' : t('catalog.addProduct')}</h3>
                    <button onClick={onClose} className="text-muted-foreground hover:text-white">✕</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">ID del Producto (Personalizable)</label>
                        <input
                            type="text"
                            className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2"
                            value={formData.id}
                            onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                            placeholder="Ej: PROD-001"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Nombre del Producto</label>
                        <input
                            type="text"
                            className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">{t('catalog.category')}</label>
                        {!isAddingCategory ? (
                            <div className="flex gap-2">
                                <select
                                    className="flex-1 bg-accent/30 border border-border rounded-lg px-4 py-2"
                                    value={formData.category?.id || ''}
                                    onChange={(e) => {
                                        const cat = categories.find((c: any) => c.id === parseInt(e.target.value));
                                        setFormData({ ...formData, category: cat });
                                    }}
                                >
                                    <option value="">Seleccionar...</option>
                                    {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setIsAddingCategory(true)}
                                    className="p-2 bg-blue-600/20 text-blue-400 rounded-lg"
                                    title="Nueva Categoría"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-accent/30 border border-border rounded-lg px-4 py-2"
                                    placeholder="Nombre de categoría"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                />
                                <button onClick={handleSaveCategory} className="px-3 bg-green-600 text-white rounded-lg text-xs">Guardar</button>
                                <button onClick={() => setIsAddingCategory(false)} className="px-3 bg-destructive/20 text-destructive rounded-lg text-xs">✕</button>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">{t('catalog.price') || 'Normal Price'}</label>
                        <input
                            type="number"
                            className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2"
                            value={formData.normalPrice}
                            onChange={(e) => setFormData({ ...formData, normalPrice: parseFloat(e.target.value) })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">{t('catalog.wholesalePrice') || 'Wholesale Price'}</label>
                        <input
                            type="number"
                            className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2"
                            value={formData.wholesalePrice}
                            onChange={(e) => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) })}
                        />
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-blue-400">Variantes y Stock (Subcategorías)</h4>
                            <p className="text-[11px] text-muted-foreground mt-1">Cada variante tiene su propio stock; el inventario se maneja por la variante seleccionada.</p>
                        </div>
                        <button onClick={addVariant} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-1">
                            <Plus size={14} /> Añadir Variante
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.variants.map((v: any, vIdx: number) => (
                            <div key={v.id} className="p-4 bg-accent/10 rounded-xl border border-border/50 space-y-3">
                                {/* Variant header */}
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-blue-400 uppercase">Variante {vIdx + 1}</span>
                                    <button
                                        onClick={() => removeVariant(vIdx)}
                                        disabled={formData.variants.length === 1}
                                        className="p-1.5 text-destructive hover:text-destructive/90 font-bold hover:bg-destructive/20 rounded-lg disabled:opacity-30 text-xs flex items-center gap-1 transition-colors"
                                    >
                                        <Trash2 size={14} className="text-destructive" /> Eliminar variante
                                    </button>
                                </div>

                                {/* Dynamic attributes */}
                                <div className="space-y-2">
                                    {v.attributeList.map((attr: any, aIdx: number) => (
                                        <div key={aIdx} className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
                                            <input
                                                type="text"
                                                placeholder="Nombre (Ej: Talla, Color, Material)"
                                                className="bg-accent/30 border border-border rounded-md px-2 py-1 text-xs w-full min-w-0"
                                                value={attr.key}
                                                onChange={e => updateAttribute(vIdx, aIdx, 'key', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Valor (Ej: XL, Rojo, Algodón)"
                                                className="bg-accent/30 border border-border rounded-md px-2 py-1 text-xs w-full min-w-0"
                                                value={attr.value}
                                                onChange={e => updateAttribute(vIdx, aIdx, 'value', e.target.value)}
                                            />
                                            <button
                                                onClick={() => removeAttribute(vIdx, aIdx)}
                                                disabled={v.attributeList.length === 1}
                                                className="p-1 text-destructive hover:bg-destructive/10 rounded disabled:opacity-30 self-end sm:self-auto"
                                            >
                                                <Trash2 size={12} className="text-destructive" />
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addAttribute(vIdx)}
                                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 mt-1"
                                    >
                                        <Plus size={12} /> Añadir atributo
                                    </button>
                                </div>

                                {/* Stock field */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                    <label className="text-[10px] font-bold uppercase text-muted-foreground whitespace-nowrap">{t('catalog.stock')} de esta variante</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-24 bg-accent/30 border border-border rounded-md px-2 py-1 text-sm"
                                        value={v.stock}
                                        onChange={e => updateVariantStock(vIdx, parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end space-x-3 mt-8">
                    <button onClick={onClose} className="px-6 py-2 glass rounded-lg font-medium">Cancelar</button>
                    <button
                        onClick={handleSave}
                        className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all shadow-lg shadow-blue-500/20"
                    >
                        Guardar Producto
                    </button>
                </div>
            </div>
        </div>
    );
};

const Catalog = () => {
    const { t } = useTranslation();
    const { productUseCases, categoryUseCases } = useDependencies();
    const { showToast, confirm } = useAlert();
    const [searchTerm, setSearchTerm] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const exportProductsExcel = async () => {
        try {
            const data: any = await productUseCases.getProducts(0, 1000);
            const products = Array.isArray(data) ? data : (data?.content || []);

            const XLSX = await import('xlsx');
            const rows = products.map((p: any) => ({
                ID: p.id,
                Nombre: p.name,
                Categoria: p.category?.name || '',
                [t('catalog.price') || 'Normal Price']: p.normalPrice ?? 0,
                [t('catalog.wholesalePrice') || 'Wholesale Price']: p.wholesalePrice ?? p.normalPrice ?? 0,
                Variantes: (p.variants || []).map((v: any) => `${Object.values(v.attributes||{}).join('/')}:${v.stock}`).join(' | '),
                StockTotal: (p.variants || []).reduce((acc: number, v: any) => acc + (v.stock || 0), 0)
            }));

            const worksheet = XLSX.utils.json_to_sheet(rows, { header: ['ID',t('catalog.name') || 'Name','Categoria',t('catalog.price') || 'Normal Price',t('catalog.wholesalePrice') || 'Wholesale Price',t('catalog.variants') || 'Variants',t('catalog.stock') || 'Total Stock'] });
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Productos');
            const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([wbout], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `productos_${new Date().toISOString().slice(0,10)}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error exporting products to Excel:', error);
            showToast('Error al exportar productos', 'error');
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const buffer = await file.arrayBuffer();
            const XLSX = await import('xlsx');
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsed: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

            if (!Array.isArray(parsed)) {
                showToast('Archivo inválido', 'error');
                return;
            }

            for (const row of parsed) {
                const product: any = {
                    id: row['ID'] || row['Id'] || row['id'] || undefined,
                    name: row[t('catalog.name') || 'Name'] || row['Name'] || row['name'] || '',
                    normalPrice: Number(row[t('catalog.price') || 'Normal Price'] ?? row['normalPrice'] ?? 0) || 0,
                    wholesalePrice: Number(row[t('catalog.wholesalePrice') || 'Wholesale Price'] ?? row['wholesalePrice'] ?? 0) || 0,
                };

                try {
                    await productUseCases.saveProduct(product);
                } catch (err) {
                    console.error('Error importing product', product, err);
                }
            }

            showToast('Importación finalizada', 'success');
            fetchData();
        } catch (error) {
            console.error('Error importing file:', error);
            showToast('Error al importar productos', 'error');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [pData, cData] = await Promise.all([
                productUseCases.getProducts(page, 15),
                categoryUseCases.getCategories()
            ]);

            if (Array.isArray(pData)) {
                setProducts(pData);
                setTotal(pData.length);
            } else if (pData && pData.content) {
                setProducts(pData.content);
                setTotal(pData.totalElements || 0);
            } else {
                setProducts([]);
                setTotal(0);
            }

            setCategories(cData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [page]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            fetchData();
            return;
        }
        setLoading(true);
        try {
            const results: any = await productUseCases.searchProducts(searchTerm);
            if (Array.isArray(results)) {
                setProducts(results);
                setTotal(results.length);
            } else if (results && results.content) {
                setProducts(results.content);
                setTotal(results.totalElements);
            } else {
                setProducts([]);
                setTotal(0);
            }
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (formData: any) => {
        try {
            const payload = { ...formData, _isNew: !editingProduct };
            await productUseCases.saveProduct(payload);
            setModalOpen(false);
            setEditingProduct(null);
            fetchData();
            showToast('Producto guardado', 'success');
        } catch (error) {
            console.error('Error saving product:', error);
            showToast('Error al guardar el producto. Verifique que el ID sea único.', 'error');
        }
    };

    const handleDeleteProduct = async (id: string) => {
        const confirmed = await confirm({
            title: 'Eliminar Producto',
            message: '¿Desea eliminar este producto? Se registrará un movimiento de salida de stock.',
            type: 'danger',
            confirmText: t('common.delete')
        });
        if (!confirmed) return;
        try {
            await productUseCases.deleteProduct(id);
            showToast('Producto eliminado con éxito', 'success');
            fetchData();
        } catch (error) {
            console.error('Error deleting product:', error);
            showToast('Error al eliminar el producto', 'error');
        }
    };

    const handleAddCategory = async (name: string) => {
        try {
            const saved = await categoryUseCases.saveCategory({ name });
            setCategories([...categories, saved]);
            return saved;
        } catch (error) {
            console.error('Error adding category:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold">{t('catalog.title')}</h3>
                    <div className="flex flex-wrap items-center gap-2 ml-auto">
                        <button onClick={exportProductsExcel} className="text-xs px-3 py-2 bg-emerald-600 text-white rounded">Export (Excel)</button>
                        <button onClick={handleImportClick} className="text-xs px-3 py-2 bg-blue-600 text-white rounded">Import (Excel)</button>
                        <input ref={fileInputRef} type="file" accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" onChange={handleImportFile} className="hidden" />
                        <button
                            onClick={() => { setEditingProduct(null); setModalOpen(true); }}
                            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            <Plus size={20} />
                            <span>{t('catalog.addProduct')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder={t('catalog.search')}
                        className="w-full bg-accent/50 border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{t('common.search')}</button>
                    <button type="button" className="glass flex items-center space-x-2 px-4 py-2 text-sm" onClick={() => fetchData()}>
                        <span>Clear</span>
                    </button>
                </div>
            </form>

            <div className="glass overflow-hidden shadow-2xl w-full">
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left min-w-[800px]">
                        <thead>
                            <tr className="text-muted-foreground text-xs uppercase tracking-widest border-b border-border">
                                <th className="p-4 font-bold">{t('catalog.name')}</th>
                                <th className="p-4 font-bold">{t('catalog.category')}</th>
                                <th className="p-4 font-bold">{t('catalog.price')}</th>
                                <th className="p-4 font-bold">{t('catalog.wholesalePrice')}</th>
                                <th className="p-4 font-bold text-center">{t('catalog.stock')}</th>
                                <th className="p-4 font-bold text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground animate-pulse">Cargando catálogo...</td></tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-16 text-center text-muted-foreground">
                                        <Package size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No hay productos en el catálogo</p>
                                    </td>
                                </tr>
                            ) : products.map((product) => (
                                <tr key={product.id} className="hover:bg-accent/30 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{product.name}</span>
                                            <span className="text-[10px] text-muted-foreground font-mono mt-0.5">ID: {product.id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="px-3 py-1 bg-accent rounded-full text-xs font-medium border border-border">
                                            {product.category?.name || 'General'}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-emerald-400">
                                        {formatMoney(product.normalPrice || 0)}
                                    </td>
                                    <td className="p-4 font-medium text-blue-400">
                                        {formatMoney(product.wholesalePrice || 0)}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1 items-center">
                                            {(product.variants || []).map((v: any, i: number) => (
                                                <div key={i} className="flex items-center gap-2 text-xs">
                                                    <span className="text-muted-foreground">{Object.values(v.attributes || {}).join('/')}:</span>
                                                    <span className={`font-black ${v.stock <= 5 ? 'text-destructive' : 'text-blue-400'}`}>{v.stock}</span>
                                                </div>
                                            ))}
                                            {(!product.variants || product.variants.length === 0) && (
                                                <span className="text-destructive font-bold text-xs">Sin stock</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 flex justify-end gap-2">
                                        <button
                                            onClick={() => { setEditingProduct(product); setModalOpen(true); }}
                                            className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                            title={t('common.edit')}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduct(product.id)}
                                            className="p-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-lg transition-colors"
                                            title={t('common.delete')}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > 15 && (
                    <div className="p-4 border-t border-border flex justify-between items-center bg-accent/5">
                        <span className="text-xs text-muted-foreground">Mostrando {products.length} de {total}</span>
                        <div className="flex gap-2">
                            <button
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}
                                className="px-3 py-1 glass rounded text-xs disabled:opacity-30"
                            >
                                Anterior
                            </button>
                            <button
                                disabled={(page + 1) * 15 >= total}
                                onClick={() => setPage(page + 1)}
                                className="px-3 py-1 glass rounded text-xs disabled:opacity-30"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <ProductModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSave={handleSaveProduct}
                categories={categories}
                onAddCategory={handleAddCategory}
                initialData={editingProduct}
            />
        </div>
    );
};

export default Catalog;
