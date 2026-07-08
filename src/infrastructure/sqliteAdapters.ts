import { Capacitor } from '@capacitor/core';
import { SQLiteConnection, capSQLiteChanges } from '@capacitor-community/sqlite';
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

const DB_NAME = 'sistema_facturacion_db';
const DATA_KEY = 'app_db_json';

const sqliteConn = new SQLiteConnection(Capacitor);
let connection: any = null;

const ensureConnection = async () => {
    if (connection) return connection;
    try {
        const isConn = await sqliteConn.isConnection({ database: DB_NAME, readonly: false });
        if (isConn.result) {
            connection = await sqliteConn.retrieveConnection({ database: DB_NAME, readonly: false });
        } else {
            connection = await sqliteConn.createConnection({ database: DB_NAME, version: 1, encrypted: false, mode: 'no-encryption', readonly: false });
        }
        await connection.open();
        await connection.execute(`CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT);`);
        return connection;
    } catch (e) {
        connection = null;
        throw e;
    }
};

const readDb = async (): Promise<any> => {
    try {
        const conn = await ensureConnection();
        const res = await conn.query(`SELECT value FROM kv WHERE key = ?;`, [DATA_KEY]);
        if (res && res.values && res.values.length) {
            const parsed = JSON.parse(res.values[0].value || '{}');
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
        }
        return emptyDb();
    } catch (e) {
        throw e;
    }
};

const writeDb = async (data: any) => {
    const conn = await ensureConnection();
    const json = JSON.stringify(data);
    await conn.run(`INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?);`, [DATA_KEY, json]);
};

const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const emptyDb = () => ({
    categories: [{ id: 1, name: 'General' }],
    clients: [],
    products: [],
    sales: [],
    credits: [],
    expenses: [],
    stockMovements: []
});

const ensureDb = async () => {
    const db = await readDb();
    await writeDb(db);
    return db;
};

const normalizeVariant = (variant: any, fallbackId?: string) => ({
    id: variant?.id || fallbackId || uid('VAR'),
    sku: variant?.sku || '',
    attributes: variant?.attributes || {},
    stock: Number(variant?.stock) || 0
});

/* Helper wrappers to expose same shape as local adapters but backed by sqlite */

export const SqliteProductAdapter: IProductRepository = {
    findAll: async (page = 0, size = 15) => {
        const db = (await readDb());
        const start = page * size;
        return { content: db.products.slice(start, start + size), totalElements: db.products.length };
    },
    findById: async (id: string) => {
        const db = (await readDb());
        const product = db.products.find((p: any) => p.id === id);
        if (!product) throw new Error('Producto no encontrado');
        return product;
    },
    search: async (query: string) => {
        const q = query.toLowerCase();
        const db = (await readDb());
        return db.products.filter((p: any) => p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q));
    },
    save: async (product: Partial<Product> & { _isNew?: boolean }) => {
        const db = (await readDb());
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
        const index = db.products.findIndex((p: any) => p.id === id);
        if (index >= 0) db.products[index] = prepared;
        else db.products.unshift(prepared);
        await writeDb(db);
        return prepared;
    },
    delete: async (id: string) => {
        const db = (await readDb());
        db.products = db.products.filter((p: any) => p.id !== id);
        await writeDb(db);
    }
};

