'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  RefreshCw,
  Settings,
  Save,
  RotateCcw,
  Loader2,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Shield,
  FileCheck,
} from 'lucide-react';

interface AdminSetting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  category: string | null;
  updatedBy: string;
  updatedAt: string;
}

const CATEGORY_ICONS: Record<string, any> = {
  FEES: DollarSign,
  SECURITY: Shield,
  COMPLIANCE: FileCheck,
  GENERAL: Settings,
};

const CATEGORY_COLORS: Record<string, string> = {
  FEES: 'bg-green-500/20 text-green-400',
  SECURITY: 'bg-red-500/20 text-red-400',
  COMPLIANCE: 'bg-blue-500/20 text-blue-400',
  GENERAL: 'bg-slate-500/20 text-slate-400',
};

export function SettingsSection() {
  const [settings, setSettings] = useState<AdminSetting[]>([]);
  const [originalSettings, setOriginalSettings] = useState<AdminSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modifiedKeys, setModifiedKeys] = useState<Set<string>>(new Set());

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/admin/settings');
      
      if (response.status === 403) {
        setError('Access denied. Admin privileges required.');
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSettings(result.data);
        setOriginalSettings(JSON.parse(JSON.stringify(result.data)));
        setModifiedKeys(new Set());
      } else {
        setError(result.error || 'Failed to fetch settings');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      // Use mock data as fallback
      const mockSettings = [
        { id: 's1', key: 'TRANSACTION_FEE', value: '2.5', description: 'Platform transaction fee percentage', category: 'FINANCIAL', updatedBy: 'admin', updatedAt: new Date().toISOString() },
        { id: 's2', key: 'KYC_REQUIRED', value: 'true', description: 'Require KYC verification for transactions', category: 'COMPLIANCE', updatedBy: 'admin', updatedAt: new Date().toISOString() },
        { id: 's3', key: 'DISPUTE_RESOLUTION_DAYS', value: '14', description: 'Days allowed for dispute resolution', category: 'OPERATIONS', updatedBy: 'admin', updatedAt: new Date().toISOString() },
        { id: 's4', key: 'ESCROW_REQUIRED', value: 'true', description: 'Require escrow for all transactions', category: 'FINANCIAL', updatedBy: 'admin', updatedAt: new Date().toISOString() },
        { id: 's5', key: 'MIN_TRANSACTION_AMOUNT', value: '100', description: 'Minimum transaction amount in USD', category: 'FINANCIAL', updatedBy: 'admin', updatedAt: new Date().toISOString() },
        { id: 's6', key: 'MAX_TRANSACTION_AMOUNT', value: '1000000', description: 'Maximum transaction amount in USD', category: 'FINANCIAL', updatedBy: 'admin', updatedAt: new Date().toISOString() },
      ];
      setSettings(mockSettings);
      setOriginalSettings(mockSettings);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleValueChange = (key: string, newValue: string) => {
    setSettings(prev => 
      prev.map(s => s.key === key ? { ...s, value: newValue } : s)
    );
    
    const original = originalSettings.find(s => s.key === key);
    if (original && original.value !== newValue) {
      setModifiedKeys(prev => new Set(Array.from(prev).concat(key)));
    } else {
      setModifiedKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
    
    setSuccess(null);
  };

  const handleSave = async () => {
    if (modifiedKeys.size === 0) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const modifiedSettings = settings
        .filter(s => modifiedKeys.has(s.key))
        .map(s => ({
          key: s.key,
          value: s.value,
          description: s.description,
          category: s.category,
        }));
      
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: modifiedSettings }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      const result = await response.json();
      
      if (result.success) {
        setOriginalSettings(JSON.parse(JSON.stringify(settings)));
        setModifiedKeys(new Set());
        setSuccess(`Successfully updated ${result.data.updated} settings`);
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(JSON.parse(JSON.stringify(originalSettings)));
    setModifiedKeys(new Set());
    setSuccess(null);
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    const category = setting.category || 'GENERAL';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(setting);
    return acc;
  }, {} as Record<string, AdminSetting[]>);

  if (loading) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && settings.length === 0) {
    return (
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center text-red-400 gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={fetchSettings} variant="outline" className="border-slate-600">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Admin Settings
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Configure platform settings and parameters
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              disabled={modifiedKeys.size === 0 || saving}
              className="border-slate-600 text-slate-300"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={modifiedKeys.size === 0 || saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/20 text-red-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/20 text-green-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </div>
        )}
        
        {modifiedKeys.size > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {modifiedKeys.size} unsaved change(s)
          </div>
        )}

        {/* Settings by Category */}
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([category, categorySettings]) => {
            const Icon = CATEGORY_ICONS[category] || Settings;
            return (
              <div key={category} className="space-y-4">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-slate-400" />
                  <h3 className="text-sm font-medium text-slate-300">{category}</h3>
                  <Badge className={CATEGORY_COLORS[category] || CATEGORY_COLORS.GENERAL}>
                    {categorySettings.length}
                  </Badge>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  {categorySettings.map((setting) => (
                    <div
                      key={setting.key}
                      className={`p-4 rounded-lg border ${
                        modifiedKeys.has(setting.key)
                          ? 'bg-yellow-500/10 border-yellow-500/50'
                          : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      <Label htmlFor={setting.key} className="text-slate-300 text-sm">
                        {setting.key.replace(/_/g, ' ')}
                        {modifiedKeys.has(setting.key) && (
                          <span className="ml-2 text-yellow-400 text-xs">Modified</span>
                        )}
                      </Label>
                      <Input
                        id={setting.key}
                        value={setting.value}
                        onChange={(e) => handleValueChange(setting.key, e.target.value)}
                        className="mt-2 bg-slate-800 border-slate-600 text-white"
                      />
                      {setting.description && (
                        <p className="mt-1 text-xs text-slate-500">{setting.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {settings.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No settings configured</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
