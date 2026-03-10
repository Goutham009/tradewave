'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  FileText,
  Loader2,
  Mail,
  RefreshCw,
  Users,
} from 'lucide-react';

type OutreachStatus = 'INVITED' | 'VIEWED_RFQ' | 'QUOTATION_SUBMITTED' | 'DECLINED' | 'EXPIRED';

type SupplierOutreach = {
  id: string;
  supplierId: string;
  supplierName: string;
  contactEmail: string;
  region: string;
  invitedAt: string;
  respondedAt: string | null;
  status: OutreachStatus;
  quotedAmount: number | null;
};

type ProcurementRequirement = {
  id: string;
  requirementReference: string;
  buyerCompany: string;
  productType: string;
  category: string;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  deliveryDeadline: string;
  procurementOwner: string;
  createdAt: string;
  status: 'pending_match' | 'suppliers_contacted' | 'quotes_received';
  rawStatus: string;
  suppliersInvited: number;
  quotationsReceived: number;
  suppliers: SupplierOutreach[];
};

type MatchedSupplierCandidate = {
  id: string;
  name: string;
  companyName: string;
  tier: string;
  matchScore: number;
  canInvite: boolean;
  supplierUserKybStatus?: string;
};

const STATUS_STYLE: Record<OutreachStatus, string> = {
  INVITED: 'bg-blue-500/20 text-blue-400',
  VIEWED_RFQ: 'bg-yellow-500/20 text-yellow-400',
  QUOTATION_SUBMITTED: 'bg-green-500/20 text-green-400',
  DECLINED: 'bg-red-500/20 text-red-400',
  EXPIRED: 'bg-slate-500/30 text-slate-300',
};

const REQUIREMENT_STATUS_STYLE: Record<
  ProcurementRequirement['status'],
  { label: string; className: string }
> = {
  pending_match: { label: 'Pending Match', className: 'bg-purple-500/20 text-purple-400' },
  suppliers_contacted: { label: 'Awaiting Quotations', className: 'bg-yellow-500/20 text-yellow-400' },
  quotes_received: { label: 'Quotations Received', className: 'bg-green-500/20 text-green-400' },
};

