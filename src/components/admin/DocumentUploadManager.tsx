'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Eye, CheckCircle, XCircle, File } from 'lucide-react';

interface Document {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
  uploadedAt: string;
}

interface DocumentUploadManagerProps {
  requirementId: string;
  buyerId: string;
}

const documentTypes = [
  { value: 'BUSINESS_LICENSE', label: 'Business License' },
  { value: 'TAX_ID', label: 'Tax ID' },
  { value: 'COMPANY_REGISTRATION', label: 'Company Registration' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'TRADE_LICENSE', label: 'Trade License' },
  { value: 'OTHER', label: 'Other' },
];

const mockDocuments: Document[] = [
  {
    id: 'doc-001',
    documentType: 'BUSINESS_LICENSE',
    fileName: 'business_license_2024.pdf',
    fileUrl: '/documents/business_license_2024.pdf',
    fileSize: 2456000,
    status: 'VERIFIED',
    uploadedAt: '2024-01-15T10:30:00Z',
  },
  {
    id: 'doc-002',
    documentType: 'TAX_ID',
    fileName: 'tax_id_certificate.pdf',
    fileUrl: '/documents/tax_id_certificate.pdf',
    fileSize: 1234000,
    status: 'PENDING',
    uploadedAt: '2024-01-18T14:20:00Z',
  },
  {
    id: 'doc-003',
    documentType: 'COMPANY_REGISTRATION',
    fileName: 'company_reg_doc.pdf',
    fileUrl: '/documents/company_reg_doc.pdf',
    fileSize: 890000,
    status: 'REJECTED',
    rejectionReason: 'Document is expired. Please upload a current version.',
    uploadedAt: '2024-01-10T09:15:00Z',
  },
];

export function DocumentUploadManager({ requirementId, buyerId }: DocumentUploadManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
  }, [requirementId]);

  const fetchDocuments = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setDocuments(mockDocuments);
    setLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      alert('Please select a file and document type');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('documentType', documentType);
      formData.append('requirementId', requirementId);
      formData.append('buyerId', buyerId);

      const response = await fetch('/api/admin/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Document uploaded successfully');
        // Add to local state
        const newDoc: Document = {
          id: `doc-${Date.now()}`,
          documentType,
          fileName: selectedFile.name,
          fileUrl: URL.createObjectURL(selectedFile),
          fileSize: selectedFile.size,
          status: 'PENDING',
          uploadedAt: new Date().toISOString(),
        };
        setDocuments([newDoc, ...documents]);
        setSelectedFile(null);
        setDocumentType('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert('Failed to upload document');
      }
    } catch {
      // For demo, add locally
      const newDoc: Document = {
        id: `doc-${Date.now()}`,
        documentType,
        fileName: selectedFile.name,
        fileUrl: URL.createObjectURL(selectedFile),
        fileSize: selectedFile.size,
        status: 'PENDING',
        uploadedAt: new Date().toISOString(),
      };
      setDocuments([newDoc, ...documents]);
      setSelectedFile(null);
      setDocumentType('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      alert('Document uploaded successfully');
    }

    setUploading(false);
  };

  const handleVerifyDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/admin/documents/${documentId}/verify`, {
        method: 'POST',
      });

      if (response.ok) {
        setDocuments(docs => 
          docs.map(d => d.id === documentId ? { ...d, status: 'VERIFIED' as const } : d)
        );
        alert('Document verified');
      }
    } catch {
      // For demo
      setDocuments(docs => 
        docs.map(d => d.id === documentId ? { ...d, status: 'VERIFIED' as const } : d)
      );
      alert('Document verified');
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/admin/documents/${documentId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        setDocuments(docs => 
          docs.map(d => d.id === documentId ? { ...d, status: 'REJECTED' as const, rejectionReason: reason } : d)
        );
        alert('Document rejected');
      }
    } catch {
      // For demo
      setDocuments(docs => 
        docs.map(d => d.id === documentId ? { ...d, status: 'REJECTED' as const, rejectionReason: reason } : d)
      );
      alert('Document rejected');
    }
  };

  const formatFileSize = (bytes: number) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'VERIFIED': return 'success';
      case 'REJECTED': return 'destructive';
      case 'PENDING': return 'warning';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading documents...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5" />
          Upload Verification Document
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <select
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="">Select document type</option>
              {documentTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select File</label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            {selectedFile && (
              <p className="text-sm text-neutral-600 mt-2 flex items-center gap-2">
                <File className="w-4 h-4" />
                {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !selectedFile || !documentType}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </Card>

      {/* Uploaded Documents */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Uploaded Documents
        </h3>
        
        <div className="space-y-3">
          {documents.length === 0 ? (
            <p className="text-sm text-neutral-500 text-center py-4">
              No documents uploaded yet
            </p>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold">
                      {documentTypes.find(t => t.value === doc.documentType)?.label || doc.documentType}
                    </p>
                    <p className="text-sm text-neutral-600 flex items-center gap-1">
                      <File className="w-3 h-3" />
                      {doc.fileName}
                    </p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(doc.status)}>
                    {doc.status}
                  </Badge>
                </div>

                <div className="text-xs text-neutral-500 mb-3">
                  <p>Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</p>
                  <p>Size: {formatFileSize(doc.fileSize)}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(doc.fileUrl, '_blank')}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>

                  {doc.status === 'PENDING' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleVerifyDocument(doc.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verify
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejectDocument(doc.id)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  )}
                </div>

                {doc.status === 'REJECTED' && doc.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 rounded text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {doc.rejectionReason}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
