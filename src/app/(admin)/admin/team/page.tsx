'use client';

import { useState } from 'react';
import { UserCog, Plus, Edit, Trash2, Shield, Mail } from 'lucide-react';

const MOCK_TEAM = [
  { id: '1', name: 'John Admin', email: 'john@tradewave.io', role: 'SUPER_ADMIN', lastActive: '2024-01-15 14:30', status: 'ONLINE' },
  { id: '2', name: 'Jane Manager', email: 'jane@tradewave.io', role: 'ADMIN', lastActive: '2024-01-15 12:00', status: 'ONLINE' },
  { id: '3', name: 'Bob Support', email: 'bob@tradewave.io', role: 'SUPPORT', lastActive: '2024-01-14 18:00', status: 'OFFLINE' },
  { id: '4', name: 'Alice Analyst', email: 'alice@tradewave.io', role: 'ANALYST', lastActive: '2024-01-15 10:00', status: 'OFFLINE' },
];

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-red-500/20 text-red-400',
  ADMIN: 'bg-blue-500/20 text-blue-400',
  SUPPORT: 'bg-green-500/20 text-green-400',
  ANALYST: 'bg-yellow-500/20 text-yellow-400',
};

export default function AdminTeamPage() {
  const [team] = useState(MOCK_TEAM);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Team</h1>
          <p className="text-slate-400">Manage admin users and permissions</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Invite Admin
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">User</th>
                <th className="text-left p-4 text-slate-400 font-medium">Role</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Last Active</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((member) => (
                <tr key={member.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                        <span className="text-white font-medium">{member.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{member.name}</p>
                        <p className="text-slate-400 text-sm">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${ROLE_COLORS[member.role]}`}>
                      {member.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        member.status === 'ONLINE' ? 'bg-green-400' : 'bg-slate-500'
                      }`} />
                      <span className={member.status === 'ONLINE' ? 'text-green-400' : 'text-slate-400'}>
                        {member.status}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-400">{member.lastActive}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                        <Mail className="w-4 h-4" />
                      </button>
                      {member.role !== 'SUPER_ADMIN' && (
                        <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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
