'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Shield,
  MessageSquare,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  X,
  Sparkles,
  DollarSign,
  Truck,
  Star,
} from 'lucide-react';

interface WelcomeTourProps {
  userName: string;
  userRole?: 'BUYER' | 'SUPPLIER' | string;
  accountManagerName?: string;
  onComplete: () => void;
  onDismiss: () => void;
}

const TOUR_STEPS = [
  {
    icon: Sparkles,
    title: 'Welcome to Tradewave!',
    description: 'Your dedicated platform for secure B2B procurement. Your Account Manager has set everything up for you.',
    color: 'text-brand-primary',
    bgColor: 'bg-brand-primary/10',
  },
  {
    icon: Package,
    title: 'Your Requirements',
    description: 'View and track all your procurement requirements. Your AM will create detailed requirements on your behalf after understanding your needs.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  {
    icon: DollarSign,
    title: 'Compare Quotations',
    description: 'When suppliers respond, you\'ll see a side-by-side comparison of their offers — pricing, delivery timeline, certifications, and more.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  {
    icon: MessageSquare,
    title: 'Negotiate & Communicate',
    description: 'Not happy with the price? Use the negotiation feature to request better terms. Your AM facilitates all communication.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  {
    icon: Shield,
    title: 'Secure Escrow Payments',
    description: 'Pay securely through our escrow system. Your money is only released to the supplier after you confirm delivery and quality.',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
  },
  {
    icon: Truck,
    title: 'Track Your Orders',
    description: 'Monitor shipment progress in real-time with tracking updates, customs clearance status, and estimated delivery dates.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  {
    icon: Star,
    title: 'Rate & Review',
    description: 'After delivery, rate your supplier to help other buyers and earn loyalty points for your next procurement.',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
];

export function WelcomeTour({ userName, userRole, accountManagerName, onComplete, onDismiss }: WelcomeTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const step = TOUR_STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg relative overflow-hidden">
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-brand-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 z-10"
        >
          <X className="h-5 w-5" />
        </button>

        <CardContent className="pt-8 pb-6 px-8">
          {/* Step counter */}
          <p className="text-xs text-gray-400 mb-4">
            Step {currentStep + 1} of {TOUR_STEPS.length}
          </p>

          {/* Icon */}
          <div className={`inline-flex p-4 rounded-2xl ${step.bgColor} mb-4`}>
            <StepIcon className={`h-8 w-8 ${step.color}`} />
          </div>

          {/* Content */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {currentStep === 0 ? `Welcome, ${userName}!` : step.title}
          </h2>
          <p className="text-gray-600 mb-2">{step.description}</p>
          {currentStep === 0 && accountManagerName && (
            <p className="text-sm text-brand-primary font-medium">
              Your Account Manager: {accountManagerName}
            </p>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {/* Dots */}
            <div className="flex gap-1.5">
              {TOUR_STEPS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentStep(idx)}
                  className={`h-2 rounded-full transition-all ${
                    idx === currentStep ? 'w-6 bg-brand-primary' : 'w-2 bg-gray-200 hover:bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="text-gray-500"
                >
                  Back
                </Button>
              )}
              {isLastStep ? (
                <Button size="sm" onClick={onComplete} className="bg-brand-primary">
                  <CheckCircle2 className="h-4 w-4 mr-1" /> Get Started
                </Button>
              ) : (
                <Button size="sm" onClick={() => setCurrentStep(prev => prev + 1)} className="bg-brand-primary">
                  Next <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
