import { Product, User, Debtor } from './types';

export const APP_NAME = "AMANABI ENT.";

export const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Manager',
  email: 'manager@amanabi.com',
  role: 'MANAGER',
  avatar: 'https://picsum.photos/100/100'
};

export const CATEGORIES = [
  'Men',
  'Women',
  'Kids',
  'Accessories',
  'Footwear',
  'Unisex'
];

// Empty Initial Data for Supabase Integration
export const INITIAL_DEBTORS: Debtor[] = [];
export const INITIAL_PRODUCTS: Product[] = [];