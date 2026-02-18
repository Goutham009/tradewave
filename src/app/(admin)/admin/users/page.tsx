'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useSocket } from '@/hooks/useSocket';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Users,
  Search,
  Filter,
  MoreVertical,
  Check,
  X,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName?: string;
  verified: boolean;
  kycStatus: string;
  createdAt: string;
  lastLogin?: string | null;
  transactionCount: number;
}

const getMockUsers = (): User[] => [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'BUYER', companyName: 'Acme Corp', verified: true, kycStatus: 'VERIFIED', createdAt: '2024-01-15', lastLogin: '2024-01-20', transactionCount: 15 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'SUPPLIER', companyName: 'Steel Inc', verified: true, kycStatus: 'VERIFIED', createdAt: '2024-01-10', lastLogin: '2024-01-19', transactionCount: 42 },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'BUYER', companyName: 'Trade Co', verified: false, kycStatus: 'PENDING', createdAt: '2024-01-18', lastLogin: '2024-01-18', transactionCount: 0 },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'SUPPLIER', companyName: 'Metals Ltd', verified: true, kycStatus: 'VERIFIED', createdAt: '2024-01-05', lastLogin: '2024-01-20', transactionCount: 28 },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'BUYER', companyName: 'Import Hub', verified: false, kycStatus: 'REJECTED', createdAt: '2024-01-12', lastLogin: null, transactionCount: 0 },
  { id: '6', name: 'Sarah Johnson', email: 'sarah@example.com', role: 'SUPPLIER', companyName: 'Global Exports', verified: true, kycStatus: 'VERIFIED', createdAt: '2024-01-08', lastLogin: '2024-01-21', transactionCount: 35 },
  { id: '7', name: 'Michael Chen', email: 'michael@example.com', role: 'BUYER', companyName: 'Pacific Trading', verified: true, kycStatus: 'VERIFIED', createdAt: '2024-01-02', lastLogin: '2024-01-20', transactionCount: 67 },
  { id: '8', name: 'Emily Watson', email: 'emily@example.com', role: 'SUPPLIER', companyName: 'Premium Goods Co', verified: false, kycStatus: 'PENDING', createdAt: '2024-01-19', lastLogin: '2024-01-19', transactionCount: 0 },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [kycFilter, setKycFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { subscribe } = useSocket();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(roleFilter && { role: roleFilter }),
        ...(kycFilter && { kycStatus: kycFilter }),
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.data.users?.length > 0) {
        setUsers(data.data.users);
        setTotalPages(data.data.pagination?.pages || 1);
      } else {
        // Use mock data when no users returned
        setUsers(getMockUsers());
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers(getMockUsers());
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, kycFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Socket.io real-time listener for new user registrations
  useEffect(() => {
    const unsubscribe = subscribe('user:registered', (newUser: User) => {
      setUsers(prev => [newUser, ...prev]);
    });

    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  const handleVerifyUser = async (userId: string, verify: boolean) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: verify }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleUpdateKYC = async (userId: string, status: string) => {
    try {
      await fetch(`/api/admin/users/${userId}/kyc`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kycStatus: status }),
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to update KYC:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  const getKYCBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-green-500/20 text-green-400">Verified</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/20 text-red-400">Rejected</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">Not Started</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-red-500/20 text-red-400">Admin</Badge>;
      case 'SUPPLIER':
        return <Badge className="bg-purple-500/20 text-purple-400">Supplier</Badge>;
      case 'BUYER':
        return <Badge className="bg-blue-500/20 text-blue-400">Buyer</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-slate-400">Manage users, verification, and KYC</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Download className="mr-2 h-4 w-4" />
          Export Users
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={roleFilter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter(null)}
                className={roleFilter === null ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                All Roles
              </Button>
              <Button
                variant={roleFilter === 'BUYER' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('BUYER')}
                className={roleFilter === 'BUYER' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                Buyers
              </Button>
              <Button
                variant={roleFilter === 'SUPPLIER' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRoleFilter('SUPPLIER')}
                className={roleFilter === 'SUPPLIER' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                Suppliers
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant={kycFilter === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKycFilter(null)}
                className={kycFilter === null ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                All KYC
              </Button>
              <Button
                variant={kycFilter === 'PENDING' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setKycFilter('PENDING')}
                className={kycFilter === 'PENDING' ? 'bg-red-600' : 'border-slate-600 text-slate-300'}
              >
                Pending
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-4 text-sm font-medium text-slate-400">User</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Role</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">KYC Status</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Verified</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Transactions</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-400">Joined</th>
                    <th className="text-right p-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700/50">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-white">{user.name}</p>
                          <p className="text-sm text-slate-400">{user.email}</p>
                          {user.companyName && (
                            <p className="text-xs text-slate-500">{user.companyName}</p>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{getRoleBadge(user.role)}</td>
                      <td className="p-4">{getKYCBadge(user.kycStatus)}</td>
                      <td className="p-4">
                        {user.verified ? (
                          <Check className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5 text-slate-500" />
                        )}
                      </td>
                      <td className="p-4 text-slate-300">{user.transactionCount}</td>
                      <td className="p-4 text-sm text-slate-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem 
                              className="text-slate-300 hover:bg-slate-700"
                              onClick={() => window.location.href = `/admin/users/${user.id}`}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-slate-300 hover:bg-slate-700"
                              onClick={() => handleVerifyUser(user.id, !user.verified)}
                            >
                              {user.verified ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  Unverify User
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Verify User
                                </>
                              )}
                            </DropdownMenuItem>
                            {user.kycStatus === 'PENDING' && (
                              <>
                                <DropdownMenuItem 
                                  className="text-green-400 hover:bg-slate-700"
                                  onClick={() => handleUpdateKYC(user.id, 'VERIFIED')}
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve KYC
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-400 hover:bg-slate-700"
                                  onClick={() => handleUpdateKYC(user.id, 'REJECTED')}
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject KYC
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                              <Mail className="mr-2 h-4 w-4" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {filteredUsers.length} users
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="border-slate-600 text-slate-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="flex items-center px-3 text-sm text-slate-400">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="border-slate-600 text-slate-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
