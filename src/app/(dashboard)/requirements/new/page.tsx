'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Send, AlertCircle, Upload } from 'lucide-react';

const categories = [
  'Raw Materials',
  'Electronics',
  'Machinery',
  'Packaging',
  'Textiles',
  'Chemicals',
  'Food & Beverage',
  'Automotive',
  'Medical',
  'Other',
];

const priorities = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

const DRAFT_STORAGE_KEY = 'tradewave_requirement_drafts_v1';

type RequirementDraft = {
  id: string;
  createdAt: string;
  payload: {
    title: string;
    description: string;
    category: string;
    subcategory: string;
    quantity: string;
    unit: string;
    targetPrice: string;
    currency: string;
    deliveryLocation: string;
    deliveryDeadline: string;
    priority: string;
    specifications: string;
    paymentTerms: string;
    additionalNotes: string;
  };
};

export default function NewRequirementPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedDrafts, setSavedDrafts] = useState<RequirementDraft[]>([]);
  const [draftNotice, setDraftNotice] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    quantity: '',
    unit: 'pcs',
    targetPrice: '',
    currency: 'USD',
    deliveryLocation: '',
    deliveryDeadline: '',
    priority: 'MEDIUM',
    specifications: '',
    paymentTerms: '',
    additionalNotes: '',
  });

  useEffect(() => {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as RequirementDraft[];
      setSavedDrafts(parsed);
    } catch {
      setSavedDrafts([]);
    }
  }, []);

  const totalAmount = useMemo(() => {
    const quantity = Number(formData.quantity || 0);
    const targetPrice = Number(formData.targetPrice || 0);
    if (!Number.isFinite(quantity) || !Number.isFinite(targetPrice) || quantity <= 0 || targetPrice <= 0) {
      return 0;
    }
    return quantity * targetPrice;
  }, [formData.quantity, formData.targetPrice]);

  const persistDrafts = (nextDrafts: RequirementDraft[]) => {
    setSavedDrafts(nextDrafts);
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(nextDrafts));
  };

  const saveDraftLocally = () => {
    const draft: RequirementDraft = {
      id: `draft-${Date.now()}`,
      createdAt: new Date().toISOString(),
      payload: {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory,
        quantity: formData.quantity,
        unit: formData.unit,
        targetPrice: formData.targetPrice,
        currency: formData.currency,
        deliveryLocation: formData.deliveryLocation,
        deliveryDeadline: formData.deliveryDeadline,
        priority: formData.priority,
        specifications: formData.specifications,
        paymentTerms: formData.paymentTerms,
        additionalNotes: formData.additionalNotes,
      },
    };

    persistDrafts([draft, ...savedDrafts].slice(0, 20));
    setDraftNotice('Draft saved locally. You can load it anytime from Saved Drafts.');
    setTimeout(() => setDraftNotice(''), 2500);
  };

  const loadDraft = (draftId: string) => {
    const draft = savedDrafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }
    setFormData((prev) => ({ ...prev, ...draft.payload }));
    setDraftNotice('Draft loaded into form.');
    setTimeout(() => setDraftNotice(''), 2000);
  };

  const deleteDraft = (draftId: string) => {
    const nextDrafts = savedDrafts.filter((item) => item.id !== draftId);
    persistDrafts(nextDrafts);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    setError('');
    setIsLoading(true);

    try {
      if (isDraft) {
        saveDraftLocally();
      }

      const response = await fetch('/api/requirements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity) || 0,
          targetPrice: parseFloat(formData.targetPrice) || null,
          totalAmount: totalAmount || null,
          status: isDraft ? 'DRAFT' : 'SUBMITTED',
          specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create requirement');
      }

      router.push('/requirements');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link href="/requirements">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Requirement</h1>
          <p className="text-muted-foreground">
            Submit a new sourcing requirement
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Describe what you need</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Steel Components for Manufacturing"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Provide detailed description of your requirements..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    name="subcategory"
                    placeholder="e.g., Stainless Steel"
                    value={formData.subcategory}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quantity & Pricing</CardTitle>
              <CardDescription>Specify your quantity and target price</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    placeholder="1000"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <select
                    id="unit"
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="pcs">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="tons">Tons</option>
                    <option value="meters">Meters</option>
                    <option value="liters">Liters</option>
                    <option value="units">Units</option>
                    <option value="sets">Sets</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {priorities.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetPrice">Target Price (per {formData.unit})</Label>
                  <Input
                    id="targetPrice"
                    name="targetPrice"
                    type="number"
                    placeholder="100"
                    value={formData.targetPrice}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="INR">INR - Indian Rupee</option>
                    <option value="CNY">CNY - Chinese Yuan</option>
                  </select>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/20 p-3">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Estimated Total Amount</p>
                <p className="text-lg font-semibold">
                  {formData.currency} {totalAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Quantity × Target Price = {formData.quantity || 0} × {formData.targetPrice || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
              <CardDescription>Where and when you need it</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="deliveryLocation">Delivery Location *</Label>
                  <Input
                    id="deliveryLocation"
                    name="deliveryLocation"
                    placeholder="City, Country"
                    value={formData.deliveryLocation}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryDeadline">Delivery Deadline *</Label>
                  <Input
                    id="deliveryDeadline"
                    name="deliveryDeadline"
                    type="date"
                    value={formData.deliveryDeadline}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Payment Terms</Label>
                <Input
                  id="paymentTerms"
                  name="paymentTerms"
                  placeholder="e.g., 30% advance, 70% on delivery"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  placeholder="Any special requirements, certifications needed, etc."
                  value={formData.additionalNotes}
                  onChange={handleChange}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {draftNotice && (
            <Alert>
              <AlertDescription>{draftNotice}</AlertDescription>
            </Alert>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="gradient"
                className="w-full"
                onClick={() => handleSubmit(false)}
                disabled={isLoading}
              >
                <Send className="mr-2 h-4 w-4" />
                {isLoading ? 'Submitting...' : 'Submit Requirement'}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSubmit(true)}
                disabled={isLoading}
              >
                <Save className="mr-2 h-4 w-4" />
                Save as Draft
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Drafts</CardTitle>
              <CardDescription>Drafts are saved locally in this browser.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {savedDrafts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No drafts saved yet.</p>
              ) : (
                savedDrafts.map((draft) => (
                  <div key={draft.id} className="rounded-lg border p-3">
                    <p className="text-sm font-medium truncate">
                      {draft.payload.title || 'Untitled draft'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Saved {new Date(draft.createdAt).toLocaleString()}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => loadDraft(draft.id)}>
                        Load
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteDraft(draft.id)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Attachments</CardTitle>
              <CardDescription>Upload supporting documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Drag & drop files here or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, DOC, XLS, Images (max 10MB)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>• Be specific about your requirements</p>
              <p>• Include quality standards if applicable</p>
              <p>• Mention any certifications needed</p>
              <p>• Set realistic delivery deadlines</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
