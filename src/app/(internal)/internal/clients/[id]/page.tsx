'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Package,
  Star,
  TrendingUp,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Edit,
  User,
} from 'lucide-react';
import Link from 'next/link';

const MOCK_CLIENTS = [
  {
    id: 'CLI-001',
    companyName: 'Acme Corporation',
    type: 'buyer' as const,
    status: 'active' as const,
    rating: 4.8,
    joinedDate: '2023-06-15',
    lastActivity: '2024-01-20',
    contact: {
      name: 'John Smith',
      designation: 'Procurement Manager',
      email: 'john@acme.com',
      phone: '+1 234 567 8900',
    },
    address: {
      street: '456 Business Park',
      city: 'New York',
      state: 'New York',
      country: 'United States',
      postalCode: '10001',
    },
    stats: {
      totalOrders: 45,
      totalValue: 125000,
      pendingOrders: 3,
      completedOrders: 42,
      avgOrderValue: 2778,
      onTimeDeliveryRate: 96,
    },
    transactions: [
      { id: 'TXN-001', date: '2024-01-18', type: 'Order', description: 'Steel Components - 5000 units', amount: 24500, status: 'completed' },
      { id: 'TXN-002', date: '2024-01-15', type: 'Payment', description: 'Invoice #INV-2024-045', amount: 18000, status: 'completed' },
      { id: 'TXN-003', date: '2024-01-10', type: 'Order', description: 'Copper Wire - 2000 meters', amount: 15200, status: 'in_progress' },
      { id: 'TXN-004', date: '2024-01-05', type: 'Refund', description: 'Partial refund for damaged goods', amount: -1500, status: 'completed' },
      { id: 'TXN-005', date: '2023-12-28', type: 'Order', description: 'Aluminum Sheets - 500 units', amount: 32000, status: 'completed' },
      { id: 'TXN-006', date: '2023-12-20', type: 'Payment', description: 'Invoice #INV-2023-189', amount: 28500, status: 'completed' },
    ],
    requirements: [
      { id: 'REQ-001', title: 'Steel Components', status: 'active', quotations: 5, budget: 25000, deadline: '2024-02-15' },
      { id: 'REQ-002', title: 'Copper Wire Supply', status: 'fulfilled', quotations: 3, budget: 15000, deadline: '2024-01-20' },
      { id: 'REQ-003', title: 'Aluminum Raw Materials', status: 'pending', quotations: 0, budget: 35000, deadline: '2024-03-01' },
    ],
    notes: [
      { id: 'NOTE-001', date: '2024-01-15', author: 'Sarah Johnson', content: 'Client prefers communication via email. Quick response times appreciated.' },
      { id: 'NOTE-002', date: '2024-01-10', author: 'Michael Chen', content: 'Discussed potential bulk order discount for Q2. Will follow up next week.' },
      { id: 'NOTE-003', date: '2023-12-20', author: 'Sarah Johnson', content: 'Client is interested in expanding to textile materials. Scheduled demo for January.' },
    ],
    communications: [
      { id: 'COMM-001', date: '2024-01-19', type: 'Email', subject: 'Order Status Update', status: 'sent' },
      { id: 'COMM-002', date: '2024-01-17', type: 'Call', subject: 'Quotation Discussion', status: 'completed', duration: '15 min' },
      { id: 'COMM-003', date: '2024-01-12', type: 'Meeting', subject: 'Q1 Planning Review', status: 'completed', duration: '45 min' },
    ],
  },
  {
    id: 'CLI-002',
    companyName: 'Tech Solutions Inc',
    type: 'buyer' as const,
    status: 'active' as const,
    rating: 4.6,
    joinedDate: '2023-08-22',
    lastActivity: '2024-01-18',
    contact: {
      name: 'Sarah Johnson',
      designation: 'Operations Lead',
      email: 'sarah@techsolutions.com',
      phone: '+1 345 678 9012',
    },
    address: {
      street: '890 Innovation Drive',
      city: 'Austin',
      state: 'Texas',
      country: 'United States',
      postalCode: '73301',
    },
    stats: {
      totalOrders: 32,
      totalValue: 89000,
      pendingOrders: 5,
      completedOrders: 27,
      avgOrderValue: 2780,
      onTimeDeliveryRate: 93,
    },
    transactions: [
      { id: 'TXN-011', date: '2024-01-14', type: 'Order', description: 'Industrial Chemicals - 500 units', amount: 15000, status: 'in_progress' },
      { id: 'TXN-012', date: '2024-01-11', type: 'Payment', description: 'Invoice #INV-2024-078', amount: 12500, status: 'completed' },
      { id: 'TXN-013', date: '2024-01-07', type: 'Order', description: 'Safety Equipment - 200 units', amount: 9600, status: 'completed' },
      { id: 'TXN-014', date: '2023-12-30', type: 'Order', description: 'Copper Wire - 1500 meters', amount: 11800, status: 'completed' },
    ],
    requirements: [
      { id: 'REQ-010', title: 'Industrial Chemicals', status: 'active', quotations: 4, budget: 18000, deadline: '2024-02-10' },
      { id: 'REQ-011', title: 'Safety Equipment', status: 'fulfilled', quotations: 2, budget: 10000, deadline: '2024-01-12' },
    ],
    notes: [
      { id: 'NOTE-010', date: '2024-01-12', author: 'Emily Davis', content: 'Client is planning a larger Q2 procurement cycle.' },
      { id: 'NOTE-011', date: '2024-01-05', author: 'Sarah Johnson', content: 'Requested faster delivery options for chemicals.' },
    ],
    communications: [
      { id: 'COMM-011', date: '2024-01-18', type: 'Email', subject: 'Order timeline update', status: 'sent' },
      { id: 'COMM-012', date: '2024-01-13', type: 'Call', subject: 'Discuss expedited delivery', status: 'completed', duration: '20 min' },
    ],
  },
  {
    id: 'CLI-003',
    companyName: 'Steel Industries Ltd',
    type: 'supplier' as const,
    status: 'active' as const,
    rating: 4.9,
    joinedDate: '2023-03-10',
    lastActivity: '2024-01-21',
    contact: {
      name: 'Mike Chen',
      designation: 'Sales Director',
      email: 'mike@steelindustries.com',
      phone: '+1 456 789 0123',
    },
    address: {
      street: '25 Industrial Estate',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '411001',
    },
    stats: {
      totalOrders: 156,
      totalValue: 450000,
      pendingOrders: 7,
      completedOrders: 149,
      avgOrderValue: 2885,
      onTimeDeliveryRate: 98,
    },
    transactions: [
      { id: 'TXN-021', date: '2024-01-19', type: 'Order', description: 'Steel Components - 6500 units', amount: 31200, status: 'in_progress' },
      { id: 'TXN-022', date: '2024-01-16', type: 'Payment', description: 'Invoice #INV-2024-099', amount: 26000, status: 'completed' },
      { id: 'TXN-023', date: '2024-01-08', type: 'Order', description: 'Alloy Sheet - 1200 units', amount: 18400, status: 'completed' },
    ],
    requirements: [
      { id: 'REQ-020', title: 'Bulk Steel Supply', status: 'active', quotations: 6, budget: 38000, deadline: '2024-02-22' },
      { id: 'REQ-021', title: 'Alloy Sheet', status: 'fulfilled', quotations: 3, budget: 20000, deadline: '2024-01-18' },
    ],
    notes: [
      { id: 'NOTE-020', date: '2024-01-18', author: 'Michael Chen', content: 'Supplier can commit to shorter lead times for bulk orders.' },
      { id: 'NOTE-021', date: '2023-12-28', author: 'Sarah Johnson', content: 'Quality scores remain strong for Q4 shipments.' },
    ],
    communications: [
      { id: 'COMM-021', date: '2024-01-20', type: 'Call', subject: 'Bulk order capacity', status: 'completed', duration: '30 min' },
      { id: 'COMM-022', date: '2024-01-09', type: 'Email', subject: 'Delivery schedule confirmation', status: 'sent' },
    ],
  },
];

