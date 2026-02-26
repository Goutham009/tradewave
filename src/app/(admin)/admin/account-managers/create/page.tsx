'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  ArrowLeft,
  UserPlus,
  Copy,
  CheckCircle,
  Mail,
  User,
  Key,
} from 'lucide-react';
import Link from 'next/link';

interface CreatedUser {
  email: string;
  password: string;
  name: string;
}

export default function CreateAccountManagerPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [creating, setCreating] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);
  const [copied, setCopied] = useState<'email' | 'password' | null>(null);

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setCreating(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const password = generatePassword();
    setCreatedUser({
      email,
      password,
      name,
    });
    
    setCreating(false);
  };

  const handleCopy = async (text: string, type: 'email' | 'password') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleClose = () => {
    setCreatedUser(null);
    setName('');
    setEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/account-managers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Create Account Manager</h1>
          <p className="text-slate-400">Generate login credentials for a new account manager</p>
        </div>
      </div>

      <Card className="bg-slate-900 border-slate-800 max-w-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New Account Manager
          </CardTitle>
          <CardDescription>
            Fill in the details below. A secure password will be auto-generated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="am@tradewave.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-slate-800 border-slate-700"
                  required
                />
              </div>
              <p className="text-xs text-slate-500">
                Use @tradewave.io domain for internal users
              </p>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={creating || !name || !email} className="w-full">
                {creating ? (
                  <>Creating...</>
                ) : (
                  <>
                    <Key className="h-4 w-4 mr-2" />
                    Generate Credentials
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={!!createdUser} onOpenChange={handleClose}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Account Manager Created
            </DialogTitle>
            <DialogDescription>
              Share these credentials securely with {createdUser?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-slate-800 border border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <p className="text-white font-mono">{createdUser?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(createdUser?.email || '', 'email')}
                >
                  {copied === 'email' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Password</p>
                  <p className="text-white font-mono">{createdUser?.password}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(createdUser?.password || '', 'password')}
                >
                  {copied === 'password' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-400">
                ⚠️ This password will only be shown once. Make sure to copy and share it securely.
              </p>
            </div>

            <div className="text-sm text-slate-400">
              <p>The user can log in at:</p>
              <Badge variant="outline" className="mt-1 font-mono">
                /login
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
