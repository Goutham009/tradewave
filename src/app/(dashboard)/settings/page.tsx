'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  Mail,
  Globe,
  Palette,
  CreditCard,
  Link as LinkIcon,
  Save,
  Check,
} from 'lucide-react';

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    quotationAlerts: true,
    orderUpdates: true,
    marketingEmails: false,
    weeklyDigest: true,
  });

  const [preferences, setPreferences] = useState({
    language: 'en',
    currency: 'USD',
    timezone: 'Asia/Kolkata',
    theme: 'system',
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your preferences and notifications
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save All
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Choose what updates you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'emailAlerts', label: 'Email Alerts', description: 'Receive important alerts via email' },
              { key: 'quotationAlerts', label: 'Quotation Alerts', description: 'Get notified when new quotations arrive' },
              { key: 'orderUpdates', label: 'Order Updates', description: 'Updates on your order status' },
              { key: 'marketingEmails', label: 'Marketing Emails', description: 'Tips, offers, and product updates' },
              { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Weekly summary of your activities' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <button
                  onClick={() => toggleNotification(item.key as keyof typeof notifications)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications]
                      ? 'bg-primary'
                      : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                      notifications[item.key as keyof typeof notifications]
                        ? 'translate-x-5'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Preferences
            </CardTitle>
            <CardDescription>
              Customize your experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                value={preferences.language}
                onChange={(e) => setPreferences((p) => ({ ...p, language: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="zh">Chinese</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <select
                id="currency"
                value={preferences.currency}
                onChange={(e) => setPreferences((p) => ({ ...p, currency: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="CNY">CNY - Chinese Yuan</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <select
                id="timezone"
                value={preferences.timezone}
                onChange={(e) => setPreferences((p) => ({ ...p, timezone: e.target.value }))}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Shanghai">Asia/Shanghai (CST)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => setPreferences((p) => ({ ...p, theme }))}
                    className={`rounded-lg border p-3 text-center capitalize ${
                      preferences.theme === theme
                        ? 'border-primary bg-primary/5'
                        : 'border-input'
                    }`}
                  >
                    {preferences.theme === theme && (
                      <Check className="mx-auto mb-1 h-4 w-4 text-primary" />
                    )}
                    {theme}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Methods
            </CardTitle>
            <CardDescription>
              Manage your payment options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-100">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Visa ending in 4242</p>
                  <p className="text-sm text-muted-foreground">Expires 12/25</p>
                </div>
              </div>
              <Badge variant="outline">Default</Badge>
            </div>

            <Button variant="outline" className="w-full">
              + Add Payment Method
            </Button>
          </CardContent>
        </Card>

        {/* Integrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Integrations
            </CardTitle>
            <CardDescription>
              Connect with other services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-purple-100">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <p className="font-medium">Email Integration</p>
                  <p className="text-sm text-muted-foreground">Sync with your email</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-green-100">
                  <span className="text-lg">📊</span>
                </div>
                <div>
                  <p className="font-medium">ERP System</p>
                  <p className="text-sm text-muted-foreground">Connect your ERP</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-orange-100">
                  <span className="text-lg">🔗</span>
                </div>
                <div>
                  <p className="font-medium">Blockchain Wallet</p>
                  <p className="text-sm text-muted-foreground">Connect MetaMask</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
