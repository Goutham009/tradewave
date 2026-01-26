'use client';

import { FileText, CheckCircle, AlertTriangle, Clock, Download } from 'lucide-react';

const COMPLIANCE_ITEMS = [
  { name: 'GDPR Compliance', status: 'COMPLIANT', lastAudit: '2024-01-10', nextAudit: '2024-04-10' },
  { name: 'PCI DSS', status: 'COMPLIANT', lastAudit: '2024-01-05', nextAudit: '2024-07-05' },
  { name: 'SOC 2 Type II', status: 'IN_PROGRESS', lastAudit: '2023-12-01', nextAudit: '2024-02-01' },
  { name: 'AML/KYC', status: 'COMPLIANT', lastAudit: '2024-01-12', nextAudit: '2024-04-12' },
  { name: 'Data Retention Policy', status: 'REVIEW_NEEDED', lastAudit: '2023-10-15', nextAudit: '2024-01-15' },
];

export default function CompliancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compliance</h1>
          <p className="text-slate-400">Regulatory compliance status and audits</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Compliant</p>
              <p className="text-white text-xl font-bold">3</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">In Progress</p>
              <p className="text-white text-xl font-bold">1</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Review Needed</p>
              <p className="text-white text-xl font-bold">1</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-white font-semibold">Compliance Status</h2>
        </div>
        <div className="divide-y divide-slate-800">
          {COMPLIANCE_ITEMS.map((item) => (
            <div key={item.name} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  item.status === 'COMPLIANT' ? 'bg-green-500/20' :
                  item.status === 'IN_PROGRESS' ? 'bg-blue-500/20' : 'bg-yellow-500/20'
                }`}>
                  {item.status === 'COMPLIANT' ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : item.status === 'IN_PROGRESS' ? (
                    <Clock className="w-5 h-5 text-blue-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{item.name}</p>
                  <p className="text-slate-400 text-sm">Last audit: {item.lastAudit}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  item.status === 'COMPLIANT' ? 'bg-green-500/20 text-green-400' :
                  item.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
                <p className="text-slate-500 text-sm mt-1">Next: {item.nextAudit}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
