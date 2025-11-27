
import React, { useState } from 'react';
import { 
  TrendingUp, 
  AlertOctagon, 
  DollarSign,
  Shirt,
  Users,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Pencil,
  Store,
  Warehouse,
  Building2
} from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { Debtor } from '../types';

const Dashboard: React.FC = () => {
  const { 
    stats, 
    products, 
    getFormattedCurrency, 
    notifications, 
    debtors, 
    addDebtor,
    updateDebtor, 
    toggleDebtorStatus, 
    deleteDebtor,
    user 
  } = useInventory();

  // RBAC
  const isManager = user?.role === 'MANAGER';

  const [isAddingDebtor, setIsAddingDebtor] = useState(false);
  const [editingDebtorId, setEditingDebtorId] = useState<string | null>(null);
  const [newDebtor, setNewDebtor] = useState({ name: '', amount: '', notes: '' });

  // Calculate Warehouse Specific Totals
  const warehouseStats = products.reduce((acc, curr) => {
    const nsakenaAvail = curr.nsakenaPrev - curr.nsakenaSold;
    const vivAvail = curr.vivPrev - curr.vivSold;
    const yellowAvail = curr.yellowSackPrev - curr.yellowSackSold;
    
    return {
      nsakena: acc.nsakena + nsakenaAvail,
      viv: acc.viv + vivAvail,
      yellow: acc.yellow + yellowAvail
    };
  }, { nsakena: 0, viv: 0, yellow: 0 });

  // Data for Category Chart
  const categoryData = products.reduce((acc: any[], curr) => {
    const existing = acc.find(x => x.name === curr.category);
    // Calculate total available
    const totalQty = (curr.nsakenaPrev - curr.nsakenaSold) + 
                     (curr.vivPrev - curr.vivSold) + 
                     (curr.yellowSackPrev - curr.yellowSackSold);
                     
    if (existing) {
      existing.value += totalQty;
    } else {
      acc.push({ name: curr.category, value: totalQty });
    }
    return acc;
  }, []);

  const handleSaveDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (newDebtor.name && newDebtor.amount) {
      if (editingDebtorId) {
        updateDebtor(editingDebtorId, {
          name: newDebtor.name,
          amount: Number(newDebtor.amount),
          notes: newDebtor.notes
        });
        setEditingDebtorId(null);
      } else {
        addDebtor({
          name: newDebtor.name,
          amount: Number(newDebtor.amount),
          notes: newDebtor.notes
        });
      }
      setNewDebtor({ name: '', amount: '', notes: '' });
      setIsAddingDebtor(false);
    }
  };

  const handleEditDebtor = (debtor: Debtor) => {
    setNewDebtor({
      name: debtor.name,
      amount: debtor.amount.toString(),
      notes: debtor.notes || ''
    });
    setEditingDebtorId(debtor.id);
    setIsAddingDebtor(true);
    // Optional: scroll to form if needed
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const toggleDebtorForm = () => {
    if (isAddingDebtor) {
      setIsAddingDebtor(false);
      setEditingDebtorId(null);
      setNewDebtor({ name: '', amount: '', notes: '' });
    } else {
      setIsAddingDebtor(true);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-500 text-lg">Welcome back, {user?.name.split(' ')[0]}. Here is your stock summary.</p>
        </div>
        <div>
           <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200 shadow-sm">
              <CheckCircle className="w-4 h-4 mr-2"/>
              System Operational
           </span>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-base font-medium text-gray-500">Total Stock Value</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{getFormattedCurrency(stats.totalValue)}</h3>
            <span className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="w-4 h-4 mr-1" /> Estimated
            </span>
          </div>
          <div className="p-4 bg-blue-50 rounded-xl text-blue-600">
            <DollarSign className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-base font-medium text-gray-500">Total Items</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalItems}</h3>
            <p className="text-sm text-gray-400 mt-1">Global Available</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl text-indigo-600">
            <Shirt className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-base font-medium text-gray-500">Total Debt</p>
            <h3 className="text-3xl font-bold text-red-600 mt-2">{getFormattedCurrency(stats.totalDebt)}</h3>
            <p className="text-sm text-red-500 mt-1">Outstanding</p>
          </div>
          <div className="p-4 bg-orange-50 rounded-xl text-orange-600">
            <Users className="w-7 h-7" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between">
          <div>
            <p className="text-base font-medium text-gray-500">Alerts</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.lowStockCount}</h3>
            <p className="text-sm text-red-500 mt-1">Items below reorder</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl text-red-600">
            <AlertOctagon className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Warehouse Stock Breakdown */}
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-5 px-1">Warehouse Stock Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Nsakena */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md cursor-pointer group">
            <div>
              <p className="text-base font-medium text-gray-500">Nsakena Warehouse</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-3">{warehouseStats.nsakena}</h3>
              <span className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-md mt-3 inline-block">
                Available Stock
              </span>
            </div>
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Store className="w-10 h-10" />
            </div>
          </div>
          
          {/* Viv */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md cursor-pointer group">
            <div>
              <p className="text-base font-medium text-gray-500">Viv Warehouse</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-3">{warehouseStats.viv}</h3>
              <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md mt-3 inline-block">
                Available Stock
              </span>
            </div>
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Warehouse className="w-10 h-10" />
            </div>
          </div>

          {/* Yellow Sack */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between transition hover:shadow-md cursor-pointer group">
            <div>
              <p className="text-base font-medium text-gray-500">Yellow Sack</p>
              <h3 className="text-4xl font-bold text-gray-900 mt-3">{warehouseStats.yellow}</h3>
              <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-md mt-3 inline-block">
                Available Stock
              </span>
            </div>
            <div className="p-4 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-600 group-hover:text-white transition-colors">
              <Building2 className="w-10 h-10" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Stock by Category</h3>
          <div className="h-72">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={categoryData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                 <YAxis fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', fontSize: '14px' }} />
                 <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">Recent Alerts</h3>
          <div className="space-y-4 max-h-72 overflow-y-auto custom-scrollbar pr-2">
            {notifications.length === 0 ? (
              <p className="text-gray-400 text-base text-center py-12">No recent alerts</p>
            ) : (
              notifications.slice(0, 5).map(n => (
                <div key={n.id} className={`p-4 rounded-xl border-l-4 ${n.type === 'DANGER' ? 'border-red-500 bg-red-50' : 'border-blue-500 bg-blue-50'}`}>
                  <p className="text-base font-bold text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">{new Date(n.date).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Debtors Management Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Debtors Management</h3>
            <p className="text-base text-gray-500">Track and manage outstanding payments</p>
          </div>
          {isManager && (
            <button 
              onClick={toggleDebtorForm}
              className="flex items-center px-5 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-900 transition text-sm font-bold shadow-md"
            >
              {isAddingDebtor ? <XCircle className="w-5 h-5 mr-2" /> : <Plus className="w-5 h-5 mr-2" />}
              {isAddingDebtor ? 'Cancel' : 'Add Debtor'}
            </button>
          )}
        </div>

        {/* Add/Edit Debtor Form */}
        {isAddingDebtor && isManager && (
          <form onSubmit={handleSaveDebtor} className="p-6 bg-slate-50 border-b border-gray-100 animate-fadeIn">
            <h4 className="text-base font-bold text-gray-700 mb-4">
              {editingDebtorId ? 'Edit Debtor Details' : 'Add New Debtor'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
              <input 
                type="text" 
                placeholder="Debtor Name" 
                className="p-3 border rounded-xl text-base bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={newDebtor.name}
                onChange={e => setNewDebtor({...newDebtor, name: e.target.value})}
                required
              />
              <input 
                type="number" 
                placeholder="Amount Owed" 
                className="p-3 border rounded-xl text-base bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={newDebtor.amount}
                onChange={e => setNewDebtor({...newDebtor, amount: e.target.value})}
                required
              />
              <input 
                type="text" 
                placeholder="Notes (Optional)" 
                className="p-3 border rounded-xl text-base bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                value={newDebtor.notes}
                onChange={e => setNewDebtor({...newDebtor, notes: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={toggleDebtorForm}
                className="px-5 py-2.5 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-md">
                {editingDebtorId ? 'Update Record' : 'Save Record'}
              </button>
            </div>
          </form>
        )}

        {/* Debtors List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
              <tr>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">Date Added</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm md:text-base">
              {debtors.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center text-gray-400">No debtors recorded.</td>
                </tr>
              ) : (
                debtors.map(debtor => (
                  <tr key={debtor.id} className="hover:bg-gray-50 transition">
                    <td className="px-8 py-5">
                      <p className="font-bold text-gray-900">{debtor.name}</p>
                      {debtor.notes && <p className="text-sm text-gray-500">{debtor.notes}</p>}
                    </td>
                    <td className="px-8 py-5 text-gray-500">
                      {new Date(debtor.date).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 font-bold text-gray-900">
                      {getFormattedCurrency(debtor.amount)}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                        debtor.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {debtor.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {isManager && (
                        <div className="flex justify-end gap-3">
                          <button 
                             onClick={() => handleEditDebtor(debtor)}
                             className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                             title="Edit"
                          >
                             <Pencil className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => toggleDebtorStatus(debtor.id)}
                            className={`p-2 rounded-lg transition ${
                              debtor.isPaid 
                                ? 'text-gray-400 hover:text-gray-600 bg-gray-100' 
                                : 'text-green-600 hover:bg-green-50 bg-white border border-green-200'
                            }`}
                            title={debtor.isPaid ? "Mark Unpaid" : "Mark Paid"}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm('Delete this debtor record?')) deleteDebtor(debtor.id);
                            }}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
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

export default Dashboard;
