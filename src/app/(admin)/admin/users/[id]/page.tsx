'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  User,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  ShoppingCart,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Package,
  MessageSquare,
  Loader2,
  MoreVertical,
  Ban,
  UserCheck,
  Send,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface UserDetails {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  companyName?: string;
  country?: string;
  region?: string;
  kybStatus: string;
  createdAt: string;
  lastLogin?: string;
  accountManagerId?: string;
  accountManager?: { id: string; name: string; email: string };
  // Stats
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  totalSpent: number;
  totalEarned: number;
  avgOrderValue: number;
  disputeCount: number;
  activeDisputes: number;
  // KYB Details
  kyb?: {
    id: string;
    status: string;
    businessName: string;
    businessType: string;
    submittedAt?: string;
    reviewedAt?: string;
    expiresAt?: string;
  };
  // Recent Activity
  recentOrders: Array<{
    id: string;
    title: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  recentTransactions: Array<{
    id: string;
    amount: number;
    status: string;
    type: string;
    createdAt: string;
  }>;
  recentDisputes: Array<{
    id: string;
    type: string;
    status: string;
    createdAt: string;
  }>;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchUserDetails();
  }, [params.id]);

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${params.id}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setUser(data.data.user);
      } else {
        // Mock data for demo
        setUser({
          id: params.id as string,
          name: 'John Smith',
          email: 'john@acmecorp.com',
          phone: '+1-555-1001',
          role: 'BUYER',
          status: 'ACTIVE',
          companyName: 'Acme Corporation',
          country: 'USA',
          region: 'North America',
          kybStatus: 'COMPLETED',
          createdAt: '2024-01-15T10:00:00Z',
          lastLogin: '2024-02-17T08:30:00Z',
          accountManager: { id: 'am1', name: 'Sarah Johnson', email: 'am1@tradewave.io' },
          totalOrders: 15,
          completedOrders: 12,
          pendingOrders: 3,
          totalSpent: 125000,
          totalEarned: 0,
          avgOrderValue: 8333,
          disputeCount: 2,
          activeDisputes: 1,
          kyb: {
            id: 'kyb1',
            status: 'VERIFIED',
            businessName: 'Acme Corporation',
            businessType: 'CORPORATION',
            submittedAt: '2024-01-10T10:00:00Z',
            reviewedAt: '2024-01-12T15:00:00Z',
            expiresAt: '2025-01-12T15:00:00Z',
          },
          recentOrders: [
            { id: 'req1', title: 'Steel Coils - Grade A', amount: 22500, status: 'VERIFIED', createdAt: '2024-02-15T10:00:00Z' },
            { id: 'req2', title: 'Industrial Chemicals', amount: 15000, status: 'QUOTES_PENDING', createdAt: '2024-02-10T10:00:00Z' },
            { id: 'req3', title: 'Electronic Components', amount: 8000, status: 'COMPLETED', createdAt: '2024-02-01T10:00:00Z' },
          ],
          recentTransactions: [
            { id: 'tx1', amount: 22500, status: 'PAYMENT_PENDING', type: 'PURCHASE', createdAt: '2024-02-15T10:00:00Z' },
            { id: 'tx2', amount: 15000, status: 'COMPLETED', type: 'PURCHASE', createdAt: '2024-02-01T10:00:00Z' },
            { id: 'tx3', amount: 8000, status: 'COMPLETED', type: 'PURCHASE', createdAt: '2024-01-20T10:00:00Z' },
          ],
          recentDisputes: [
            { id: 'disp1', type: 'QUALITY', status: 'PENDING', createdAt: '2024-02-14T10:00:00Z' },
            { id: 'disp2', type: 'DELIVERY', status: 'RESOLVED', createdAt: '2024-01-25T10:00:00Z' },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string) => {
    try {
      await fetch(`/api/admin/users/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      fetchUserDetails();
    } catch (error) {
      console.error('Action failed:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      ACTIVE: { bg: 'bg-green-500/20', text: 'text-green-400' },
      PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      SUSPENDED: { bg: 'bg-red-500/20', text: 'text-red-400' },
      INACTIVE: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
    };
    const c = config[status] || config.INACTIVE;
    return <Badge className={`${c.bg} ${c.text}`}>{status}</Badge>;
  };

  const getKYBStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      VERIFIED: { bg: 'bg-green-500/20', text: 'text-green-400' },
      COMPLETED: { bg: 'bg-green-500/20', text: 'text-green-400' },
      PENDING: { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
      REJECTED: { bg: 'bg-red-500/20', text: 'text-red-400' },
      NOT_STARTED: { bg: 'bg-slate-500/20', text: 'text-slate-400' },
    };
    const c = config[status] || config.NOT_STARTED;
    return <Badge className={`${c.bg} ${c.text}`}>{status.replace('_', ' ')}</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const config: Record<string, { bg: string; text: string }> = {
      ADMIN: { bg: 'bg-red-500/20', text: 'text-red-400' },
      BUYER: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
      SUPPLIER: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
      ACCOUNT_MANAGER: { bg: 'bg-orange-500/20', text: 'text-orange-400' },
      PROCUREMENT_OFFICER: { bg: 'bg-cyan-500/20', text: 'text-cyan-400' },
    };
    const c = config[role] || { bg: 'bg-slate-500/20', text: 'text-slate-400' };
    return <Badge className={`${c.bg} ${c.text}`}>{role.replace('_', ' ')}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">User not found</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} className="text-slate-400">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-400">{user.companyName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(user.status)}
          {getRoleBadge(user.role)}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-slate-600">
                <MoreVertical className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem className="text-slate-300" onClick={() => handleAction('verify')}>
                <UserCheck className="mr-2 h-4 w-4" />
                Verify User
              </DropdownMenuItem>
              <DropdownMenuItem className="text-slate-300" onClick={() => handleAction('send_email')}>
                <Send className="mr-2 h-4 w-4" />
                Send Email
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem className="text-yellow-400" onClick={() => handleAction('suspend')}>
                <Ban className="mr-2 h-4 w-4" />
                Suspend User
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-400" onClick={() => handleAction('blacklist')}>
                <XCircle className="mr-2 h-4 w-4" />
                Blacklist User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-slate-400">Total Orders</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{user.totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-400">Completed</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{user.completedOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-slate-400">Pending</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{user.pendingOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-sm text-slate-400">Total Spent</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">${user.totalSpent.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-slate-400">Avg Order</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">${user.avgOrderValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-slate-400">Disputes</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">{user.disputeCount}</p>
            {user.activeDisputes > 0 && (
              <p className="text-xs text-red-400">{user.activeDisputes} active</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-red-600">Overview</TabsTrigger>
          <TabsTrigger value="orders" className="data-[state=active]:bg-red-600">Orders</TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-red-600">Transactions</TabsTrigger>
          <TabsTrigger value="kyb" className="data-[state=active]:bg-red-600">KYB</TabsTrigger>
          <TabsTrigger value="disputes" className="data-[state=active]:bg-red-600">Disputes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-500" />
                      {user.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Phone</p>
                    <p className="text-white flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      {user.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Location</p>
                    <p className="text-white flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      {user.country || 'N/A'}, {user.region || ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Member Since</p>
                    <p className="text-white flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Last Login</p>
                    <p className="text-white">
                      {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Account Manager</p>
                    <p className="text-white">
                      {user.accountManager?.name || 'Not Assigned'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Company Name</p>
                    <p className="text-white">{user.companyName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">KYB Status</p>
                    {getKYBStatusBadge(user.kybStatus)}
                  </div>
                  {user.kyb && (
                    <>
                      <div>
                        <p className="text-sm text-slate-400">Business Type</p>
                        <p className="text-white">{user.kyb.businessType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-400">KYB Expires</p>
                        <p className="text-white">
                          {user.kyb.expiresAt ? new Date(user.kyb.expiresAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">{order.title}</p>
                        <p className="text-sm text-slate-400">${order.amount.toLocaleString()}</p>
                      </div>
                      <Badge className={
                        order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'VERIFIED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {user.recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                      <div>
                        <p className="text-white font-medium">${tx.amount.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">{tx.type}</p>
                      </div>
                      <Badge className={
                        tx.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        tx.status === 'PAYMENT_PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }>
                        {tx.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">All Orders</CardTitle>
              <CardDescription className="text-slate-400">Complete order history for this user</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700 cursor-pointer">
                    <div className="flex items-center gap-4">
                      <Package className="h-8 w-8 text-slate-400" />
                      <div>
                        <p className="text-white font-medium">{order.title}</p>
                        <p className="text-sm text-slate-400">
                          Created {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${order.amount.toLocaleString()}</p>
                      <Badge className={
                        order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'VERIFIED' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }>
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Transaction History</CardTitle>
              <CardDescription className="text-slate-400">All financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <DollarSign className="h-8 w-8 text-green-400" />
                      <div>
                        <p className="text-white font-medium">{tx.type}</p>
                        <p className="text-sm text-slate-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">${tx.amount.toLocaleString()}</p>
                      <Badge className={
                        tx.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                        tx.status === 'PAYMENT_PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-slate-500/20 text-slate-400'
                      }>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kyb" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5" />
                KYB Verification Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.kyb ? (
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-slate-400">Business Name</p>
                    <p className="text-white text-lg">{user.kyb.businessName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Business Type</p>
                    <p className="text-white text-lg">{user.kyb.businessType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    {getKYBStatusBadge(user.kyb.status)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Submitted At</p>
                    <p className="text-white">
                      {user.kyb.submittedAt ? new Date(user.kyb.submittedAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Reviewed At</p>
                    <p className="text-white">
                      {user.kyb.reviewedAt ? new Date(user.kyb.reviewedAt).toLocaleString() : 'Pending Review'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Expires At</p>
                    <p className="text-white">
                      {user.kyb.expiresAt ? new Date(user.kyb.expiresAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">KYB not submitted yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="disputes" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Dispute History</CardTitle>
              <CardDescription className="text-slate-400">All disputes involving this user</CardDescription>
            </CardHeader>
            <CardContent>
              {user.recentDisputes.length > 0 ? (
                <div className="space-y-3">
                  {user.recentDisputes.map((dispute) => (
                    <div key={dispute.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <MessageSquare className="h-8 w-8 text-orange-400" />
                        <div>
                          <p className="text-white font-medium">{dispute.type} Dispute</p>
                          <p className="text-sm text-slate-400">
                            {new Date(dispute.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge className={
                        dispute.status === 'RESOLVED' ? 'bg-green-500/20 text-green-400' :
                        dispute.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }>
                        {dispute.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-slate-400">No disputes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