export const SqliteSaleAdapter: ISaleRepository = {
    register: async (payload: any) => {
        const db = (await readDb());
        const items = (payload.items || []).map((item: any) => {
            const product = db.products.find((p: any) => p.id === item.productId);
            const variant = product?.variants?.find((v: any) => v.id === item.variantId);
            if (variant) {
                variant.stock = Math.max(0, Number(variant.stock) - Number(item.quantity || 1));
            }

            db.stockMovements.unshift({
                id: uid('MOV'),
                productId: item.productId,
                productName: product?.name || item.productName || item.productId,
                variantId: item.variantId,
                variantDescription: item.variantDescription || (variant ? Object.values(variant.attributes || {}).join(' / ') : 'Unica'),
                quantity: -(Number(item.quantity) || 1),
                type: 'SALE',
                date: getLocalDateTime(),
                reason: 'Venta'
            });

            return {
                productId: item.productId,
                variantId: item.variantId,
                productName: product?.name || item.productName || item.productId,
                variantDescription: item.variantDescription || (variant ? Object.values(variant.attributes || {}).join(' / ') : 'Unica'),
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
        await writeDb(db);
        return sale;
    },
    findAll: async (page = 0, size = 15) => {
        const db = (await readDb());
        const start = page * size;
        return { content: db.sales.slice(start, start + size), totalElements: db.sales.length };
    },
    revert: async (id: string) => {
        const db = (await readDb());
        const sale = db.sales.find((s: any) => s.id === id);
        if (!sale || sale.isReverted) return;

        sale.isReverted = true;

        (sale.items || []).forEach((item: any) => {
            const product = db.products.find((p: any) => p.id === item.productId);
            const variant = product?.variants?.find((v: any) => v.id === item.variantId);
            if (variant) {
                variant.stock = Number(variant.stock) + Number(item.quantity || 1);
            }

            db.stockMovements.unshift({
                id: uid('MOV'),
                productId: item.productId,
                productName: product?.name || item.productName || item.productId,
                variantId: item.variantId,
                variantDescription: item.variantDescription || (variant ? Object.values(variant.attributes || {}).join(' / ') : 'Unica'),
                quantity: Number(item.quantity) || 1,
                type: 'RETURN',
                date: getLocalDateTime(),
                reason: 'Reversión de venta'
            });
        });

        await writeDb(db);
    }
};

export const SqliteCategoryAdapter: ICategoryRepository = {
    findAll: async () => {
        const db = (await readDb());
        return db.categories;
    },
    save: async (category: Partial<Category>) => {
        const db = (await readDb());
        const saved = { id: Date.now(), name: category.name || 'General' };
        db.categories.push(saved);
        await writeDb(db);
        return saved;
    }
};

export const SqliteClientAdapter: IClientRepository = {
    findAll: async () => {
        const db = (await readDb());
        return db.clients;
    },
    save: async (client: Partial<Client>) => {
        const db = (await readDb());
        const saved = { id: client.id || uid('CLI'), name: client.name || 'Cliente', phone: client.phone || '' };
        db.clients.unshift(saved);
        await writeDb(db);
        return saved;
    }
};

export const SqliteExpenseAdapter: IExpenseRepository = {
    findAll: async () => {
        const db = (await readDb());
        return db.expenses;
    },
    save: async (expense: any) => {
        const db = (await readDb());
        const saved = { ...expense, id: expense.id || Date.now(), date: expense.date || getLocalDate() };
        db.expenses.unshift(saved);
        await writeDb(db);
        return saved;
    },
    delete: async (id: string) => {
        const db = (await readDb());
        db.expenses = db.expenses.filter((e: any) => String(e.id) !== String(id));
        await writeDb(db);
    }
};

export const SqliteCreditAdapter: ICreditRepository = {
    findAll: async () => {
        const db = (await readDb());
        return db.credits;
    },
    findByClient: async (clientId: string) => {
        const db = (await readDb());
        return db.credits.filter((c: any) => c.clientId === clientId);
    },
    create: async (credit: any) => {
        const db = (await readDb());
        const amount = (credit.items || []).reduce((acc: number, item: any) => acc + Number(item.price || item.unitPrice || 0) * Number(item.quantity || 1), 0);
        const saved = { ...credit, id: uid('CRE'), amount, paidAmount: 0, status: 'PENDING', createdAt: getLocalDateTime() };
        db.credits.unshift(saved);
        await writeDb(db);
        return saved;
    },
    addInstallment: async (id: string, amount: number, method: string) => {
        const db = (await readDb());
        const credit = db.credits.find((c: any) => c.id === id);
        if (!credit) throw new Error('Credito no encontrado');
        credit.paidAmount = Math.min(Number(credit.amount) || 0, Number(credit.paidAmount || 0) + Number(amount || 0));
        credit.status = credit.paidAmount >= credit.amount ? 'PAID' : 'PENDING';
        credit.installmentsHistory = [...(credit.installmentsHistory || []), { amount, method, date: getLocalDateTime() }];
        await writeDb(db);
        return credit;
    },
    delete: async (id: string) => {
        const db = (await readDb());
        db.credits = db.credits.filter((c: any) => c.id !== id);
        await writeDb(db);
    }
};

export const SqliteFinanceAdapter: IFinanceRepository = {
    getReport: async (month: number, year: number) => {
        const db = (await readDb());
        const key = `${year}-${String(month).padStart(2, '0')}`;
        const sales = db.sales.filter((s: any) => !s.isReverted && s.registrationDate.startsWith(key));
        const expenses = db.expenses.filter((e: any) => e.date?.startsWith(key));
        const totalSales = sales.reduce((acc: number, s: any) => acc + Number(s.total || 0), 0);
        const totalExpenses = expenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);
        return { totalSales, totalExpenses, utility: totalSales - totalExpenses, month, year };
    },
    getDashboardStats: async () => {
        const db = (await readDb());
        const today = getLocalDate();
        const month = getLocalMonth();
        const todaySalesRows = db.sales.filter((s: any) => !s.isReverted && s.registrationDate.startsWith(today));
        const monthExpenses = db.expenses.filter((e: any) => e.date?.startsWith(month));
        const todaySales = todaySalesRows.reduce((acc: number, s: any) => acc + Number(s.total || 0), 0);
        const totalExpenses = monthExpenses.reduce((acc: number, e: any) => acc + Number(e.amount || 0), 0);
        const sold: Record<string, number> = {};
        todaySalesRows.forEach((s: any) => s.items.forEach((i: any) => sold[i.productName] = (sold[i.productName] || 0) + Number(i.quantity || 0)));
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

export const SqliteStockAdapter: IStockRepository = {
    getMovements: async () => {
        const db = (await readDb());
        return db.stockMovements;
    },
    getHistory: async (productId: string) => {
        const db = (await readDb());
        return db.stockMovements.filter((m: any) => m.productId === productId);
    },
    deleteMovements: async () => {
        const db = (await readDb());
        db.stockMovements = [];
        await writeDb(db);
    }
};

export const SqliteBackupAdapter: IBackupRepository = {
    exportData: async () => {
        const db = (await readDb());
        return JSON.stringify(db);
    },
    importData: async (data: string) => {
        const parsed = JSON.parse(data);
        // Basic validation
        if (!parsed.products || !parsed.sales) throw new Error('Archivo de copia de seguridad inválido');
        await writeDb(parsed);
    }
};

// Ensure DB is initialized on first import (lazy but safe)
ensureConnection().then(() => ensureDb()).catch(() => {/* ignore init errors; caller should fallback to local adapters */});
