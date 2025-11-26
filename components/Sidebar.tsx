import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  LogOut, 
  Settings,
  Store,
  Warehouse
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface SidebarProps {
  currentPage: string;
  setPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setPage, isOpen, setIsOpen }) => {
  const { logout, user } = useInventory();
  
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'All Inventory', icon: Package },
    { id: 'nsakena', label: 'Nsakena ', icon: Warehouse },
    { id: 'viv', label: 'Viv Warehouse', icon: Warehouse },
    { id: 'yellowsack', label: 'Yellow Sack Whse', icon: Warehouse },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-slate-850 text-white flex flex-col shadow-xl`}>
        
        {/* Logo Area */}
        <div className="h-20 flex items-center px-6 border-b border-gray-700 bg-slate-900">
          <Store className="h-9 w-9 text-blue-500 mr-3" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">AMANABI</h1>
            <p className="text-sm text-blue-400 font-medium">CLOTHING ENT.</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setPage(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-4 py-3.5 rounded-lg transition-colors duration-150 group relative
                  ${isActive 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
              >
                <Icon className={`h-6 w-6 mr-3 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-white'}`} />
                <span className="font-medium text-base tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User / Footer */}
        <div className="p-5 border-t border-gray-700 bg-slate-900">
          <div className="mb-4 px-2">
            <p className="text-sm text-gray-400">Signed in as:</p>
            <p className="text-base font-semibold text-white truncate">{user?.name}</p>
          </div>
          <button 
            onClick={logout}
            className="flex items-center w-full px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-gray-800 rounded-md transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;