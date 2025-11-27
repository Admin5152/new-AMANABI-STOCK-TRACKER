
export type UserRole = 'MANAGER' | 'STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  last_seen: string;
}

export interface Debtor {
  id: string;
  name: string;
  amount: number;
  date: string;
  isPaid: boolean;
  notes?: string;
}

export interface AppPreferences {
  currency: string;
  defaultView: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  
  // Nsakena
  nsakenaPrev: number;
  nsakenaSold: number;
  
  // Viv Warehouse
  vivPrev: number;
  vivSold: number;
  
  // Yellow Sack Warehouse
  yellowSackPrev: number;
  yellowSackSold: number;
  
  reorderLevel: number;
  pricePurchase: number;
  priceSelling: number;
  
  // Clothing specific
  size?: string;
  color?: string;
  collectionWeek?: string; // Week Number/Collection
  notes?: string;
  
  supplierName: string;
  lastUpdated: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  totalItems: number;
  totalDebt: number;
}

export interface ActivityLog {
  id: string;
  action: 'ADD' | 'UPDATE' | 'DELETE' | 'TRANSFER' | 'LOGIN' | 'DEBTOR' | 'USER_MGMT';
  description: string;
  user: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  type: 'WARNING' | 'DANGER' | 'INFO';
  title: string;
  message: string;
  read: boolean;
  date: string;
}

export type SortField = 'name' | 'quantity' | 'status';
export type SortOrder = 'asc' | 'desc';
