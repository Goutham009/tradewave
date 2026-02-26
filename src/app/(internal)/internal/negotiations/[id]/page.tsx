'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare, DollarSign, Clock, Send, CheckCircle, XCircle, Building2, User, ArrowRight, History } from 'lucide-react';
import Link from 'next/link';

const MOCK_NEGOTIATIONS = [
  {
    id: 'NEG-001',
    status: 'active',
    requirement: { id: 'REQ-001', title: 'Steel Components for Manufacturing', quantity: 5000, unit: 'units', category: 'Raw Materials' },
    buyer: { name: 'Acme Corporation', contact: 'John Smith', email: 'john@acme.com' },
    supplier: { name: 'Steel Industries Ltd', contact: 'Mike Chen', email: 'mike@steel.com', rating: 4.8 },
    originalQuote: { amount: 25000, unitPrice: 5.0, deliveryDays: 14 },
    currentOffer: { amount: 23500, unitPrice: 4.7, deliveryDays: 14, offeredBy: 'buyer' },
    history: [
      { id: 1, type: 'quote', from: 'supplier', amount: 25000, unitPrice: 5.0, deliveryDays: 14, message: 'Initial quote based on current market rates.', date: '2024-01-15 10:00 AM' },
      { id: 2, type: 'counter', from: 'buyer', amount: 22000, unitPrice: 4.4, deliveryDays: 14, message: 'We are looking for a better rate given our volume.', date: '2024-01-16 02:30 PM' },
      { id: 3, type: 'counter', from: 'supplier', amount: 24000, unitPrice: 4.8, deliveryDays: 12, message: 'Best we can do is $24K with faster delivery.', date: '2024-01-17 11:00 AM' },
      { id: 4, type: 'counter', from: 'buyer', amount: 23500, unitPrice: 4.7, deliveryDays: 14, message: 'Can we meet at $23.5K? We prefer the original delivery timeline.', date: '2024-01-18 09:15 AM' },
    ],
    startedAt: '2024-01-15',
    lastActivity: '2024-01-18',
  },
  {
    id: 'NEG-002',
    status: 'pending_response',
    requirement: { id: 'REQ-002', title: 'Cotton Fabric', quantity: 10000, unit: 'meters', category: 'Textiles' },
    buyer: { name: 'Fashion Hub Ltd', contact: 'Emily Davis', email: 'emily@fashionhub.com' },
    supplier: { name: 'Textile Masters', contact: 'Ravi Patel', email: 'ravi@textilemasters.com', rating: 4.6 },
    originalQuote: { amount: 45000, unitPrice: 4.5, deliveryDays: 12 },
    currentOffer: { amount: 42000, unitPrice: 4.2, deliveryDays: 12, offeredBy: 'buyer' },
    history: [
      { id: 1, type: 'quote', from: 'supplier', amount: 45000, unitPrice: 4.5, deliveryDays: 12, message: 'Initial fabric quote for premium grade.', date: '2024-01-14 09:00 AM' },
      { id: 2, type: 'counter', from: 'buyer', amount: 42000, unitPrice: 4.2, deliveryDays: 12, message: 'Requesting a volume discount for Q1 supply.', date: '2024-01-16 04:30 PM' },
    ],
    startedAt: '2024-01-14',
    lastActivity: '2024-01-16',
  },
  {
    id: 'NEG-003',
    status: 'agreed',
    requirement: { id: 'REQ-003', title: 'Industrial Chemicals', quantity: 500, unit: 'drums', category: 'Chemicals' },
    buyer: { name: 'Tech Solutions Inc', contact: 'Sarah Johnson', email: 'sarah@techsolutions.com' },
    supplier: { name: 'ChemPro Industries', contact: 'Victor Lee', email: 'victor@chempro.com', rating: 4.7 },
    originalQuote: { amount: 15000, unitPrice: 30.0, deliveryDays: 10 },
    currentOffer: { amount: 14200, unitPrice: 28.4, deliveryDays: 10, offeredBy: 'supplier' },
    history: [
      { id: 1, type: 'quote', from: 'supplier', amount: 15000, unitPrice: 30.0, deliveryDays: 10, message: 'Initial quotation based on current raw material prices.', date: '2024-01-12 10:30 AM' },
      { id: 2, type: 'counter', from: 'buyer', amount: 13800, unitPrice: 27.6, deliveryDays: 12, message: 'Can you match our previous contract pricing?', date: '2024-01-13 02:10 PM' },
      { id: 3, type: 'counter', from: 'supplier', amount: 14200, unitPrice: 28.4, deliveryDays: 10, message: 'Final offer with expedited delivery.', date: '2024-01-14 01:20 PM' },
    ],
    startedAt: '2024-01-12',
    lastActivity: '2024-01-14',
  },
  {
    id: 'NEG-004',
    status: 'declined',
    requirement: { id: 'REQ-004', title: 'Electronic Components', quantity: 50000, unit: 'units', category: 'Electronics' },
    buyer: { name: 'ElectroMart', contact: 'Priya Singh', email: 'priya@electromart.com' },
    supplier: { name: 'ElectroComponents', contact: 'Leo Grant', email: 'leo@electrocomponents.com', rating: 4.3 },
    originalQuote: { amount: 75000, unitPrice: 1.5, deliveryDays: 18 },
    currentOffer: { amount: 70000, unitPrice: 1.4, deliveryDays: 18, offeredBy: 'buyer' },
    history: [
      { id: 1, type: 'quote', from: 'supplier', amount: 75000, unitPrice: 1.5, deliveryDays: 18, message: 'Initial quotation for capacitor batch.', date: '2024-01-10 09:00 AM' },
      { id: 2, type: 'counter', from: 'buyer', amount: 70000, unitPrice: 1.4, deliveryDays: 18, message: 'Negotiated target pricing for repeat order.', date: '2024-01-11 01:30 PM' },
    ],
    startedAt: '2024-01-10',
    lastActivity: '2024-01-11',
  },
];

