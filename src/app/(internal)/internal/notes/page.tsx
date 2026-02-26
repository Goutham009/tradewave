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
import {
  Search,
  Plus,
  FileText,
  Clock,
  Building2,
  User,
  Edit,
  Trash2,
  Star,
  Filter,
  MessageSquare,
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

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

interface ActivityLog {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note' | 'verification' | 'negotiation';
  clientName: string;
  description: string;
  outcome: string;
  date: string;
  duration?: string;
}

const MOCK_NOTES: Note[] = [
  { id: 'NOTE-001', clientName: 'Acme Corporation', clientType: 'buyer', title: 'Q1 Bulk Order Discussion', content: 'Client interested in 20% increase in Q1 orders. Discussed potential volume discounts. Need to follow up with pricing proposal by end of week.', category: 'negotiation', isPinned: true, createdAt: '2024-01-20', updatedAt: '2024-01-20' },
  { id: 'NOTE-002', clientName: 'Steel Industries Ltd', clientType: 'supplier', title: 'Quality Issue Resolution', content: 'Resolved quality issue from last shipment. Supplier agreed to 5% credit on next order. Quality control measures being implemented.', category: 'issue', isPinned: false, createdAt: '2024-01-19', updatedAt: '2024-01-19' },
  { id: 'NOTE-003', clientName: 'Tech Solutions Inc', clientType: 'buyer', title: 'KYB Follow-up Required', content: 'Additional documents needed for KYB verification. Contacted client via email. Waiting for bank statement and updated registration certificate.', category: 'follow_up', isPinned: true, createdAt: '2024-01-18', updatedAt: '2024-01-18' },
  { id: 'NOTE-004', clientName: 'Fashion Hub Ltd', clientType: 'buyer', title: 'Communication Preferences', content: 'Client prefers communication via email. Best time to call is between 10 AM - 12 PM EST. Primary contact for urgent matters: Sarah (ext. 234)', category: 'general', isPinned: false, createdAt: '2024-01-17', updatedAt: '2024-01-17' },
  { id: 'NOTE-005', clientName: 'Global Traders LLC', clientType: 'buyer', title: 'Payment Terms Discussion', content: 'Discussed extending payment terms from Net 30 to Net 45. Needs approval from finance. Client has clean payment history.', category: 'negotiation', isPinned: false, createdAt: '2024-01-15', updatedAt: '2024-01-16' },
];

const MOCK_ACTIVITY: ActivityLog[] = [
  { id: 'ACT-001', type: 'call', clientName: 'Acme Corporation', description: 'Discussed Q1 order projections', outcome: 'Client confirmed 20% increase, awaiting formal PO', date: '2024-01-20 10:30 AM', duration: '25 min' },
  { id: 'ACT-002', type: 'email', clientName: 'Tech Solutions Inc', description: 'Sent KYB document request', outcome: 'Awaiting response', date: '2024-01-20 09:15 AM' },
  { id: 'ACT-003', type: 'meeting', clientName: 'Fashion Hub Ltd', description: 'Quarterly business review', outcome: 'Identified new requirements for Q2', date: '2024-01-19 02:00 PM', duration: '1 hour' },
  { id: 'ACT-004', type: 'verification', clientName: 'Global Traders LLC', description: 'KYB verification completed', outcome: 'Approved and activated', date: '2024-01-19 11:00 AM' },
  { id: 'ACT-005', type: 'negotiation', clientName: 'Steel Industries Ltd', description: 'Price negotiation round 2', outcome: 'Agreed on 8% discount for bulk orders', date: '2024-01-18 03:30 PM', duration: '40 min' },
  { id: 'ACT-006', type: 'call', clientName: 'Premium Exports Ltd', description: 'Initial introduction call', outcome: 'Scheduled product demo for next week', date: '2024-01-18 10:00 AM', duration: '15 min' },
];

const CATEGORY_CONFIG = {
  general: { label: 'General', className: 'bg-slate-500/20 text-slate-300' },
  negotiation: { label: 'Negotiation', className: 'bg-blue-500/20 text-blue-400' },
  issue: { label: 'Issue', className: 'bg-red-500/20 text-red-400' },
  follow_up: { label: 'Follow Up', className: 'bg-yellow-500/20 text-yellow-400' },
};

const ACTIVITY_ICONS = {
  call: { icon: Phone, className: 'bg-green-500/20 text-green-400' },
  email: { icon: Mail, className: 'bg-blue-500/20 text-blue-400' },
  meeting: { icon: Calendar, className: 'bg-purple-500/20 text-purple-400' },
  note: { icon: FileText, className: 'bg-yellow-500/20 text-yellow-400' },
  verification: { icon: User, className: 'bg-indigo-500/20 text-indigo-400' },
  negotiation: { icon: MessageSquare, className: 'bg-orange-500/20 text-orange-400' },
};

export default function NotesHistoryPage() {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('notes');
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', category: 'general', clientName: '' });

  const filteredNotes = notes.filter((note) => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.clientName.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || note.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const pinnedNotes = filteredNotes.filter((n) => n.isPinned);
  const otherNotes = filteredNotes.filter((n) => !n.isPinned);

  const togglePin = (noteId: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };

  const handleSaveNote = () => {
    const note: Note = {
      id: `NOTE-${Date.now()}`,
      ...newNote,
      clientType: 'buyer',
      isPinned: false,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    } as Note;
    setNotes((prev) => [note, ...prev]);
    setShowAddNote(false);
    setNewNote({ title: '', content: '', category: 'general', clientName: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Notes & History</h1>
          <p className="text-slate-400">Track client interactions and important notes</p>
        </div>
        <Button onClick={() => setShowAddNote(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Note
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="notes" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">
            <FileText className="h-4 w-4 mr-2" />
            Notes ({notes.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">
            <Clock className="h-4 w-4 mr-2" />
            Activity Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search notes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={categoryFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setCategoryFilter('all')}
                size="sm"
                className="border-slate-700"
              >
                All
              </Button>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <Button
                  key={key}
                  variant={categoryFilter === key ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter(key)}
                  size="sm"
                  className="border-slate-700"
                >
                  {config.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Pinned Notes */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                Pinned Notes
              </h3>
              <div className="grid gap-3">
                {pinnedNotes.map((note) => (
                  <NoteCard key={note.id} note={note} onTogglePin={togglePin} />
                ))}
              </div>
            </div>
          )}

          {/* Other Notes */}
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
            <CardHeader>
              <CardTitle className="text-white">Activity Timeline</CardTitle>
            </CardHeader>
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
                        <p className="text-sm text-slate-400 mt-1">{activity.clientName} {activity.duration && `• ${activity.duration}`}</p>
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

      {/* Add/Edit Note Dialog */}
      <Dialog open={showAddNote} onOpenChange={() => { setShowAddNote(false); setNewNote({ title: '', content: '', category: 'general', clientName: '' }); }}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Client Name</label>
              <Input
                placeholder="Enter client name"
                value={newNote.clientName}
                onChange={(e) => setNewNote((prev) => ({ ...prev, clientName: e.target.value }))}
                className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Title</label>
              <Input
                placeholder="Note title"
                value={newNote.title}
                onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Category</label>
              <div className="flex gap-2 mt-1">
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <Button
                    key={key}
                    variant={newNote.category === key ? 'default' : 'outline'}
                    onClick={() => setNewNote((prev) => ({ ...prev, category: key }))}
                    size="sm"
                    className="border-slate-700"
                  >
                    {config.label}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400">Content</label>
              <Textarea
                placeholder="Write your note..."
                value={newNote.content}
                onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAddNote(false); }} className="border-slate-700 text-slate-300">
              Cancel
            </Button>
            <Button onClick={handleSaveNote} disabled={!newNote.title || !newNote.content} className="bg-blue-600 hover:bg-blue-700 text-white">
              Add Note
            </Button>
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
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
              note.clientType === 'buyer' ? 'bg-blue-500/20' : 'bg-green-500/20'
            }`}>
              <Building2 className={`h-5 w-5 ${note.clientType === 'buyer' ? 'text-blue-400' : 'text-green-400'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-white">{note.title}</h3>
                <Badge className={CATEGORY_CONFIG[note.category].className}>
                  {CATEGORY_CONFIG[note.category].label}
                </Badge>
              </div>
              <p className="text-sm text-slate-400 mt-1">{note.clientName}</p>
              <p className="text-slate-300 mt-2">{note.content}</p>
              <p className="text-xs text-slate-500 mt-3">
                Created {note.createdAt} {note.updatedAt !== note.createdAt && `• Updated ${note.updatedAt}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => onTogglePin(note.id)} className="text-slate-400 hover:text-yellow-400">
              <Star className={`h-4 w-4 ${note.isPinned ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </Button>
            <Link href={`/internal/notes/${note.id}/edit`}>
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
