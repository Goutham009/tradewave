'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  AlertTriangle, 
  Upload, 
  X, 
  Loader2,
  FileText,
  Image as ImageIcon,
  CheckCircle,
} from 'lucide-react';

interface DisputeFilingFormProps {
  transactionId: string;
  transactionAmount?: number;
  currency?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DISPUTE_REASONS = [
  { value: 'QUALITY_ISSUE', label: 'Quality Issues', description: 'Items received are defective or not as described' },
  { value: 'NOT_RECEIVED', label: 'Item Not Received', description: 'Order was never delivered' },
  { value: 'DIFFERENT_ITEM', label: 'Different Item Received', description: 'Received wrong product or specification' },
  { value: 'QUANTITY_MISMATCH', label: 'Quantity Mismatch', description: 'Received different quantity than ordered' },
  { value: 'LATE_DELIVERY', label: 'Late Delivery', description: 'Significant delay caused losses' },
  { value: 'OTHER', label: 'Other', description: 'Other issues not listed above' },
];

const RESOLUTION_OPTIONS = [
  { value: 'FULL_REFUND', label: 'Full Refund', description: 'Return items and get full refund' },
  { value: 'PARTIAL_REFUND', label: 'Partial Refund', description: 'Keep items with partial compensation' },
  { value: 'ITEM_EXCHANGE', label: 'Item Exchange', description: 'Replace with correct items' },
  { value: 'RENEGOTIATE', label: 'Renegotiate Terms', description: 'Discuss new terms with supplier' },
];

export function DisputeFilingForm({ 
  transactionId, 
  transactionAmount,
  currency = 'USD',
  onSuccess, 
  onCancel 
}: DisputeFilingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    requestedResolution: 'FULL_REFUND'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        const isValid = file.size <= 10 * 1024 * 1024; // 10MB max
        if (!isValid) {
          setError(`File ${file.name} is too large. Max size is 10MB.`);
        }
        return isValid;
      });
      setEvidenceFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!formData.reason) {
      setError('Please select a dispute reason');
      setIsLoading(false);
      return;
    }

    if (formData.description.length < 20) {
      setError('Please provide a detailed description (minimum 20 characters)');
      setIsLoading(false);
      return;
    }

    try {
      // Upload evidence files
      const evidenceUrls: string[] = [];
      
      if (evidenceFiles.length > 0) {
        setUploadProgress(0);
        for (let i = 0; i < evidenceFiles.length; i++) {
          const file = evidenceFiles[i];
          const formDataFile = new FormData();
          formDataFile.append('file', file);
          formDataFile.append('transactionId', transactionId);
          formDataFile.append('type', 'dispute_evidence');

          const uploadRes = await fetch('/api/documents/upload', {
            method: 'POST',
            body: formDataFile
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            evidenceUrls.push(uploadData.url || uploadData.data?.url);
          }
          setUploadProgress(Math.round(((i + 1) / evidenceFiles.length) * 100));
        }
      }

      // Create dispute
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactionId,
          reason: formData.reason,
          description: formData.description,
          evidenceUrls,
          requestedResolution: formData.requestedResolution
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to file dispute');
      }

      setSuccess(true);
      if (onSuccess) {
        onSuccess();
      } else {
        setTimeout(() => {
          router.push(`/disputes/${data.dispute.id}`);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-900 mb-2">Dispute Filed Successfully</h3>
          <p className="text-green-700">
            Your dispute has been submitted. Our team will review it within 24-48 hours.
          </p>
          <p className="text-sm text-green-600 mt-2">Redirecting to dispute details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Transaction Info */}
      {transactionAmount && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Transaction</p>
                <p className="font-mono text-sm">{transactionId.slice(0, 12)}...</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="font-semibold">{currency} {transactionAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dispute Reason */}
      <div>
        <label className="block text-sm font-medium mb-3">Dispute Reason *</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {DISPUTE_REASONS.map((reason) => (
            <button
              key={reason.value}
              type="button"
              onClick={() => setFormData({ ...formData, reason: reason.value })}
              className={`p-4 border rounded-lg text-left transition-all ${
                formData.reason === reason.value
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <p className="font-medium">{reason.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{reason.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Detailed Description *</label>
        <Textarea
          required
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what happened in detail. Include dates, specifics about the issue, and any communication you've had with the supplier..."
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground mt-1">
          {formData.description.length}/500 characters (minimum 20)
        </p>
      </div>

      {/* Evidence Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Evidence (Photos, Documents)</label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            id="evidence-upload"
          />
          <label htmlFor="evidence-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Drag and drop files here or <span className="text-primary">click to browse</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Max 10MB per file. Supports images, PDF, DOC
            </p>
          </label>
        </div>

        {/* Uploaded Files */}
        {evidenceFiles.length > 0 && (
          <div className="mt-3 space-y-2">
            {evidenceFiles.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                {file.type.startsWith('image/') ? (
                  <ImageIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <FileText className="h-5 w-5 text-orange-500" />
                )}
                <span className="text-sm flex-1 truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Uploading evidence... {uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Requested Resolution */}
      <div>
        <label className="block text-sm font-medium mb-3">Requested Resolution *</label>
        <div className="grid gap-3 sm:grid-cols-2">
          {RESOLUTION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFormData({ ...formData, requestedResolution: option.value })}
              className={`p-4 border rounded-lg text-left transition-all ${
                formData.requestedResolution === option.value
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <p className="font-medium">{option.label}</p>
              <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Warning */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium">Important Notice</p>
            <p className="mt-1">
              Filing a dispute will freeze the escrow funds until the issue is resolved. 
              Our team will review your case and contact both parties within 24-48 hours.
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="destructive"
          disabled={isLoading || !formData.reason || formData.description.length < 20}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Filing Dispute...
            </>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              File Dispute
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default DisputeFilingForm;
