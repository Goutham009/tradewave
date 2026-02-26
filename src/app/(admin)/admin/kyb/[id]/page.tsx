'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, Clock, FileText, Shield, Globe, Building2, Phone, Mail, CreditCard, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  DRAFT: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Draft' },
  PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', label: 'Submitted' },
  AUTOMATED_CHECKS_IN_PROGRESS: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Auto Checks Running' },
  AUTOMATED_CHECKS_COMPLETE: { color: 'text-indigo-600', bgColor: 'bg-indigo-100', label: 'Ready for Review' },
  UNDER_REVIEW: { color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Under Review' },
  INFO_REQUESTED: { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Info Requested' },
  DOCUMENTS_REQUIRED: { color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Docs Required' },
  VERIFIED: { color: 'text-green-600', bgColor: 'bg-green-100', label: 'Verified' },
  REJECTED: { color: 'text-red-600', bgColor: 'bg-red-100', label: 'Rejected' },
  SUSPENDED: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Suspended' },
  EXPIRED: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Expired' }
};

export default function AdminKYBReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [kyb, setKyb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchKYB();
  }, [params.id]);

  const fetchKYB = async () => {
    try {
      const res = await fetch(`/api/admin/kyb/${params.id}/review`);
      const data = await res.json();
      if (data && data.businessName) {
        setKyb(data);
      } else {
        // Use mock data for demo
        loadMockKYB();
      }
    } catch (err) {
      console.error('Failed to fetch KYB:', err);
      // Use mock data for demo
      loadMockKYB();
    } finally {
      setLoading(false);
    }
  };

  const loadMockKYB = () => {
    setKyb({
      id: params.id,
      businessName: 'TechMfg Industries Pvt Ltd',
      businessType: 'Private Limited Company',
      businessEstablishedYear: 2018,
      businessWebsite: 'https://techmfg.example.com',
      businessDescription: 'Leading manufacturer of electronic components and PCB assemblies for industrial applications. Specializing in high-quality precision parts.',
      registrationCountry: 'India',
      registrationRegion: 'Maharashtra',
      registrationNumber: 'U27100MH2018PTC123456',
      taxIdType: 'GSTIN',
      taxIdNumber: '27AABCT1234F1ZP',
      taxIdCountry: 'India',
      registeredAddress: '42 Industrial Estate, Andheri East',
      registeredCity: 'Mumbai',
      registeredRegion: 'Maharashtra',
      registeredPostalCode: '400069',
      registeredCountry: 'India',
      primaryContactName: 'Priya Sharma',
      primaryContactPhone: '+91 98765 43210',
      primaryContactEmail: 'priya.sharma@techmfg.example.com',
      bankName: 'HDFC Bank',
      bankCountry: 'India',
      bankAccountHolderName: 'TechMfg Industries Pvt Ltd',
      bankAccountNumber: '****4567',
      status: 'PENDING',
      documents: [
        { id: 'd1', documentName: 'Certificate of Incorporation', documentType: 'INCORPORATION_CERTIFICATE', verificationStatus: 'VERIFIED', storageUrl: '#' },
        { id: 'd2', documentName: 'GST Registration Certificate', documentType: 'TAX_REGISTRATION', verificationStatus: 'VERIFIED', storageUrl: '#' },
        { id: 'd3', documentName: 'Bank Statement (Last 3 months)', documentType: 'BANK_STATEMENT', verificationStatus: 'PENDING', storageUrl: '#' },
        { id: 'd4', documentName: 'Director ID Proof', documentType: 'ID_PROOF', verificationStatus: 'VERIFIED', storageUrl: '#' },
      ],
      complianceItems: [
        { id: 'c1', displayName: 'Business Registration Verification', description: 'Verify company registration with government database', status: 'COMPLETED', isMandatory: true },
        { id: 'c2', displayName: 'Tax ID Verification', description: 'Validate tax identification number', status: 'COMPLETED', isMandatory: true },
        { id: 'c3', displayName: 'Bank Account Verification', description: 'Verify bank account ownership', status: 'IN_PROGRESS', isMandatory: true },
        { id: 'c4', displayName: 'Address Verification', description: 'Confirm registered business address', status: 'COMPLETED', isMandatory: false },
      ],
      riskAssessment: {
        totalRiskScore: 15,
        riskLevel: 'LOW',
      },
      badge: null,
      verificationLogs: [
        { id: 'l1', action: 'KYB Submitted', actionDetails: 'Business submitted KYB application for verification', createdAt: new Date(Date.now() - 172800000).toISOString(), performedByAdmin: null },
        { id: 'l2', action: 'Documents Uploaded', actionDetails: '4 documents uploaded for verification', createdAt: new Date(Date.now() - 86400000).toISOString(), performedByAdmin: null },
        { id: 'l3', action: 'Auto-checks Completed', actionDetails: 'Automated verification checks passed', createdAt: new Date(Date.now() - 43200000).toISOString(), performedByAdmin: null },
      ],
    });
  };

  const handleSubmitReview = async () => {
    if (!decision) return;
    if ((decision === 'REJECT' || decision === 'REQUEST_INFO') && !rejectionReason) {
      alert('Please provide a reason');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/kyb/${params.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: decision, 
          notes: adminNotes, 
          reason: rejectionReason 
        })
      });

      if (res.ok) {
        router.push('/admin/kyb');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit review');
      }
    } catch (err) {
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!kyb) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-400">KYB not found</p>
        <Link href="/admin/kyb" className="text-blue-400 hover:underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[kyb.status] || STATUS_CONFIG.PENDING;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/kyb" className="p-2 hover:bg-slate-700 rounded-lg">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{kyb.businessName}</h1>
            <p className="text-slate-400">{kyb.businessType} • {kyb.registrationCountry}</p>
          </div>
        </div>
        <span className={`px-4 py-2 rounded-full font-medium ${statusConfig.bgColor} ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="bg-slate-800 rounded-lg">
            <div className="border-b border-slate-700">
              <nav className="flex -mb-px">
                {['details', 'documents', 'compliance', 'activity'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300'
                    }`}>
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'details' && (
                <div className="space-y-6">
                  {/* Business Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5" /> Business Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-400">Business Name:</span> <span className="text-white ml-2">{kyb.businessName}</span></div>
                      <div><span className="text-slate-400">Type:</span> <span className="text-white ml-2">{kyb.businessType}</span></div>
                      <div><span className="text-slate-400">Established:</span> <span className="text-white ml-2">{kyb.businessEstablishedYear}</span></div>
                      <div><span className="text-slate-400">Website:</span> <span className="text-white ml-2">{kyb.businessWebsite || '-'}</span></div>
                      <div className="col-span-2"><span className="text-slate-400">Description:</span> <p className="text-white mt-1">{kyb.businessDescription}</p></div>
                    </div>
                  </div>

                  {/* Registration */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5" /> Registration & Tax
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-400">Country:</span> <span className="text-white ml-2">{kyb.registrationCountry}</span></div>
                      <div><span className="text-slate-400">Region:</span> <span className="text-white ml-2">{kyb.registrationRegion || '-'}</span></div>
                      <div><span className="text-slate-400">Reg Number:</span> <span className="text-white ml-2">{kyb.registrationNumber || '-'}</span></div>
                      <div><span className="text-slate-400">Tax ID Type:</span> <span className="text-white ml-2">{kyb.taxIdType || '-'}</span></div>
                      <div><span className="text-slate-400">Tax ID:</span> <span className="text-white ml-2">{kyb.taxIdNumber || '-'}</span></div>
                      <div><span className="text-slate-400">Tax Country:</span> <span className="text-white ml-2">{kyb.taxIdCountry || '-'}</span></div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Registered Address</h3>
                    <p className="text-slate-300">{kyb.registeredAddress}</p>
                    <p className="text-slate-300">{kyb.registeredCity}, {kyb.registeredRegion} {kyb.registeredPostalCode}</p>
                    <p className="text-slate-300">{kyb.registeredCountry}</p>
                  </div>

                  {/* Contact */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <Phone className="w-5 h-5" /> Primary Contact
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-400">Name:</span> <span className="text-white ml-2">{kyb.primaryContactName}</span></div>
                      <div><span className="text-slate-400">Phone:</span> <span className="text-white ml-2">{kyb.primaryContactPhone}</span></div>
                      <div><span className="text-slate-400">Email:</span> <span className="text-white ml-2">{kyb.primaryContactEmail}</span></div>
                    </div>
                  </div>

                  {/* Bank */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" /> Bank Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-400">Bank:</span> <span className="text-white ml-2">{kyb.bankName || '-'}</span></div>
                      <div><span className="text-slate-400">Country:</span> <span className="text-white ml-2">{kyb.bankCountry || '-'}</span></div>
                      <div><span className="text-slate-400">Account Holder:</span> <span className="text-white ml-2">{kyb.bankAccountHolderName || '-'}</span></div>
                      <div><span className="text-slate-400">Account:</span> <span className="text-white ml-2">{kyb.bankAccountNumber || '-'}</span></div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {kyb.documents?.length === 0 ? (
                    <p className="text-slate-400 text-center py-8">No documents uploaded</p>
                  ) : (
                    kyb.documents?.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-white font-medium">{doc.documentName}</p>
                            <p className="text-sm text-slate-400">{doc.documentType}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            doc.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-600' :
                            doc.verificationStatus === 'REJECTED' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {doc.verificationStatus}
                          </span>
                          <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer"
                            className="text-blue-400 hover:underline text-sm">View</a>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'compliance' && (
                <div className="space-y-4">
                  {kyb.complianceItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{item.displayName}</p>
                        <p className="text-sm text-slate-400">{item.description}</p>
                        {item.isMandatory && <span className="text-xs text-red-400">Required</span>}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.status === 'COMPLETED' ? 'bg-green-100 text-green-600' :
                        item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-600' :
                        'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  {kyb.verificationLogs?.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-700 rounded-lg">
                      <div className="w-2 h-2 mt-2 rounded-full bg-blue-500" />
                      <div>
                        <p className="text-white font-medium">{log.action}</p>
                        <p className="text-sm text-slate-400">{log.actionDetails}</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(log.createdAt).toLocaleString()}
                          {log.performedByAdmin && ` by ${log.performedByAdmin.name}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Panel */}
        <div className="space-y-6">
          {/* Risk Assessment */}
          {kyb.riskAssessment && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" /> Risk Assessment
              </h3>
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-white">{100 - kyb.riskAssessment.totalRiskScore}</div>
                <div className="text-slate-400">Trust Score</div>
              </div>
              <div className={`text-center py-2 rounded ${
                kyb.riskAssessment.riskLevel === 'LOW' ? 'bg-green-900 text-green-400' :
                kyb.riskAssessment.riskLevel === 'MEDIUM' ? 'bg-yellow-900 text-yellow-400' :
                kyb.riskAssessment.riskLevel === 'HIGH' ? 'bg-orange-900 text-orange-400' :
                'bg-red-900 text-red-400'
              }`}>
                {kyb.riskAssessment.riskLevel} RISK
              </div>
            </div>
          )}

          {/* Badge */}
          {kyb.badge && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Current Badge</h3>
              <div className={`text-center py-4 rounded ${
                kyb.badge.badgeType === 'GOLD' ? 'bg-yellow-900 text-yellow-400' :
                kyb.badge.badgeType === 'SILVER' ? 'bg-gray-700 text-gray-300' :
                kyb.badge.badgeType === 'BRONZE' ? 'bg-orange-900 text-orange-400' :
                'bg-blue-900 text-blue-400'
              }`}>
                <Shield className="w-8 h-8 mx-auto mb-2" />
                {kyb.badge.badgeType} VERIFIED
              </div>
            </div>
          )}

          {/* Decision Panel */}
          {kyb.status !== 'VERIFIED' && (
            <div className="bg-slate-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Review Decision</h3>
              
              <div className="space-y-3 mb-4">
                <button onClick={() => setDecision('APPROVE')}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                    decision === 'APPROVE' ? 'bg-green-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  <CheckCircle className="w-5 h-5" /> Approve
                </button>
                <button onClick={() => setDecision('REQUEST_MORE_INFO')}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                    decision === 'REQUEST_MORE_INFO' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  <AlertTriangle className="w-5 h-5" /> Request Documents
                </button>
                <button onClick={() => setDecision('REJECT')}
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 ${
                    decision === 'REJECT' ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}>
                  <XCircle className="w-5 h-5" /> Reject
                </button>
              </div>

              {decision === 'REJECT' && (
                <div className="mb-4">
                  <label className="block text-sm text-slate-400 mb-1">Rejection Reason *</label>
                  <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                    placeholder="Explain why this application is being rejected..." />
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm text-slate-400 mb-1">Admin Notes</label>
                <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                  placeholder="Internal notes (optional)..." />
              </div>

              <button onClick={handleSubmitReview} disabled={!decision || submitting}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
