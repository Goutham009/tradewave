'use client';

import { useState } from 'react';
import { Mail, Plus, Edit, Eye, Copy, X, Loader2 } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  trigger: string;
  lastEdited: string;
  status: string;
}

const MOCK_TEMPLATES: Template[] = [
  { id: '1', name: 'Welcome Email', trigger: 'USER_SIGNUP', lastEdited: '2024-01-10', status: 'ACTIVE' },
  { id: '2', name: 'Order Confirmation', trigger: 'ORDER_PLACED', lastEdited: '2024-01-08', status: 'ACTIVE' },
  { id: '3', name: 'Password Reset', trigger: 'PASSWORD_RESET', lastEdited: '2024-01-05', status: 'ACTIVE' },
  { id: '4', name: 'KYB Approved', trigger: 'KYB_APPROVED', lastEdited: '2024-01-03', status: 'ACTIVE' },
  { id: '5', name: 'Payment Receipt', trigger: 'PAYMENT_SUCCESS', lastEdited: '2024-01-01', status: 'DRAFT' },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(MOCK_TEMPLATES);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [saving, setSaving] = useState(false);

  const handleView = (t: Template) => { setSelectedTemplate(t); setModalMode('view'); setShowModal(true); };
  const handleEdit = (t: Template) => { setSelectedTemplate(t); setModalMode('edit'); setShowModal(true); };
  const handleCreate = () => { setSelectedTemplate({ id: '', name: '', trigger: '', lastEdited: new Date().toISOString().split('T')[0], status: 'DRAFT' }); setModalMode('create'); setShowModal(true); };
  const handleDuplicate = (t: Template) => { setTemplates(prev => [...prev, { ...t, id: String(Date.now()), name: `${t.name} (Copy)` }]); };
  const handleSave = async () => {
    if (!selectedTemplate) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    if (modalMode === 'create') {
      setTemplates(prev => [...prev, { ...selectedTemplate, id: String(Date.now()) }]);
    } else {
      setTemplates(prev => prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t));
    }
    setSaving(false);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Templates</h1>
          <p className="text-slate-400">Manage automated email templates</p>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{template.name}</p>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      template.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {template.status}
                    </span>
                  </div>
                  <p className="text-slate-400 text-sm mt-1">Trigger: {template.trigger}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-500 text-sm">Edited {template.lastEdited}</span>
                <div className="flex gap-2">
                  <button onClick={() => handleView(template)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleEdit(template)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDuplicate(template)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {modalMode === 'view' ? 'Template Details' : modalMode === 'edit' ? 'Edit Template' : 'New Template'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-slate-400">Template Name</label>
                <input type="text" value={selectedTemplate.name} onChange={(e) => setSelectedTemplate({ ...selectedTemplate, name: e.target.value })} disabled={modalMode === 'view'} className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Trigger Event</label>
                <select value={selectedTemplate.trigger} onChange={(e) => setSelectedTemplate({ ...selectedTemplate, trigger: e.target.value })} disabled={modalMode === 'view'} className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50">
                  <option value="">Select trigger...</option>
                  <option value="USER_SIGNUP">User Signup</option>
                  <option value="ORDER_PLACED">Order Placed</option>
                  <option value="PASSWORD_RESET">Password Reset</option>
                  <option value="KYB_APPROVED">KYB Approved</option>
                  <option value="KYB_REJECTED">KYB Rejected</option>
                  <option value="PAYMENT_SUCCESS">Payment Success</option>
                  <option value="PAYMENT_FAILED">Payment Failed</option>
                  <option value="SHIPMENT_UPDATE">Shipment Update</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400">Status</label>
                <select value={selectedTemplate.status} onChange={(e) => setSelectedTemplate({ ...selectedTemplate, status: e.target.value })} disabled={modalMode === 'view'} className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50">
                  <option value="DRAFT">Draft</option>
                  <option value="ACTIVE">Active</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white">{modalMode === 'view' ? 'Close' : 'Cancel'}</button>
              {modalMode !== 'view' && <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">{saving && <Loader2 className="w-4 h-4 animate-spin" />}{saving ? 'Saving...' : 'Save'}</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
