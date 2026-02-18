'use client';

import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Clock, Eye, MessageSquare, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Appeal {
  id: string;
  userId: string;
  userName: string;
  type: string;
  reason: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const INITIAL_APPEALS: Appeal[] = [
  { id: '1', userId: 'USR001', userName: 'John Doe', type: 'BLACKLIST', reason: 'Account suspended unfairly - I have not violated any terms', status: 'PENDING', createdAt: '2024-01-15' },
  { id: '2', userId: 'USR002', userName: 'Jane Smith', type: 'KYB_REJECTION', reason: 'Documents were valid but system rejected them', status: 'UNDER_REVIEW', createdAt: '2024-01-14' },
  { id: '3', userId: 'USR003', userName: 'Bob Wilson', type: 'TRANSACTION_DISPUTE', reason: 'Payment was deducted but order not processed', status: 'PENDING', createdAt: '2024-01-13' },
  { id: '4', userId: 'USR004', userName: 'Alice Chen', type: 'KYB_REJECTION', reason: 'Business registration documents are genuine', status: 'APPROVED', createdAt: '2024-01-10' },
  { id: '5', userId: 'USR005', userName: 'Mike Johnson', type: 'ACCOUNT_SUSPENSION', reason: 'I did not violate any policies', status: 'REJECTED', createdAt: '2024-01-08' },
];

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>(INITIAL_APPEALS);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'view' | 'approve' | 'reject'>('view');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleAction = (appeal: Appeal, action: 'view' | 'approve' | 'reject') => {
    setSelectedAppeal(appeal);
    setModalAction(action);
    setNotes('');
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!selectedAppeal) return;
    
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (modalAction === 'approve') {
      setAppeals(prev => prev.map(a => 
        a.id === selectedAppeal.id ? { ...a, status: 'APPROVED' as const } : a
      ));
    } else if (modalAction === 'reject') {
      setAppeals(prev => prev.map(a => 
        a.id === selectedAppeal.id ? { ...a, status: 'REJECTED' as const } : a
      ));
    }
    
    setProcessing(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Appeals Review</h1>
          <p className="text-slate-400">Review and manage user appeals</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">User</th>
                <th className="text-left p-4 text-slate-400 font-medium">Type</th>
                <th className="text-left p-4 text-slate-400 font-medium">Reason</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Date</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appeals.map((appeal) => (
                <tr key={appeal.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="text-white font-medium">{appeal.userName}</div>
                    <div className="text-slate-400 text-sm">{appeal.userId}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs bg-orange-500/20 text-orange-400">
                      {appeal.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-300 max-w-xs truncate">{appeal.reason}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      appeal.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                      appeal.status === 'UNDER_REVIEW' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {appeal.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{appeal.createdAt}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAction(appeal, 'view')}
                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {(appeal.status === 'PENDING' || appeal.status === 'UNDER_REVIEW') && (
                        <>
                          <button 
                            onClick={() => handleAction(appeal, 'approve')}
                            className="p-2 hover:bg-green-500/20 rounded-lg text-slate-400 hover:text-green-400"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleAction(appeal, 'reject')}
                            className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {modalAction === 'view' && 'Appeal Details'}
              {modalAction === 'approve' && 'Approve Appeal'}
              {modalAction === 'reject' && 'Reject Appeal'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {modalAction === 'view' && 'Review the appeal details below'}
              {modalAction === 'approve' && 'Confirm approval of this appeal'}
              {modalAction === 'reject' && 'Confirm rejection of this appeal'}
            </DialogDescription>
          </DialogHeader>

          {selectedAppeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">User</p>
                  <p className="text-white font-medium">{selectedAppeal.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">User ID</p>
                  <p className="text-white">{selectedAppeal.userId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Type</p>
                  <p className="text-orange-400">{selectedAppeal.type}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="text-white">{selectedAppeal.status}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Reason</p>
                <p className="text-white bg-slate-700/50 p-3 rounded-lg">{selectedAppeal.reason}</p>
              </div>

              {modalAction !== 'view' && (
                <div>
                  <p className="text-xs text-slate-400 mb-1">Admin Notes</p>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes for this decision..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} className="border-slate-600 text-slate-300">
              {modalAction === 'view' ? 'Close' : 'Cancel'}
            </Button>
            {modalAction !== 'view' && (
              <Button 
                onClick={handleSubmit}
                disabled={processing}
                className={modalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {processing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
                ) : (
                  modalAction === 'approve' ? 'Approve Appeal' : 'Reject Appeal'
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
