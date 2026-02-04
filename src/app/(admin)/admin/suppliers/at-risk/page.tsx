'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Clock, Mail, Phone, Building2 } from 'lucide-react';

export default function AtRiskSuppliersPage() {
  const atRiskSuppliers = [
    { id: 1, name: 'Beta Manufacturing', category: 'Electronics', lastDelivery: '21 days ago', fulfillment: '72%', reason: 'Fulfillment rate dropped', risk: 'high', complaints: 8 },
    { id: 2, name: 'Delta Parts Co', category: 'Components', lastDelivery: '18 days ago', fulfillment: '78%', reason: 'Quality issues reported', risk: 'high', complaints: 6 },
    { id: 3, name: 'Omega Supplies', category: 'Raw Materials', lastDelivery: '14 days ago', fulfillment: '82%', reason: 'Delivery delays', risk: 'medium', complaints: 4 },
    { id: 4, name: 'Sigma Industries', category: 'Machinery', lastDelivery: '12 days ago', fulfillment: '85%', reason: 'Payment disputes', risk: 'medium', complaints: 3 },
    { id: 5, name: 'Kappa Trading', category: 'General', lastDelivery: '10 days ago', fulfillment: '88%', reason: 'Response time issues', risk: 'low', complaints: 2 },
  ];

  const getRiskBadge = (risk: string) => {
    const styles = {
      high: 'bg-red-500/20 text-red-400 border-red-500/50',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      low: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    };
    return styles[risk as keyof typeof styles] || styles.low;
  };

  const stats = [
    { label: 'High Risk', value: 2, color: 'text-red-400', bg: 'bg-red-500/20' },
    { label: 'Medium Risk', value: 2, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { label: 'Low Risk', value: 1, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { label: 'Total At Risk', value: 5, color: 'text-white', bg: 'bg-slate-700' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">At Risk Suppliers</h1>
          <p className="text-slate-400 mt-1">Suppliers with performance or compliance issues</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Mail className="w-4 h-4 mr-2" />
          Send Warning Notices
        </Button>
      </div>

      {/* Risk Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${stat.bg}`}>
                <Building2 className={`w-6 h-6 ${stat.color}`} />
              </div>
              <p className={`text-3xl font-bold mt-3 ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-slate-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* At Risk List */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Suppliers Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atRiskSuppliers.map((supplier) => (
              <div key={supplier.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{supplier.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRiskBadge(supplier.risk)}`}>
                        {supplier.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{supplier.category}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Last delivery: {supplier.lastDelivery}
                      </div>
                      <div className="flex items-center gap-1 text-red-400">
                        <TrendingDown className="w-4 h-4" />
                        Fulfillment: {supplier.fulfillment}
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <AlertTriangle className="w-4 h-4" />
                        {supplier.complaints} complaints
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <span className="text-slate-400">Issue: </span>
                      <span className="text-slate-300">{supplier.reason}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
