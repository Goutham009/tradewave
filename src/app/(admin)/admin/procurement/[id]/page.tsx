'use client';

import { useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  Mail,
  Users,
} from 'lucide-react';

type OutreachStatus = 'INVITED' | 'VIEWED_RFQ' | 'QUOTATION_SUBMITTED' | 'DECLINED';

type SupplierOutreach = {
  id: string;
  supplierName: string;
  contactEmail: string;
  region: string;
  invitedAt: string;
  respondedAt?: string;
  status: OutreachStatus;
  quotedAmount?: number;
};

type ProcurementRequirement = {
  id: string;
  buyerCompany: string;
  productType: string;
  quantity: number;
  unit: string;
  procurementOwner: string;
  createdAt: string;
  status: 'INVITATIONS_SENT' | 'AWAITING_QUOTATIONS' | 'QUOTATIONS_RECEIVED';
  suppliers: SupplierOutreach[];
};

const STATUS_STYLE: Record<OutreachStatus, string> = {
  INVITED: 'bg-blue-500/20 text-blue-400',
  VIEWED_RFQ: 'bg-yellow-500/20 text-yellow-400',
  QUOTATION_SUBMITTED: 'bg-green-500/20 text-green-400',
  DECLINED: 'bg-red-500/20 text-red-400',
};

const REQUIREMENT_STATUS_STYLE: Record<ProcurementRequirement['status'], string> = {
  INVITATIONS_SENT: 'bg-purple-500/20 text-purple-400',
  AWAITING_QUOTATIONS: 'bg-yellow-500/20 text-yellow-400',
  QUOTATIONS_RECEIVED: 'bg-green-500/20 text-green-400',
};

const MOCK_REQUIREMENTS: Record<string, ProcurementRequirement> = {
  'REQ-2024-001': {
    id: 'REQ-2024-001',
    buyerCompany: 'TechCorp Industries',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    procurementOwner: 'Sarah Johnson',
    createdAt: '2024-02-21T09:30:00Z',
    status: 'AWAITING_QUOTATIONS',
    suppliers: [
      {
        id: 'sup-001',
        supplierName: 'SensorTech Solutions',
        contactEmail: 'rfq@sensortech.com',
        region: 'Shenzhen, China',
        invitedAt: '2024-02-21T11:00:00Z',
        respondedAt: '2024-02-21T14:30:00Z',
        status: 'VIEWED_RFQ',
      },
      {
        id: 'sup-002',
        supplierName: 'Precision Components Ltd',
        contactEmail: 'procurement@precisioncomponents.com',
        region: 'Seoul, South Korea',
        invitedAt: '2024-02-21T11:10:00Z',
        respondedAt: '2024-02-22T09:10:00Z',
        status: 'QUOTATION_SUBMITTED',
        quotedAmount: 178000,
      },
      {
        id: 'sup-003',
        supplierName: 'Global Sensor Manufacturing',
        contactEmail: 'sales@globalsensor.jp',
        region: 'Tokyo, Japan',
        invitedAt: '2024-02-21T11:20:00Z',
        status: 'INVITED',
      },
      {
        id: 'sup-004',
        supplierName: 'SmartSense Technologies',
        contactEmail: 'rfq@smartsense.in',
        region: 'Mumbai, India',
        invitedAt: '2024-02-21T11:25:00Z',
        respondedAt: '2024-02-22T13:05:00Z',
        status: 'QUOTATION_SUBMITTED',
        quotedAmount: 181500,
      },
      {
        id: 'sup-005',
        supplierName: 'EuroSensor GmbH',
        contactEmail: 'quotes@eurosensor.de',
        region: 'Munich, Germany',
        invitedAt: '2024-02-21T11:40:00Z',
        respondedAt: '2024-02-22T08:15:00Z',
        status: 'DECLINED',
      },
    ],
  },
};

