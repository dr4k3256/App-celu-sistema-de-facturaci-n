// Product Domain Models
export interface Category {
  id: number;
  name: string;
}

export interface Variant {
  id: string;
  sku: string;
  attributes: Record<string, string>;
  stock: number;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  normalPrice: number;
  wholesalePrice: number;
  variants: Variant[];
  createdAt: string;
}

// Sale Domain Models
export interface SaleItem {
  productId: string;
  variantId: string;
  productName: string;
  variantDescription: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  registrationDate: string;
  clientName: string;
  type: 'POS' | 'ELECTRONIC' | 'CREDIT';
  isReverted: boolean;
}

// Finance & Analytics Models
export interface FinanceReport {
  totalSales: number;
  totalExpenses: number;
  utility: number;
  month: number;
  year: number;
  todaySales?: number;
  dailySalesHistory?: Record<string, number>;
  weeklySalesHistory?: Record<string, number>;
  topProductsToday?: Record<string, number>;
}

// Expense Models
export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
}

// Stock Movement Models
export interface StockMovement {
  id: number;
  productId: string;
  variantId: string;
  quantity: number;
  type: 'CREATION' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'DELETION';
  referenceId?: string;
  movementDate: string;
}
export interface Client {
  id: string;
  name: string;
  phone?: string;
}
