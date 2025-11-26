import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, User, ActivityLog, Notification, InventoryStats, Debtor, AppPreferences } from '../types';
import { supabase } from '../lib/supabase';

interface InventoryContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<void>;
  signup: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  products: Product[];
  isLoading: boolean;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  transferStock: (id: string, from: 'Nsakena' | 'Viv' | 'YellowSack', to: 'Nsakena' | 'Viv' | 'YellowSack', amount: number) => Promise<void>;
  logs: ActivityLog[];
  notifications: Notification[];
  markNotificationRead: (id: string) => void;
  stats: InventoryStats;
  getFormattedCurrency: (amount: number) => string;
  debtors: Debtor[];
  addDebtor: (debtor: Omit<Debtor, 'id' | 'isPaid' | 'date'>) => Promise<void>;
  updateDebtor: (id: string, updates: Partial<Debtor>) => Promise<void>;
  toggleDebtorStatus: (id: string) => Promise<void>;
  deleteDebtor: (id: string) => Promise<void>;
  preferences: AppPreferences;
  updatePreferences: (prefs: Partial<AppPreferences>) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider = ({ children }: { children?: ReactNode }) => {
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [preferences, setPreferences] = useState<AppPreferences>(() => {
    const saved = localStorage.getItem('amanabi_prefs');
    return saved ? JSON.parse(saved) : { currency: 'GBP', defaultView: 'Show All' };
  });

  // --- Auth & Initial Load ---
  useEffect(() => {
    // Check active session on mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        handleUserSession(session.user);
        fetchData(); // Fetch data if logged in
      } else {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        handleUserSession(session.user);
        fetchData();
      } else {
        setUser(null);
        setProducts([]);
        setDebtors([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = (authUser: any) => {
    // MANAGER EMAIL CHECK - Case Insensitive
    const isManager = authUser.email?.toLowerCase() === 'amabelle100@yahoo.com';
    
    // Check for metadata name, fallback to email part, fallback to generic
    const displayName = authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Staff';

    setUser({
      id: authUser.id,
      email: authUser.email!,
      name: isManager ? 'Manager Amabelle' : displayName,
      role: isManager ? 'MANAGER' : 'STAFF'
    });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch Products
      const { data: prodData, error: prodError } = await supabase
        .from('products')
        .select('*');
      
      if (prodError) console.error('Error fetching products:', prodError);
      else if (prodData) setProducts(prodData);

      // Fetch Debtors
      const { data: debtData, error: debtError } = await supabase
        .from('debtors')
        .select('*');
        
      if (debtError) console.error('Error fetching debtors:', debtError);
      else if (debtData) setDebtors(debtData);

    } catch (err) {
      console.error('Unexpected error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (products.length > 0) {
      checkAlerts();
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('amanabi_prefs', JSON.stringify(preferences));
  }, [preferences]);

  // --- Helpers ---
  const addLog = (action: ActivityLog['action'], description: string) => {
    const newLog: ActivityLog = {
      id: Date.now().toString(),
      action,
      description,
      user: user?.name || 'System',
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (type: Notification['type'], title: string, message: string) => {
    const exists = notifications.find(n => n.title === title && !n.read);
    if (exists) return;

    const newNotif: Notification = {
      id: Date.now().toString() + Math.random(),
      type,
      title,
      message,
      read: false,
      date: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const getAvailable = (p: Product, loc: 'Nsakena' | 'Viv' | 'YellowSack' | 'All') => {
    const nAvail = Number(p.nsakenaPrev || 0) - Number(p.nsakenaSold || 0);
    const vAvail = Number(p.vivPrev || 0) - Number(p.vivSold || 0);
    const yAvail = Number(p.yellowSackPrev || 0) - Number(p.yellowSackSold || 0);

    if (loc === 'Nsakena') return nAvail;
    if (loc === 'Viv') return vAvail;
    if (loc === 'YellowSack') return yAvail;
    return nAvail + vAvail + yAvail;
  };

  const checkAlerts = () => {
    products.forEach(p => {
      const totalAvailable = getAvailable(p, 'All');
      if (totalAvailable <= p.reorderLevel) {
        addNotification(
          'DANGER', 
          `Low Stock: ${p.name}`, 
          `Total available stock (${totalAvailable}) is below reorder level (${p.reorderLevel}).`
        );
      }
    });
  };

  // --- Auth Actions ---
  const login = async (email: string, pass: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) throw error;
    addLog('LOGIN', `User ${email} logged in`);
  };

  const signup = async (email: string, pass: string, name: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password: pass,
      options: {
        data: {
          full_name: name
        }
      }
    });
    if (error) throw error;
    addLog('LOGIN', `New user signed up: ${email}`);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // --- Product CRUD (Supabase) ---
  const checkPermission = () => {
    if (user?.role !== 'MANAGER') {
      alert("Access Denied: Only Managers can perform this action.");
      throw new Error("Unauthorized");
    }
  };

  const addProduct = async (data: Omit<Product, 'id' | 'lastUpdated'>) => {
    checkPermission();
    try {
      const newProduct = {
        ...data,
        lastUpdated: new Date().toISOString()
      };

      const { data: inserted, error } = await supabase
        .from('products')
        .insert([newProduct])
        .select();

      if (error) throw error;

      if (inserted && inserted.length > 0) {
        setProducts(prev => [...prev, inserted[0]]);
        addLog('ADD', `Added new item: ${inserted[0].name}`);
      }
    } catch (err) {
      console.error('Error adding product:', err);
      if ((err as any).message !== "Unauthorized") alert('Failed to save product.');
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    checkPermission();
    try {
      const updatedData = { ...updates, lastUpdated: new Date().toISOString() };
      
      const { error } = await supabase
        .from('products')
        .update(updatedData)
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
      const prodName = products.find(p => p.id === id)?.name;
      addLog('UPDATE', `Updated details for ${prodName}`);
    } catch (err) {
      console.error('Error updating product:', err);
    }
  };

  const deleteProduct = async (id: string) => {
    checkPermission();
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      const prodName = products.find(p => p.id === id)?.name;
      setProducts(prev => prev.filter(p => p.id !== id));
      addLog('DELETE', `Deleted product: ${prodName}`);
    } catch (err) {
      console.error('Error deleting product:', err);
    }
  };

  const transferStock = async (id: string, from: 'Nsakena' | 'Viv' | 'YellowSack', to: 'Nsakena' | 'Viv' | 'YellowSack', amount: number) => {
    checkPermission();
    if (from === to) return;

    const product = products.find(p => p.id === id);
    if (!product) return;

    const sourceAvailable = getAvailable(product, from);

    if (sourceAvailable < amount) {
      alert(`Insufficient available stock in ${from}`);
      return;
    }

    try {
      const updates: Partial<Product> = { lastUpdated: new Date().toISOString() };
      
      if (from === 'Nsakena') updates.nsakenaPrev = Number(product.nsakenaPrev) - amount;
      if (from === 'Viv') updates.vivPrev = Number(product.vivPrev) - amount;
      if (from === 'YellowSack') updates.yellowSackPrev = Number(product.yellowSackPrev) - amount;

      if (to === 'Nsakena') updates.nsakenaPrev = Number(product.nsakenaPrev) + amount;
      if (to === 'Viv') updates.vivPrev = Number(product.vivPrev) + amount;
      if (to === 'YellowSack') updates.yellowSackPrev = Number(product.yellowSackPrev) + amount;

      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setProducts(prev => prev.map(p => {
        if (p.id !== id) return p;
        const newP = { ...p, ...updates };
        // Re-calculate local state correctly
        if (from === 'Nsakena') newP.nsakenaPrev = Number(p.nsakenaPrev) - amount;
        if (from === 'Viv') newP.vivPrev = Number(p.vivPrev) - amount;
        if (from === 'YellowSack') newP.yellowSackPrev = Number(p.yellowSackPrev) - amount;

        if (to === 'Nsakena') newP.nsakenaPrev = Number(p.nsakenaPrev) + amount;
        if (to === 'Viv') newP.vivPrev = Number(p.vivPrev) + amount;
        if (to === 'YellowSack') newP.yellowSackPrev = Number(p.yellowSackPrev) + amount;
        return newP;
      }));

      addLog('TRANSFER', `Transferred ${amount} units of ${product.name} from ${from} to ${to}`);
    } catch (err) {
      console.error('Error transferring stock:', err);
    }
  };

  // --- Debtor CRUD (Supabase) ---

  const addDebtor = async (data: Omit<Debtor, 'id' | 'isPaid' | 'date'>) => {
    checkPermission();
    try {
      const newDebtor = {
        ...data,
        isPaid: false,
        date: new Date().toISOString()
      };

      const { data: inserted, error } = await supabase
        .from('debtors')
        .insert([newDebtor])
        .select();

      if (error) throw error;

      if (inserted && inserted.length > 0) {
        setDebtors(prev => [inserted[0], ...prev]);
        addLog('DEBTOR', `Added new debtor: ${inserted[0].name}`);
      }
    } catch (err) {
      console.error('Error adding debtor:', err);
    }
  };

  const updateDebtor = async (id: string, updates: Partial<Debtor>) => {
    checkPermission();
    try {
      const { error } = await supabase
        .from('debtors')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setDebtors(prev => prev.map(d => d.id === id ? { ...d, ...updates } : d));
      const dName = debtors.find(d => d.id === id)?.name;
      addLog('DEBTOR', `Updated info for debtor: ${dName}`);
    } catch (err) {
      console.error('Error updating debtor:', err);
    }
  };

  const toggleDebtorStatus = async (id: string) => {
    checkPermission();
    const debtor = debtors.find(d => d.id === id);
    if (!debtor) return;
    
    try {
      const newStatus = !debtor.isPaid;
      const { error } = await supabase
        .from('debtors')
        .update({ isPaid: newStatus })
        .eq('id', id);

      if (error) throw error;

      setDebtors(prev => prev.map(d => d.id === id ? { ...d, isPaid: newStatus } : d));
      addLog('DEBTOR', `Marked ${debtor.name} as ${newStatus ? 'Paid' : 'Unpaid'}`);
    } catch (err) {
      console.error('Error toggling debtor status:', err);
    }
  };

  const deleteDebtor = async (id: string) => {
    checkPermission();
    try {
      const { error } = await supabase
        .from('debtors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDebtors(prev => prev.filter(d => d.id !== id));
      addLog('DEBTOR', `Deleted debtor record`);
    } catch (err) {
      console.error('Error deleting debtor:', err);
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const getFormattedCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: preferences.currency }).format(amount);
  };

  const updatePreferences = (prefs: Partial<AppPreferences>) => {
    setPreferences(prev => ({ ...prev, ...prefs }));
  };

  // --- Derived Stats ---
  const stats: InventoryStats = {
    totalProducts: products.length,
    totalValue: products.reduce((acc, p) => acc + (getAvailable(p, 'All') * (Number(p.pricePurchase) || 0)), 0),
    lowStockCount: products.filter(p => getAvailable(p, 'All') <= p.reorderLevel).length,
    totalItems: products.reduce((acc, p) => acc + getAvailable(p, 'All'), 0),
    totalDebt: debtors.filter(d => !d.isPaid).reduce((acc, d) => acc + Number(d.amount), 0)
  };

  return (
    <InventoryContext.Provider value={{
      user, login, signup, logout,
      products, isLoading, addProduct, updateProduct, deleteProduct, transferStock,
      logs, notifications, markNotificationRead, stats, getFormattedCurrency,
      debtors, addDebtor, updateDebtor, toggleDebtorStatus, deleteDebtor,
      preferences, updatePreferences
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within InventoryProvider");
  return context;
};