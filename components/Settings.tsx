
import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { History, User, Lock, Shield, Save, Users, Key, RefreshCw } from 'lucide-react';
import { UserRole } from '../types';

const Settings: React.FC = () => {
  const { logs, user, allUsers, updateUserRole, refreshUsers, preferences, updatePreferences } = useInventory();
  const [activeTab, setActiveTab] = useState<'general' | 'logs' | 'users'>('logs');

  const isManager = user?.role === 'MANAGER';

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      await updateUserRole(userId, newRole as UserRole);
    }
  };

  const handlePreferenceChange = (key: string, value: string) => {
    updatePreferences({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500 mt-1">Manage system preferences and view activity history</p>
      </div>

      <div className="flex space-x-4 border-b border-gray-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'logs' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Activity Log
          {activeTab === 'logs' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
            activeTab === 'general' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          General Settings
          {activeTab === 'general' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
          )}
        </button>
        {isManager && (
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 text-sm font-medium transition-colors relative whitespace-nowrap ${
              activeTab === 'users' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            User Management
            {activeTab === 'users' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
            )}
          </button>
        )}
      </div>

      {activeTab === 'logs' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">System Activity</h2>
            <p className="text-sm text-gray-500">Track all actions performed within the application</p>
          </div>
          <ul className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
            {logs.length === 0 ? (
              <li className="p-8 text-center text-gray-400">No recent activity</li>
            ) : (
              logs.map((log) => (
                <li key={log.id} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-4 ${
                      log.action === 'ADD' ? 'bg-green-100 text-green-600' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-600' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-600' :
                      log.action === 'LOGIN' ? 'bg-purple-100 text-purple-600' :
                      log.action === 'USER_MGMT' ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <History className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{log.description}</p>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-500">User: <span className="font-semibold">{log.user}</span></p>
                        <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Profile Settings</h3>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={user?.name || ''} 
                  readOnly
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  readOnly
                  className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <div className="flex items-center mb-4">
               <Shield className="w-5 h-5 text-gray-500 mr-2" />
               <h3 className="text-lg font-bold text-gray-900">System Preferences</h3>
             </div>
             <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Warehouse View</label>
                  <select 
                    value={preferences.defaultView}
                    onChange={(e) => handlePreferenceChange('defaultView', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option>Show All</option>
                    <option>Nsakena</option>
                    <option>Viv Warehouse</option>
                    <option>Yellow Sack</option>
                  </select>
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency Symbol</label>
                  <select 
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="GHS">₵ (GHS)</option>
                    <option value="GBP">£ (GBP)</option>
                    <option value="USD">$ (USD)</option>
                    <option value="EUR">€ (EUR)</option>
                  </select>
               </div>
               <div className="pt-2">
                 <button 
                  disabled
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-default"
                 >
                   <Save className="w-4 h-4 mr-2" />
                   Auto-Saved
                 </button>
               </div>
             </form>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
             <div className="flex items-center mb-4">
               <Lock className="w-5 h-5 text-gray-500 mr-2" />
               <h3 className="text-lg font-bold text-gray-900">Data Management</h3>
             </div>
             <p className="text-sm text-gray-500 mb-4">
               Clear local storage data if you are experiencing issues or want to reset the demo.
             </p>
             <button 
               onClick={() => {
                 if(confirm('Are you sure? This will reset all inventory and debtors to default.')) {
                   localStorage.clear();
                   window.location.reload();
                 }
               }}
               className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition"
             >
               Reset Application Data
             </button>
          </div>
        </div>
      )}

      {activeTab === 'users' && isManager && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
             <div>
               <h2 className="text-lg font-bold text-gray-900">User Management</h2>
               <p className="text-sm text-gray-500">View registered users and assign access roles.</p>
             </div>
             <div className="flex items-center gap-3">
               <button 
                  onClick={() => refreshUsers()}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition"
                  title="Refresh List"
               >
                 <RefreshCw className="w-5 h-5" />
               </button>
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-6 h-6" />
               </div>
             </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Last Active</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {allUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                      No user profiles found.
                    </td>
                  </tr>
                ) : (
                  allUsers.map((profile) => (
                    <tr key={profile.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">{profile.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{profile.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          profile.role === 'MANAGER' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {profile.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {profile.last_seen ? new Date(profile.last_seen).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-right">
                         <div className="flex justify-end items-center gap-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <select 
                              value={profile.role}
                              onChange={(e) => handleRoleChange(profile.id, e.target.value)}
                              className="text-sm border-gray-200 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none py-1 pl-2 pr-8 bg-white cursor-pointer"
                              disabled={profile.email === user?.email} // Cannot change own role here effectively to avoid lockout
                            >
                              <option value="STAFF">STAFF</option>
                              <option value="MANAGER">MANAGER</option>
                            </select>
                         </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
