'use client';

import { useState } from 'react';
import { Mail, Plus, Edit, Eye, Copy } from 'lucide-react';

const MOCK_TEMPLATES = [
  { id: '1', name: 'Welcome Email', trigger: 'USER_SIGNUP', lastEdited: '2024-01-10', status: 'ACTIVE' },
  { id: '2', name: 'Order Confirmation', trigger: 'ORDER_PLACED', lastEdited: '2024-01-08', status: 'ACTIVE' },
  { id: '3', name: 'Password Reset', trigger: 'PASSWORD_RESET', lastEdited: '2024-01-05', status: 'ACTIVE' },
  { id: '4', name: 'KYB Approved', trigger: 'KYB_APPROVED', lastEdited: '2024-01-03', status: 'ACTIVE' },
  { id: '5', name: 'Payment Receipt', trigger: 'PAYMENT_SUCCESS', lastEdited: '2024-01-01', status: 'DRAFT' },
];

export default function EmailTemplatesPage() {
  const [templates] = useState(MOCK_TEMPLATES);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Templates</h1>
          <p className="text-slate-400">Manage automated email templates</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{template.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      template.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Trigger: {template.trigger}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 text-sm">Edited {template.lastEdited}</span>
                <div className="flex gap-2">
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
