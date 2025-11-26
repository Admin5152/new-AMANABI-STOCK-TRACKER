import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { 
  Search, 
  Plus, 
  Trash2,
  Calendar,
  Filter,
  Pencil,
  AlertCircle
} from 'lucide-react';
import { Product } from '../types';
import { CATEGORIES } from '../constants';
import ProductModal from './ProductModal';

interface InventoryTableProps {
  locationFilter?: 'Nsakena' | 'Viv' | 'YellowSack';
}

const InventoryTable: React.FC<InventoryTableProps> = ({ locationFilter }) => {
  const { products, deleteProduct, user } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  
  // Local state for the "Week" header inputs
  const [weekNumber, setWeekNumber] = useState('1');
  const [weekDate, setWeekDate] = useState(new Date().toISOString().split('T')[0]);

  // RBAC
  const isManager = user?.role === 'MANAGER';

  // Filter Logic
  const filteredProducts = useMemo(() => {
    let result = products;

    // Category Filter
    if (categoryFilter) {
      result = result.filter(p => p.category === categoryFilter);
    }

    // Search Term
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(lower) || 
        p.sku.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        (p.collectionWeek && p.collectionWeek.toLowerCase().includes(lower))
      );
    }
    return result;
  }, [products, searchTerm, categoryFilter]);

  const handleEdit = (p: Product) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleAddNew = () => {
    setEditingProduct(undefined);
    setIsModalOpen(true);
  };

  const getPageTitle = () => {
    if (locationFilter === 'Nsakena') return 'Nsakena Warehouse';
    if (locationFilter === 'Viv') return 'Viv Warehouse';
    if (locationFilter === 'YellowSack') return 'Yellow Sack Warehouse';
    return 'All Inventory';
  };

  // Helper to extract stats for a single row based on the current view
  const getRowData = (p: Product) => {
    let prev = 0;
    let sold = 0;

    if (locationFilter === 'Nsakena') {
      prev = p.nsakenaPrev;
      sold = p.nsakenaSold;
    } else if (locationFilter === 'Viv') {
      prev = p.vivPrev;
      sold = p.vivSold;
    } else if (locationFilter === 'YellowSack') {
      prev = p.yellowSackPrev;
      sold = p.yellowSackSold;
    } else {
      // Aggregate for 'All Inventory' view
      prev = p.nsakenaPrev + p.vivPrev + p.yellowSackPrev;
      sold = p.nsakenaSold + p.vivSold + p.yellowSackSold;
    }

    const avail = prev - sold;
    return { prev, sold, avail };
  };

  // Calculate Totals for the entire table
  const totals = filteredProducts.reduce((acc, p) => {
    const { prev, sold, avail } = getRowData(p);
    return {
      prev: acc.prev + prev,
      sold: acc.sold + sold,
      avail: acc.avail + avail
    };
  }, { prev: 0, sold: 0, avail: 0 });

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
         <div>
           <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight leading-tight">{getPageTitle()}</h1>
           <p className="text-gray-500 mt-3 text-lg md:text-xl flex items-center gap-3">
             <Calendar className="w-5 h-5" />
             Week {weekNumber} • {formatDate(weekDate)}
           </p>
         </div>
         
         {isManager && (
           <button 
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all active:scale-95"
           >
             <Plus className="w-6 h-6 mr-2" />
             Add New Item
           </button>
         )}
      </div>

      {/* Top Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Week Number Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
           <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
             Week Number
           </label>
           <input 
             type="number" 
             value={weekNumber}
             onChange={(e) => setWeekNumber(e.target.value)}
             className="w-full text-2xl font-bold text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
             placeholder="#"
           />
        </div>

        {/* Week Date Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative">
           <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
             Week Date
           </label>
           <div className="relative">
             <input 
               type="date"
               value={weekDate}
               onChange={(e) => setWeekDate(e.target.value)}
               className="w-full text-2xl font-bold text-gray-900 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
             />
             <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 pointer-events-none" />
           </div>
        </div>

        {/* Total Available Stock Card */}
        <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 shadow-sm sm:col-span-2 lg:col-span-1">
           <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">
             Total Available Stock
           </label>
           <div className="text-5xl md:text-6xl font-bold text-blue-700 mt-2">
             {totals.avail}
           </div>
        </div>
      </div>

      {/* Main Inventory Section */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">Inventory Items</h2>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              Managing stock for Week {weekNumber}
            </p>
          </div>
          
          {/* Search/Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
             <div className="relative w-full sm:w-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search item..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-500 w-full sm:w-64 transition-all"
                />
             </div>
             <div className="relative w-full sm:w-auto">
               <select 
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="w-full sm:w-48 pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-base focus:outline-none focus:border-blue-500 appearance-none bg-white cursor-pointer"
               >
                 <option value="">All Categories</option>
                 {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
               <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
             </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-wide">Item Name</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-wide text-center">Prev. Stock</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-wide text-center">Sold</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-wide text-center text-blue-600">Available</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-wide">Notes</th>
                <th className="px-8 py-5 text-sm font-bold text-gray-900 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Search className="w-10 h-10 mb-3 opacity-50" />
                      <p className="text-lg">No items found.</p>
                      {isManager && (
                        <button onClick={handleAddNew} className="mt-3 text-blue-600 hover:underline text-base font-medium">
                          Add your first item
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const { prev, sold, avail } = getRowData(p);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleEdit(p)}>
                      <td className="px-8 py-5">
                        <div className="font-bold text-gray-900 text-base">{p.name}</div>
                        <div className="text-sm text-gray-500 mt-1 inline-block bg-gray-100 px-2 py-0.5 rounded">{p.category}</div>
                      </td>
                      <td className="px-8 py-5 text-center text-base font-medium text-gray-700">
                        {prev}
                      </td>
                      <td className="px-8 py-5 text-center text-base font-medium text-gray-700">
                        {sold}
                      </td>
                      <td className="px-8 py-5 text-center">
                         <span className={`text-xl font-bold ${avail <= (p.reorderLevel || 5) ? 'text-red-600' : 'text-blue-600'}`}>
                           {avail}
                         </span>
                      </td>
                      <td className="px-8 py-5 text-base text-gray-500 max-w-xs truncate">
                        {p.notes || <span className="text-gray-300 italic text-sm">No notes</span>}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {isManager ? (
                          <div className="flex items-center justify-end gap-3" onClick={e => e.stopPropagation()}>
                            <button 
                              onClick={() => handleEdit(p)}
                              className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2.5 rounded-lg transition-colors"
                              title="Edit Item"
                            >
                              <Pencil className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => {
                                if(confirm(`Delete "${p.name}"? This cannot be undone.`)) deleteProduct(p.id);
                              }}
                              className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition-colors"
                              title="Delete Item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 italic">View Only</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {/* Total Row */}
            <tfoot className="bg-slate-50 border-t border-gray-200">
              <tr>
                <td className="px-8 py-5 text-lg font-bold text-gray-900">Totals</td>
                <td className="px-8 py-5 text-center text-lg font-bold text-gray-900">{totals.prev}</td>
                <td className="px-8 py-5 text-center text-lg font-bold text-gray-900">{totals.sold}</td>
                <td className="px-8 py-5 text-center text-2xl font-bold text-blue-600">{totals.avail}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Product Modal */}
      {isModalOpen && (
        <ProductModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          initialData={editingProduct}
          limitLocation={locationFilter} // Pass current view context
        />
      )}
    </div>
  );
};

export default InventoryTable;