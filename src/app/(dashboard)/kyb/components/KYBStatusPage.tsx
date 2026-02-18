'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle, Shield, FileText, Upload, RefreshCw } from 'lucide-react';
import { KYBDocumentUpload } from './KYBDocumentUpload';
import { ComplianceChecklist } from './ComplianceChecklist';
import { RiskAssessmentDisplay } from './RiskAssessmentDisplay';

interface KYBData {
  id: string;
  businessName: string;
  businessType: string;
  registrationCountry: string;
  status: string;
  riskScore: number;
  verifiedAt: string | null;
  expiresAt: string | null;
  rejectionReason: string | null;
  infoRequestReason: string | null;
  documents: any[];
  complianceItems: any[];
  riskAssessment: any;
  badge: any;
  verificationLogs: any[];
  // Automated checks
  sanctionsCheckStatus: string | null;
  pepCheckStatus: string | null;
  adverseMediaCheckStatus: string | null;
  creditCheckStatus: string | null;
  registryCheckStatus: string | null;
  documentAICheckStatus: string | null;
  bankVerificationStatus: string | null;
  automatedChecksStartedAt: string | null;
  automatedChecksCompletedAt: string | null;
}

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string; bgColor: string }> = {
  DRAFT: { color: 'text-gray-600', icon: Clock, label: 'Draft', bgColor: 'bg-gray-50' },
  PENDING: { color: 'text-yellow-600', icon: Clock, label: 'Submitted', bgColor: 'bg-yellow-50' },
  AUTOMATED_CHECKS_IN_PROGRESS: { color: 'text-blue-600', icon: RefreshCw, label: 'Automated Checks Running', bgColor: 'bg-blue-50' },
  AUTOMATED_CHECKS_COMPLETE: { color: 'text-indigo-600', icon: CheckCircle, label: 'Awaiting Manual Review', bgColor: 'bg-indigo-50' },
  UNDER_REVIEW: { color: 'text-blue-600', icon: RefreshCw, label: 'Under Review', bgColor: 'bg-blue-50' },
  INFO_REQUESTED: { color: 'text-orange-600', icon: AlertTriangle, label: 'Info Requested', bgColor: 'bg-orange-50' },
  DOCUMENTS_REQUIRED: { color: 'text-orange-600', icon: AlertTriangle, label: 'Documents Required', bgColor: 'bg-orange-50' },
  VERIFIED: { color: 'text-green-600', icon: CheckCircle, label: 'Verified', bgColor: 'bg-green-50' },
  REJECTED: { color: 'text-red-600', icon: XCircle, label: 'Rejected', bgColor: 'bg-red-50' },
  SUSPENDED: { color: 'text-gray-600', icon: XCircle, label: 'Suspended', bgColor: 'bg-gray-50' },
  EXPIRED: { color: 'text-gray-600', icon: Clock, label: 'Expired - Renewal Required', bgColor: 'bg-gray-50' }
};

const BADGE_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  GOLD: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', label: 'Gold Verified' },
  SILVER: { color: 'text-gray-600', bgColor: 'bg-gray-100', label: 'Silver Verified' },
  BRONZE: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'Bronze Verified' },
  VERIFIED: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Verified' }
};

