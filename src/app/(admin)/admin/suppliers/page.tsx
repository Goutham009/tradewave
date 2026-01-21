'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  MoreVertical,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Building2,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Star,
  Package,
  DollarSign,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Supplier {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  verified: boolean;
  rating: number;
  totalTransactions: number;
  totalRevenue: number;
  productCategories: string[];
  createdAt: string;
  lastActive: string;
}

const VERIFICATION_STATUS: Record<string, { label: string; color: string; icon: any }> = {
  verified: { label: 'Verified', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  rejected: { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: XCircle },
};

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    fetchSuppliers();
  }, [page]);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/suppliers?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setSuppliers(data.data);
        setTotalPages(data.pagination?.totalPages || 1);
        setStats(data.stats || stats);
      } else {
        throw new Error('Failed to fetch');
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error);
      // Mock data fallback
      setSuppliers([
        { id: 's1', companyName: 'Steel Industries Ltd', email: 'contact@steelindustries.com', phone: '+1-555-0101', country: 'China', city: 'Shanghai', verified: true, rating: 4.8, totalTransactions: 156, totalRevenue: 2450000, productCategories: ['Raw Materials', 'Metals'], createdAt: '2023-06-15', lastActive: new Date().toISOString() },
        { id: 's2', companyName: 'Electronics Manufacturing Co', email: 'sales@elecmfg.com', phone: '+1-555-0102', country: 'Japan', city: 'Tokyo', verified: true, rating: 4.9, totalTransactions: 234, totalRevenue: 3890000, productCategories: ['Electronics', 'Components'], createdAt: '2023-04-20', lastActive: new Date(Date.now() - 86400000).toISOString() },
        { id: 's3', companyName: 'Global Textiles Inc', email: 'info@globaltextiles.com', phone: '+1-555-0103', country: 'India', city: 'Mumbai', verified: true, rating: 4.5, totalTransactions: 89, totalRevenue: 1250000, productCategories: ['Textiles', 'Fabrics'], createdAt: '2023-08-10', lastActive: new Date(Date.now() - 172800000).toISOString() },
        { id: 's4', companyName: 'Precision Parts GmbH', email: 'sales@precisionparts.de', phone: '+49-555-0104', country: 'Germany', city: 'Hamburg', verified: true, rating: 4.7, totalTransactions: 178, totalRevenue: 4120000, productCategories: ['Machinery', 'Components'], createdAt: '2023-02-28', lastActive: new Date(Date.now() - 3600000).toISOString() },
        { id: 's5', companyName: 'ChemSupply Corp', email: 'orders@chemsupply.com', phone: '+1-555-0105', country: 'USA', city: 'Houston', verified: false, rating: 4.2, totalTransactions: 45, totalRevenue: 890000, productCategories: ['Chemicals', 'Raw Materials'], createdAt: '2023-10-05', lastActive: new Date(Date.now() - 259200000).toISOString() },
        { id: 's6', companyName: 'Asian Trade Partners', email: 'contact@asiantrade.com', phone: '+65-555-0106', country: 'Singapore', city: 'Singapore', verified: true, rating: 4.6, totalTransactions: 112, totalRevenue: 2180000, productCategories: ['Electronics', 'Machinery'], createdAt: '2023-05-12', lastActive: new Date(Date.now() - 7200000).toISOString() },
        { id: 's7', companyName: 'EuroMetals SA', email: 'info@eurometals.eu', phone: '+33-555-0107', country: 'France', city: 'Paris', verified: true, rating: 4.4, totalTransactions: 67, totalRevenue: 1560000, productCategories: ['Metals', 'Raw Materials'], createdAt: '2023-07-22', lastActive: new Date(Date.now() - 432000000).toISOString() },
        { id: 's8', companyName: 'Pacific Imports Ltd', email: 'sales@pacificimports.com', phone: '+61-555-0108', country: 'Australia', city: 'Sydney', verified: false, rating: 4.0, totalTransactions: 23, totalRevenue: 450000, productCategories: ['Machinery', 'Equipment'], createdAt: '2023-11-01', lastActive: new Date(Date.now() - 604800000).toISOString() },
      ]);
      setStats({
        total: 156,
        verified: 134,
        pending: 22,
        totalRevenue: 16790000,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.companyName.toLowerCase().includes(search.toLowerCase()) ||
    supplier.email.toLowerCase().includes(search.toLowerCase()) ||
    supplier.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplier Management</h1>
          <p className="text-slate-400">Manage and monitor all platform suppliers</p>
        </div>
        <Button onClick={fetchSuppliers} variant="outline" className="border-slate-600 text-slate-300">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Suppliers</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
              <Building2 className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Verified</p>
                <p className="text-xl font-bold text-green-400">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Pending Verification</p>
                <p className="text-xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Total Revenue</p>
                <p className="text-xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="bg-slate-800 border-slate-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              placeholder="Search by company name, email, or country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-slate-700 border-slate-600 text-white"
            />
          </div>
        </CardContent>
      </Card>

      {/* Suppliers Table */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Suppliers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Company</TableHead>
                    <TableHead className="text-slate-400">Location</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Rating</TableHead>
                    <TableHead className="text-slate-400">Transactions</TableHead>
                    <TableHead className="text-slate-400">Revenue</TableHead>
                    <TableHead className="text-slate-400">Categories</TableHead>
                    <TableHead className="text-slate-400">Last Active</TableHead>
                    <TableHead className="text-slate-400 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.map((supplier) => (
                    <TableRow key={supplier.id} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell>
                        <div>
                          <p className="font-medium text-white">{supplier.companyName}</p>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {supplier.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-300">
                          <MapPin className="h-3 w-3" />
                          {supplier.city}, {supplier.country}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={supplier.verified ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                          {supplier.verified ? (
                            <><CheckCircle className="h-3 w-3 mr-1" /> Verified</>
                          ) : (
                            <><Clock className="h-3 w-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-4 w-4 fill-yellow-400" />
                          {supplier.rating.toFixed(1)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-slate-300">
                          <Package className="h-3 w-3" />
                          {supplier.totalTransactions}
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-medium">
                        {formatCurrency(supplier.totalRevenue)}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {supplier.productCategories.slice(0, 2).map((cat) => (
                            <Badge key={cat} variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {cat}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-400">
                        {formatDate(supplier.lastActive)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-slate-400">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                            <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {!supplier.verified && (
                              <DropdownMenuItem className="text-green-400 hover:bg-slate-700">
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify Supplier
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-slate-300 hover:bg-slate-700">
                              <Mail className="mr-2 h-4 w-4" />
                              Contact
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-700">
            <p className="text-sm text-slate-400">
              Showing {filteredSuppliers.length} suppliers
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
