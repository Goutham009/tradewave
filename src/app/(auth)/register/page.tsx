'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Eye, EyeOff, Mail, Lock, User, Building, AlertCircle, Check,
  Phone, Globe, MapPin, Tag, ShoppingBag, Store, ArrowLeftRight,
} from 'lucide-react';

const SOURCE_OPTIONS = [
  { value: 'BUSINESS_DEVELOPMENT', label: 'Business Development Team' },
  { value: 'ORGANIC', label: 'Google Search' },
  { value: 'REFERRAL', label: 'Referral from friend/colleague' },
  { value: 'TRADE_SHOW', label: 'Trade show/Event' },
  { value: 'SOCIAL_MEDIA', label: 'Social Media' },
  { value: 'OTHER', label: 'Other' },
];

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    phone: '',
    country: '',
    region: '',
    city: '',
    password: '',
    confirmPassword: '',
    accountType: 'BUYER' as 'BUYER' | 'SUPPLIER' | 'BOTH',
    source: '',
    referralCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptVerification, setAcceptVerification] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms || !acceptPrivacy) {
      setError('Please accept the terms and conditions');
      return;
    }

    if (formData.accountType === 'SUPPLIER' && !acceptVerification) {
      setError('Suppliers must consent to background verification');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          companyName: formData.companyName,
          phone: formData.phone,
          country: formData.country,
          region: formData.region || undefined,
          city: formData.city || undefined,
          password: formData.password,
          accountType: formData.accountType,
          source: formData.source || undefined,
          referralCode: formData.referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Redirect to registration success page with context
      const params = new URLSearchParams({
        email: formData.email,
        name: formData.name,
        role: formData.accountType,
      });
      if (data.amAssigned && data.amName) {
        params.set('am', data.amName);
      }
      router.push(`/register/success?${params.toString()}`);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = () => {
    const { password } = formData;
    if (!password) return { strength: 0, text: '' };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    const texts = ['Weak', 'Fair', 'Good', 'Strong'];
    return { strength, text: texts[strength - 1] || '' };
  };

  const { strength, text } = passwordStrength();
  const isSupplier = formData.accountType === 'SUPPLIER' || formData.accountType === 'BOTH';

  return (
    <div className="space-y-6">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <span className="text-2xl font-bold">Tradewave</span>
        </Link>
      </div>

      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Join Tradewave</h1>
        <p className="text-muted-foreground">
          One platform for all your B2B needs
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Account Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">I want to:</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'BUYER', label: 'Buy', icon: ShoppingBag, desc: 'Buy products/services' },
              { value: 'SUPPLIER', label: 'Sell', icon: Store, desc: 'Sell products/services' },
              { value: 'BOTH', label: 'Both', icon: ArrowLeftRight, desc: 'Buy & Sell' },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, accountType: value as any }))}
                className={`p-3 rounded-lg border-2 text-center transition-all ${
                  formData.accountType === value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-muted hover:border-muted-foreground/30'
                }`}
              >
                <Icon className={`h-5 w-5 mx-auto mb-1 ${formData.accountType === value ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className={`text-sm font-medium ${formData.accountType === value ? 'text-primary' : ''}`}>{label}</p>
                <p className="text-[10px] text-muted-foreground">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Personal Information */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Personal Information</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="name" name="name" placeholder="Chen Wei" value={formData.name} onChange={handleChange} className="pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" name="email" type="email" placeholder="you@company.com" value={formData.email} onChange={handleChange} className="pl-10" required />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="phone" name="phone" type="tel" placeholder="+86 20 1234 5678" value={formData.phone} onChange={handleChange} className="pl-10" required />
          </div>
        </div>

        {/* Company Information */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company Information</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name *</Label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="companyName" name="companyName" placeholder="Steel Masters China Ltd." value={formData.companyName} onChange={handleChange} className="pl-10" required />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="country" name="country" placeholder="China" value={formData.country} onChange={handleChange} className="pl-10" required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="region">Region/State</Label>
            <Input id="region" name="region" placeholder="Guangdong" value={formData.region} onChange={handleChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="city" name="city" placeholder="Guangzhou" value={formData.city} onChange={handleChange} className="pl-10" />
            </div>
          </div>
        </div>

        {/* Account Setup */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account Setup</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" value={formData.password} onChange={handleChange} className="pl-10 pr-10" required minLength={8} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {formData.password && (
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full transition-all ${strength === 1 ? 'w-1/4 bg-red-500' : strength === 2 ? 'w-2/4 bg-yellow-500' : strength === 3 ? 'w-3/4 bg-blue-500' : strength === 4 ? 'w-full bg-green-500' : 'w-0'}`} />
                </div>
                <span className="text-xs text-muted-foreground">{text}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" value={formData.confirmPassword} onChange={handleChange} className="pl-10" required />
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="source">How did you hear about us?</Label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">Select...</option>
              {SOURCE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="referralCode">Referral Code (if any)</Label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="referralCode" name="referralCode" placeholder="BD-SARAH-2026" value={formData.referralCode} onChange={handleChange} className="pl-10" />
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="space-y-3 pt-2">
          <div className="flex items-start gap-2">
            <input type="checkbox" id="terms" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300" />
            <label htmlFor="terms" className="text-sm text-muted-foreground">
              I agree to the{' '}
              <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            </label>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" id="privacy" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300" />
            <label htmlFor="privacy" className="text-sm text-muted-foreground">
              I agree to the{' '}
              <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
            </label>
          </div>
          {isSupplier && (
            <div className="flex items-start gap-2">
              <input type="checkbox" id="verification" checked={acceptVerification} onChange={(e) => setAcceptVerification(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300" />
              <label htmlFor="verification" className="text-sm text-muted-foreground">
                I consent to background verification (KYB)
              </label>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" variant="gradient" loading={isLoading}>
          Register
        </Button>
      </form>

      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline font-medium">
          Login
        </Link>
      </div>
    </div>
  );
}
