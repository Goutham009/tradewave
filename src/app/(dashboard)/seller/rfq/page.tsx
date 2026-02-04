'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Package, Clock, CheckCircle, Send, Bell, Shield, Calendar, DollarSign } from 'lucide-react';

interface Invitation {
  id: string;
  requirementId: string;
  requirement: {
    title: string;
    description: string;
    quantity: number;
    unit: string;
    deliveryDeadline: string;
    buyer: {
      companyName: string;
    };
  };
  status: 'PENDING' | 'QUOTED' | 'EXPIRED';
  invitedAt: string;
  expiresAt: string;
}

export default function SupplierInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [myQuotations, setMyQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'invitations' | 'quotations'>('invitations');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch invitations (mock data for demo)
      setInvitations([
        {
          id: '1',
          requirementId: 'req-1',
          requirement: {
            title: 'Industrial Pumps - High Capacity',
            description: 'Looking for centrifugal pumps with 500 GPM capacity for chemical processing plant.',
            quantity: 50,
            unit: 'units',
            deliveryDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            buyer: { companyName: 'ChemProcess Industries' },
          },
          status: 'PENDING',
          invitedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          requirementId: 'req-2',
          requirement: {
            title: 'Electronic Components - Microcontrollers',
            description: 'Bulk order for ARM-based microcontrollers for IoT devices.',
            quantity: 10000,
            unit: 'pieces',
            deliveryDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            buyer: { companyName: 'TechGadgets Inc.' },
          },
          status: 'PENDING',
          invitedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);

      setMyQuotations([
        {
          id: 'q1',
          requirementTitle: 'Steel Beams - Construction Grade',
          status: 'SUBMITTED',
          submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          unitPrice: 450,
          totalPrice: 45000,
        },
      ]);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const daysUntilExpiry = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quotation Invitations</h1>
        <p className="text-gray-600 mt-1">
          You&apos;ve been selected by our procurement team to submit quotes for these requirements
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-brand-primary/10 to-brand-accent/10 rounded-2xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-brand-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Curated Opportunity Matching</h3>
            <p className="text-gray-600">
              At Tradewave, we match you with high-quality buyers based on your expertise and track record. 
              You only see requirements where you&apos;ve been <strong>specifically invited</strong> to quote.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('invitations')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'invitations'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Mail className="w-4 h-4 inline mr-2" />
          Pending Invitations ({invitations.filter(i => i.status === 'PENDING').length})
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'quotations'
              ? 'border-brand-primary text-brand-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-4 h-4 inline mr-2" />
          My Quotations ({myQuotations.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : activeTab === 'invitations' ? (
        invitations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Invitations</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              When our procurement team identifies a requirement matching your expertise, 
              you&apos;ll receive an invitation to submit a quote here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {invitations.map((invitation) => {
              const daysLeft = daysUntilExpiry(invitation.expiresAt);
              const isUrgent = daysLeft <= 3;

              return (
                <div key={invitation.id} className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{invitation.requirement.title}</h3>
                        {isUrgent && (
                          <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                            Urgent - {daysLeft} days left
                          </span>
                        )}
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          Invited
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{invitation.requirement.description}</p>

                      <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-gray-400" />
                          <strong>{invitation.requirement.quantity.toLocaleString()}</strong> {invitation.requirement.unit}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          Delivery by {new Date(invitation.requirement.deliveryDeadline).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {daysLeft} days to respond
                        </span>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-500">
                          Buyer: <strong>{invitation.requirement.buyer.companyName}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="ml-6">
                      <Link
                        href={`/seller/rfq/${invitation.requirementId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-primary text-white font-semibold rounded-xl hover:bg-brand-primaryHover transition-colors"
                      >
                        <Send className="w-4 h-4" />
                        Submit Quote
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        myQuotations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <Send className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quotations Yet</h3>
            <p className="text-gray-600">You haven&apos;t submitted any quotations yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myQuotations.map((quote) => (
              <div key={quote.id} className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{quote.requirementTitle}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Submitted on {new Date(quote.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      {quote.status}
                    </span>
                    <p className="text-lg font-bold text-gray-900 mt-2">
                      ${quote.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
