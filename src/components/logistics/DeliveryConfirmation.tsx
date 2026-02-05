'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Camera, FileSignature, AlertTriangle, Package } from 'lucide-react';

interface DeliveryConfirmationProps {
  transactionId: string;
  onConfirmed: () => void;
}

interface ConfirmationData {
  receivedInGoodCondition: boolean;
  quantityMatches: boolean;
  qualityAcceptable: boolean;
  notes: string;
}

export function DeliveryConfirmation({ transactionId, onConfirmed }: DeliveryConfirmationProps) {
  const [confirmationData, setConfirmationData] = useState<ConfirmationData>({
    receivedInGoodCondition: false,
    quantityMatches: false,
    qualityAcceptable: false,
    notes: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setPhotos(files);
      
      // Create preview URLs
      const urls = files.map(file => URL.createObjectURL(file));
      setPhotoUrls(urls);
    }
  };

  const handleCheckboxChange = (field: keyof Omit<ConfirmationData, 'notes'>) => {
    setConfirmationData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const allChecked = confirmationData.receivedInGoodCondition && 
                     confirmationData.quantityMatches && 
                     confirmationData.qualityAcceptable;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!allChecked) {
      alert('Please confirm all checkboxes before submitting');
      return;
    }

    setSubmitting(true);

    try {
      // Upload photos first if any
      let uploadedPhotoUrls: string[] = [];
      if (photos.length > 0) {
        const formData = new FormData();
        photos.forEach((file, index) => {
          formData.append(`photo_${index}`, file);
        });

        const uploadResponse = await fetch('/api/upload/delivery-photos', {
          method: 'POST',
          body: formData,
        });

        if (uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          uploadedPhotoUrls = uploadData.urls || [];
        }
      }

      // Submit confirmation
      const response = await fetch(`/api/transactions/${transactionId}/confirm-delivery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...confirmationData,
          photoUrls: uploadedPhotoUrls,
          confirmedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert('✅ Delivery confirmed! Payment will be released to supplier.');
        onConfirmed();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to confirm delivery. Please try again.');
      }
    } catch (error) {
      console.error('Confirmation error:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
          <Package className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Confirm Delivery</h3>
          <p className="text-sm text-neutral-600">Verify goods received before releasing payment</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Confirmation Checklist */}
        <div className="space-y-4">
          <label className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg hover:border-teal-300 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={confirmationData.receivedInGoodCondition}
              onChange={() => handleCheckboxChange('receivedInGoodCondition')}
              className="mt-1 w-5 h-5 text-teal-600 rounded"
            />
            <div className="flex-1">
              <p className="font-medium">Goods received in good condition</p>
              <p className="text-sm text-neutral-600">
                No visible damage to packaging or products
              </p>
            </div>
            {confirmationData.receivedInGoodCondition && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </label>

          <label className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg hover:border-teal-300 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={confirmationData.quantityMatches}
              onChange={() => handleCheckboxChange('quantityMatches')}
              className="mt-1 w-5 h-5 text-teal-600 rounded"
            />
            <div className="flex-1">
              <p className="font-medium">Quantity matches order</p>
              <p className="text-sm text-neutral-600">
                All items as per quotation received
              </p>
            </div>
            {confirmationData.quantityMatches && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </label>

          <label className="flex items-start gap-3 p-4 border border-neutral-200 rounded-lg hover:border-teal-300 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={confirmationData.qualityAcceptable}
              onChange={() => handleCheckboxChange('qualityAcceptable')}
              className="mt-1 w-5 h-5 text-teal-600 rounded"
            />
            <div className="flex-1">
              <p className="font-medium">Quality meets specifications</p>
              <p className="text-sm text-neutral-600">
                Products meet agreed quality standards
              </p>
            </div>
            {confirmationData.qualityAcceptable && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
          </label>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Upload Photos (Optional but recommended)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          
          {photoUrls.length > 0 && (
            <div className="mt-3 flex gap-2 flex-wrap">
              {photoUrls.map((url, index) => (
                <div key={index} className="relative">
                  <img 
                    src={url} 
                    alt={`Upload ${index + 1}`} 
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          )}
          
          {photos.length > 0 && (
            <p className="text-sm text-neutral-600 mt-2">
              {photos.length} photo(s) selected
            </p>
          )}
        </div>

        {/* Signature Pad Placeholder */}
        <div>
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <FileSignature className="w-4 h-4" />
            Signature (Optional)
          </label>
          <div className="w-full h-32 border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50 flex items-center justify-center">
            <p className="text-neutral-400 text-sm">
              Signature pad - integrate react-signature-canvas
            </p>
          </div>
        </div>

        {/* Additional Notes */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={confirmationData.notes}
            onChange={(e) => setConfirmationData({ ...confirmationData, notes: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            rows={3}
            placeholder="Any additional comments or observations..."
          />
        </div>

        {/* Warning Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">Important Notice</p>
              <p className="text-sm text-amber-800 mt-1">
                By confirming delivery, you authorize the release of payment from escrow to
                the supplier. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-teal-600 hover:bg-teal-700"
          disabled={!allChecked || submitting}
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin">⏳</span> Processing...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Confirm Delivery & Release Payment
            </span>
          )}
        </Button>
      </form>
    </Card>
  );
}
