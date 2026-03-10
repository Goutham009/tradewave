'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Loader2,
  Eye,
} from 'lucide-react';
import Link from 'next/link';

interface Client {
  id: string;
  accountNumber?: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string | null;
  type: 'buyer' | 'supplier';
  status: 'active' | 'inactive';
  totalOrders: number;
  joinedDate: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (typeFilter !== 'all') {
        params.set('type', typeFilter);
      }

      const response = await fetch(`/api/am/clients?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch clients');
      }

      setClients(data.clients || []);
    } catch (fetchError) {
      console.error('Error fetching clients:', fetchError);
      setClients([]);
      setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    void fetchClients();
  }, [fetchClients]);

  const filteredClients = useMemo(
    () =>
      clients.filter((client) => {
        const matchesSearch =
          client.companyName.toLowerCase().includes(search.toLowerCase()) ||
          client.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
          client.email.toLowerCase().includes(search.toLowerCase());
        const matchesType = typeFilter === 'all' || client.type === typeFilter;
        return matchesSearch && matchesType;
      }),
    [clients, search, typeFilter]
  );

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
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-10 text-center text-slate-400">
            No clients found.
          </CardContent>
        </Card>
      ) : (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">{client.companyName}</h3>
                        <Badge variant="outline" className="text-xs capitalize">{client.type}</Badge>
                        <Badge className={client.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'}>
                          {client.status}
                        </Badge>
                      </div>
                    </div>

                    <p className="text-sm text-slate-400 mt-1">{client.contactPerson}</p>
                    {client.accountNumber && (
                      <p className="text-xs text-slate-500 mt-1 font-mono">{client.accountNumber}</p>
                    )}

                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-800">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-white">{client.totalOrders} orders</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        Joined {new Date(client.joinedDate).toLocaleDateString()}
                      </span>
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
      )}

      {error && (
        <Card className="bg-slate-900 border-red-500/30">
          <CardContent className="py-3 text-sm text-red-300">{error}</CardContent>
        </Card>
      )}
    </div>
  );
}
