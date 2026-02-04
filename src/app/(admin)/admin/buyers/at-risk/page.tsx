'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Clock, Mail, Phone, UserX } from 'lucide-react';

export default function AtRiskBuyersPage() {
  const atRiskBuyers = [
    { id: 1, name: 'Omega Industries', company: 'Manufacturing', lastOrder: '45 days ago', decline: '-62%', reason: 'Order frequency dropped', risk: 'high', accountManager: 'Sarah Johnson' },
    { id: 2, name: 'Coastal Trading', company: 'Import/Export', lastOrder: '38 days ago', decline: '-48%', reason: 'Payment delays', risk: 'high', accountManager: 'Mike Chen' },
    { id: 3, name: 'Metro Supplies', company: 'Retail', lastOrder: '32 days ago', decline: '-35%', reason: 'Reduced order volume', risk: 'medium', accountManager: 'Sarah Johnson' },
    { id: 4, name: 'Eastern Materials', company: 'Construction', lastOrder: '28 days ago', decline: '-28%', reason: 'Competitor switch risk', risk: 'medium', accountManager: 'David Park' },
    { id: 5, name: 'Summit Corp', company: 'Electronics', lastOrder: '25 days ago', decline: '-22%', reason: 'Support escalations', risk: 'low', accountManager: 'Lisa Wong' },
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
          <h1 className="text-2xl font-bold text-white">At Risk Buyers</h1>
          <p className="text-slate-400 mt-1">Buyers showing signs of churn or reduced activity</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Mail className="w-4 h-4 mr-2" />
          Send Retention Campaign
        </Button>
      </div>

      {/* Risk Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6 text-center">
              <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${stat.bg}`}>
                <UserX className={`w-6 h-6 ${stat.color}`} />
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
            Buyers Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atRiskBuyers.map((buyer) => (
              <div key={buyer.id} className="p-4 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-white">{buyer.name}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getRiskBadge(buyer.risk)}`}>
                        {buyer.risk.toUpperCase()} RISK
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{buyer.company}</p>
                    
                    <div className="flex flex-wrap gap-4 mt-3 text-sm">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-4 h-4 text-slate-400" />
                        Last order: {buyer.lastOrder}
                      </div>
                      <div className="flex items-center gap-1 text-red-400">
                        <TrendingDown className="w-4 h-4" />
                        {buyer.decline} vs prev. period
                      </div>
                    </div>
                    
                    <div className="mt-2 text-sm">
                      <span className="text-slate-400">Reason: </span>
                      <span className="text-slate-300">{buyer.reason}</span>
                    </div>
                    <div className="mt-1 text-sm">
                      <span className="text-slate-400">Account Manager: </span>
                      <span className="text-blue-400">{buyer.accountManager}</span>
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
                      View Profile
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
