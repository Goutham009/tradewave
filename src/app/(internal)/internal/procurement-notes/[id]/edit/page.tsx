'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Save,
  Trash2,
  Building2,
  Clock,
  Star,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Note {
  id: string;
  supplierName: string;
  requirementId: string;
  title: string;
  content: string;
  category: 'supplier' | 'quotation' | 'negotiation' | 'general';
  isPinned: boolean;
  createdAt: string;
  lastModified?: string;
}

const MOCK_NOTES: Note[] = [
  { id: 'NOTE-001', supplierName: 'Steel Industries Ltd', requirementId: 'REQ-001', title: 'Best supplier for steel', content: 'Consistently delivers quality products. Response time excellent. Recommend for all steel requirements.', category: 'supplier', isPinned: true, createdAt: '2024-01-20' },
  { id: 'NOTE-002', supplierName: 'Textile Masters', requirementId: 'REQ-002', title: 'Quotation analysis', content: 'Price competitive but delivery time longer than others. Good for non-urgent orders.', category: 'quotation', isPinned: false, createdAt: '2024-01-19' },
  { id: 'NOTE-003', supplierName: 'ChemPro Industries', requirementId: 'REQ-003', title: 'Negotiation strategy', content: 'Supplier open to 10% discount on bulk orders. Minimum order value $50K for discount.', category: 'negotiation', isPinned: true, createdAt: '2024-01-18' },
  { id: 'NOTE-004', supplierName: 'Premium Metals Co', requirementId: 'REQ-001', title: 'Quality feedback', content: 'Recent quality issues reported. Monitor closely for next 3 orders.', category: 'general', isPinned: false, createdAt: '2024-01-17' },
];

const CATEGORY_CONFIG: Record<string, { label: string; className: string }> = {
  supplier: { label: 'Supplier', className: 'bg-green-500/20 text-green-400' },
  quotation: { label: 'Quotation', className: 'bg-blue-500/20 text-blue-400' },
  negotiation: { label: 'Negotiation', className: 'bg-purple-500/20 text-purple-400' },
  general: { label: 'General', className: 'bg-slate-500/20 text-slate-300' },
};

export default function EditNotePage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [category, setCategory] = useState<string>('general');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    // Simulate fetching note
    const foundNote = MOCK_NOTES.find(n => n.id === noteId);
    if (foundNote) {
      setNote(foundNote);
      setTitle(foundNote.title);
      setContent(foundNote.content);
      setSupplierName(foundNote.supplierName);
      setCategory(foundNote.category);
      setIsPinned(foundNote.isPinned);
    }
    setLoading(false);
  }, [noteId]);

  useEffect(() => {
    if (note) {
      const changed = 
        title !== note.title ||
        content !== note.content ||
        supplierName !== note.supplierName ||
        category !== note.category ||
        isPinned !== note.isPinned;
      setHasChanges(changed);
    }
  }, [title, content, supplierName, category, isPinned, note]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    router.push('/internal/procurement-notes');
  };

  const handleDelete = async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    router.push('/internal/procurement-notes');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.back()} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">Note not found</h3>
            <p className="text-slate-400 mt-2">The note you&rsquo;re looking for doesn&rsquo;t exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/internal/procurement-notes')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Note</h1>
            <p className="text-slate-400">Modify procurement note details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDeleteDialog(true)}
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges || saving || !title || !content}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Note Info */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Created: {note.createdAt}
            </span>
            <span>•</span>
            <span>ID: {note.id}</span>
            {note.requirementId && (
              <>
                <span>•</span>
                <span>Requirement: {note.requirementId}</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Note Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Content *</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note content..."
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-[200px]"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Supplier Name</label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <Input
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Enter supplier name"
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Category</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={category === key ? 'default' : 'outline'}
                      onClick={() => setCategory(key)}
                      size="sm"
                      className={category === key ? 'bg-blue-600' : 'border-slate-700 text-slate-300'}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Pin Status</label>
                <Button
                  variant={isPinned ? 'default' : 'outline'}
                  onClick={() => setIsPinned(!isPinned)}
                  className={isPinned ? 'bg-yellow-600 hover:bg-yellow-700' : 'border-slate-700 text-slate-300'}
                >
                  <Star className={`h-4 w-4 mr-2 ${isPinned ? 'fill-current' : ''}`} />
                  {isPinned ? 'Pinned' : 'Not Pinned'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-white text-sm">{title || 'Untitled'}</h4>
                  {category && (
                    <Badge className={`text-xs ${CATEGORY_CONFIG[category]?.className || ''}`}>
                      {CATEGORY_CONFIG[category]?.label || category}
                    </Badge>
                  )}
                  {isPinned && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                </div>
                <p className="text-xs text-slate-400">{supplierName || 'No supplier'}</p>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3">{content || 'No content'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete Note
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this note? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
