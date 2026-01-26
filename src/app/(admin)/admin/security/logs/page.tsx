'use client';

import { useState } from 'react';
import { Activity, Filter, Download, Shield, AlertTriangle } from 'lucide-react';

const MOCK_LOGS = [
  { id: '1', action: 'USER_LOGIN', user: 'john@example.com', ip: '192.168.1.1', timestamp: '2024-01-15 14:30:00', status: 'SUCCESS' },
  { id: '2', action: 'PASSWORD_CHANGE', user: 'jane@example.com', ip: '192.168.1.2', timestamp: '2024-01-15 14:25:00', status: 'SUCCESS' },
  { id: '3', action: 'LOGIN_FAILED', user: 'unknown@test.com', ip: '10.0.0.5', timestamp: '2024-01-15 14:20:00', status: 'FAILED' },
  { id: '4', action: 'KYB_APPROVED', user: 'admin@tradewave.io', ip: '192.168.1.100', timestamp: '2024-01-15 14:15:00', status: 'SUCCESS' },
];

export default function AuditLogsPage() {
  const [logs] = useState(MOCK_LOGS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400">Security and activity audit trail</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">Timestamp</th>
                <th className="text-left p-4 text-slate-400 font-medium">Action</th>
                <th className="text-left p-4 text-slate-400 font-medium">User</th>
                <th className="text-left p-4 text-slate-400 font-medium">IP Address</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4 text-slate-400 font-mono text-sm">{log.timestamp}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {log.status === 'FAILED' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : (
                        <Activity className="w-4 h-4 text-blue-400" />
                      )}
                      <span className="text-white">{log.action}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{log.user}</td>
                  <td className="p-4 text-slate-400 font-mono text-sm">{log.ip}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      log.status === 'SUCCESS' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {log.status}
                    </span>
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
