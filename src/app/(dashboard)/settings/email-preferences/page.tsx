'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Mail, Package, CreditCard, Truck, AlertTriangle, Calendar, Loader2, CheckCircle } from 'lucide-react';

interface EmailPreferences {
  quoteNotifications: boolean;
  transactionNotifications: boolean;
  paymentNotifications: boolean;
  deliveryNotifications: boolean;
  disputeNotifications: boolean;
  systemNotifications: boolean;
  weeklyDigest: boolean;
  unsubscribedAt: string | null;
}

const preferenceItems = [
  { key: 'quoteNotifications', label: 'Quote Notifications', description: 'Receive emails when you get new quotes or quote updates', icon: Mail },
  { key: 'transactionNotifications', label: 'Transaction Notifications', description: 'Get notified about transaction status changes', icon: Package },
  { key: 'paymentNotifications', label: 'Payment Notifications', description: 'Receive payment confirmations and release notifications', icon: CreditCard },
  { key: 'deliveryNotifications', label: 'Delivery Notifications', description: 'Track shipment and delivery updates via email', icon: Truck },
  { key: 'disputeNotifications', label: 'Dispute Notifications', description: 'Stay informed about dispute filings and resolutions', icon: AlertTriangle },
  { key: 'systemNotifications', label: 'System Notifications', description: 'Important account and security notifications', icon: Bell },
  { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary of your activity', icon: Calendar },
];

export default function EmailPreferencesPage() {
  const [preferences, setPreferences] = useState<EmailPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/emails/preferences');
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (err) {
      setError('Failed to load preferences');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async (key: string, value: boolean) => {
    if (!preferences) return;
    const updated = { ...preferences, [key]: value };
    setPreferences(updated);
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/emails/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        setPreferences(preferences);
        setError('Failed to save');
      }
    } catch {
      setPreferences(preferences);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const unsubscribeAll = async () => {
    if (!confirm('Are you sure you want to unsubscribe from all emails?')) return;
    setSaving(true);
    try {
      const res = await fetch('/api/emails/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteNotifications: false,
          transactionNotifications: false,
          paymentNotifications: false,
          deliveryNotifications: false,
          disputeNotifications: false,
          systemNotifications: false,
          weeklyDigest: false,
        }),
      });
      if (res.ok) {
        fetchPreferences();
      }
    } catch {
      setError('Failed to unsubscribe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">Email Preferences</h1>
        <p className="text-zinc-500 mt-1">Manage which emails you receive from Tradewave</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {saved && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Preferences saved successfully
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
        {preferenceItems.map((item) => {
          const Icon = item.icon;
          const isEnabled = preferences?.[item.key as keyof EmailPreferences] as boolean;
          return (
            <div key={item.key} className="p-4 flex items-center justify-between">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-zinc-100 rounded-lg">
                  <Icon className="w-5 h-5 text-zinc-600" />
                </div>
                <div>
                  <h3 className="font-medium text-zinc-900">{item.label}</h3>
                  <p className="text-sm text-zinc-500">{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => updatePreference(item.key, !isEnabled)}
                disabled={saving}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isEnabled ? 'bg-sky-500' : 'bg-zinc-300'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    isEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-6 bg-zinc-50 rounded-xl border border-zinc-200">
        <h3 className="font-medium text-zinc-900 mb-2">Unsubscribe from all emails</h3>
        <p className="text-sm text-zinc-500 mb-4">
          You will still receive critical security and account notifications required by law.
        </p>
        <button
          onClick={unsubscribeAll}
          disabled={saving}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          Unsubscribe from all
        </button>
      </div>
    </div>
  );
}
