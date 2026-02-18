'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Search,
  MoreVertical,
  Eye,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  Building2,
  User,
  Calendar,
  RefreshCw,
  Loader2,
  XCircle,
} from 'lucide-react';

interface Order {
  id: string;
  requirementId: string;
  buyerName: string;
  buyerCompany: string;
  supplierName: string;
  supplierCompany: string;
  productName: string;
  quantity: number;
  unit: string;
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'PAYMENT_RECEIVED' | 'IN_PRODUCTION' | 'READY_TO_SHIP' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED';
  createdAt: string;
  expectedDelivery: string;
}

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-2024-001', requirementId: 'REQ-001', buyerName: 'John Smith', buyerCompany: 'Acme Corp', supplierName: 'Wei Chen', supplierCompany: 'Steel Industries Ltd', productName: 'Steel Coils Grade A', quantity: 500, unit: 'tons', totalAmount: 225000, status: 'IN_PRODUCTION', createdAt: '2024-02-01', expectedDelivery: '2024-03-15' },
  { id: 'ORD-2024-002', requirementId: 'REQ-002', buyerName: 'Lisa Wang', buyerCompany: 'Global Imports', supplierName: 'Raj Patel', supplierCompany: 'Textile Exports Co', productName: 'Cotton Fabric Premium', quantity: 10000, unit: 'meters', totalAmount: 28000, status: 'READY_TO_SHIP', createdAt: '2024-02-05', expectedDelivery: '2024-02-28' },
  { id: 'ORD-2024-003', requirementId: 'REQ-003', buyerName: 'Mike Johnson', buyerCompany: 'TechParts Inc', supplierName: 'Yuki Tanaka', supplierCompany: 'ElecParts Japan', productName: 'Ceramic Capacitors 100uF', quantity: 50000, unit: 'pcs', totalAmount: 4500, status: 'SHIPPED', createdAt: '2024-02-08', expectedDelivery: '2024-02-20' },
  { id: 'ORD-2024-004', requirementId: 'REQ-004', buyerName: 'Sarah Chen', buyerCompany: 'Chem Solutions', supplierName: 'Hans Mueller', supplierCompany: 'ChemSupply GmbH', productName: 'Industrial Solvents', quantity: 100, unit: 'barrels', totalAmount: 15000, status: 'PENDING_PAYMENT', createdAt: '2024-02-10', expectedDelivery: '2024-03-01' },
  { id: 'ORD-2024-005', requirementId: 'REQ-005', buyerName: 'David Lee', buyerCompany: 'Auto Parts Co', supplierName: 'Maria Garcia', supplierCompany: 'Precision Parts SA', productName: 'Aluminum Sheets', quantity: 200, unit: 'sheets', totalAmount: 36000, status: 'DELIVERED', createdAt: '2024-01-20', expectedDelivery: '2024-02-10' },
  { id: 'ORD-2024-006', requirementId: 'REQ-006', buyerName: 'Emma Wilson', buyerCompany: 'Fashion Hub', supplierName: 'Ahmed Hassan', supplierCompany: 'Textile Masters', productName: 'Silk Fabric', quantity: 5000, unit: 'meters', totalAmount: 75000, status: 'COMPLETED', createdAt: '2024-01-15', expectedDelivery: '2024-02-01' },
  { id: 'ORD-2024-007', requirementId: 'REQ-007', buyerName: 'James Brown', buyerCompany: 'BuildRight Inc', supplierName: 'Pierre Dubois', supplierCompany: 'Euro Metals SA', productName: 'Steel Beams', quantity: 50, unit: 'tons', totalAmount: 42000, status: 'DISPUTED', createdAt: '2024-01-25', expectedDelivery: '2024-02-15' },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  PAYMENT_RECEIVED: { label: 'Payment Received', color: 'bg-blue-500/20 text-blue-400', icon: DollarSign },
  IN_PRODUCTION: { label: 'In Production', color: 'bg-purple-500/20 text-purple-400', icon: Package },
  READY_TO_SHIP: { label: 'Ready to Ship', color: 'bg-cyan-500/20 text-cyan-400', icon: Truck },
  SHIPPED: { label: 'Shipped', color: 'bg-indigo-500/20 text-indigo-400', icon: Truck },
  DELIVERED: { label: 'Delivered', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  COMPLETED: { label: 'Completed', color: 'bg-emerald-500/20 text-emerald-400', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  DISPUTED: { label: 'Disputed', color: 'bg-orange-500/20 text-orange-400', icon: AlertTriangle },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'PENDING_PAYMENT').length,
    inProgress: orders.filter(o => ['PAYMENT_RECEIVED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED'].includes(o.status)).length,
    completed: orders.filter(o => ['DELIVERED', 'COMPLETED'].includes(o.status)).length,
    disputed: orders.filter(o => o.status === 'DISPUTED').length,
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.buyerCompany.toLowerCase().includes(search.toLowerCase()) ||
      order.supplierCompany.toLowerCase().includes(search.toLowerCase()) ||
      order.productName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAction = async (orderId: string, action: string) => {
    setProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (action === 'view') {
      const order = orders.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        setShowModal(true);
      }
    } else if (action === 'mark_shipped') {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SHIPPED' as const } : o));
    } else if (action === 'mark_delivered') {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'DELIVERED' as const } : o));
    } else if (action === 'complete') {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'COMPLETED' as const } : o));
    }
    
    setProcessing(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">All Orders</h1>
          <p className="text-slate-400">Manage and track all platform orders</p>
        </div>
        <Button variant="outline" className="border-slate-600 text-slate-300">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-slate-800 border-slate-700 cursor-pointer" onClick={() => setStatusFilter('all')}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Total Orders</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer" onClick={() => setStatusFilter('PENDING_PAYMENT')}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Pending Payment</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700 cursor-pointer" onClick={() => setStatusFilter('DISPUTED')}>
          <CardContent className="p-4">
            <p className="text-xs text-slate-400">Disputed</p>
            <p className="text-2xl font-bold text-orange-400">{stats.disputed}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-slate-700">
            <SelectItem value="all">All Statuses</SelectItem>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <SelectItem key={key} value={key}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left p-4 text-slate-400 font-medium">Order ID</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Product</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Buyer</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Supplier</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Amount</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left p-4 text-slate-400 font-medium">Delivery</th>
                  <th className="text-right p-4 text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-4">
                      <p className="text-white font-medium">{order.id}</p>
                      <p className="text-xs text-slate-500">{order.requirementId}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{order.productName}</p>
                      <p className="text-xs text-slate-400">{order.quantity} {order.unit}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{order.buyerName}</p>
                      <p className="text-xs text-slate-400">{order.buyerCompany}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-white">{order.supplierName}</p>
                      <p className="text-xs text-slate-400">{order.supplierCompany}</p>
                    </td>
                    <td className="p-4 text-emerald-400 font-medium">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="p-4">
                      <Badge className={STATUS_CONFIG[order.status]?.color}>
                        {STATUS_CONFIG[order.status]?.label}
                      </Badge>
                    </td>
                    <td className="p-4 text-slate-300 text-sm">
                      {new Date(order.expectedDelivery).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-slate-400">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem className="text-slate-300" onClick={() => handleAction(order.id, 'view')}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {order.status === 'READY_TO_SHIP' && (
                            <DropdownMenuItem className="text-blue-400" onClick={() => handleAction(order.id, 'mark_shipped')}>
                              <Truck className="mr-2 h-4 w-4" />
                              Mark as Shipped
                            </DropdownMenuItem>
                          )}
                          {order.status === 'SHIPPED' && (
                            <DropdownMenuItem className="text-green-400" onClick={() => handleAction(order.id, 'mark_delivered')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Mark as Delivered
                            </DropdownMenuItem>
                          )}
                          {order.status === 'DELIVERED' && (
                            <DropdownMenuItem className="text-emerald-400" onClick={() => handleAction(order.id, 'complete')}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete Order
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Order Details Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              {selectedOrder?.id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Product</p>
                  <p className="text-white font-medium">{selectedOrder.productName}</p>
                  <p className="text-sm text-slate-400">{selectedOrder.quantity} {selectedOrder.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Total Amount</p>
                  <p className="text-emerald-400 font-bold text-xl">{formatCurrency(selectedOrder.totalAmount)}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Buyer</p>
                  <p className="text-white font-medium">{selectedOrder.buyerName}</p>
                  <p className="text-slate-400 text-sm">{selectedOrder.buyerCompany}</p>
                </div>
                <div className="bg-slate-900 p-4 rounded-lg">
                  <p className="text-xs text-slate-400 mb-2">Supplier</p>
                  <p className="text-white font-medium">{selectedOrder.supplierName}</p>
                  <p className="text-slate-400 text-sm">{selectedOrder.supplierCompany}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Status</p>
                  <Badge className={STATUS_CONFIG[selectedOrder.status]?.color}>
                    {STATUS_CONFIG[selectedOrder.status]?.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Expected Delivery</p>
                  <p className="text-white">{new Date(selectedOrder.expectedDelivery).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)} className="border-slate-600 text-slate-300">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
