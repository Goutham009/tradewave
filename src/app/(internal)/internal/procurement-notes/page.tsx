'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Plus, FileText, Clock, Building2, Star, Edit, Package, MessageSquare, Phone, Mail, Calendar, Send } from 'lucide-react';

interface Note {
  id: string;
  supplierName: string;
  requirementId: string;
  title: string;
  content: string;
  category: 'supplier' | 'quotation' | 'negotiation' | 'general';
  isPinned: boolean;
  createdAt: string;
}

interface Activity {
  id: string;
  type: 'match' | 'quote_review' | 'supplier_contact' | 'negotiation';
  description: string;
  supplierName: string;
  outcome: string;
  date: string;
}

const MOCK_NOTES: Note[] = [
  { id: 'NOTE-001', supplierName: 'Steel Industries Ltd', requirementId: 'REQ-001', title: 'Best supplier for steel', content: 'Consistently delivers quality products. Response time excellent. Recommend for all steel requirements.', category: 'supplier', isPinned: true, createdAt: '2024-01-20' },
  { id: 'NOTE-002', supplierName: 'Textile Masters', requirementId: 'REQ-002', title: 'Quotation analysis', content: 'Price competitive but delivery time longer than others. Good for non-urgent orders.', category: 'quotation', isPinned: false, createdAt: '2024-01-19' },
  { id: 'NOTE-003', supplierName: 'ChemPro Industries', requirementId: 'REQ-003', title: 'Negotiation strategy', content: 'Supplier open to 10% discount on bulk orders. Minimum order value $50K for discount.', category: 'negotiation', isPinned: true, createdAt: '2024-01-18' },
  { id: 'NOTE-004', supplierName: 'Premium Metals Co', requirementId: 'REQ-001', title: 'Quality feedback', content: 'Recent quality issues reported. Monitor closely for next 3 orders.', category: 'general', isPinned: false, createdAt: '2024-01-17' },
];

const MOCK_ACTIVITY: Activity[] = [
  { id: 'ACT-001', type: 'match', description: 'Matched 5 suppliers for Steel Components requirement', supplierName: 'Multiple', outcome: 'All suppliers contacted, awaiting quotes', date: '2024-01-20 10:30 AM' },
  { id: 'ACT-002', type: 'quote_review', description: 'Reviewed 3 quotations for Cotton Fabric', supplierName: 'Textile Masters', outcome: 'Recommended top 2 quotes to admin', date: '2024-01-19 02:15 PM' },
  { id: 'ACT-003', type: 'supplier_contact', description: 'Called supplier for expedited delivery', supplierName: 'ChemPro Industries', outcome: 'Agreed to 5-day delivery instead of 10', date: '2024-01-18 11:00 AM' },
  { id: 'ACT-004', type: 'negotiation', description: 'Price negotiation for bulk order', supplierName: 'Steel Industries Ltd', outcome: '8% discount secured', date: '2024-01-17 03:30 PM' },
];

const CATEGORY_CONFIG: Record<string, { label: string; className: string }> = {
  supplier: { label: 'Supplier', className: 'bg-green-500/20 text-green-400' },
  quotation: { label: 'Quotation', className: 'bg-blue-500/20 text-blue-400' },
  negotiation: { label: 'Negotiation', className: 'bg-purple-500/20 text-purple-400' },
  general: { label: 'General', className: 'bg-slate-500/20 text-slate-300' },
};

const ACTIVITY_ICONS: Record<string, { icon: React.ElementType; className: string }> = {
  match: { icon: Package, className: 'bg-blue-500/20 text-blue-400' },
  quote_review: { icon: FileText, className: 'bg-green-500/20 text-green-400' },
  supplier_contact: { icon: Phone, className: 'bg-yellow-500/20 text-yellow-400' },
  negotiation: { icon: MessageSquare, className: 'bg-purple-500/20 text-purple-400' },
};

