'use client';

import React, { useEffect, useState } from 'react';
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
  Star,
  AlertTriangle,
  Clock,
  User,
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Note {
  id: string;
  clientName: string;
  clientType: 'buyer' | 'supplier';
  title: string;
  content: string;
  category: 'general' | 'negotiation' | 'issue' | 'follow_up';
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

const MOCK_NOTES: Note[] = [
  { id: 'NOTE-001', clientName: 'Acme Corporation', clientType: 'buyer', title: 'Q1 Bulk Order Discussion', content: 'Client interested in 20% increase in Q1 orders. Discussed potential volume discounts. Need to follow up with pricing proposal by end of week.', category: 'negotiation', isPinned: true, createdAt: '2024-01-20', updatedAt: '2024-01-20' },
  { id: 'NOTE-002', clientName: 'Steel Industries Ltd', clientType: 'supplier', title: 'Quality Issue Resolution', content: 'Resolved quality issue from last shipment. Supplier agreed to 5% credit on next order. Quality control measures being implemented.', category: 'issue', isPinned: false, createdAt: '2024-01-19', updatedAt: '2024-01-19' },
  { id: 'NOTE-003', clientName: 'Tech Solutions Inc', clientType: 'buyer', title: 'KYB Follow-up Required', content: 'Additional documents needed for KYB verification. Contacted client via email. Waiting for bank statement and updated registration certificate.', category: 'follow_up', isPinned: true, createdAt: '2024-01-18', updatedAt: '2024-01-18' },
  { id: 'NOTE-004', clientName: 'Fashion Hub Ltd', clientType: 'buyer', title: 'Communication Preferences', content: 'Client prefers communication via email. Best time to call is between 10 AM - 12 PM EST. Primary contact for urgent matters: Sarah (ext. 234)', category: 'general', isPinned: false, createdAt: '2024-01-17', updatedAt: '2024-01-17' },
];

const CATEGORY_CONFIG: Record<string, { label: string; className: string }> = {
  general: { label: 'General', className: 'bg-slate-500/20 text-slate-300' },
  negotiation: { label: 'Negotiation', className: 'bg-blue-500/20 text-blue-400' },
  issue: { label: 'Issue', className: 'bg-red-500/20 text-red-400' },
  follow_up: { label: 'Follow Up', className: 'bg-yellow-500/20 text-yellow-400' },
};

export default function NoteEditPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [clientName, setClientName] = useState('');
  const [category, setCategory] = useState<Note['category']>('general');
  const [clientType, setClientType] = useState<Note['clientType']>('buyer');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    const found = MOCK_NOTES.find((item) => item.id === noteId) ?? MOCK_NOTES[0];
    setNote(found);
    setTitle(found.title);
    setContent(found.content);
    setClientName(found.clientName);
    setCategory(found.category);
    setClientType(found.clientType);
    setIsPinned(found.isPinned);
    setLoading(false);
  }, [noteId]);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    router.push('/internal/notes');
  };

  const handleDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push('/internal/notes');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push('/internal/notes')} className="text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">Note not found</h3>
            <p className="text-slate-400 mt-2">The note you are looking for doesn’t exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/internal/notes')} className="text-slate-400 hover:text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Notes
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Note</h1>
            <p className="text-slate-400">Update client notes and interaction details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="border-red-500/50 text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleSave} disabled={!title || !content || saving} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Created: {note.createdAt}
            </span>
            <span>•</span>
            <span>Updated: {note.updatedAt}</span>
            <span>•</span>
            <span>ID: {note.id}</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Note Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 bg-slate-800 border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Content</label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 bg-slate-800 border-slate-700 text-white min-h-40"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400">Client Name</label>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Client Type</label>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={clientType === 'buyer' ? 'default' : 'outline'}
                    onClick={() => setClientType('buyer')}
                    size="sm"
                    className={clientType === 'buyer' ? 'bg-blue-600' : 'border-slate-700 text-slate-300'}
                  >
                    Buyer
                  </Button>
                  <Button
                    variant={clientType === 'supplier' ? 'default' : 'outline'}
                    onClick={() => setClientType('supplier')}
                    size="sm"
                    className={clientType === 'supplier' ? 'bg-green-600' : 'border-slate-700 text-slate-300'}
                  >
                    Supplier
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Category</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                    <Button
                      key={key}
                      variant={category === key ? 'default' : 'outline'}
                      onClick={() => setCategory(key as Note['category'])}
                      size="sm"
                      className={category === key ? 'bg-blue-600' : 'border-slate-700 text-slate-300'}
                    >
                      {config.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-400">Pin Status</label>
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

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-3 rounded-lg bg-slate-800 border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-medium text-white text-sm">{title || 'Untitled'}</h4>
                  <Badge className={`text-xs ${CATEGORY_CONFIG[category]?.className || ''}`}>
                    {CATEGORY_CONFIG[category]?.label || category}
                  </Badge>
                  {isPinned && <Star className="h-3 w-3 text-yellow-400 fill-current" />}
                </div>
                <p className="text-xs text-slate-400">{clientName || 'No client'}</p>
                <p className="text-xs text-slate-300 mt-2 line-clamp-3">{content || 'No content'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
