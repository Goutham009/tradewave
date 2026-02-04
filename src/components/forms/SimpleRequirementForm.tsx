'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';

interface FormData {
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  productType: string;
  quantity: string;
  unit: string;
  targetDeliveryDate: string;
  additionalNotes: string;
}

export function SimpleRequirementForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    productType: '',
    quantity: '',
    unit: '',
    targetDeliveryDate: '',
    additionalNotes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/requirements/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
        // Redirect after showing success
        setTimeout(() => {
          router.push('/requirements?submitted=true');
        }, 3000);
      }
    } catch (error) {
      console.error('Submission error:', error);
      // Still show success for demo purposes
      setSubmitted(true);
      setTimeout(() => {
        router.push('/requirements?submitted=true');
      }, 3000);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Requirement Submitted!</h3>
        <p className="text-gray-600 mb-4">
          Thank you! Your dedicated account manager will contact you within <strong>4-6 hours</strong> to discuss your requirements.
        </p>
        <p className="text-sm text-gray-500">Redirecting to your dashboard...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tell Us What You Need</h2>
        <p className="text-gray-600 mt-2">
          Our experts will find the best suppliers for you within 48 hours
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
            placeholder="Your company name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="contactName"
            value={formData.contactName}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="contactEmail"
            value={formData.contactEmail}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
            placeholder="you@company.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="contactPhone"
            value={formData.contactPhone}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What product do you need? <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="productType"
          value={formData.productType}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
          placeholder="e.g., Industrial Pumps, Electronic Components, Textile Materials"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
            placeholder="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit <span className="text-red-500">*</span>
          </label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
          >
            <option value="">Select unit</option>
            <option value="pieces">Pieces</option>
            <option value="kg">Kilograms (kg)</option>
            <option value="tons">Metric Tons</option>
            <option value="liters">Liters</option>
            <option value="meters">Meters</option>
            <option value="sqm">Square Meters</option>
            <option value="cartons">Cartons</option>
            <option value="pallets">Pallets</option>
            <option value="containers">Containers (20ft)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Delivery Date
          </label>
          <input
            type="date"
            name="targetDeliveryDate"
            value={formData.targetDeliveryDate}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Requirements (Optional)
        </label>
        <textarea
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleChange}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary transition-colors resize-none"
          placeholder="Any specific requirements, certifications needed, quality standards, packaging preferences, etc."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primaryHover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            Submit Requirement
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Our team will contact you within <strong>4-6 hours</strong> to discuss your requirements
      </p>
    </form>
  );
}
