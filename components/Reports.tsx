import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { ChevronDown, Filter } from 'lucide-react';
import { Product } from '../types';

const Reports: React.FC = () => {
  const { products } = useInventory();
  const [warehouseFilter, setWarehouseFilter] = useState<'All' | 'Nsakena' | 'Viv' | 'YellowSack'>('All');

  // Helper to get numbers based on filter
  const getNumbers = (p: Product, filter: string) => {
    let prev = 0, sold = 0;
    if (filter === 'All') {
      prev = p.nsakenaPrev + p.vivPrev + p.yellowSackPrev;
      sold = p.nsakenaSold + p.vivSold + p.yellowSackSold;
    } else if (filter === 'Nsakena') {
      prev = p.nsakenaPrev;
      sold = p.nsakenaSold;
    } else if (filter === 'Viv') {
      prev = p.vivPrev;
      sold = p.vivSold;
    } else if (filter === 'YellowSack') {
      prev = p.yellowSackPrev;
      sold = p.yellowSackSold;
    }
    return { prev, sold, avail: prev - sold };
  };

  // Group data by Week
  const weeklyData = useMemo(() => {
    const groups: { [key: string]: { week: string, date: string, items: number, prev: number, sold: number, avail: number } } = {};

    products.forEach(p => {
      const weekKey = p.collectionWeek || 'Unassigned';
      if (!groups[weekKey]) {
        groups[weekKey] = {
          week: weekKey,
          date: new Date(p.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          items: 0,
          prev: 0,
          sold: 0,
          avail: 0
        };
      }
      
      const { prev, sold, avail } = getNumbers(p, warehouseFilter);
      groups[weekKey].items += 1;
      groups[weekKey].prev += prev;
      groups[weekKey].sold += sold;
      groups[weekKey].avail += avail;
    });

    return Object.values(groups).sort((a, b) => a.week.localeCompare(b.week));
  }, [products, warehouseFilter]);

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Reports</h1>
        <p className="text-gray-500 mt-1">View historical data and weekly summaries</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div>
               <h2 className="text-xl font-bold text-gray-900">Weekly Sales Reports</h2>
               <p className="text-sm text-gray-500">Breakdown by warehouse</p>
             </div>
             
             <div className="relative w-full md:w-64">
               <select 
                 value={warehouseFilter}
                 onChange={(e) => setWarehouseFilter(e.target.value as any)}
                 className="w-full appearance-none bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer shadow-sm"
               >
                 <option value="All">All Warehouses</option>
                 <option value="Nsakena">Nsakena</option>
                 <option value="Viv">Viv Warehouse</option>
                 <option value="YellowSack">Yellow Sack Warehouse</option>
               </select>
               <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
             </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Week</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Previous Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Sold Out</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-blue-600">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {weeklyData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                    No data available for the selected filter.
                  </td>
                </tr>
              ) : (
                weeklyData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{row.week}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.items}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.prev}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{row.sold}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{row.avail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;