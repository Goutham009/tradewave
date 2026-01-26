'use client';

import { useState } from 'react';
import { Globe, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';

const MOCK_REGIONS = [
  { id: '1', name: 'United States', code: 'US', currency: 'USD', status: 'ACTIVE' },
  { id: '2', name: 'United Kingdom', code: 'GB', currency: 'GBP', status: 'ACTIVE' },
  { id: '3', name: 'European Union', code: 'EU', currency: 'EUR', status: 'ACTIVE' },
  { id: '4', name: 'India', code: 'IN', currency: 'INR', status: 'ACTIVE' },
  { id: '5', name: 'Japan', code: 'JP', currency: 'JPY', status: 'INACTIVE' },
];

export default function RegionsSettingsPage() {
  const [regions] = useState(MOCK_REGIONS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Regions & Currency</h1>
          <p className="text-slate-400">Manage supported regions and currencies</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Region
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">Region</th>
                <th className="text-left p-4 text-slate-400 font-medium">Code</th>
                <th className="text-left p-4 text-slate-400 font-medium">Currency</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region) => (
                <tr key={region.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">{region.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300 font-mono">{region.code}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-slate-300">{region.currency}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      region.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {region.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
