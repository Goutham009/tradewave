'use client';

// CONCIERGE MODEL: Search page explains the white-glove service
// Buyers don't search for suppliers - they submit requirements and receive curated options

import Link from 'next/link';
import { ShieldCheck, Users, Clock, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-brand-primary to-brand-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          White-Glove Supplier Matching
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          At Tradewave, you don&apos;t need to search through thousands of suppliers. 
          Our expert procurement team does the heavy lifting for you, curating the 
          <strong> top 3 best-matched suppliers</strong> for each of your requirements.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-left">
            <Users className="w-8 h-8 text-brand-primary mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">5,000+ Verified Suppliers</h3>
            <p className="text-sm text-gray-600">Pre-vetted and compliance-checked suppliers in our global network</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-left">
            <ShieldCheck className="w-8 h-8 text-brand-success mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">Expert Curation</h3>
            <p className="text-sm text-gray-600">Senior procurement team manually selects the best 3 matches for you</p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-left">
            <Clock className="w-8 h-8 text-brand-accent mb-3" />
            <h3 className="font-semibold text-gray-900 mb-2">24-48 Hour Turnaround</h3>
            <p className="text-sm text-gray-600">Receive curated quotations within 2 business days</p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 rounded-2xl p-8 mb-8 text-left">
          <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">How Our Concierge Service Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold text-gray-900">Submit Your Requirement</h4>
                <p className="text-gray-600 text-sm">Tell us what you need through our simple form - product type, quantity, and delivery timeline.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold text-gray-900">Consultation & Verification</h4>
                <p className="text-gray-600 text-sm">Your dedicated account manager contacts you to understand your exact needs and verify your requirements.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold text-gray-900">AI + Expert Matching</h4>
                <p className="text-gray-600 text-sm">Our AI analyzes 5,000+ suppliers, then our senior procurement team manually curates the TOP 3 best matches.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
              <div>
                <h4 className="font-semibold text-gray-900">Compare & Select</h4>
                <p className="text-gray-600 text-sm">Review 3 curated quotations with full supplier details, ratings, and certifications - then choose your supplier.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/requirements/new"
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primaryHover transition-colors"
          >
            Submit a Requirement
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/quotations"
            className="inline-flex items-center justify-center px-8 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-brand-primary hover:text-brand-primary transition-colors"
          >
            View My Quotations
          </Link>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
          No more endless searching - let our experts find the perfect suppliers for you
        </p>
      </div>
    </div>
  );
}
