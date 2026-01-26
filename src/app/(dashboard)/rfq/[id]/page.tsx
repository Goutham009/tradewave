'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, CheckCircle, XCircle, FileText, MessageSquare, BarChart3, Send, Eye } from 'lucide-react';

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  DRAFT: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Draft' },
  PUBLISHED: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Published' },
  IN_REVIEW: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'In Review' },
  CLOSED: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Closed' },
  ARCHIVED: { color: 'text-gray-500', bgColor: 'bg-gray-50', label: 'Archived' }
};

export default function RFQDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [rfq, setRfq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('quotes');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchRFQ();
  }, [params.id]);

  const fetchRFQ = async () => {
    try {
      const res = await fetch(`/api/rfq/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setRfq(data);
      }
    } catch (err) {
      console.error('Failed to fetch RFQ:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      const res = await fetch(`/api/rfq/${params.id}/publish`, { method: 'POST' });
      if (res.ok) {
        fetchRFQ();
      }
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return <div className="container mx-auto px-4 py-8 text-center">Loading...</div>;
  }

  if (!rfq) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">RFQ not found</p>
        <Link href="/rfq" className="text-blue-600 hover:underline">Back to RFQs</Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[rfq.status] || STATUS_CONFIG.DRAFT;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 flex items-center gap-2 mb-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold">{rfq.title}</h1>
          <p className="text-gray-500">{rfq.rfqNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
            {statusConfig.label}
          </span>
          {rfq.status === 'DRAFT' && (
            <button onClick={handlePublish} disabled={publishing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {publishing ? 'Publishing...' : 'Publish RFQ'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFQ Details Card */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">RFQ Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{rfq.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Category</h3>
                  <p className="mt-1">{rfq.industryCategory} / {rfq.productCategory}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quantity</h3>
                  <p className="mt-1">{rfq.requestedQuantity.toLocaleString()} {rfq.quantityUnit}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Delivery Location</h3>
                  <p className="mt-1">{rfq.deliveryCity}, {rfq.deliveryCountry}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Expected Delivery</h3>
                  <p className="mt-1">{new Date(rfq.deliveryDate).toLocaleDateString()}</p>
                </div>
                {rfq.incoterms && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Incoterms</h3>
                    <p className="mt-1">{rfq.incoterms}</p>
                  </div>
                )}
              </div>
              {rfq.qualityStandards?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quality Standards</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {rfq.qualityStandards.map((std: string) => (
                      <span key={std} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">{std}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white border rounded-lg">
            <div className="border-b">
              <nav className="flex -mb-px">
                {[
                  { id: 'quotes', label: 'Quotes', icon: FileText, count: rfq.quotes?.length || 0 },
                  { id: 'activity', label: 'Activity', icon: Clock }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}>
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== undefined && (
                      <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">{tab.count}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'quotes' && (
                <div>
                  {rfq.quotes?.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No quotes received yet</p>
                      {rfq.status === 'DRAFT' && (
                        <p className="text-sm text-gray-400 mt-2">Publish your RFQ to start receiving quotes</p>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rfq.quotes.map((quote: any) => (
                        <div key={quote.id} className="border rounded-lg p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">{quote.sellerCompanyName}</p>
                              <p className="text-sm text-gray-500">{quote.quoteNumber}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">{quote.currency} {Number(quote.totalPrice).toLocaleString()}</p>
                              <p className="text-sm text-gray-500">{quote.currency} {Number(quote.unitPrice).toFixed(2)}/unit</p>
                            </div>
                          </div>
                          <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                            <span>Delivery: {new Date(quote.deliveryDate).toLocaleDateString()}</span>
                            <span>Lead: {quote.totalLeadTime} days</span>
                            <span>Terms: {quote.paymentTerms}</span>
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Link href={`/quote/${quote.id}`}
                              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                              View Details
                            </Link>
                            <span className={`px-2 py-1 rounded text-xs ${
                              quote.status === 'ACCEPTED' ? 'bg-green-100 text-green-600' :
                              quote.status === 'REJECTED' ? 'bg-red-100 text-red-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>{quote.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {rfq.logs?.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="text-sm">{log.action}: {log.details}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                          {log.performedByUser && ` by ${log.performedByUser.name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Views</span>
                <span className="font-medium">{rfq.viewCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quotes</span>
                <span className="font-medium">{rfq.quotesReceived || rfq.quotes?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expires</span>
                <span className="font-medium">{new Date(rfq.expiresAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {rfq.quotes?.length >= 2 && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="font-semibold mb-4">Actions</h3>
              <Link href={`/rfq/${rfq.id}/compare`}
                className="w-full px-4 py-2 border rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
                <BarChart3 className="w-4 h-4" />
                Compare Quotes
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