export function KYBStatusPage() {
  const [kyb, setKyb] = useState<KYBData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchKYB();
  }, []);

  const fetchKYB = async () => {
    try {
      const res = await fetch('/api/kyb');
      const data = await res.json();
      if (!data.kyb) {
        setKyb(null);
      } else {
        // Ensure arrays have default values
        setKyb({
          ...data.kyb,
          documents: data.kyb.documents || [],
          complianceItems: data.kyb.complianceItems || [],
          verificationLogs: data.kyb.verificationLogs || [],
        });
      }
    } catch (err) {
      setError('Failed to load KYB data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!kyb) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No KYB Application Found</h2>
        <p className="text-gray-600 mb-6">
          Complete your business verification to unlock all platform features.
        </p>
        <a href="/kyb/submit" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Start KYB Verification
        </a>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[kyb.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{kyb.businessName}</h1>
            <p className="text-gray-600">{kyb.businessType} • {kyb.registrationCountry}</p>
          </div>
          <div className="flex items-center gap-4">
            {kyb.badge && (
              <div className={`px-4 py-2 rounded-full ${BADGE_CONFIG[kyb.badge.badgeType]?.bgColor || 'bg-gray-100'}`}>
                <span className={`font-medium ${BADGE_CONFIG[kyb.badge.badgeType]?.color || 'text-gray-700'}`}>
                  {BADGE_CONFIG[kyb.badge.badgeType]?.label || 'Verified'}
                </span>
                <span className="ml-2 text-sm text-gray-500">
                  Trust Score: {kyb.badge.trustScore}
                </span>
              </div>
            )}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig.bgColor}`}>
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              <span className={`font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
          </div>
        </div>

        {kyb.status === 'REJECTED' && kyb.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-1">Rejection Reason</h4>
            <p className="text-red-700">{kyb.rejectionReason}</p>
          </div>
        )}

        {kyb.status === 'DOCUMENTS_REQUIRED' && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-1">Action Required</h4>
            <p className="text-orange-700">Please upload additional documents to complete your verification.</p>
          </div>
        )}

        {kyb.status === 'INFO_REQUESTED' && kyb.infoRequestReason && (
          <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-1">Additional Information Required</h4>
            <p className="text-orange-700">{kyb.infoRequestReason}</p>
            <p className="text-sm text-orange-600 mt-2">Please provide the requested information or documents to continue your verification.</p>
          </div>
        )}

        {kyb.verifiedAt && (
          <div className="mt-4 text-sm text-gray-500">
            Verified on: {new Date(kyb.verifiedAt).toLocaleDateString()}
            {kyb.expiresAt && ` • Expires: ${new Date(kyb.expiresAt).toLocaleDateString()}`}
          </div>
        )}

        {/* Renewal Warning */}
        {kyb.status === 'EXPIRED' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-800 mb-1">KYB Verification Expired</h4>
            <p className="text-red-700 mb-3">Your business verification has expired. Please renew to continue accepting quotes and receiving requirements.</p>
            <button 
              onClick={() => {/* TODO: Trigger renewal */}}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Start Renewal Process
            </button>
          </div>
        )}

        {kyb.status === 'VERIFIED' && kyb.expiresAt && (() => {
          const expiresAt = new Date(kyb.expiresAt);
          const now = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
          const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          
          if (expiresAt < thirtyDaysFromNow && daysUntilExpiry > 0) {
            return (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-1">Renewal Reminder</h4>
                <p className="text-yellow-700">Your KYB verification expires in <strong>{daysUntilExpiry} days</strong>. Consider renewing soon to avoid service interruption.</p>
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="border-b">
          <nav className="flex -mb-px">
            {['overview', 'documents', 'compliance', 'activity'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-4">Verification Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      kyb.status !== 'PENDING' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <CheckCircle className={`w-5 h-5 ${
                        kyb.status !== 'PENDING' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <span>Application Submitted</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      (kyb.documents?.length || 0) > 0 ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <FileText className={`w-5 h-5 ${
                        (kyb.documents?.length || 0) > 0 ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <span>Documents Uploaded ({kyb.documents?.length || 0})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      kyb.status === 'VERIFIED' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Shield className={`w-5 h-5 ${
                        kyb.status === 'VERIFIED' ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <span>Verification Complete</span>
                  </div>
                </div>

                {/* Automated Checks Progress */}
                {(kyb.status === 'AUTOMATED_CHECKS_IN_PROGRESS' || kyb.status === 'AUTOMATED_CHECKS_COMPLETE' || kyb.automatedChecksStartedAt) && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 text-sm text-gray-700">Automated Compliance Checks</h4>
                    <div className="space-y-2">
                      {[
                        { key: 'sanctionsCheckStatus', label: 'Sanctions Screening (OFAC, UN, EU)' },
                        { key: 'pepCheckStatus', label: 'PEP Check (Politically Exposed Persons)' },
                        { key: 'adverseMediaCheckStatus', label: 'Adverse Media Check' },
                        { key: 'creditCheckStatus', label: 'Business Credit Check' },
                        { key: 'registryCheckStatus', label: 'Company Registry Verification' },
                        { key: 'documentAICheckStatus', label: 'Document AI Verification' },
                        { key: 'bankVerificationStatus', label: 'Bank Account Verification' },
                      ].map(check => {
                        const status = (kyb as any)[check.key];
                        const isPassed = status === 'PASSED' || status === 'VERIFIED';
                        const isPending = status === 'PENDING' || !status;
                        const isFailed = status === 'FAILED' || status === 'FLAGGED';
                        return (
                          <div key={check.key} className="flex items-center justify-between text-sm p-2 rounded bg-gray-50">
                            <span>{check.label}</span>
                            <span className={`font-medium ${isPassed ? 'text-green-600' : isFailed ? 'text-red-600' : 'text-yellow-600'}`}>
                              {isPassed ? '✓ Passed' : isFailed ? '✗ Review Required' : '⏳ Pending'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {kyb.riskAssessment && (
                <RiskAssessmentDisplay riskAssessment={kyb.riskAssessment} />
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold">Uploaded Documents</h3>
              </div>
              <KYBDocumentUpload kybId={kyb.id} documents={kyb.documents || []} onUpload={fetchKYB} />
            </div>
          )}

          {activeTab === 'compliance' && (
            <ComplianceChecklist kybId={kyb.id} items={kyb.complianceItems || []} onUpdate={fetchKYB} />
          )}

          {activeTab === 'activity' && (
            <div>
              <h3 className="font-semibold mb-4">Verification Activity</h3>
              <div className="space-y-4">
                {(kyb.verificationLogs || []).map((log: any, index: number) => (
                  <div key={log.id || index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-600" />
                    <div>
                      <p className="font-medium">{log.action}</p>
                      <p className="text-sm text-gray-600">{log.actionDetails}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KYBStatusPage;
