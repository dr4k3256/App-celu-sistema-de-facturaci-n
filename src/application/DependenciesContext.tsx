import React, { createContext, useContext } from 'react';
import {
    createProductUseCases,
    createSaleUseCases,
    createCreditUseCases,
    createExpenseUseCases,
    createFinanceUseCases,
    createStockUseCases,
    createCategoryUseCases,
    createClientUseCases,
    createBackupUseCases
} from './useCases';
import {
    LocalCategoryAdapter,
    LocalClientAdapter,
    LocalCreditAdapter,
    LocalExpenseAdapter,
    LocalFinanceAdapter,
    LocalProductAdapter,
    LocalSaleAdapter,
    LocalStockAdapter,
    LocalBackupAdapter
} from '../infrastructure/localAdapters';

// Always use localStorage adapters — they work reliably on both web and
// Capacitor Android (WebView localStorage is persistent across sessions).
// The SQLite plugin was causing silent failures on Android.
const productUseCases   = createProductUseCases(LocalProductAdapter);
const saleUseCases      = createSaleUseCases(LocalSaleAdapter);
const creditUseCases    = createCreditUseCases(LocalCreditAdapter);
const expenseUseCases   = createExpenseUseCases(LocalExpenseAdapter);
const financeUseCases   = createFinanceUseCases(LocalFinanceAdapter);
const stockUseCases     = createStockUseCases(LocalStockAdapter);
const categoryUseCases  = createCategoryUseCases(LocalCategoryAdapter);
const clientUseCases    = createClientUseCases(LocalClientAdapter);
const backupUseCases    = createBackupUseCases(LocalBackupAdapter);

const DependenciesContext = createContext({
    productUseCases,
    saleUseCases,
    creditUseCases,
    expenseUseCases,
    financeUseCases,
    stockUseCases,
    categoryUseCases,
    clientUseCases,
    backupUseCases
});

export const DependenciesProvider = ({ children }: React.PropsWithChildren) => {
    return (
        <DependenciesContext.Provider value={{
            productUseCases,
            saleUseCases,
            creditUseCases,
            expenseUseCases,
            financeUseCases,
            stockUseCases,
            categoryUseCases,
            clientUseCases,
            backupUseCases
        }}>
            {children}
        </DependenciesContext.Provider>
    );
};

export const useDependencies = () => useContext(DependenciesContext);
