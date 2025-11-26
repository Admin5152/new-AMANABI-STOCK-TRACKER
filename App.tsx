import React, { useState, useEffect } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InventoryTable from './components/InventoryTable';
import Reports from './components/Reports';
import Settings from './components/Settings';
import { Menu, Store, AlertCircle, Check, ArrowRight, Eye, EyeOff, ShoppingCart } from 'lucide-react';
import { supabase } from './lib/supabase';

// Splash Screen Component with Animation
const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-blue-600 flex flex-col items-center justify-center animate-fade-out pointer-events-none">
      <div className="bg-white p-6 rounded-full shadow-2xl mb-4 animate-bounce-slow">
        <ShoppingCart className="w-16 h-16 text-blue-600 animate-cart-roll" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">AMANABI ENT.</h1>
      <p className="text-blue-100 text-lg mt-2 font-medium tracking-wide">Premium Inventory Management</p>
    </div>
  );
};

const LoginScreen = () => {
  const { login, signup } = useInventory();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email.trim(), password.trim(), name.trim());
        alert("Account created! You can now log in.");
        setIsSignUp(false);
      } else {
        try {
          // Explicitly try to sign in
          const { error } = await supabase.auth.signInWithPassword({ 
            email: email.trim(), 
            password: password.trim() 
          });
          
          if (error) throw error;
          
          // If successful, the auth listener in Context will handle the state update
        } catch (loginErr: any) {
          // Robust Check: If specific manager email fails because account doesn't exist, auto-create
          if (email.trim().toLowerCase() === 'amabelle100@yahoo.com' && loginErr.message.includes('Invalid login credentials')) {
             try {
                // Check if user exists but has wrong password vs user doesn't exist
                // Supabase doesn't reveal user existence security-wise easily, but we can try to signup
                const { error: signUpError } = await supabase.auth.signUp({ 
                  email: email.trim(), 
                  password: password.trim(),
                  options: { data: { full_name: 'Manager Amabelle' } }
                });

                if (signUpError) {
                  // If signup fails (e.g. user already exists), then it really was a wrong password
                  throw new Error("Invalid login credentials. If you created this account before, check your password.");
                } else {
                  // Signup success, now login
                  await supabase.auth.signInWithPassword({ email: email.trim(), password: password.trim() });
                }
             } catch (err: any) {
               throw loginErr; // Throw original login error if auto-provision fails logic
             }
          } else {
            throw loginErr;
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Email not confirmed")) {
        setError("Please verify your email address before logging in.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans text-base">
      {/* Left Side - Brand & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-blue-600 text-white flex-col justify-center px-12 xl:px-20 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <Store className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">AMANABI ENT.</h1>
              <p className="text-blue-200 text-base font-medium tracking-wide">CLOTHING INVENTORY</p>
            </div>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold mb-8 leading-tight">
            Manage your stock with precision & ease.
          </h2>
          
          <p className="text-blue-100 text-xl mb-12 leading-relaxed">
            The complete solution for tracking inventory across Nsakena, Viv, and Yellow Sack warehouses. Real-time insights for smarter business decisions.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-blue-500/50 flex items-center justify-center flex-shrink-0 border border-blue-400">
                <Check className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-medium">Real-time Multi-warehouse Tracking</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-blue-500/50 flex items-center justify-center flex-shrink-0 border border-blue-400">
                <Check className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-medium">Automated Stock Calculations</span>
            </div>
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-blue-500/50 flex items-center justify-center flex-shrink-0 border border-blue-400">
                <Check className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-medium">Debtor & Sales Management</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo (only visible on small screens) */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
             <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
               <Store className="w-8 h-8 text-white" />
             </div>
             <span className="text-2xl font-bold text-gray-900">AMANABI ENT.</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome back'}
            </h2>
            <p className="mt-3 text-gray-500 text-base md:text-lg">
              {isSignUp ? 'Enter your details to get started.' : 'Please enter your credentials to access the portal.'}
            </p>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-base rounded-xl flex items-center border border-red-100 shadow-sm">
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="animate-fadeIn">
                <label className="block text-base font-semibold text-gray-700 mb-2">Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all" 
                  placeholder="e.g. John Doe"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label className="block text-base font-semibold text-gray-700 mb-2">Email Address</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all" 
                placeholder="name@example.com"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-base font-semibold text-gray-700">Password</label>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-lg placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent outline-none transition-all pr-12" 
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition duration-200 shadow-xl shadow-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center group"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 text-center border-t border-gray-100">
            <p className="text-base text-gray-500">
              {isSignUp ? "Already have an account? " : "Don't have an account? "}
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setError(''); setName(''); }}
                className="text-blue-600 font-bold hover:text-blue-700 transition-colors ml-1"
              >
                {isSignUp ? "Sign In" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MainLayout = () => {
  const { user } = useInventory();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return <LoginScreen />;

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <InventoryTable />;
      case 'nsakena': return <InventoryTable locationFilter="Nsakena" />;
      case 'viv': return <InventoryTable locationFilter="Viv" />;
      case 'yellowsack': return <InventoryTable locationFilter="YellowSack" />;
      case 'main': return <InventoryTable locationFilter="YellowSack" />; // Fallback/Alias
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-base">
      <Sidebar 
        currentPage={currentPage} 
        setPage={setCurrentPage} 
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen}
      />
      
      <div className="flex-1 flex flex-col md:pl-64 h-full w-full relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
           <div className="flex items-center">
             <Store className="h-7 w-7 text-blue-600 mr-2" />
             <span className="font-bold text-xl text-gray-800 tracking-tight">AMANABI</span>
           </div>
           <button onClick={() => setSidebarOpen(true)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
             <Menu className="w-7 h-7" />
           </button>
        </header>

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar scroll-smooth">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // 3 seconds splash
    return () => clearTimeout(timer);
  }, []);

  return (
    <InventoryProvider>
      {showSplash && <SplashScreen />}
      <MainLayout />
    </InventoryProvider>
  );
};

export default App;