function formatCurrency(amount?: number | null) {
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
  const [requirement, setRequirement] = useState<ProcurementRequirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matching, setMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [matchedSuppliers, setMatchedSuppliers] = useState<MatchedSupplierCandidate[]>([]);
  const [selectedSupplierIds, setSelectedSupplierIds] = useState<string[]>([]);
  const [supplierSearchQuery, setSupplierSearchQuery] = useState('');

  const fetchRequirement = useCallback(async (manualRefresh = false) => {
    try {
      if (manualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await fetch(`/api/procurement/requirements/${requirementId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load procurement requirement detail');
      }

      setRequirement(data.requirement || null);
    } catch (fetchError) {
      console.error('Failed to fetch procurement detail:', fetchError);
      setRequirement(null);
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Failed to load procurement requirement detail'
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [requirementId]);

  const fetchMatchedSuppliers = useCallback(async () => {
    try {
      const response = await fetch(`/api/procurement/requirements/${requirementId}/match-suppliers`);
      const data = await response.json();

      if (!response.ok) {
        setMatchedSuppliers([]);
        setSelectedSupplierIds([]);
        return;
      }

      const suppliers = Array.isArray(data?.suppliers) ? data.suppliers : [];
      const eligibleSupplierIds = suppliers
        .filter((supplier: MatchedSupplierCandidate) => supplier.canInvite)
        .slice(0, 10)
        .map((supplier: MatchedSupplierCandidate) => supplier.id);

      setMatchedSuppliers(suppliers);
      setSelectedSupplierIds((previousSelection) => {
        if (previousSelection.length === 0) {
          return eligibleSupplierIds;
        }

        return previousSelection.filter((supplierId) =>
          suppliers.some(
            (supplier: MatchedSupplierCandidate) =>
              supplier.id === supplierId && supplier.canInvite
          )
        );
      });
    } catch {
      setMatchedSuppliers([]);
      setSelectedSupplierIds([]);
    }
  }, [requirementId]);

  useEffect(() => {
    void fetchRequirement();
    void fetchMatchedSuppliers();
  }, [fetchMatchedSuppliers, fetchRequirement]);

  const handleAutoMatchSuppliers = async () => {
    const eligibleSupplierIds = selectedSupplierIds.filter((supplierId) =>
      matchedSuppliers.some((supplier) => supplier.id === supplierId && supplier.canInvite)
    );

    if (eligibleSupplierIds.length === 0) {
      setMatchResult({
        type: 'error',
        message: 'Select at least one KYB-approved supplier to continue.',
      });
      return;
    }

    try {
      setMatching(true);
      setMatchResult(null);

      const response = await fetch(`/api/procurement/requirements/${requirementId}/match-suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supplierIds: eligibleSupplierIds }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMatchResult({
          type: 'error',
          message: data?.error || 'Failed to send supplier invitations',
        });
        return;
      }

      setMatchResult({
        type: 'success',
        message: `Sent requirement to ${data?.cardsSent || eligibleSupplierIds.length} supplier(s).`,
      });

      await Promise.all([fetchRequirement(true), fetchMatchedSuppliers()]);
    } catch {
      setMatchResult({ type: 'error', message: 'Network error while sending invitations.' });
    } finally {
      setMatching(false);
    }
  };

  const filteredMatchedSuppliers = useMemo(() => {
    const query = supplierSearchQuery.trim().toLowerCase();
    if (!query) {
      return matchedSuppliers;
    }

    return matchedSuppliers.filter((supplier) =>
      [supplier.companyName, supplier.name, supplier.tier]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [matchedSuppliers, supplierSearchQuery]);

  const eligibleVisibleSupplierIds = filteredMatchedSuppliers
    .filter((supplier) => supplier.canInvite)
    .map((supplier) => supplier.id);

  const allEligibleVisibleSelected =
    eligibleVisibleSupplierIds.length > 0 &&
    eligibleVisibleSupplierIds.every((supplierId) => selectedSupplierIds.includes(supplierId));

  const toggleSupplierSelection = (supplierId: string, checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedSupplierIds((prev) => (prev.includes(supplierId) ? prev : [...prev, supplierId]));
      return;
    }

    setSelectedSupplierIds((prev) => prev.filter((id) => id !== supplierId));
  };

  const toggleSelectAllVisibleEligible = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedSupplierIds((prev) => {
        const merged = new Set([...prev, ...eligibleVisibleSupplierIds]);
        return Array.from(merged);
      });
      return;
    }

    setSelectedSupplierIds((prev) =>
      prev.filter((supplierId) => !eligibleVisibleSupplierIds.includes(supplierId))
    );
  };

  const stats = useMemo(
    () => ({
      invited: requirement?.suppliersInvited || requirement?.suppliers.length || 0,
      viewed:
        requirement?.suppliers.filter((supplier) => supplier.status === 'VIEWED_RFQ').length || 0,
      submitted:
        requirement?.suppliers.filter((supplier) => supplier.status === 'QUOTATION_SUBMITTED').length ||
        requirement?.quotationsReceived ||
        0,
      declined:
        requirement?.suppliers.filter(
          (supplier) => supplier.status === 'DECLINED' || supplier.status === 'EXPIRED'
        ).length || 0,
    }),
    [requirement]
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-slate-400">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" />
        Loading requirement details...
      </div>
    );
  }

  if (!requirement) {
    return (
      <div className="space-y-4 p-6 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <p className="text-white">{error || 'Requirement not found'}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => router.push('/admin/procurement')}>
            Back to Procurement
          </Button>
          <Button className="bg-red-600 hover:bg-red-700" onClick={() => void fetchRequirement(true)}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {matchResult && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            matchResult.type === 'success'
              ? 'border-green-500/30 bg-green-900/20 text-green-300'
              : 'border-red-500/30 bg-red-900/20 text-red-300'
          }`}
        >
          {matchResult.message}
        </div>
      )}

      {requirement.status === 'pending_match' && (
        <Card className="border-slate-700 bg-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Supplier Matching</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-slate-300">
                {matchedSuppliers.filter((supplier) => supplier.canInvite).length} KYB-approved suppliers available.
              </p>
              <Input
                value={supplierSearchQuery}
                onChange={(event) => setSupplierSearchQuery(event.target.value)}
                placeholder="Filter suppliers by name, company, or tier"
                className="md:max-w-sm bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <div className="rounded-lg border border-slate-700 overflow-hidden">
              <div className="grid grid-cols-12 border-b border-slate-700 bg-slate-900/70 px-3 py-2 text-xs uppercase tracking-wide text-slate-400">
                <div className="col-span-1">
                  <Checkbox
                    checked={allEligibleVisibleSelected}
                    onCheckedChange={toggleSelectAllVisibleEligible}
                  />
                </div>
                <div className="col-span-5">Supplier</div>
                <div className="col-span-2">Tier</div>
                <div className="col-span-2">Match</div>
                <div className="col-span-2">KYB</div>
              </div>
              {filteredMatchedSuppliers.length === 0 ? (
                <div className="px-3 py-6 text-sm text-slate-400 text-center">No matched suppliers found.</div>
              ) : (
                filteredMatchedSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="grid grid-cols-12 items-center border-b border-slate-700/60 px-3 py-2 text-sm last:border-b-0"
                  >
                    <div className="col-span-1">
                      <Checkbox
                        checked={selectedSupplierIds.includes(supplier.id)}
                        onCheckedChange={(checked) => toggleSupplierSelection(supplier.id, checked)}
                        disabled={!supplier.canInvite}
                      />
                    </div>
                    <div className="col-span-5">
                      <p className="text-white font-medium">{supplier.companyName || supplier.name}</p>
                      <p className="text-xs text-slate-400">{supplier.name}</p>
                    </div>
                    <div className="col-span-2 text-slate-300">{supplier.tier}</div>
                    <div className="col-span-2 text-slate-300">{supplier.matchScore}%</div>
                    <div className="col-span-2">
                      <Badge className={supplier.canInvite ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/20 text-amber-400'}>
                        {supplier.canInvite ? 'Approved' : supplier.supplierUserKybStatus || 'Pending'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-slate-400">
                Selected: {selectedSupplierIds.length} supplier(s)
              </p>
              <Button
                onClick={handleAutoMatchSuppliers}
                disabled={matching || selectedSupplierIds.length === 0}
                className="bg-red-600 hover:bg-red-700"
              >
                {matching ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Invitations...
                  </>
                ) : (
                  `Send to Selected Suppliers (${selectedSupplierIds.length})`
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push('/admin/procurement')} className="text-slate-400">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Procurement
          </Button>
          <div>
            <p className="font-mono text-xs text-slate-500">{requirement.requirementReference}</p>
            <h1 className="text-2xl font-bold text-white">Supplier Outreach Status</h1>
            <p className="text-slate-400">{requirement.buyerCompany} • {requirement.productType}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300"
            onClick={() => {
              void Promise.all([fetchRequirement(true), fetchMatchedSuppliers()]);
            }}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Badge className={REQUIREMENT_STATUS_STYLE[requirement.status].className}>
            {REQUIREMENT_STATUS_STYLE[requirement.status].label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Suppliers Contacted</p>
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
            <p className="text-xs text-slate-400">Declined / Expired</p>
            <p className="text-2xl font-bold text-red-400">{stats.declined}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700 bg-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Requirement Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <p className="text-xs text-slate-400">Product</p>
            <p className="text-white">{requirement.productType}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Category</p>
            <p className="text-white">{requirement.category}</p>
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
            <p className="text-xs text-slate-400">Delivery</p>
            <p className="text-white">{requirement.deliveryLocation}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Deadline</p>
            <p className="text-white">{new Date(requirement.deliveryDeadline).toLocaleDateString()}</p>
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
