'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Building2, Star, Clock, DollarSign, Package, CheckCircle, Send, TrendingDown, Award, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const MOCK_REQUIREMENT = {
  id: 'REQ-001',
  title: 'Steel Components for Manufacturing',
  buyer: { name: 'Acme Corporation', contact: 'John Smith' },
  category: 'Raw Materials',
  quantity: 5000,
  unit: 'units',
  budget: 25000,
  deadline: '2024-02-15',
  specifications: 'Grade A steel, 2mm thickness, custom dimensions as per attached drawings',
};

const MOCK_QUOTATIONS = [
  { id: 'QUO-001', supplier: 'Steel Industries Ltd', rating: 4.8, orders: 156, amount: 24000, unitPrice: 4.8, deliveryDays: 14, warranty: '12 months', paymentTerms: 'Net 30', location: 'Mumbai', matchScore: 95, strengths: ['Best price', 'Top rated'], weaknesses: ['Longer delivery'] },
  { id: 'QUO-002', supplier: 'Premium Metals Co', rating: 4.6, orders: 112, amount: 26500, unitPrice: 5.3, deliveryDays: 10, warranty: '18 months', paymentTerms: 'Net 15', location: 'Pune', matchScore: 88, strengths: ['Fastest delivery', 'Extended warranty'], weaknesses: ['Higher price'] },
  { id: 'QUO-003', supplier: 'MetalWorks India', rating: 4.5, orders: 67, amount: 23000, unitPrice: 4.6, deliveryDays: 21, warranty: '12 months', paymentTerms: 'Net 45', location: 'Delhi', matchScore: 82, strengths: ['Lowest price', 'Flexible terms'], weaknesses: ['Slowest delivery', 'Lower rating'] },
  { id: 'QUO-004', supplier: 'Global Steel', rating: 4.3, orders: 45, amount: 25500, unitPrice: 5.1, deliveryDays: 12, warranty: '6 months', paymentTerms: 'Net 30', location: 'Chennai', matchScore: 75, strengths: ['Good delivery time'], weaknesses: ['Short warranty', 'Lower rating'] },
];

export default function QuotationComparisonPage() {
  const params = useParams();
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [sending, setSending] = useState(false);

  const req = MOCK_REQUIREMENT;
  const quotes = MOCK_QUOTATIONS;

  const lowestPrice = Math.min(...quotes.map((q) => q.amount));
  const fastestDelivery = Math.min(...quotes.map((q) => q.deliveryDays));
  const highestRating = Math.max(...quotes.map((q) => q.rating));

  const toggleSelect = (id: string) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  const handleSendToAdmin = async () => {
    if (selected.length === 0) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1500));
    router.push('/internal/quotations');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internal/quotations">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white"><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">{req.title}</h1>
            <p className="text-slate-400">{req.buyer.name} • {req.quantity} {req.unit} • Budget: ${req.budget.toLocaleString()}</p>
          </div>
        </div>
        {selected.length > 0 && (
          <Button onClick={handleSendToAdmin} disabled={sending} className="bg-green-600 hover:bg-green-700 text-white">
            <Send className="h-4 w-4 mr-2" />{sending ? 'Sending...' : `Send ${selected.length} to Admin`}
          </Button>
        )}
      </div>

      {/* Comparison Matrix */}
      <Card className="bg-slate-900 border-slate-800 overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white">Quotation Comparison Matrix</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-800/50">
                  <th className="p-4 text-left text-slate-400 font-medium w-12">Select</th>
                  <th className="p-4 text-left text-slate-400 font-medium">Supplier</th>
                  <th className="p-4 text-right text-slate-400 font-medium">Price</th>
                  <th className="p-4 text-right text-slate-400 font-medium">Unit Price</th>
                  <th className="p-4 text-right text-slate-400 font-medium">Delivery</th>
                  <th className="p-4 text-center text-slate-400 font-medium">Rating</th>
                  <th className="p-4 text-left text-slate-400 font-medium">Warranty</th>
                  <th className="p-4 text-left text-slate-400 font-medium">Terms</th>
                  <th className="p-4 text-center text-slate-400 font-medium">Match</th>
                </tr>
              </thead>
              <tbody>
                {quotes.map((q) => (
                  <tr key={q.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 ${selected.includes(q.id) ? 'bg-green-500/10' : ''}`}>
                    <td className="p-4">
                      <Checkbox checked={selected.includes(q.id)} onCheckedChange={() => toggleSelect(q.id)} />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{q.supplier}</p>
                          <p className="text-xs text-slate-400">{q.location} • {q.orders} orders</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {q.amount === lowestPrice && <Badge className="bg-green-500/20 text-green-400 text-xs">Lowest</Badge>}
                        <span className={`font-bold ${q.amount === lowestPrice ? 'text-green-400' : 'text-white'}`}>${q.amount.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right text-slate-300">${q.unitPrice}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {q.deliveryDays === fastestDelivery && <Badge className="bg-blue-500/20 text-blue-400 text-xs">Fastest</Badge>}
                        <span className={q.deliveryDays === fastestDelivery ? 'text-blue-400' : 'text-slate-300'}>{q.deliveryDays} days</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {q.rating === highestRating && <Award className="h-4 w-4 text-yellow-400" />}
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className={q.rating === highestRating ? 'text-yellow-400 font-bold' : 'text-slate-300'}>{q.rating}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-300">{q.warranty}</td>
                    <td className="p-4 text-slate-300">{q.paymentTerms}</td>
                    <td className="p-4 text-center">
                      <Badge className={q.matchScore >= 90 ? 'bg-green-500/20 text-green-400' : q.matchScore >= 80 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-500/20 text-slate-400'}>
                        {q.matchScore}%
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quotes.map((q) => (
          <Card key={q.id} className={`bg-slate-900 border-slate-800 ${selected.includes(q.id) ? 'ring-2 ring-green-500' : ''}`}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Checkbox checked={selected.includes(q.id)} onCheckedChange={() => toggleSelect(q.id)} />
                  <div>
                    <h3 className="font-semibold text-white">{q.supplier}</h3>
                    <p className="text-sm text-slate-400">{q.location}</p>
                  </div>
                </div>
                <Badge className={q.matchScore >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}>
                  {q.matchScore}% match
                </Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-slate-800">
                  <DollarSign className="h-5 w-5 text-green-400 mx-auto" />
                  <p className="text-lg font-bold text-white">${q.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">Total Price</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-800">
                  <Clock className="h-5 w-5 text-blue-400 mx-auto" />
                  <p className="text-lg font-bold text-white">{q.deliveryDays}</p>
                  <p className="text-xs text-slate-400">Days</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-slate-800">
                  <Star className="h-5 w-5 text-yellow-400 mx-auto" />
                  <p className="text-lg font-bold text-white">{q.rating}</p>
                  <p className="text-xs text-slate-400">Rating</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap gap-1">
                  {q.strengths.map((s) => (
                    <Badge key={s} className="bg-green-500/10 text-green-400 text-xs"><CheckCircle className="h-3 w-3 mr-1" />{s}</Badge>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {q.weaknesses.map((w) => (
                    <Badge key={w} className="bg-red-500/10 text-red-400 text-xs"><AlertTriangle className="h-3 w-3 mr-1" />{w}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendation & Notes */}
      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-white">Procurement Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea placeholder="Add your analysis and recommendations for the admin..." value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-24" />
        </CardContent>
      </Card>
    </div>
  );
}
