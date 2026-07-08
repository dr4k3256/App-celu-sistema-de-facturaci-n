import {
    ICategoryRepository,
    IClientRepository,
    ICreditRepository,
    IExpenseRepository,
    IFinanceRepository,
    IProductRepository,
    ISaleRepository,
    IStockRepository,
    IBackupRepository
} from '../domain/ports';
import { Category, Client, Product, Sale, StockMovement } from '../domain/models';
import { getLocalDateTime, getLocalDate, getLocalMonth } from './timezoneUtils';

const DB_KEY = 'sistema_facturacion_sqlite_local_v1';

type LocalDb = {
    categories: Category[];
    clients: Client[];
    products: Product[];
    sales: Sale[];
    credits: any[];
    expenses: any[];
    stockMovements: StockMovement[];
};

const emptyDb = (): LocalDb => ({
    categories: [{ id: 1, name: 'General' }],
    clients: [],
    products: [],
    sales: [],
    credits: [],
    expenses: [],
    stockMovements: []
});

const readDb = (): LocalDb => {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) return emptyDb();
    try {
        const parsed = JSON.parse(raw);
        const merged = { ...emptyDb(), ...parsed };
        return {
            categories: Array.isArray(merged.categories) ? merged.categories : [{ id: 1, name: 'General' }],
            clients: Array.isArray(merged.clients) ? merged.clients : [],
            products: Array.isArray(merged.products) ? merged.products : [],
            sales: Array.isArray(merged.sales) ? merged.sales : [],
            credits: Array.isArray(merged.credits) ? merged.credits : [],
            expenses: Array.isArray(merged.expenses) ? merged.expenses : [],
            stockMovements: Array.isArray(merged.stockMovements) ? merged.stockMovements : []
        };
    } catch {
        return emptyDb();
    }
};

const writeDb = (db: LocalDb) => {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
};

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const getVariantDescription = (product: Product | undefined, variantId: string) => {
    const variant = product?.variants?.find(v => v.id === variantId);
    return Object.values(variant?.attributes || {}).join(' / ') || 'Unica';
};

const normalizeVariant = (variant: any, fallbackId?: string) => ({
    id: variant?.id || fallbackId || uid('VAR'),
    sku: variant?.sku || '',
    attributes: variant?.attributes || Object.fromEntries((variant?.attributeList || []).filter((a: any) => a.key).map((a: any) => [a.key, a.value])),
    stock: Number(variant?.stock) || 0
});

