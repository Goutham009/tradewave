'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Clock, Trash2, Eye } from 'lucide-react';

const DOCUMENT_TYPES = [
  { value: 'BUSINESS_LICENSE', label: 'Business License' },
  { value: 'TAX_CERTIFICATE', label: 'Tax Certificate' },
  { value: 'REGISTRATION_CERTIFICATE', label: 'Registration Certificate' },
  { value: 'INCORPORATION_CERTIFICATE', label: 'Incorporation Certificate' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'IDENTIFICATION', label: 'Identification Document' },
  { value: 'UTILITY_BILL', label: 'Utility Bill (Address Proof)' },
  { value: 'ARTICLES_OF_INCORPORATION', label: 'Articles of Incorporation' },
  { value: 'MEMORANDUM_OF_ASSOCIATION', label: 'Memorandum of Association' },
  { value: 'PARTNERSHIP_DEED', label: 'Partnership Deed' },
  { value: 'TRUST_DEED', label: 'Trust Deed' },
  { value: 'PROOF_OF_OWNERSHIP', label: 'Proof of Ownership' },
  { value: 'INSURANCE_CERTIFICATE', label: 'Insurance Certificate' },
  { value: 'PRODUCT_CERTIFICATION', label: 'Product Certification' },
  { value: 'EXPORT_LICENSE', label: 'Export License' },
  { value: 'IMPORT_LICENSE', label: 'Import License' },
  { value: 'ISO_CERTIFICATION', label: 'ISO Certification' },
  { value: 'AUDITED_ACCOUNTS', label: 'Audited Financial Accounts' },
  { value: 'VAT_CERTIFICATE', label: 'VAT Certificate' },
  { value: 'OTHER', label: 'Other Document' }
];

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING: { color: 'text-yellow-600', icon: Clock, label: 'Pending' },
  VERIFIED: { color: 'text-green-600', icon: CheckCircle, label: 'Verified' },
  REJECTED: { color: 'text-red-600', icon: XCircle, label: 'Rejected' },
  EXPIRED: { color: 'text-gray-600', icon: Clock, label: 'Expired' }
};

interface Document {
  id: string;
  documentType: string;
  documentName: string;
  storageUrl: string;
  fileSize: number;
  verificationStatus: string;
  verificationNotes?: string;
  expiryDate?: string;
  createdAt: string;
}

interface KYBDocumentUploadProps {
  kybId: string;
  documents: Document[];
  onUpload: () => void;
}

export function KYBDocumentUpload({ kybId, documents, onUpload }: KYBDocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedType) {
      setError('Please select a document type first');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', selectedType);

      const res = await fetch('/api/kyb/documents/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      setSelectedType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      onUpload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getDocumentTypeLabel = (type: string) => {
    return DOCUMENT_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div>
      {/* Upload Section */}
      <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
        <div className="text-center">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <h4 className="font-medium mb-2">Upload New Document</h4>
          <p className="text-sm text-gray-500 mb-4">PDF, JPG, PNG up to 10MB</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 w-full sm:w-auto">
              <option value="">Select document type</option>
              {DOCUMENT_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
            
            <label className={`px-6 py-2 rounded-lg cursor-pointer ${
              uploading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            } text-white`}>
              {uploading ? 'Uploading...' : 'Choose File'}
              <input type="file" ref={fileInputRef} onChange={handleUpload}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" className="hidden" disabled={uploading} />
            </label>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-4">
        {documents.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No documents uploaded yet</p>
        ) : (
          documents.map(doc => {
            const statusConfig = STATUS_CONFIG[doc.verificationStatus] || STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <div key={doc.id} className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium">{doc.documentName}</p>
                    <p className="text-sm text-gray-500">
                      {getDocumentTypeLabel(doc.documentType)} • {formatFileSize(doc.fileSize)}
                    </p>
                    {doc.verificationNotes && (
                      <p className="text-sm text-gray-600 mt-1">{doc.verificationNotes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                    <StatusIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">{statusConfig.label}</span>
                  </div>
                  <a href={doc.storageUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 text-gray-400 hover:text-gray-600">
                    <Eye className="w-5 h-5" />
                  </a>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default KYBDocumentUpload;