export default function ProcurementNotesPage() {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('notes');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general', supplierName: '' });

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(search.toLowerCase()) ||
    note.supplierName.toLowerCase().includes(search.toLowerCase()) ||
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const togglePin = (noteId: string) => {
    setNotes((prev) => prev.map((note) => note.id === noteId ? { ...note, isPinned: !note.isPinned } : note));
  };

  const handleSaveNote = () => {
    const note: Note = {
      id: `NOTE-${Date.now()}`,
      ...newNote,
      requirementId: '',
      isPinned: false,
      createdAt: new Date().toISOString().split('T')[0],
    } as Note;
    setNotes((prev) => [note, ...prev]);
    setShowAddNote(false);
    setNewNote({ title: '', content: '', category: 'general', supplierName: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Procurement Notes & History</h1>
          <p className="text-slate-400">Track supplier interactions and procurement activities</p>
        </div>
        <Button onClick={() => setShowAddNote(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />Add Note
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="notes" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search notes..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500" />
          </div>

          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" />Pinned</h3>
              <div className="grid gap-3">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onTogglePin={togglePin} />
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            {pinnedNotes.length > 0 && <h3 className="text-sm font-semibold text-slate-400">All Notes</h3>}
            <div className="grid gap-3">
              {otherNotes.map((note) => (
                <NoteCard key={note.id} note={note} onTogglePin={togglePin} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white">Activity Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                {MOCK_ACTIVITY.map((activity) => {
                  const config = ACTIVITY_ICONS[activity.type];
                  const Icon = config.icon;
                  return (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b border-slate-800 last:border-0">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.className}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-white">{activity.description}</p>
                          <p className="text-sm text-slate-400">{activity.date}</p>
                        </div>
                        <p className="text-sm text-slate-400 mt-1">{activity.supplierName}</p>
                        <p className="text-sm text-slate-300 mt-2 p-2 rounded bg-slate-800/50">{activity.outcome}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showAddNote} onOpenChange={setShowAddNote}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader><DialogTitle className="text-white">Add Procurement Note</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Supplier Name</label>
              <Input placeholder="Enter supplier name" value={newNote.supplierName} onChange={(e) => setNewNote((p) => ({ ...p, supplierName: e.target.value }))} className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
            </div>
            <div>
              <label className="text-sm text-slate-400">Title</label>
              <Input placeholder="Note title" value={newNote.title} onChange={(e) => setNewNote((p) => ({ ...p, title: e.target.value }))} className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
            </div>
            <div>
              <label className="text-sm text-slate-400">Category</label>
              <div className="flex gap-2 mt-1">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <Button key={key} variant={newNote.category === key ? 'default' : 'outline'} onClick={() => setNewNote((p) => ({ ...p, category: key }))} size="sm" className="border-slate-700">
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400">Content</label>
              <Textarea placeholder="Write your note..." value={newNote.content} onChange={(e) => setNewNote((p) => ({ ...p, content: e.target.value }))} className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-32" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddNote(false)} className="border-slate-700 text-slate-300">Cancel</Button>
            <Button onClick={handleSaveNote} disabled={!newNote.title || !newNote.content} className="bg-blue-600 hover:bg-blue-700 text-white">Add Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NoteCard({ note, onTogglePin }: { note: Note; onTogglePin: (id: string) => void }) {
  return (
    <Card className="bg-slate-900 border-slate-800">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white">{note.title}</h3>
                <Badge className={CATEGORY_CONFIG[note.category].className}>{CATEGORY_CONFIG[note.category].label}</Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">{note.supplierName}</p>
              <p className="text-slate-300 mt-2">{note.content}</p>
              <p className="text-xs text-slate-500 mt-3">{note.createdAt}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onTogglePin(note.id)} className="text-slate-400 hover:text-yellow-400">
              <Star className={`h-4 w-4 ${note.isPinned ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Link href={`/internal/procurement-notes/${note.id}/edit`}>
              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
