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
      // Simulate API call for now - replace with actual API when ready
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Mock success response
      const mockResult = {
        status: 'success',
        data: {
          email: data.email,
          fullName: data.fullName,
          companyName: data.companyName,
          phoneNumber: data.phoneNumber,
          requirement: {
            category: data.category,
            productName: data.productName,
            quantity: data.quantity,
            unit: data.unit,
            location: data.location,
            timeline: data.timeline,
          },
          createdAt: new Date().toISOString(),
        },
      };

      // Success!
      setSubmittedData(mockResult.data);
      setShowSuccess(true);
      reset();
      onSuccess?.(mockResult);
    } catch (error) {
      setServerError('Failed to create requirement. Please try again.');
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Success State
  if (showSuccess && submittedData) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-8 pb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-green-800 mb-2">
            Thank You, {submittedData.fullName}!
          </h3>
          <p className="text-green-700 mb-4">
            Your requirement has been submitted successfully.
          </p>
          <div className="bg-white rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">
              <strong>What happens next?</strong>
            </p>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-green-600" />
                <span>Our team will call you at <strong>{submittedData.phoneNumber}</strong> within 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-green-600" />
                <span>A confirmation has been sent to <strong>{submittedData.email}</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <Package className="h-4 w-4 mt-0.5 text-green-600" />
                <span>We'll find the best suppliers for <strong>{submittedData.requirement.productName}</strong></span>
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
    <Card className="shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
        <CardTitle className="text-xl flex items-center gap-2">
          <Package className="h-5 w-5" />
          Get Free Quotes - No Login Required
        </CardTitle>
        <p className="text-blue-100 text-sm mt-1">
          Tell us what you need and we'll connect you with verified suppliers
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
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              Your Contact Information
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <p className="text-xs text-gray-500 mt-1">
                  We'll call you to discuss your requirements
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* SECTION 2: Requirement Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              What Are You Looking For?
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category *
                </label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit *
                </label>
                <select
                  {...register('unit')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Timeline *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
                  <select
                    {...register('timeline')}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Requirements (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <textarea
                  placeholder="Quality specs, certifications needed, special packaging, etc."
                  {...register('additionalReqs')}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[80px] resize-none"
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
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
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
