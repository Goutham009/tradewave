'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Building2,
  Mail,
  Phone,
  Package,
  DollarSign,
  Star,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: 'buyer' | 'supplier';
  status: 'active' | 'inactive';
  totalOrders: number;
  totalValue: number;
  rating: number;
  joinedDate: string;
}

const MOCK_CLIENTS: Client[] = [
  { id: 'CLI-001', companyName: 'Acme Corporation', contactPerson: 'John Smith', email: 'john@acme.com', phone: '+1 234 567 8900', type: 'buyer', status: 'active', totalOrders: 45, totalValue: 125000, rating: 4.8, joinedDate: '2023-06-15' },
  { id: 'CLI-002', companyName: 'Tech Solutions Inc', contactPerson: 'Sarah Johnson', email: 'sarah@techsolutions.com', phone: '+1 345 678 9012', type: 'buyer', status: 'active', totalOrders: 32, totalValue: 89000, rating: 4.6, joinedDate: '2023-08-22' },
  { id: 'CLI-003', companyName: 'Steel Industries Ltd', contactPerson: 'Mike Chen', email: 'mike@steelindustries.com', phone: '+1 456 789 0123', type: 'supplier', status: 'active', totalOrders: 156, totalValue: 450000, rating: 4.9, joinedDate: '2023-03-10' },
  { id: 'CLI-004', companyName: 'Fashion Hub Ltd', contactPerson: 'Emily Davis', email: 'emily@fashionhub.com', phone: '+1 567 890 1234', type: 'buyer', status: 'active', totalOrders: 28, totalValue: 67000, rating: 4.5, joinedDate: '2023-09-05' },
  { id: 'CLI-005', companyName: 'Global Traders LLC', contactPerson: 'Robert Wilson', email: 'robert@globaltraders.com', phone: '+1 678 901 2345', type: 'supplier', status: 'inactive', totalOrders: 12, totalValue: 34000, rating: 4.2, joinedDate: '2023-11-18' },
];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredClients = MOCK_CLIENTS.filter((client) => {
    const matchesSearch = client.companyName.toLowerCase().includes(search.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'all' || client.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Clients</h1>
        <p className="text-slate-400">Manage your assigned buyers and suppliers</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-slate-900 border-slate-700"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={typeFilter === 'all' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('all')}
            className="border-slate-700"
          >
            All
          </Button>
          <Button
            variant={typeFilter === 'buyer' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('buyer')}
            className="border-slate-700"
          >
            Buyers
          </Button>
          <Button
            variant={typeFilter === 'supplier' ? 'default' : 'outline'}
            onClick={() => setTypeFilter('supplier')}
            className="border-slate-700"
          >
            Suppliers
          </Button>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  client.type === 'buyer' ? 'bg-blue-500/20' : 'bg-green-500/20'
                }`}>
                  <Building2 className={`h-6 w-6 ${client.type === 'buyer' ? 'text-blue-500' : 'text-green-500'}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{client.companyName}</h3>
                      <Badge variant="outline" className="text-xs capitalize">{client.type}</Badge>
                      <Badge className={client.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                        {client.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{client.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">{client.contactPerson}</p>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {client.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {client.phone}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-white">{client.totalOrders} orders</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-white">${client.totalValue.toLocaleString()}</span>
                    </div>
                    <Link href={`/internal/clients/${client.id}`}>
                      <Button variant="ghost" size="sm" className="ml-auto">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
