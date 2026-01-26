'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, MessageSquare, Package, DollarSign, AlertTriangle, Save } from 'lucide-react';
import Link from 'next/link';

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'quotes', label: 'New Quotations', description: 'When suppliers send you new quotes', email: true, push: true, sms: false },
    { id: 'orders', label: 'Order Updates', description: 'Status changes on your orders', email: true, push: true, sms: true },
    { id: 'shipments', label: 'Shipment Tracking', description: 'Delivery and tracking updates', email: true, push: true, sms: false },
    { id: 'payments', label: 'Payment Alerts', description: 'Payment confirmations and reminders', email: true, push: false, sms: true },
    { id: 'messages', label: 'Messages', description: 'New messages from suppliers', email: false, push: true, sms: false },
    { id: 'rfq', label: 'RFQ Updates', description: 'Updates on your RFQ submissions', email: true, push: true, sms: false },
    { id: 'security', label: 'Security Alerts', description: 'Login attempts and security events', email: true, push: true, sms: true },
    { id: 'marketing', label: 'Marketing & Offers', description: 'Promotions and special offers', email: false, push: false, sms: false },
  ]);

  const toggleSetting = (id: string, channel: 'email' | 'push' | 'sms') => {
    setSettings(prev => prev.map(s => 
      s.id === id ? { ...s, [channel]: !s[channel] } : s
    ));
  };

  const handleSave = () => {
    alert('Notification settings saved!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notification Settings</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Choose how you want to be notified</p>
        </div>
        <div className="flex gap-3">
          <Link href="/settings" className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800">
            Cancel
          </Link>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Channel Legend */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Email</span>
          </div>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">Push Notification</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600 dark:text-gray-400">SMS</span>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-slate-800">
          {settings.map((setting) => (
            <div key={setting.id} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">{setting.label}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
              </div>
              <div className="flex items-center gap-6">
                {/* Email Toggle */}
                <button
                  onClick={() => toggleSetting(setting.id, 'email')}
                  className={`p-2 rounded-lg transition-colors ${
                    setting.email
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      : 'bg-gray-100 text-gray-400 dark:bg-slate-800'
                  }`}
                  title="Email"
                >
                  <Mail className="w-5 h-5" />
                </button>
                
                {/* Push Toggle */}
                <button
                  onClick={() => toggleSetting(setting.id, 'push')}
                  className={`p-2 rounded-lg transition-colors ${
                    setting.push
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      : 'bg-gray-100 text-gray-400 dark:bg-slate-800'
                  }`}
                  title="Push Notification"
                >
                  <Bell className="w-5 h-5" />
                </button>
                
                {/* SMS Toggle */}
                <button
                  onClick={() => toggleSetting(setting.id, 'sms')}
                  className={`p-2 rounded-lg transition-colors ${
                    setting.sms
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'
                      : 'bg-gray-100 text-gray-400 dark:bg-slate-800'
                  }`}
                  title="SMS"
                >
                  <Smartphone className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Quiet Hours</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Pause non-urgent notifications during specific hours
        </p>
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
            <select className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              <option>10:00 PM</option>
              <option>11:00 PM</option>
              <option>12:00 AM</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
            <select className="px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
              <option>6:00 AM</option>
              <option>7:00 AM</option>
              <option>8:00 AM</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
