'use client';

import { useState } from 'react';
import { Megaphone, Plus, Edit, Trash2, Eye, Calendar, X, Loader2 } from 'lucide-react';

interface Promotion {
  id: string;
  name: string;
  discount: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  uses: number;
}

const MOCK_PROMOTIONS: Promotion[] = [
  { id: '1', name: 'New Year Sale', discount: '20%', type: 'PERCENTAGE', startDate: '2024-01-01', endDate: '2024-01-31', status: 'ACTIVE', uses: 1250 },
  { id: '2', name: 'First Order Discount', discount: '$50', type: 'FIXED', startDate: '2024-01-01', endDate: '2024-12-31', status: 'ACTIVE', uses: 890 },
  { id: '3', name: 'Bulk Order Special', discount: '15%', type: 'PERCENTAGE', startDate: '2024-02-01', endDate: '2024-02-28', status: 'SCHEDULED', uses: 0 },
];

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>(MOCK_PROMOTIONS);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [saving, setSaving] = useState(false);

  const handleView = (promo: Promotion) => {
    setSelectedPromo(promo);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEdit = (promo: Promotion) => {
    setSelectedPromo(promo);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleCreate = () => {
    setSelectedPromo({ id: '', name: '', discount: '', type: 'PERCENTAGE', startDate: '', endDate: '', status: 'SCHEDULED', uses: 0 });
    setModalMode('create');
    setShowModal(true);
  };

  const handleDelete = (promoId: string) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      setPromotions(prev => prev.filter(p => p.id !== promoId));
    }
  };

  const handleSave = async () => {
    if (!selectedPromo) return;
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (modalMode === 'create') {
      const newId = String(Math.max(...promotions.map(p => Number(p.id))) + 1);
      setPromotions(prev => [...prev, { ...selectedPromo, id: newId }]);
    } else {
      setPromotions(prev => prev.map(p => p.id === selectedPromo.id ? selectedPromo : p));
    }
    
    setSaving(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Promotions</h1>
          <p className="text-slate-400">Manage platform-wide promotions and discounts</p>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Promotion
        </button>
      </div>

      <div className="grid gap-4">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Megaphone className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{promo.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      promo.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {promo.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                    <span className="text-blue-400 font-medium">{promo.discount} off</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {promo.startDate} - {promo.endDate}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-white font-semibold">{promo.uses.toLocaleString()}</p>
                  <p className="text-slate-400 text-sm">times used</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleView(promo)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(promo)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(promo.id)} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for View/Edit/Create */}
      {showModal && selectedPromo && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {modalMode === 'view' ? 'Promotion Details' : modalMode === 'edit' ? 'Edit Promotion' : 'Create Promotion'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-slate-400">Name</label>
                <input
                  type="text"
                  value={selectedPromo.name}
                  onChange={(e) => setSelectedPromo({ ...selectedPromo, name: e.target.value })}
                  disabled={modalMode === 'view'}
                  className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Discount</label>
                  <input
                    type="text"
                    value={selectedPromo.discount}
                    onChange={(e) => setSelectedPromo({ ...selectedPromo, discount: e.target.value })}
                    disabled={modalMode === 'view'}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Type</label>
                  <select
                    value={selectedPromo.type}
                    onChange={(e) => setSelectedPromo({ ...selectedPromo, type: e.target.value })}
                    disabled={modalMode === 'view'}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50"
                  >
                    <option value="PERCENTAGE">Percentage</option>
                    <option value="FIXED">Fixed Amount</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Start Date</label>
                  <input
                    type="date"
                    value={selectedPromo.startDate}
                    onChange={(e) => setSelectedPromo({ ...selectedPromo, startDate: e.target.value })}
                    disabled={modalMode === 'view'}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">End Date</label>
                  <input
                    type="date"
                    value={selectedPromo.endDate}
                    onChange={(e) => setSelectedPromo({ ...selectedPromo, endDate: e.target.value })}
                    disabled={modalMode === 'view'}
                    className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50"
                  />
                </div>
              </div>
              {modalMode === 'view' && (
                <div className="bg-slate-900 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Uses</span>
                    <span className="text-white font-bold">{selectedPromo.uses.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">
                {modalMode === 'view' ? 'Close' : 'Cancel'}
              </button>
              {modalMode !== 'view' && (
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
