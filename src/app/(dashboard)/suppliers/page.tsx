'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Users, Clock } from 'lucide-react';
import Link from 'next/link';

export default function SuppliersPage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          White-Glove Supplier Matching
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          At Tradewave, we don&apos;t leave supplier discovery to chance. Our expert procurement team 
          personally curates the <strong>top 3 best-matched suppliers</strong> for each of your requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Users className="w-8 h-8 text-brand-primary mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">5,000+ Verified Suppliers</h3>
            <p className="text-sm text-gray-600">Pre-vetted and compliance-checked suppliers in our network</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <ShieldCheck className="w-8 h-8 text-brand-success mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Expert Curation</h3>
            <p className="text-sm text-gray-600">Senior procurement team selects the best 3 matches for you</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <Clock className="w-8 h-8 text-brand-accent mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">24-48 Hour Turnaround</h3>
            <p className="text-sm text-gray-600">Receive curated quotations within 2 business days</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 rounded-2xl p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">How It Works</h2>
          <ol className="text-left space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              <span>Submit your requirement through our simple form</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              <span>Your dedicated account manager verifies and refines your needs</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              <span>Our expert procurement team manually curates the TOP 3 best suppliers</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              <span>Compare quotations side-by-side with full supplier details</span>
            </li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/requirements/new"
            className="inline-flex items-center justify-center px-8 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primaryHover transition-colors"
          >
            Submit a Requirement
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            View My Quotations
          </Link>
        </div>
      </div>
    </div>
  );
}
