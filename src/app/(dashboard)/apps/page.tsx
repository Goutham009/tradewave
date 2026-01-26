'use client';

import { useState } from 'react';
import { Puzzle, Check, ExternalLink, Settings, Zap, Database, BarChart3, FileText } from 'lucide-react';

interface App {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  connected: boolean;
}

export default function ConnectedAppsPage() {
  const [apps, setApps] = useState<App[]>([
    { id: '1', name: 'QuickBooks', description: 'Sync invoices and payments automatically', icon: '📊', category: 'Accounting', connected: true },
    { id: '2', name: 'Salesforce', description: 'Connect your CRM for better customer insights', icon: '☁️', category: 'CRM', connected: false },
    { id: '3', name: 'Slack', description: 'Get notifications in your Slack channels', icon: '💬', category: 'Communication', connected: true },
    { id: '4', name: 'SAP', description: 'Enterprise resource planning integration', icon: '🔷', category: 'ERP', connected: false },
    { id: '5', name: 'Zapier', description: 'Connect with 5000+ apps via Zapier', icon: '⚡', category: 'Automation', connected: false },
    { id: '6', name: 'Google Sheets', description: 'Export data to Google Sheets automatically', icon: '📗', category: 'Productivity', connected: true },
  ]);

  const toggleConnection = (id: string) => {
    setApps(prev => prev.map(app => 
      app.id === id ? { ...app, connected: !app.connected } : app
    ));
  };

  const connectedApps = apps.filter(a => a.connected);
  const availableApps = apps.filter(a => !a.connected);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Connected Apps</h1>
          <p className="text-gray-500 mt-1">Integrate Tradewave with your favorite tools</p>
        </div>
      </div>

      {/* Connected Apps */}
      {connectedApps.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            Connected ({connectedApps.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {connectedApps.map((app) => (
              <div key={app.id} className="bg-white rounded-xl border border-green-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      {app.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{app.name}</h3>
                      <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                        Connected
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">{app.description}</p>
                <div className="flex gap-2">
                  <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm flex items-center justify-center gap-1">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={() => toggleConnection(app.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Apps */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-blue-600" />
          Available Integrations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableApps.map((app) => (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                    {app.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.name}</h3>
                    <span className="text-xs text-gray-500">{app.category}</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-4">{app.description}</p>
              <button
                onClick={() => toggleConnection(app.id)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1"
              >
                <Zap className="w-4 h-4" />
                Connect
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* API Access */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6" />
          <h2 className="text-lg font-semibold">Need custom integration?</h2>
        </div>
        <p className="text-gray-300 mb-4">
          Use our REST API to build custom integrations with your internal systems.
        </p>
        <button className="px-4 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 text-sm font-medium flex items-center gap-2">
          View API Documentation
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
