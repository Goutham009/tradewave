'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, User } from 'lucide-react';

interface Note {
  id: string;
  supplierId: string;
  requirementId: string | null;
  note: string;
  recommendation: 'HIGHLY_RECOMMENDED' | 'RECOMMENDED' | 'NEUTRAL' | 'NOT_RECOMMENDED';
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
}

interface SupplierRecommendationNotesProps {
  supplierId: string;
  requirementId?: string;
}

const mockNotes: Note[] = [
  {
    id: 'note-001',
    supplierId: 'sup-001',
    requirementId: 'req-001',
    note: 'Excellent communication throughout the entire order process. Delivered ahead of schedule with premium packaging.',
    recommendation: 'HIGHLY_RECOMMENDED',
    createdAt: '2024-01-15T10:30:00Z',
    createdBy: {
      id: 'user-001',
      name: 'Sarah Johnson',
      role: 'Procurement Manager',
    },
  },
  {
    id: 'note-002',
    supplierId: 'sup-001',
    requirementId: null,
    note: 'General note: This supplier has been reliable for electronic components. Consider for future sensor orders.',
    recommendation: 'RECOMMENDED',
    createdAt: '2024-01-10T14:20:00Z',
    createdBy: {
      id: 'user-002',
      name: 'David Chen',
      role: 'Account Manager',
    },
  },
  {
    id: 'note-003',
    supplierId: 'sup-001',
    requirementId: 'req-003',
    note: 'Had some minor quality issues with the last batch but resolved quickly. Monitoring for future orders.',
    recommendation: 'NEUTRAL',
    createdAt: '2023-12-20T09:15:00Z',
    createdBy: {
      id: 'user-001',
      name: 'Sarah Johnson',
      role: 'Procurement Manager',
    },
  },
];

export function SupplierRecommendationNotes({ 
  supplierId, 
  requirementId 
}: SupplierRecommendationNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [recommendation, setRecommendation] = useState<Note['recommendation']>('NEUTRAL');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, [supplierId]);

  const fetchNotes = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setNotes(mockNotes);
    setLoading(false);
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/suppliers/notes/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          requirementId,
          note: newNote,
          recommendation,
        }),
      });

      if (response.ok) {
        // Add to local state
        const newNoteObj: Note = {
          id: `note-${Date.now()}`,
          supplierId,
          requirementId: requirementId || null,
          note: newNote,
          recommendation,
          createdAt: new Date().toISOString(),
          createdBy: {
            id: 'current-user',
            name: 'Current User',
            role: 'Procurement Team',
          },
        };
        setNotes([newNoteObj, ...notes]);
        setNewNote('');
        setRecommendation('NEUTRAL');
      } else {
        alert('Failed to add note');
      }
    } catch {
      // For demo, add locally
      const newNoteObj: Note = {
        id: `note-${Date.now()}`,
        supplierId,
        requirementId: requirementId || null,
        note: newNote,
        recommendation,
        createdAt: new Date().toISOString(),
        createdBy: {
          id: 'current-user',
          name: 'Current User',
          role: 'Procurement Team',
        },
      };
      setNotes([newNoteObj, ...notes]);
      setNewNote('');
      setRecommendation('NEUTRAL');
    }

    setSubmitting(false);
  };

  const getRecommendationBadgeVariant = (rec: string) => {
    switch(rec) {
      case 'HIGHLY_RECOMMENDED': return 'success';
      case 'RECOMMENDED': return 'info';
      case 'NEUTRAL': return 'warning';
      case 'NOT_RECOMMENDED': return 'destructive';
      default: return 'default';
    }
  };

  const getRecommendationLabel = (rec: string) => {
    return rec.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-neutral-500">Loading notes...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Internal Notes & Recommendations
      </h3>

      {/* Add New Note */}
      <div className="mb-6 p-4 bg-neutral-50 rounded-lg">
        <label className="block text-sm font-medium mb-2">Add Note</label>
        <textarea
          className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-3 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          rows={3}
          placeholder="Add internal notes about this supplier..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />

        <div className="flex items-center gap-4 mb-3">
          <label className="text-sm font-medium">Recommendation:</label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value as Note['recommendation'])}
            className="px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="HIGHLY_RECOMMENDED">Highly Recommended</option>
            <option value="RECOMMENDED">Recommended</option>
            <option value="NEUTRAL">Neutral</option>
            <option value="NOT_RECOMMENDED">Not Recommended</option>
          </select>
        </div>

        <Button onClick={handleAddNote} disabled={submitting || !newNote.trim()}>
          <Plus className="w-4 h-4 mr-2" />
          {submitting ? 'Adding...' : 'Add Note'}
        </Button>
      </div>

      {/* Existing Notes */}
      <div className="space-y-3">
        {notes.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-4">
            No notes yet. Add the first note above.
          </p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <Badge variant={getRecommendationBadgeVariant(note.recommendation)}>
                    {getRecommendationLabel(note.recommendation)}
                  </Badge>
                  {note.requirementId && (
                    <span className="text-xs text-neutral-500">
                      Requirement #{note.requirementId.slice(0, 8)}
                    </span>
                  )}
                </div>
                <span className="text-xs text-neutral-500">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-neutral-700 mb-2">{note.note}</p>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <User className="w-3 h-3" />
                <span>By: {note.createdBy.name}</span>
                <span>•</span>
                <span>{note.createdBy.role}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