export default function ClientDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  const client = MOCK_CLIENTS.find((item) => item.id === params.id) ?? MOCK_CLIENTS[0];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400">{status}</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      case 'fulfilled':
        return <Badge className="bg-purple-500/20 text-purple-400">Fulfilled</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internal/clients">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{client.companyName}</h1>
              <Badge className={client.type === 'buyer' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}>
                {client.type}
              </Badge>
              <Badge className="bg-green-500/20 text-green-400">{client.status}</Badge>
              <div className="flex items-center gap-1 text-yellow-400">
                <Star className="h-4 w-4 fill-current" />
                <span className="font-medium">{client.rating}</span>
              </div>
            </div>
            <p className="text-slate-400 mt-1">Client since {client.joinedDate} • Last activity {client.lastActivity}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
            <Phone className="h-4 w-4 mr-2" />
            Call
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Edit Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-400">Total Orders</p>
            <p className="text-2xl font-bold text-white">{client.stats.totalOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-400">Total Value</p>
            <p className="text-2xl font-bold text-green-400">${client.stats.totalValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-400">Pending Orders</p>
            <p className="text-2xl font-bold text-yellow-400">{client.stats.pendingOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-white">{client.stats.completedOrders}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-400">Avg Order Value</p>
            <p className="text-2xl font-bold text-white">${client.stats.avgOrderValue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-4">
            <p className="text-sm text-slate-400">On-Time Delivery</p>
            <p className="text-2xl font-bold text-blue-400">{client.stats.onTimeDeliveryRate}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Transactions</TabsTrigger>
          <TabsTrigger value="requirements" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Requirements</TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Notes & Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Contact Info */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-400" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl font-bold text-white">
                    {client.contact.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{client.contact.name}</p>
                    <p className="text-slate-400">{client.contact.designation}</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-white">{client.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-white">{client.contact.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Address */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-red-400" />
                  Business Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-white">{client.address.street}</p>
                  <p className="text-white">{client.address.city}, {client.address.state} {client.address.postalCode}</p>
                  <p className="text-white">{client.address.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card className="bg-slate-900 border-slate-800 lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Recent Transactions</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('transactions')} className="text-blue-400 hover:text-blue-300">
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.transactions.slice(0, 3).map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          txn.type === 'Order' ? 'bg-blue-500/20' : txn.type === 'Payment' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                          {txn.type === 'Order' ? <Package className="h-5 w-5 text-blue-400" /> :
                           txn.type === 'Payment' ? <DollarSign className="h-5 w-5 text-green-400" /> :
                           <AlertCircle className="h-5 w-5 text-red-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{txn.description}</p>
                          <p className="text-sm text-slate-400">{txn.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${txn.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount).toLocaleString()}
                        </p>
                        {getStatusBadge(txn.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">All Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.transactions.map((txn) => (
                  <div key={txn.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        txn.type === 'Order' ? 'bg-blue-500/20' : txn.type === 'Payment' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {txn.type === 'Order' ? <Package className="h-6 w-6 text-blue-400" /> :
                         txn.type === 'Payment' ? <DollarSign className="h-6 w-6 text-green-400" /> :
                         <AlertCircle className="h-6 w-6 text-red-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{txn.description}</p>
                        <p className="text-sm text-slate-400">{txn.id} • {txn.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(txn.status)}
                      <p className={`text-lg font-bold ${txn.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {txn.amount < 0 ? '-' : '+'}${Math.abs(txn.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Client Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {client.requirements.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{req.title}</p>
                        <p className="text-sm text-slate-400">{req.id} • Budget: ${req.budget.toLocaleString()} • Deadline: {req.deadline}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="text-slate-300 border-slate-600">{req.quotations} Quotations</Badge>
                      {getStatusBadge(req.status)}
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Notes */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-400" />
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Textarea
                    placeholder="Add a new note..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <Button className="mt-2 bg-blue-600 hover:bg-blue-700 text-white" disabled={!newNote}>
                    Add Note
                  </Button>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  {client.notes.map((note) => (
                    <div key={note.id} className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-white">{note.author}</p>
                        <p className="text-xs text-slate-400">{note.date}</p>
                      </div>
                      <p className="text-slate-300">{note.content}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Communications */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-400" />
                  Communication History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {client.communications.map((comm) => (
                    <div key={comm.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          comm.type === 'Email' ? 'bg-blue-500/20' : comm.type === 'Call' ? 'bg-green-500/20' : 'bg-purple-500/20'
                        }`}>
                          {comm.type === 'Email' ? <Mail className="h-5 w-5 text-blue-400" /> :
                           comm.type === 'Call' ? <Phone className="h-5 w-5 text-green-400" /> :
                           <Calendar className="h-5 w-5 text-purple-400" />}
                        </div>
                        <div>
                          <p className="font-medium text-white">{comm.subject}</p>
                          <p className="text-sm text-slate-400">{comm.type} • {comm.date} {comm.duration && `• ${comm.duration}`}</p>
                        </div>
                      </div>
                      {getStatusBadge(comm.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
