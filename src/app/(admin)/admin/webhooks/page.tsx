'use client';

import { useState } from 'react';
import { Webhook, Plus, Edit, Trash2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const MOCK_WEBHOOKS = [
  { id: '1', url: 'https://api.example.com/webhook', events: ['order.created', 'payment.completed'], status: 'ACTIVE', lastDelivery: 'Success', lastRun: '2024-01-15 14:30' },
  { id: '2', url: 'https://erp.company.com/tradewave', events: ['order.*'], status: 'ACTIVE', lastDelivery: 'Success', lastRun: '2024-01-15 14:25' },
  { id: '3', url: 'https://old-system.test/hook', events: ['user.created'], status: 'INACTIVE', lastDelivery: 'Failed', lastRun: '2024-01-10 10:00' },
];

export default function WebhooksPage() {
  const [webhooks] = useState(MOCK_WEBHOOKS);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Webhooks</h1>
          <p className="text-slate-400">Configure external integrations via webhooks</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Webhook
        </button>
      </div>

      <div className="grid gap-4">
        {webhooks.map((webhook) => (
          <div key={webhook.id} className={`bg-slate-900 rounded-xl border p-6 ${
            webhook.status === 'INACTIVE' ? 'border-slate-800 opacity-60' : 'border-slate-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${
                  webhook.status === 'ACTIVE' ? 'bg-blue-500/20' : 'bg-slate-800'
                }`}>
                  <Webhook className={`w-6 h-6 ${
                    webhook.status === 'ACTIVE' ? 'text-blue-400' : 'text-slate-500'
                  }`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-mono text-sm">{webhook.url}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      webhook.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'
                    }`}>
                      {webhook.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    {webhook.events.map((event) => (
                      <span key={event} className="px-2 py-0.5 bg-slate-800 rounded text-xs text-slate-400">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-sm">
                  <div className="flex items-center gap-1">
                    {webhook.lastDelivery === 'Success' ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400" />
                    )}
                    <span className={webhook.lastDelivery === 'Success' ? 'text-green-400' : 'text-red-400'}>
                      {webhook.lastDelivery}
                    </span>
                  </div>
                  <p className="text-slate-500">{webhook.lastRun}</p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400">
                    <Trash2 className="w-4 h-4" />
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
