'use client';

import { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Search, X, Loader2 } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  category: string;
  views: number;
  lastUpdated: string;
  status: string;
}

const MOCK_ARTICLES: Article[] = [
  { id: '1', title: 'Getting Started Guide', category: 'Onboarding', views: 12500, lastUpdated: '2024-01-10', status: 'PUBLISHED' },
  { id: '2', title: 'How to Submit a Quote', category: 'Suppliers', views: 8900, lastUpdated: '2024-01-08', status: 'PUBLISHED' },
  { id: '3', title: 'Payment Methods FAQ', category: 'Billing', views: 6500, lastUpdated: '2024-01-05', status: 'DRAFT' },
];

export default function HelpArticlesPage() {
  const [articles, setArticles] = useState<Article[]>(MOCK_ARTICLES);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'create'>('view');
  const [saving, setSaving] = useState(false);

  const handleView = (article: Article) => { setSelectedArticle(article); setModalMode('view'); setShowModal(true); };
  const handleEdit = (article: Article) => { setSelectedArticle(article); setModalMode('edit'); setShowModal(true); };
  const handleCreate = () => { setSelectedArticle({ id: '', title: '', category: '', views: 0, lastUpdated: new Date().toISOString().split('T')[0], status: 'DRAFT' }); setModalMode('create'); setShowModal(true); };
  const handleDelete = (id: string) => { if (confirm('Delete this article?')) setArticles(prev => prev.filter(a => a.id !== id)); };
  const handleSave = async () => {
    if (!selectedArticle) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    if (modalMode === 'create') {
      setArticles(prev => [...prev, { ...selectedArticle, id: String(Date.now()) }]);
    } else {
      setArticles(prev => prev.map(a => a.id === selectedArticle.id ? selectedArticle : a));
    }
    setSaving(false);
    setShowModal(false);
  };

  const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()) || a.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Help Articles</h1>
          <p className="text-slate-400">Manage help center content</p>
        </div>
        <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Article
        </button>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left p-4 text-slate-400 font-medium">Title</th>
                <th className="text-left p-4 text-slate-400 font-medium">Category</th>
                <th className="text-left p-4 text-slate-400 font-medium">Views</th>
                <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                <th className="text-left p-4 text-slate-400 font-medium">Last Updated</th>
                <th className="text-left p-4 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredArticles.map((article) => (
                <tr key={article.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-blue-400" />
                      <span className="text-white font-medium">{article.title}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-300">{article.category}</td>
                  <td className="p-4 text-slate-300">{article.views.toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      article.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {article.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400">{article.lastUpdated}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => handleView(article)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => handleEdit(article)} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(article.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedArticle && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-800 border border-slate-700 rounded-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {modalMode === 'view' ? 'Article Details' : modalMode === 'edit' ? 'Edit Article' : 'New Article'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm text-slate-400">Title</label>
                <input type="text" value={selectedArticle.title} onChange={(e) => setSelectedArticle({ ...selectedArticle, title: e.target.value })} disabled={modalMode === 'view'} className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Category</label>
                <input type="text" value={selectedArticle.category} onChange={(e) => setSelectedArticle({ ...selectedArticle, category: e.target.value })} disabled={modalMode === 'view'} className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50" />
              </div>
              <div>
                <label className="text-sm text-slate-400">Status</label>
                <select value={selectedArticle.status} onChange={(e) => setSelectedArticle({ ...selectedArticle, status: e.target.value })} disabled={modalMode === 'view'} className="w-full mt-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-50">
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                </select>
              </div>
              {modalMode === 'view' && <div className="bg-slate-900 p-4 rounded-lg"><span className="text-slate-400">Views:</span> <span className="text-white font-bold ml-2">{selectedArticle.views.toLocaleString()}</span></div>}
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