export default function NegotiationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [newOffer, setNewOffer] = useState({ amount: '', message: '' });
  const [sending, setSending] = useState(false);

  const data = MOCK_NEGOTIATIONS.find((item) => item.id === params.id) ?? MOCK_NEGOTIATIONS[0];
  const savings = data.originalQuote.amount - data.currentOffer.amount;
  const savingsPercent = ((savings / data.originalQuote.amount) * 100).toFixed(1);

  const handleSendCounter = async () => {
    if (!newOffer.amount) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSending(false);
    setNewOffer({ amount: '', message: '' });
  };

  const handleAccept = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push('/internal/negotiations');
  };

  const handleReject = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push('/internal/negotiations');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internal/negotiations">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{data.requirement.title}</h1>
              <Badge className="bg-blue-500/20 text-blue-400">Active Negotiation</Badge>
            </div>
            <p className="text-slate-400">Started {data.startedAt} • Last activity {data.lastActivity}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReject} disabled={sending} variant="outline" className="border-red-600 text-red-400 hover:bg-red-500/10">
            <XCircle className="h-4 w-4 mr-2" />Decline
          </Button>
          <Button onClick={handleAccept} disabled={sending} className="bg-green-600 hover:bg-green-700 text-white">
            <CheckCircle className="h-4 w-4 mr-2" />Accept Current Offer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Current Status */}
          <Card className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border-blue-500/30">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-300">Current Offer</p>
                  <p className="text-3xl font-bold text-white">${data.currentOffer.amount.toLocaleString()}</p>
                  <p className="text-sm text-slate-400">${data.currentOffer.unitPrice}/unit • {data.currentOffer.deliveryDays} days delivery</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">Savings from Original</p>
                  <p className="text-2xl font-bold text-green-400">${savings.toLocaleString()}</p>
                  <p className="text-sm text-green-400">{savingsPercent}% reduction</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Negotiation Timeline */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><History className="h-5 w-5 text-blue-400" />Negotiation History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.history.map((item, idx) => (
                  <div key={item.id} className={`flex gap-4 ${item.from === 'buyer' ? 'flex-row-reverse' : ''}`}>
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${item.from === 'buyer' ? 'bg-blue-500/20' : 'bg-green-500/20'}`}>
                      {item.from === 'buyer' ? <User className="h-5 w-5 text-blue-400" /> : <Building2 className="h-5 w-5 text-green-400" />}
                    </div>
                    <div className={`flex-1 max-w-md ${item.from === 'buyer' ? 'text-right' : ''}`}>
                      <div className={`p-4 rounded-lg ${item.from === 'buyer' ? 'bg-blue-500/10 border border-blue-500/30' : 'bg-slate-800 border border-slate-700'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="text-xs text-slate-300 border-slate-600">{item.from === 'buyer' ? data.buyer.name : data.supplier.name}</Badge>
                          <span className="text-xs text-slate-500">{item.date}</span>
                        </div>
                        <p className="text-xl font-bold text-white">${item.amount.toLocaleString()}</p>
                        <p className="text-sm text-slate-400">${item.unitPrice}/unit • {item.deliveryDays} days</p>
                        <p className="text-sm text-slate-300 mt-2">{item.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Send Counter Offer */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><MessageSquare className="h-5 w-5 text-purple-400" />Send Counter Offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Counter Amount ($)</label>
                  <Input type="number" placeholder="Enter amount" value={newOffer.amount} onChange={(e) => setNewOffer((p) => ({ ...p, amount: e.target.value }))} className="mt-1 bg-slate-800 border-slate-700 text-white" />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Unit Price</label>
                  <Input value={newOffer.amount ? `$${(Number(newOffer.amount) / data.requirement.quantity).toFixed(2)}` : '-'} disabled className="mt-1 bg-slate-800 border-slate-700 text-slate-400" />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400">Message</label>
                <Textarea placeholder="Add a message with your offer..." value={newOffer.message} onChange={(e) => setNewOffer((p) => ({ ...p, message: e.target.value }))} className="mt-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
              </div>
              <Button onClick={handleSendCounter} disabled={!newOffer.amount || sending} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                <Send className="h-4 w-4 mr-2" />{sending ? 'Sending...' : 'Send Counter Offer'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-sm">Buyer Details</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium text-white">{data.buyer.name}</p>
              <p className="text-sm text-slate-400">{data.buyer.contact}</p>
              <p className="text-sm text-slate-400">{data.buyer.email}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-sm">Supplier Details</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium text-white">{data.supplier.name}</p>
              <p className="text-sm text-slate-400">{data.supplier.contact}</p>
              <p className="text-sm text-slate-400">{data.supplier.email}</p>
              <p className="text-sm text-yellow-400 mt-1">⭐ {data.supplier.rating} rating</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader><CardTitle className="text-white text-sm">Requirement</CardTitle></CardHeader>
            <CardContent>
              <p className="font-medium text-white">{data.requirement.title}</p>
              <p className="text-sm text-slate-400">{data.requirement.quantity} {data.requirement.unit}</p>
              <p className="text-sm text-slate-400">{data.requirement.category}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
