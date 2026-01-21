'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  FileText,
  Download,
  Calendar,
  Users,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  Loader2,
  CheckCircle,
  Clock,
  FileSpreadsheet,
  FilePieChart,
  Building2,
} from 'lucide-react';

interface ReportType {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  format: string[];
}

const REPORT_TYPES: ReportType[] = [
  {
    id: 'transactions',
    name: 'Transaction Report',
    description: 'Complete transaction history with status, amounts, and parties involved',
    icon: CreditCard,
    category: 'Financial',
    format: ['CSV', 'Excel', 'PDF'],
  },
  {
    id: 'gmv',
    name: 'GMV Report',
    description: 'Gross Merchandise Value breakdown by period, category, and supplier',
    icon: DollarSign,
    category: 'Financial',
    format: ['CSV', 'Excel', 'PDF'],
  },
  {
    id: 'revenue',
    name: 'Revenue Report',
    description: 'Platform revenue from fees, charges, and other income sources',
    icon: TrendingUp,
    category: 'Financial',
    format: ['CSV', 'Excel', 'PDF'],
  },
  {
    id: 'users',
    name: 'User Report',
    description: 'User registrations, activity, and verification status',
    icon: Users,
    category: 'Users',
    format: ['CSV', 'Excel'],
  },
  {
    id: 'suppliers',
    name: 'Supplier Report',
    description: 'Supplier performance, ratings, and transaction volumes',
    icon: Building2,
    category: 'Users',
    format: ['CSV', 'Excel', 'PDF'],
  },
  {
    id: 'requirements',
    name: 'Requirements Report',
    description: 'Requirements posted, fulfillment rates, and conversion metrics',
    icon: Package,
    category: 'Operations',
    format: ['CSV', 'Excel'],
  },
  {
    id: 'disputes',
    name: 'Dispute Report',
    description: 'Dispute history, resolution times, and outcomes',
    icon: FileText,
    category: 'Operations',
    format: ['CSV', 'Excel', 'PDF'],
  },
  {
    id: 'escrow',
    name: 'Escrow Report',
    description: 'Escrow funds held, released, and pending transactions',
    icon: FilePieChart,
    category: 'Financial',
    format: ['CSV', 'Excel', 'PDF'],
  },
];

interface GeneratedReport {
  id: string;
  name: string;
  generatedAt: string;
  status: 'completed' | 'generating' | 'failed';
  size: string;
  format: string;
}

export default function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('CSV');
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([
    { id: '1', name: 'Transaction Report - Jan 2024', generatedAt: '2024-01-20 14:30', status: 'completed', size: '2.4 MB', format: 'Excel' },
    { id: '2', name: 'GMV Report - Q4 2023', generatedAt: '2024-01-15 09:15', status: 'completed', size: '1.8 MB', format: 'PDF' },
    { id: '3', name: 'User Report - 2023', generatedAt: '2024-01-10 16:45', status: 'completed', size: '856 KB', format: 'CSV' },
  ]);

  const handleGenerateReport = async () => {
    if (!selectedReport) return;

    setGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const report = REPORT_TYPES.find(r => r.id === selectedReport);
    const newReport: GeneratedReport = {
      id: Date.now().toString(),
      name: `${report?.name} - ${new Date().toLocaleDateString()}`,
      generatedAt: new Date().toLocaleString(),
      status: 'completed',
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      format: selectedFormat,
    };
    
    setGeneratedReports(prev => [newReport, ...prev]);
    setGenerating(false);
    setSelectedReport(null);
  };

  const handleDownloadReport = (reportId: string) => {
    // In production, this would trigger actual download
    console.log('Downloading report:', reportId);
  };

  const categories = Array.from(new Set(REPORT_TYPES.map(r => r.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Export</h1>
          <p className="text-slate-400">Generate and download platform reports</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Report Types */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map(category => (
            <Card key={category} className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">{category} Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {REPORT_TYPES.filter(r => r.category === category).map(report => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedReport === report.id
                          ? 'bg-red-600/20 border-red-500'
                          : 'bg-slate-900 border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedReport === report.id ? 'bg-red-600/30' : 'bg-slate-800'
                        }`}>
                          <report.icon className={`h-5 w-5 ${
                            selectedReport === report.id ? 'text-red-400' : 'text-slate-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{report.name}</p>
                          <p className="text-sm text-slate-400 mt-1">{report.description}</p>
                          <div className="flex gap-1 mt-2">
                            {report.format.map(f => (
                              <Badge key={f} className="bg-slate-700 text-slate-300 text-xs">
                                {f}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate Report Panel */}
        <div className="space-y-6">
          <Card className="bg-slate-800 border-slate-700 sticky top-4">
            <CardHeader>
              <CardTitle className="text-white">Generate Report</CardTitle>
              <CardDescription className="text-slate-400">
                {selectedReport 
                  ? `Selected: ${REPORT_TYPES.find(r => r.id === selectedReport)?.name}`
                  : 'Select a report type to generate'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-400">Date Range</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">From</p>
                  </div>
                  <div>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <p className="text-xs text-slate-500 mt-1">To</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-400">Export Format</label>
                <div className="flex gap-2 mt-2">
                  {['CSV', 'Excel', 'PDF'].map(format => (
                    <Button
                      key={format}
                      variant={selectedFormat === format ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFormat(format)}
                      className={selectedFormat === format 
                        ? 'bg-red-600' 
                        : 'border-slate-600 text-slate-300'}
                    >
                      {format}
                    </Button>
                  ))}
                </div>
              </div>

              <Button
                onClick={handleGenerateReport}
                disabled={!selectedReport || generating}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-sm">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Reports Generated</span>
                <span className="text-white font-medium">24</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Downloads</span>
                <span className="text-white font-medium">156</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Data Exported</span>
                <span className="text-white font-medium">48.5 MB</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Generated Reports History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Reports</CardTitle>
          <CardDescription className="text-slate-400">
            Previously generated reports available for download
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {generatedReports.map(report => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-900"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-slate-800">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{report.name}</p>
                    <div className="flex items-center gap-3 text-sm text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.generatedAt}
                      </span>
                      <span>{report.size}</span>
                      <Badge className="bg-slate-700 text-slate-300">{report.format}</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {report.status === 'completed' ? (
                    <>
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Ready
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                        className="border-slate-600 text-slate-300"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </>
                  ) : report.status === 'generating' ? (
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      Generating
                    </Badge>
                  ) : (
                    <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
