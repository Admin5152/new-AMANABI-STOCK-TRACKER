
import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useInventory } from '../context/InventoryContext';
import { CATEGORIES } from '../constants';
import { X, MapPin, Warehouse, Building2, Store, Calculator, Check, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Product;
  limitLocation?: 'Nsakena' | 'Viv' | 'YellowSack';
  defaultWeek?: string;
}

const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, initialData, limitLocation, defaultWeek }) => {
  const { addProduct, updateProduct, user } = useInventory();
  
  // RBAC: Check if user is Manager
  const isManager = user?.role === 'MANAGER';
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: CATEGORIES[0],
    sku: '',
    nsakenaPrev: 0,
    nsakenaSold: 0,
    vivPrev: 0,
    vivSold: 0,
    yellowSackPrev: 0,
    yellowSackSold: 0,
    reorderLevel: 10,
    pricePurchase: 0,
    priceSelling: 0,
    size: '',
    color: '',
    collectionWeek: defaultWeek || '', 
    supplierName: '',
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else if (defaultWeek) {
      setFormData(prev => ({ ...prev, collectionWeek: defaultWeek }));
    }
  }, [initialData, defaultWeek]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return; // Guard clause
    
    if (!formData.name) return alert("Item Name is required");

    if (initialData) {
      updateProduct(initialData.id, formData);
    } else {
      addProduct(formData as Omit<Product, 'id' | 'lastUpdated'>);
    }
    onClose();
  };

  const getAvail = (prev = 0, sold = 0) => prev - sold;

  // Helpers to determine which sections to show
  const showNsakena = !limitLocation || limitLocation === 'Nsakena';
  const showViv = !limitLocation || limitLocation === 'Viv';
  const showYellowSack = !limitLocation || limitLocation === 'YellowSack';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-white h-full sm:h-auto sm:rounded-xl shadow-2xl w-full max-w-4xl max-h-screen sm:max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div>
             <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
               {initialData ? 'Edit Item' : 'Add New Item'}
               {limitLocation && <span className="hidden sm:inline-flex text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs sm:text-sm font-medium border border-blue-100">@{limitLocation}</span>}
             </h2>
             <p className="text-xs sm:text-sm text-gray-500">
               {limitLocation 
                 ? `Stock for ${limitLocation} warehouse.` 
                 : 'Manage stock across all locations.'}
             </p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 sm:space-y-8 flex-1 overflow-y-auto">
          
          {!isManager && (
            <div className="bg-orange-50 border border-orange-200 text-orange-800 p-3 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>You are viewing this item in Read-Only mode. Only Managers can edit inventory details.</p>
            </div>
          )}

          {/* Main Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-blue-700 mb-1">Item Name</label>
                 <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    disabled={!isManager}
                    className="w-full p-2.5 bg-white border border-blue-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500" 
                    placeholder="Enter item name..." 
                  />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                    <input 
                      name="collectionWeek" 
                      value={formData.collectionWeek} 
                      onChange={handleChange} 
                      disabled={!isManager}
                      className="w-full p-2 bg-white border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50" 
                      placeholder="e.g. 42" 
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      disabled={!isManager}
                      className="w-full p-2 bg-white border rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
                     <input 
                       name="size" 
                       value={formData.size} 
                       onChange={handleChange} 
                       disabled={!isManager}
                       className="w-full p-2 bg-white border rounded-lg text-gray-900 outline-none disabled:bg-gray-50" 
                       placeholder="S, M..." 
                      />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                     <input 
                       name="color" 
                       value={formData.color} 
                       onChange={handleChange} 
                       disabled={!isManager}
                       className="w-full p-2 bg-white border rounded-lg text-gray-900 outline-none disabled:bg-gray-50" 
                       placeholder="Blue..." 
                      />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea 
                    name="notes" 
                    value={formData.notes || ''} 
                    onChange={handleChange} 
                    disabled={!isManager}
                    rows={2} 
                    className="w-full p-2 bg-white border rounded-lg text-gray-900 outline-none disabled:bg-gray-50" 
                    placeholder="Optional details..." 
                  />
               </div>
             </div>

             {/* Stock Section */}
             <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between mb-2">
                   <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Stock Calculations</h3>
                   <div className="text-xs text-blue-600 flex items-center bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                     <Calculator className="w-3 h-3 mr-1"/> Auto-calc
                   </div>
                </div>
                
                {/* Nsakena */}
                {showNsakena && (
                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-blue-200 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-1 bg-blue-100 text-blue-600 rounded-bl-lg">
                       <Store className="w-4 h-4"/>
                     </div>
                     <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-gray-800">Nsakena</label>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Previous</label>
                          <input 
                            type="number" 
                            name="nsakenaPrev" 
                            value={formData.nsakenaPrev} 
                            onChange={handleChange} 
                            disabled={!isManager}
                            className="w-full p-2 bg-white border rounded font-medium text-gray-900 disabled:bg-gray-50" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Sold Out</label>
                          <input 
                            type="number" 
                            name="nsakenaSold" 
                            value={formData.nsakenaSold} 
                            onChange={handleChange} 
                            disabled={!isManager}
                            className="w-full p-2 bg-white border rounded font-medium text-red-600 disabled:bg-gray-50" 
                          />
                          <div className="text-right mt-1.5">
                             <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                               Avail: {getAvail(formData.nsakenaPrev, formData.nsakenaSold)}
                             </span>
                          </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* Viv */}
                {showViv && (
                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-indigo-200 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-1 bg-indigo-100 text-indigo-600 rounded-bl-lg">
                       <Warehouse className="w-4 h-4"/>
                     </div>
                     <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-gray-800">Viv Warehouse</label>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Previous</label>
                          <input 
                            type="number" 
                            name="vivPrev" 
                            value={formData.vivPrev} 
                            onChange={handleChange} 
                            disabled={!isManager}
                            className="w-full p-2 bg-white border rounded font-medium text-gray-900 disabled:bg-gray-50" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Sold Out</label>
                          <input 
                            type="number" 
                            name="vivSold" 
                            value={formData.vivSold} 
                            onChange={handleChange} 
                            disabled={!isManager}
                            className="w-full p-2 bg-white border rounded font-medium text-red-600 disabled:bg-gray-50" 
                          />
                          <div className="text-right mt-1.5">
                             <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                               Avail: {getAvail(formData.vivPrev, formData.vivSold)}
                             </span>
                          </div>
                        </div>
                     </div>
                  </div>
                )}

                {/* Yellow Sack */}
                {showYellowSack && (
                  <div className="bg-white p-3 sm:p-4 rounded-lg border border-yellow-200 shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-1 bg-yellow-100 text-yellow-600 rounded-bl-lg">
                       <Building2 className="w-4 h-4"/>
                     </div>
                     <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-bold text-gray-800">Yellow Sack</label>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Previous</label>
                          <input 
                            type="number" 
                            name="yellowSackPrev" 
                            value={formData.yellowSackPrev} 
                            onChange={handleChange} 
                            disabled={!isManager}
                            className="w-full p-2 bg-white border rounded font-medium text-gray-900 disabled:bg-gray-50" 
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase">Sold Out</label>
                          <input 
                            type="number" 
                            name="yellowSackSold" 
                            value={formData.yellowSackSold} 
                            onChange={handleChange} 
                            disabled={!isManager}
                            className="w-full p-2 bg-white border rounded font-medium text-red-600 disabled:bg-gray-50" 
                          />
                          <div className="text-right mt-1.5">
                             <span className="text-sm font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">
                               Avail: {getAvail(formData.yellowSackPrev, formData.yellowSackSold)}
                             </span>
                          </div>
                        </div>
                     </div>
                  </div>
                )}
                
                <div className="pt-2">
                   <div className="flex items-center justify-between p-2 bg-red-50 rounded border border-red-100">
                     <span className="text-xs text-red-800 font-medium">Reorder Alert Level</span>
                     <input 
                       type="number" 
                       name="reorderLevel" 
                       value={formData.reorderLevel} 
                       onChange={handleChange} 
                       disabled={!isManager}
                       className="w-16 p-1 border border-red-200 rounded text-center font-bold text-red-600 outline-none disabled:bg-red-50 bg-white" 
                      />
                   </div>
                </div>
             </div>
          </div>
        </form>

        {/* Footer Actions */}
        {isManager && (
          <div className="p-4 sm:p-6 border-t bg-gray-50 sticky bottom-0 z-10 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all flex items-center"
            >
              <Check className="w-4 h-4 mr-2" />
              {initialData ? 'Update Item' : 'Save Item'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModal;
