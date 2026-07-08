import { Product, Sale, Category, Client } from './models';

export interface IProductRepository {
    findAll(page?: number, size?: number): Promise<{ content: Product[], totalElements: number }>;
    findById(id: string): Promise<Product>;
    search(query: string): Promise<Product[]>;
    save(product: Partial<Product>): Promise<Product>;
    delete(id: string): Promise<void>;
}

export interface ISaleRepository {
    findAll(page?: number, size?: number): Promise<{ content: Sale[], totalElements: number }>;
    register(sale: any): Promise<Sale>;
    revert(id: string): Promise<void>;
}

export interface ICreditRepository {
    findAll(): Promise<any[]>;
    findByClient(clientId: string): Promise<any[]>;
    create(credit: any): Promise<any>;
    addInstallment(id: string, amount: number, method: string): Promise<any>;
    delete(id: string): Promise<void>;
}

export interface IExpenseRepository {
    findAll(): Promise<any[]>;
    save(expense: any): Promise<any>;
    delete(id: string): Promise<void>;
}

export interface IFinanceRepository {
    getReport(month: number, year: number): Promise<any>;
    getDashboardStats(): Promise<any>;
}

export interface IStockRepository {
    getMovements(): Promise<any[]>;
    getHistory(productId: string): Promise<any[]>;
    deleteMovements(): Promise<void>;
}

export interface ICategoryRepository {
    findAll(): Promise<Category[]>;
    save(category: Partial<Category>): Promise<Category>;
}

export interface IClientRepository {
    findAll(): Promise<Client[]>;
    save(client: Partial<Client>): Promise<Client>;
}

export interface IBackupRepository {
    exportData(): Promise<string>;
    importData(data: string): Promise<void>;
}
