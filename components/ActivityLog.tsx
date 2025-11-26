import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { History } from 'lucide-react';

const ActivityLogList: React.FC = () => {
  const { logs } = useInventory();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Activity Logs</h2>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <ul className="divide-y divide-gray-100">
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
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <History className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{log.description}</p>
                    <div className="flex justify-between mt-1">
                      <p className="text-xs text-gray-500">Performed by: <span className="font-semibold">{log.user}</span></p>
                      <p className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default ActivityLogList;