export const LocalProductAdapter: IProductRepository = {
    findAll: async (page = 0, size = 15) => {
        const db = readDb();
        const start = page * size;
        return { content: db.products.slice(start, start + size), totalElements: db.products.length };
    },
    findById: async (id: string) => {
        const product = readDb().products.find(p => p.id === id);
        if (!product) throw new Error('Producto no encontrado');
        return product;
    },
    search: async (query: string) => {
        const q = query.toLowerCase();
        return readDb().products.filter(p => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
    },
    save: async (product: Partial<Product> & { _isNew?: boolean }) => {
        const db = readDb();
        const id = product.id?.trim() || uid('PROD');
        const category = product.category || db.categories[0] || { id: 1, name: 'General' };
        const prepared: Product = {
            id,
            name: product.name || 'Producto sin nombre',
            category,
            normalPrice: Number(product.normalPrice) || 0,
            wholesalePrice: Number(product.wholesalePrice) || Number(product.normalPrice) || 0,
            variants: (product.variants?.length ? product.variants : [{ id: uid('VAR'), sku: '', attributes: { Tipo: 'Unico' }, stock: 0 }]).map((v: any) => normalizeVariant(v, uid('VAR'))),
            createdAt: product.createdAt || getLocalDateTime()
        };
        const index = db.products.findIndex(p => p.id === id);
        if (index >= 0) db.products[index] = prepared;
        else db.products.unshift(prepared);
        writeDb(db);
        return prepared;
    },
    delete: async (id: string) => {
        const db = readDb();
        db.products = db.products.filter(p => p.id !== id);
        writeDb(db);
    }
};

export const LocalSaleAdapter: ISaleRepository = {
    register: async (payload: any) => {
        const db = readDb();
        const items = (payload.items || []).map((item: any) => {
            const product = db.products.find(p => p.id === item.productId);
            const variant = product?.variants?.find(v => v.id === item.variantId);
            if (variant) {
                variant.stock = Math.max(0, Number(variant.stock) - Number(item.quantity || 1));
            }

            db.stockMovements.unshift({
                id: uid('MOV'),
                productId: item.productId,
                productName: product?.name || item.productName || item.productId,
                variantId: item.variantId,
                variantDescription: item.variantDescription || getVariantDescription(product, item.variantId),
                quantity: -(Number(item.quantity) || 1),
                type: 'SALE',
                date: getLocalDateTime(),
                reason: 'Venta'
            });

            return {
                productId: item.productId,
                variantId: item.variantId,
                productName: product?.name || item.productName || item.productId,
                variantDescription: item.variantDescription || getVariantDescription(product, item.variantId),
                quantity: Number(item.quantity) || 1,
                unitPrice: Number(item.unitPrice) || 0,
                subtotal: (Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)
            };
        });
        const sale: Sale = {
            id: uid('FAC'),
            items,
            total: items.reduce((acc: number, item: any) => acc + item.subtotal, 0),
            registrationDate: getLocalDateTime(),
            clientName: payload.clientName || 'Cliente General',
            type: payload.type || 'POS',
            isReverted: false
        };
        db.sales.unshift(sale);
        writeDb(db);
        return sale;
    },
    findAll: async (page = 0, size = 15) => {
        const db = readDb();
        const start = page * size;
        return { content: db.sales.slice(start, start + size), totalElements: db.sales.length };
    },
    revert: async (id: string) => {
        const db = readDb();
        const sale = db.sales.find(s => s.id === id);
        if (!sale || sale.isReverted) return;

        sale.isReverted = true;

        (sale.items || []).forEach((item: any) => {
            const product = db.products.find(p => p.id === item.productId);
            const variant = product?.variants?.find(v => v.id === item.variantId);
            if (variant) {
                variant.stock = Number(variant.stock) + Number(item.quantity || 1);
            }

            db.stockMovements.unshift({
                id: uid('MOV'),
                productId: item.productId,
                productName: product?.name || item.productName || item.productId,
                variantId: item.variantId,
                variantDescription: item.variantDescription || getVariantDescription(product, item.variantId),
                quantity: Number(item.quantity) || 1,
                type: 'RETURN',
                date: getLocalDateTime(),
                reason: 'Reversión de venta'
            });
        });

        writeDb(db);
    }
};

export const LocalCategoryAdapter: ICategoryRepository = {
    findAll: async () => readDb().categories,
    save: async (category: Partial<Category>) => {
        const db = readDb();
        const saved = { id: Date.now(), name: category.name || 'General' };
        db.categories.push(saved);
        writeDb(db);
        return saved;
    }
};

export const LocalClientAdapter: IClientRepository = {
    findAll: async () => readDb().clients,
    save: async (client: Partial<Client>) => {
        const db = readDb();
        const saved = { id: client.id || uid('CLI'), name: client.name || 'Cliente', phone: client.phone || '' };
        db.clients.unshift(saved);
        writeDb(db);
        return saved;
    }
};

export const LocalExpenseAdapter: IExpenseRepository = {
    findAll: async () => readDb().expenses,
    save: async (expense: any) => {
        const db = readDb();
        const saved = { ...expense, id: expense.id || Date.now(), date: expense.date || getLocalDate() };
        db.expenses.unshift(saved);
        writeDb(db);
        return saved;
    },
    delete: async (id: string) => {
        const db = readDb();
        db.expenses = db.expenses.filter(e => String(e.id) !== String(id));
        writeDb(db);
    }
};

export const LocalCreditAdapter: ICreditRepository = {
    findAll: async () => readDb().credits,
    findByClient: async (clientId: string) => readDb().credits.filter(c => c.clientId === clientId),
    create: async (credit: any) => {
        const db = readDb();
        const amount = (credit.items || []).reduce((acc: number, item: any) => acc + Number(item.price || item.unitPrice || 0) * Number(item.quantity || 1), 0);
        const saved = { ...credit, id: uid('CRE'), amount, paidAmount: 0, status: 'PENDING', createdAt: getLocalDateTime() };
        db.credits.unshift(saved);
        writeDb(db);
        return saved;
    },
    addInstallment: async (id: string, amount: number, method: string) => {
        const db = readDb();
        const credit = db.credits.find(c => c.id === id);
        if (!credit) throw new Error('Credito no encontrado');
        credit.paidAmount = Math.min(Number(credit.amount) || 0, Number(credit.paidAmount || 0) + Number(amount || 0));
        credit.status = credit.paidAmount >= credit.amount ? 'PAID' : 'PENDING';
        credit.installmentsHistory = [...(credit.installmentsHistory || []), { amount, method, date: getLocalDateTime() }];
        writeDb(db);
        return credit;
    },
    delete: async (id: string) => {
        const db = readDb();
        db.credits = db.credits.filter(c => c.id !== id);
        writeDb(db);
    }
};

export const LocalFinanceAdapter: IFinanceRepository = {
    getReport: async (month: number, year: number) => {
        const db = readDb();
        const key = `${year}-${String(month).padStart(2, '0')}`;
        const sales = db.sales.filter(s => !s.isReverted && s.registrationDate.startsWith(key));
        const expenses = db.expenses.filter(e => e.date?.startsWith(key));
        const totalSales = sales.reduce((acc, s) => acc + Number(s.total || 0), 0);
        const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
        return { totalSales, totalExpenses, utility: totalSales - totalExpenses, month, year };
    },
    getDashboardStats: async () => {
        const db = readDb();
        const today = getLocalDate();
        const month = getLocalMonth();
        const todaySalesRows = db.sales.filter(s => !s.isReverted && s.registrationDate.startsWith(today));
        const monthExpenses = db.expenses.filter(e => e.date?.startsWith(month));
        const todaySales = todaySalesRows.reduce((acc, s) => acc + Number(s.total || 0), 0);
        const totalExpenses = monthExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
        const sold: Record<string, number> = {};
        todaySalesRows.forEach(s => s.items.forEach(i => sold[i.productName] = (sold[i.productName] || 0) + Number(i.quantity || 0)));
        const topProductsTodayList = Object.entries(sold).map(([name, quantity]) => ({ name, quantity }));
        return {
            todaySales,
            totalExpenses,
            utility: todaySales - totalExpenses,
            totalProductsSoldToday: topProductsTodayList.reduce((acc, item) => acc + item.quantity, 0),
            topProductsTodayList,
            topProductsWeekList: topProductsTodayList
        };
    }
};

export const LocalStockAdapter: IStockRepository = {
    getMovements: async () => readDb().stockMovements,
    getHistory: async (productId: string) => readDb().stockMovements.filter(m => m.productId === productId),
    deleteMovements: async () => {
        const db = readDb();
        db.stockMovements = [];
        writeDb(db);
    }
};

export const LocalBackupAdapter: IBackupRepository = {
    exportData: async () => {
        const db = readDb();
        return JSON.stringify(db);
    },
    importData: async (data: string) => {
        const parsed = JSON.parse(data);
        if (!parsed.products || !parsed.sales) throw new Error('Archivo de copia de seguridad inválido');
        writeDb(parsed);
    }
};
