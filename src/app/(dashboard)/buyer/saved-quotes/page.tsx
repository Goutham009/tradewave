'use client';

import { useState, useEffect } from 'react';
import { Bookmark, Star, Clock, DollarSign, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface SavedQuote {
  id: string;
  quoteId: string;
  notes: string | null;
  priority: string;
  createdAt: string;
  quote: {
    id: string;
    unitPrice: number;
    totalPrice: number;
    deliveryTimeInDays: number;
    status: string;
    seller: {
      id: string;
      name: string;
      companyName: string | null;
    };
    requirement: {
      id: string;
      title: string;
    };
  };
}

export default function SavedQuotesPage() {
  const [savedQuotes, setSavedQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedQuotes();
  }, []);

  const fetchSavedQuotes = async () => {
    try {
      const res = await fetch('/api/buyer/saved-quotes');
      const data = await res.json();
      setSavedQuotes(data.savedQuotes || []);
    } catch (error) {
      console.error('Error fetching saved quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeSavedQuote = async (id: string) => {
    try {
      await fetch(`/api/buyer/saved-quotes/${id}`, { method: 'DELETE' });
      setSavedQuotes(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error('Error removing saved quote:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-700';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading saved quotes...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Saved Quotes</h1>
          <p className="text-gray-500 mt-1">Quotes you&rsquo;ve bookmarked for later</p>
        </div>
      </div>

      {savedQuotes.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Bookmark className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved quotes</h3>
          <p className="text-gray-500 mb-4">Save quotes from your RFQs to compare them later</p>
          <Link href="/rfq" className="text-blue-600 hover:underline">
            View your RFQs →
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {savedQuotes.map((saved) => (
            <div key={saved.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {saved.quote.requirement.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(saved.priority)}`}>
                      {saved.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">
                    From: {saved.quote.seller.companyName || saved.quote.seller.name}
                  </p>
                  {saved.notes && (
                    <p className="text-gray-500 text-sm italic mb-3">&ldquo;{saved.notes}&rdquo;</p>
                  )}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      ${saved.quote.totalPrice.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      {saved.quote.deliveryTimeInDays} days delivery
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Star className="w-4 h-4" />
                      {saved.quote.status}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/rfq/${saved.quote.requirement.id}`}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => removeSavedQuote(saved.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
