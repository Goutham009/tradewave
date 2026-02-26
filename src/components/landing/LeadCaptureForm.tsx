'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  leadCaptureFormSchema,
  LeadCaptureFormData,
  CATEGORIES,
  UNITS,
  TIMELINES,
} from '@/lib/validations/leadSchema';
import {
  Mail,
  User,
  Building2,
  Phone,
  Package,
  MapPin,
  Clock,
  FileText,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Shield,
} from 'lucide-react';
import Link from 'next/link';

interface LeadCaptureFormProps {
  onSuccess?: (data: any) => void;
}

export function LeadCaptureForm({ onSuccess }: LeadCaptureFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LeadCaptureFormData>({
    resolver: zodResolver(leadCaptureFormSchema),
    defaultValues: {
      quantity: undefined,
    },
  });

  async function onSubmit(data: LeadCaptureFormData) {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to submit enquiry');
      }

      // Success!
      setSubmittedData(result.data);
      setShowSuccess(true);
      reset();
      onSuccess?.(result);
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'Failed to create requirement. Please try again.'
      );
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success State
  if (showSuccess && submittedData) {
    return (
      <Card className="border-brand-success/30 bg-brand-success/10">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-success/20 mb-4">
            <CheckCircle2 className="h-8 w-8 text-brand-success" />
          </div>
          <h3 className="text-2xl font-bold text-brand-textDark mb-2">
            Thank You, {submittedData.fullName}!
          </h3>
          <p className="text-brand-textMedium mb-4">
            Your requirement has been submitted successfully.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6 text-left shadow-sm">
            <p className="text-sm text-brand-textMedium mb-2">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-brand-textMedium space-y-2">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-brand-success" />
                <span>Our team will call you at <strong>{submittedData.phoneNumber}</strong> within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-brand-success" />
                <span>A confirmation has been sent to <strong>{submittedData.email}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="h-4 w-4 mt-0.5 text-brand-success" />
                <span>We&rsquo;ll find the best suppliers for <strong>{submittedData.requirement.productName}</strong></span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/register?email=${encodeURIComponent(submittedData.email)}&name=${encodeURIComponent(submittedData.fullName)}`}>
              <Button variant="gradient" size="lg">
                Create Account to Track
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setShowSuccess(false);
                setSubmittedData(null);
              }}
            >
              Submit Another Requirement
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border border-white/80">
      <CardHeader className="bg-gradient-to-r from-brand-primary to-brand-primaryHover text-white rounded-t-xl">
        <CardTitle className="text-xl flex items-center gap-2">
          <Package className="h-5 w-5" />
          Get Free Quotes - No Login Required
        </CardTitle>
        <p className="text-white/80 text-sm mt-1">
          Tell us what you need and we&rsquo;ll connect you with verified suppliers
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Server Error */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {serverError}
            </div>
          )}

          {/* SECTION 1: Contact Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-textDark flex items-center gap-2">
              <User className="h-4 w-4 text-brand-primary" />
              Your Contact Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMedium/60" />
                  <Input
                    type="email"
                    placeholder="your@company.com"
                    {...register('email')}
                    className="pl-10"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMedium/60" />
                  <Input
                    type="text"
                    placeholder="John Smith"
                    {...register('fullName')}
                    className="pl-10"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMedium/60" />
                  <Input
                    type="text"
                    placeholder="ABC Industries"
                    {...register('companyName')}
                    className="pl-10"
                  />
                </div>
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMedium/60" />
                  <Input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register('phoneNumber')}
                    className="pl-10"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.phoneNumber.message}</p>
                )}
                <p className="text-xs text-brand-textMedium mt-1">
                  We&rsquo;ll call you to discuss your requirements
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-200" />

          {/* SECTION 2: Requirement Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-brand-textDark flex items-center gap-2">
              <Package className="h-4 w-4 text-brand-primary" />
              What Are You Looking For?
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Product Category *
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>
                )}
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Product Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Copper Wire, Aluminum Sheets"
                  {...register('productName')}
                />
                {errors.productName && (
                  <p className="text-red-500 text-xs mt-1">{errors.productName.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Quantity *
                </label>
                <Input
                  type="number"
                  placeholder="100"
                  {...register('quantity')}
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>
                )}
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Unit *
                </label>
                <select
                  {...register('unit')}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                >
                  <option value="">Select unit</option>
                  {UNITS.map((unit) => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </select>
                {errors.unit && (
                  <p className="text-red-500 text-xs mt-1">{errors.unit.message}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Delivery Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMedium/60" />
                  <Input
                    type="text"
                    placeholder="Mumbai, India"
                    {...register('location')}
                    className="pl-10"
                  />
                </div>
                {errors.location && (
                  <p className="text-red-500 text-xs mt-1">{errors.location.message}</p>
                )}
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-medium text-brand-textMedium mb-1">
                  Delivery Timeline *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-textMedium/60 pointer-events-none z-10" />
                  <select
                    {...register('timeline')}
                    className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm"
                  >
                    <option value="">Select timeline</option>
                    {TIMELINES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.timeline && (
                  <p className="text-red-500 text-xs mt-1">{errors.timeline.message}</p>
                )}
              </div>
            </div>

            {/* Additional Requirements */}
            <div>
              <label className="block text-sm font-medium text-brand-textMedium mb-1">
                Additional Requirements (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-brand-textMedium/60" />
                <textarea
                  placeholder="Quality specs, certifications needed, special packaging, etc."
                  {...register('additionalReqs')}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent text-sm min-h-[80px] resize-none"
                  maxLength={500}
                />
              </div>
              {errors.additionalReqs && (
                <p className="text-red-500 text-xs mt-1">{errors.additionalReqs.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Get Free Quotes
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>

          {/* Trust Indicators */}
          <div className="flex items-center justify-center gap-4 text-xs text-brand-textMedium pt-2">
            <span className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              100% Free
            </span>
            <span>•</span>
            <span>No Credit Card</span>
            <span>•</span>
            <span>No Spam</span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default LeadCaptureForm;
