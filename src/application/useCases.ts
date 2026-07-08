import { IProductRepository, ISaleRepository, ICreditRepository, IExpenseRepository, IFinanceRepository, IStockRepository, ICategoryRepository, IClientRepository, IBackupRepository } from '../domain/ports';

export const createProductUseCases = (repo: IProductRepository) => ({
    getProducts: (page?: number, size?: number) => repo.findAll(page, size),
    getProduct: (id: string) => repo.findById(id),
    saveProduct: (product: any) => repo.save(product),
    deleteProduct: (id: string) => repo.delete(id),
    searchProducts: (query: string) => repo.search(query)
});

export const createSaleUseCases = (repo: ISaleRepository) => ({
    processSale: (sale: any) => repo.register(sale),
    getSales: (page?: number, size?: number) => repo.findAll(page, size),
    revertSale: (id: string) => repo.revert(id)
});

export const createCreditUseCases = (repo: ICreditRepository) => ({
    createCredit: (credit: any) => repo.create(credit),
    getCredits: () => repo.findAll(),
    getCreditsByClient: (clientId: string) => repo.findByClient(clientId),
    payInstallment: (id: string, amount: number, method: string) => repo.addInstallment(id, amount, method),
    removeCredit: (id: string) => repo.delete(id)
});

export const createExpenseUseCases = (repo: IExpenseRepository) => ({
    getExpenses: () => repo.findAll(),
    registerExpense: (expense: any) => repo.save(expense),
    removeExpense: (id: string) => repo.delete(id)
});

export const createFinanceUseCases = (repo: IFinanceRepository) => ({
    getReport: (month: number, year: number) => repo.getReport(month, year),
    getDashboardStats: () => repo.getDashboardStats()
});

export const createStockUseCases = (repo: IStockRepository) => ({
    getMovements: () => repo.getMovements(),
    getHistory: (productId: string) => repo.getHistory(productId),
    deleteMovements: () => repo.deleteMovements()
});

export const createCategoryUseCases = (repo: ICategoryRepository) => ({
    getCategories: () => repo.findAll(),
    saveCategory: (category: any) => repo.save(category)
});

export const createClientUseCases = (repo: IClientRepository) => ({
    getClients: () => repo.findAll(),
    saveClient: (client: any) => repo.save(client)
});

export const createBackupUseCases = (repo: IBackupRepository) => ({
    exportBackup: () => repo.exportData(),
    importBackup: (data: string) => repo.importData(data)
});
