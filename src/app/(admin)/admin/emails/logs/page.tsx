'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mail, Search, Filter, RefreshCw, Download, Eye, ChevronLeft, ChevronRight, Loader2, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface EmailLog {
  id: string;
  recipient: string;
  subject: string;
  templateName: string;
  status: 'PENDING' | 'SENT' | 'FAILED' | 'BOUNCED';
  sentAt: string | null;
  failureReason: string | null;
  retryCount: number;
  resendId: string | null;
  createdAt: string;
}

const statusConfig = {
  PENDING: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50', label: 'Pending' },
  SENT: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50', label: 'Sent' },
  FAILED: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Failed' },
  BOUNCED: { icon: AlertTriangle, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Bounced' },
};

export default function EmailLogsPage() {
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' });
      if (search) params.set('recipient', search);
      if (statusFilter) params.set('status', statusFilter);
      if (templateFilter) params.set('template', templateFilter);
      const res = await fetch(`/api/emails/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
        setTotal(data.pagination.total);
      }
    } catch (err) {
      console.error('Failed to fetch logs:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, templateFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const retryFailed = async () => {
    setRetrying(true);
    try {
      const res = await fetch('/api/emails/retry', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Retried ${data.processed} emails. ${data.succeeded} succeeded.`);
        fetchLogs();
      }
    } catch {
      alert('Failed to retry emails');
    } finally {
      setRetrying(false);
    }
  };

  const exportCSV = () => {
    const csv = [
      ['ID', 'Recipient', 'Subject', 'Template', 'Status', 'Sent At', 'Failure Reason', 'Created At'].join(','),
      ...logs.map(l => [l.id, l.recipient, `"${l.subject}"`, l.templateName, l.status, l.sentAt || '', `"${l.failureReason || ''}"`, l.createdAt].join(','))
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Email Logs</h1>
          <p className="text-slate-400">Monitor all outgoing emails</p>
        </div>
        <div className="flex gap-3">
          <button onClick={retryFailed} disabled={retrying} className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50">
            {retrying ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            Retry Failed
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 mb-6">
        <div className="p-4 flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-sky-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="SENT">Sent</option>
            <option value="FAILED">Failed</option>
            <option value="BOUNCED">Bounced</option>
          </select>
          <select
            value={templateFilter}
            onChange={(e) => { setTemplateFilter(e.target.value); setPage(1); }}
            className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-sky-500"
          >
            <option value="">All Templates</option>
            <option value="welcome">Welcome</option>
            <option value="quote_received">Quote Received</option>
            <option value="quote_accepted">Quote Accepted</option>
            <option value="transaction_created">Transaction Created</option>
            <option value="payment_confirmed">Payment Confirmed</option>
            <option value="delivery_ready">Delivery Ready</option>
            <option value="dispute_opened">Dispute Opened</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {(['PENDING', 'SENT', 'FAILED', 'BOUNCED'] as const).map(status => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const count = logs.filter(l => l.status === status).length;
          return (
            <div key={status} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${config.bg}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{count}</p>
                  <p className="text-sm text-slate-400">{config.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Recipient</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Subject</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Template</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Sent At</th>
                <th className="text-left p-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {logs.map(log => {
                const config = statusConfig[log.status];
                const Icon = config.icon;
                return (
                  <tr key={log.id} className="hover:bg-slate-700/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="text-white">{log.recipient}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300 max-w-[200px] truncate">{log.subject}</td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">{log.templateName}</span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 ${config.color}`}>
                        <Icon className="w-4 h-4" />
                        {config.label}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-sm">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}
                    </td>
                    <td className="p-4">
                      <button onClick={() => setSelectedLog(log)} className="p-2 hover:bg-slate-600 rounded-lg">
                        <Eye className="w-4 h-4 text-slate-400" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
          <p className="text-sm text-slate-400">Showing {logs.length} of {total} emails</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 bg-slate-700 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <span className="text-white px-3">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 bg-slate-700 rounded-lg disabled:opacity-50">
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
          <div className="bg-slate-800 rounded-xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Email Details</h3>
            <div className="space-y-3">
              <div><span className="text-slate-400">ID:</span> <span className="text-white ml-2">{selectedLog.id}</span></div>
              <div><span className="text-slate-400">Recipient:</span> <span className="text-white ml-2">{selectedLog.recipient}</span></div>
              <div><span className="text-slate-400">Subject:</span> <span className="text-white ml-2">{selectedLog.subject}</span></div>
              <div><span className="text-slate-400">Template:</span> <span className="text-white ml-2">{selectedLog.templateName}</span></div>
              <div><span className="text-slate-400">Status:</span> <span className={`ml-2 ${statusConfig[selectedLog.status].color}`}>{selectedLog.status}</span></div>
              <div><span className="text-slate-400">Resend ID:</span> <span className="text-white ml-2">{selectedLog.resendId || '-'}</span></div>
              <div><span className="text-slate-400">Retry Count:</span> <span className="text-white ml-2">{selectedLog.retryCount}</span></div>
              {selectedLog.failureReason && (
                <div><span className="text-slate-400">Failure Reason:</span> <span className="text-red-400 ml-2">{selectedLog.failureReason}</span></div>
              )}
              <div><span className="text-slate-400">Created:</span> <span className="text-white ml-2">{new Date(selectedLog.createdAt).toLocaleString()}</span></div>
            </div>
            <button onClick={() => setSelectedLog(null)} className="mt-6 w-full py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
