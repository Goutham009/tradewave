import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ClipboardList,
  FileText,
  Package,
  Receipt,
  ShoppingCart,
  Truck,
} from 'lucide-react';

export type FlowReferences = {
  requirementReference?: string | null;
  quotationReference?: string | null;
  transactionReference?: string | null;
  internalOrderId?: string | null;
  buyerOrderId?: string | null;
  supplierOrderId?: string | null;
};

type ReferenceChainCardProps = {
  references?: FlowReferences | null;
  title?: string;
  description?: string;
  className?: string;
  pendingLabel?: string;
};

export function ReferenceChainCard({
  references,
  title = 'Flow Reference Chain',
  description = 'Trace this deal across requirement, quotation, transaction, and order IDs.',
  className,
  pendingLabel = 'Pending',
}: ReferenceChainCardProps) {
  const rows = [
    {
      key: 'requirementReference',
      label: 'Requirement',
      value: references?.requirementReference,
      Icon: ClipboardList,
    },
    {
      key: 'quotationReference',
      label: 'Quotation',
      value: references?.quotationReference,
      Icon: FileText,
    },
    {
      key: 'transactionReference',
      label: 'Transaction',
      value: references?.transactionReference,
      Icon: Receipt,
    },
    {
      key: 'internalOrderId',
      label: 'Internal Order',
      value: references?.internalOrderId,
      Icon: Package,
    },
    {
      key: 'buyerOrderId',
      label: 'Buyer PO',
      value: references?.buyerOrderId,
      Icon: ShoppingCart,
    },
    {
      key: 'supplierOrderId',
      label: 'Supplier SO',
      value: references?.supplierOrderId,
      Icon: Truck,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ key, label, value, Icon }) => (
            <div key={key} className="rounded-lg border p-3">
              <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </div>
              {value ? (
                <p className="font-mono text-sm font-semibold">{value}</p>
              ) : (
                <Badge variant="secondary">{pendingLabel}</Badge>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
