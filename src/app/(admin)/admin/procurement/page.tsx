'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, Users, Clock, Building2, Filter, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface Requirement {
  id: string;
  buyerCompany: string;
  productType: string;
  quantity: number;
  unit: string;
  suppliersInvited: number;
  quotationsReceived: number;
  status: 'INVITATIONS_SENT' | 'AWAITING_QUOTATIONS' | 'QUOTATIONS_RECEIVED';
  lastUpdated: string;
  procurementOwner: string;
}

const mockRequirements: Requirement[] = [
  {
    id: 'REQ-2024-001',
    buyerCompany: 'TechCorp Industries',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    suppliersInvited: 8,
    quotationsReceived: 3,
    status: 'AWAITING_QUOTATIONS',
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    procurementOwner: 'Sarah Johnson',
  },
  {
    id: 'REQ-2024-002',
    buyerCompany: 'Global Manufacturing Co.',
    productType: 'Steel Beams - Construction Grade',
    quantity: 100,
    unit: 'tons',
    suppliersInvited: 11,
    quotationsReceived: 6,
    status: 'INVITATIONS_SENT',
    lastUpdated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    procurementOwner: 'David Chen',
  },
  {
    id: 'REQ-2024-003',
    buyerCompany: 'Premier Retail Ltd',
    productType: 'LED Display Panels',
    quantity: 200,
    unit: 'units',
    suppliersInvited: 7,
    quotationsReceived: 7,
    status: 'QUOTATIONS_RECEIVED',
    lastUpdated: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    procurementOwner: 'Sarah Johnson',
  },
];

const STATUS_CONFIG: Record<Requirement['status'], { label: string; className: string }> = {
  INVITATIONS_SENT: { label: 'Invitations Sent', className: 'bg-purple-500/20 text-purple-400' },
  AWAITING_QUOTATIONS: { label: 'Awaiting Quotations', className: 'bg-yellow-500/20 text-yellow-400' },
  QUOTATIONS_RECEIVED: { label: 'Quotations Received', className: 'bg-green-500/20 text-green-400' },
};

export default function ProcurementDashboard() {
  const [requirements] = useState<Requirement[]>(mockRequirements);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequirements = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return requirements;

    return requirements.filter((item) =>
      item.id.toLowerCase().includes(term) ||
      item.buyerCompany.toLowerCase().includes(term) ||
      item.productType.toLowerCase().includes(term)
    );
  }, [requirements, searchQuery]);

  const queueStats = {
    total: requirements.length,
    invitationsSent: requirements.filter((item) => item.status === 'INVITATIONS_SENT').length,
    awaitingQuotes: requirements.filter((item) => item.status === 'AWAITING_QUOTATIONS').length,
    quotationsReceived: requirements.filter((item) => item.status === 'QUOTATIONS_RECEIVED').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Procurement Matching Queue</h1>
          <p className="mt-1 text-slate-400">
            Information-only admin view. Open a requirement to see which suppliers were invited and current response status.
          </p>
        </div>
        <Badge className="bg-slate-700 text-slate-200">{queueStats.total} requirements</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Invitations Sent</p>
            <p className="text-2xl font-bold text-purple-400">{queueStats.invitationsSent}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Awaiting Quotes</p>
            <p className="text-2xl font-bold text-yellow-400">{queueStats.awaitingQuotes}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Quotes Received</p>
            <p className="text-2xl font-bold text-green-400">{queueStats.quotationsReceived}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Total Suppliers Invited</p>
            <p className="text-2xl font-bold text-blue-400">
              {requirements.reduce((sum, req) => sum + req.suppliersInvited, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative min-w-[260px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search by requirement id, buyer, or product..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="bg-slate-900 border-slate-700 text-white pl-10"
              />
            </div>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Requirement</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Buyer</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Invited / Quotes</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Owner</th>
                  <th className="p-4 text-left text-sm font-medium text-slate-400">Status</th>
                  <th className="p-4 text-right text-sm font-medium text-slate-400">Open</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequirements.map((requirement) => (
                  <tr key={requirement.id} className="border-b border-slate-700/60 hover:bg-slate-700/40">
                    <td className="p-4">
                      <p className="font-mono text-xs text-slate-500">{requirement.id}</p>
                      <p className="font-medium text-white">{requirement.productType}</p>
                      <p className="text-xs text-slate-400">{requirement.quantity.toLocaleString()} {requirement.unit}</p>
                    </td>
                    <td className="p-4 text-slate-300">{requirement.buyerCompany}</td>
                    <td className="p-4 text-slate-300">
                      <div className="text-sm">
                        <p>{requirement.suppliersInvited} suppliers invited</p>
                        <p className="text-slate-400">{requirement.quotationsReceived} quotations received</p>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">
                      <span className="inline-flex items-center gap-2">
                        <Users className="h-4 w-4 text-slate-500" />
                        {requirement.procurementOwner}
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge className={STATUS_CONFIG[requirement.status].className}>
                        {STATUS_CONFIG[requirement.status].label}
                      </Badge>
                      <p className="mt-1 text-xs text-slate-500 inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(requirement.lastUpdated).toLocaleString()}
                      </p>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/admin/procurement/${requirement.id}`}>
                        <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                          Details
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRequirements.length === 0 && (
            <div className="p-10 text-center text-slate-400">
              <Building2 className="mx-auto mb-3 h-10 w-10 opacity-50" />
              No procurement queue items found.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
