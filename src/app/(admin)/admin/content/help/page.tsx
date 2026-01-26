'use client';

import { useState } from 'react';
import { FileText, Plus, Edit, Trash2, Eye, Search } from 'lucide-react';

const MOCK_ARTICLES = [
  { id: '1', title: 'Getting Started Guide', category: 'Onboarding', views: 12500, lastUpdated: '2024-01-10', status: 'PUBLISHED' },
  { id: '2', title: 'How to Submit a Quote', category: 'Suppliers', views: 8900, lastUpdated: '2024-01-08', status: 'PUBLISHED' },
  { id: '3', title: 'Payment Methods FAQ', category: 'Billing', views: 6500, lastUpdated: '2024-01-05', status: 'DRAFT' },
];

export default function HelpArticlesPage() {
  const [articles] = useState(MOCK_ARTICLES);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Help Articles</h1>
          <p className="text-slate-400">Manage help center content</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center gap-2">
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
              {articles.map((article) => (
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
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><Eye className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
