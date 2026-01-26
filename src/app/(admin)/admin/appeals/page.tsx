'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, MessageSquare } from 'lucide-react';

const MOCK_APPEALS = [
  { id: '1', userId: 'USR001', userName: 'John Doe', type: 'BLACKLIST', reason: 'Account suspended unfairly', status: 'PENDING', createdAt: '2024-01-15' },
  { id: '2', userId: 'USR002', userName: 'Jane Smith', type: 'KYB_REJECTION', reason: 'Documents were valid', status: 'UNDER_REVIEW', createdAt: '2024-01-14' },
];

export default function AppealsPage() {
  const [appeals] = useState(MOCK_APPEALS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Appeals Review</h1>
          <p className="text-slate-400">Review and manage user appeals</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">User</th>
                <th className="text-left p-4 text-slate-400 font-medium">Type</th>
                <th className="text-left p-4 text-slate-400 font-medium">Reason</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appeals.map((appeal) => (
                <tr key={appeal.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="text-white font-medium">{appeal.userName}</div>
                    <div className="text-slate-400 text-sm">{appeal.userId}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                      {appeal.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs truncate">{appeal.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appeal.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      appeal.status === 'UNDER_REVIEW' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {appeal.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{appeal.createdAt}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-green-500/20 rounded-lg text-slate-400 hover:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400">
                        <XCircle className="w-4 h-4" />
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
