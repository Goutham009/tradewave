'use client';

import { useState } from 'react';
import { Key, Plus, Copy, Trash2, Eye, EyeOff } from 'lucide-react';

const MOCK_KEYS = [
  { id: '1', name: 'Production API', key: 'tw_prod_xxxx...xxxx', created: '2024-01-01', lastUsed: '2024-01-15', status: 'ACTIVE' },
  { id: '2', name: 'Development API', key: 'tw_dev_xxxx...xxxx', created: '2024-01-05', lastUsed: '2024-01-14', status: 'ACTIVE' },
  { id: '3', name: 'Testing API', key: 'tw_test_xxxx...xxxx', created: '2023-12-01', lastUsed: '2023-12-20', status: 'REVOKED' },
];

export default function ApiKeysPage() {
  const [keys] = useState(MOCK_KEYS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">API Keys</h1>
          <p className="text-slate-400">Manage API access credentials</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Generate Key
        </button>
      </div>

      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
        <p className="text-yellow-400 text-sm">
          ⚠️ API keys provide full access to your account. Keep them secure and never share them publicly.
        </p>
      </div>

      <div className="grid gap-4">
        {keys.map((apiKey) => (
          <div key={apiKey.id} className={`bg-slate-900 rounded-xl border p-6 ${
            apiKey.status === 'REVOKED' ? 'border-slate-800 opacity-60' : 'border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  apiKey.status === 'ACTIVE' ? 'bg-green-500/20' : 'bg-slate-800'
                }`}>
                  <Key className={`w-6 h-6 ${
                    apiKey.status === 'ACTIVE' ? 'text-green-400' : 'text-slate-500'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{apiKey.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      apiKey.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {apiKey.status}
                    </span>
                  </div>
                  <p className="text-slate-400 font-mono text-sm mt-1">{apiKey.key}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right text-sm">
                  <p className="text-slate-400">Created: {apiKey.created}</p>
                  <p className="text-slate-500">Last used: {apiKey.lastUsed}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Copy className="w-4 h-4" />
                  </button>
                  {apiKey.status === 'ACTIVE' && (
                    <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
