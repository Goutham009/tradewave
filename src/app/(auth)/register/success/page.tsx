'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Mail, Shield, UserCheck, Rocket, ArrowRight } from 'lucide-react';

export default function RegisterSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading...</div>}>
      <RegisterSuccessContent />
    </Suspense>
  );
}

function RegisterSuccessContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const name = searchParams.get('name') || '';
  const role = searchParams.get('role') || 'BUYER';
  const amName = searchParams.get('am') || '';

  const isSupplier = role === 'SUPPLIER' || role === 'BOTH';

  const supplierSteps = [
    { label: 'Verify your email', icon: Mail, done: false },
    { label: 'Complete KYB verification', icon: Shield, done: false },
    { label: 'Wait for admin approval', icon: UserCheck, done: false },
    { label: 'Start receiving requirements', icon: Rocket, done: false },
  ];

  const buyerSteps = [
    { label: 'Verify your email', icon: Mail, done: false },
    { label: 'Complete your profile', icon: UserCheck, done: false },
    { label: 'Start creating requirements', icon: Rocket, done: false },
  ];

  const steps = isSupplier ? supplierSteps : buyerSteps;

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Mobile Logo */}
      <div className="lg:hidden text-center mb-8">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <span className="text-xl font-bold text-white">T</span>
          </div>
          <span className="text-2xl font-bold">Tradewave</span>
        </Link>
      </div>

      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Registration Successful!</h1>
        <p className="text-muted-foreground">
          Welcome to Tradewave{name ? `, ${name.split(' ')[0]}` : ''}!
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <Mail className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900">We&apos;ve sent a verification email to:</p>
              <p className="text-sm font-semibold text-blue-700 mt-1">{email || 'your email address'}</p>
              <p className="text-xs text-blue-600 mt-2">
                Please check your inbox and click the verification link to activate your account.
              </p>
            </div>
          </div>

          {/* Resend button */}
          <div className="text-center">
            <button className="text-sm text-primary hover:underline">
              Didn&apos;t receive the email? Resend Verification Email
            </button>
          </div>
        </CardContent>
      </Card>

      {/* AM Assignment notification */}
      {amName && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-100">
              <UserCheck className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-green-900">Your Account Manager</p>
                <p className="text-sm text-green-700 mt-1">
                  <span className="font-semibold">{amName}</span> has been assigned as your Account Manager.
                  They&apos;ll reach out to help you get started.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Next Steps</h3>
          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  step.done ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                }`}>
                  {idx + 1}
                </div>
                <div className="flex items-center gap-2">
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{step.label}</span>
                </div>
              </div>
            ))}
          </div>

          {isSupplier && (
            <p className="text-xs text-muted-foreground pt-2">
              Estimated activation time: 2-3 business days
            </p>
          )}
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button asChild className="w-full" variant="gradient">
          <Link href="/login">
            Continue to Login <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