function formatCurrency(amount?: number) {
  if (!amount) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProcurementRequirementDetailPage() {
  const params = useParams();
  const router = useRouter();
  const requirementId = params.id as string;

  const requirement = useMemo<ProcurementRequirement>(() => {
    if (MOCK_REQUIREMENTS[requirementId]) {
      return MOCK_REQUIREMENTS[requirementId];
    }

    return {
      id: requirementId,
      buyerCompany: 'Buyer Company',
      productType: 'Unmapped Requirement',
      quantity: 0,
      unit: 'units',
      procurementOwner: 'Unassigned',
      createdAt: new Date().toISOString(),
      status: 'INVITATIONS_SENT',
      suppliers: [],
    };
  }, [requirementId]);

  const stats = {
    invited: requirement.suppliers.length,
    viewed: requirement.suppliers.filter((supplier) => supplier.status === 'VIEWED_RFQ').length,
    submitted: requirement.suppliers.filter((supplier) => supplier.status === 'QUOTATION_SUBMITTED').length,
    declined: requirement.suppliers.filter((supplier) => supplier.status === 'DECLINED').length,
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/procurement')} className="text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Procurement
          </Button>
          <div>
            <p className="font-mono text-xs text-slate-500">{requirement.id}</p>
            <h1 className="text-2xl font-bold text-white">Supplier Outreach Status</h1>
            <p className="text-slate-400">{requirement.buyerCompany} • {requirement.productType}</p>
          </div>
        </div>
        <Badge className={REQUIREMENT_STATUS_STYLE[requirement.status]}>
          {requirement.status.replace(/_/g, ' ')}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Suppliers Invited</p>
            <p className="text-2xl font-bold text-blue-400">{stats.invited}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Viewed RFQ</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.viewed}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Quotations Submitted</p>
            <p className="text-2xl font-bold text-green-400">{stats.submitted}</p>
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Declined</p>
            <p className="text-2xl font-bold text-red-400">{stats.declined}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Requirement Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-400">Product</p>
            <p className="text-white">{requirement.productType}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Quantity</p>
            <p className="text-white">{requirement.quantity.toLocaleString()} {requirement.unit}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Procurement Owner</p>
            <p className="text-white inline-flex items-center gap-1">
              <Users className="h-4 w-4 text-slate-500" />
              {requirement.procurementOwner}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Created</p>
            <p className="text-white inline-flex items-center gap-1">
              <Calendar className="h-4 w-4 text-slate-500" />
              {new Date(requirement.createdAt).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Invited Suppliers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {requirement.suppliers.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <Building2 className="mx-auto mb-3 h-10 w-10 opacity-50" />
              No supplier invitations recorded for this requirement.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Supplier</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Region</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Invited</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Last Response</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Quote Value</th>
                    <th className="p-4 text-left text-sm font-medium text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requirement.suppliers.map((supplier) => (
                    <tr key={supplier.id} className="border-b border-slate-700/60 hover:bg-slate-700/30">
                      <td className="p-4">
                        <p className="font-medium text-white">{supplier.supplierName}</p>
                        <p className="text-xs text-slate-400 inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {supplier.contactEmail}
                        </p>
                      </td>
                      <td className="p-4 text-slate-300">{supplier.region}</td>
                      <td className="p-4 text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-500" />
                          {new Date(supplier.invitedAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="p-4 text-slate-300">
                        {supplier.respondedAt ? new Date(supplier.respondedAt).toLocaleString() : 'No response yet'}
                      </td>
                      <td className="p-4 text-slate-300">{formatCurrency(supplier.quotedAmount)}</td>
                      <td className="p-4">
                        <Badge className={STATUS_STYLE[supplier.status]}>
                          {supplier.status.replace(/_/g, ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800">
        <CardContent className="flex items-start gap-3 p-4 text-sm text-slate-300">
          <FileText className="mt-0.5 h-4 w-4 text-slate-500" />
          This page is read-only for admin monitoring. Supplier invitation, follow-up, and quote collection are handled in the procurement workflow.
        </CardContent>
      </Card>
    </div>
  );
}
