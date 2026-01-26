'use client';

import { Target, ArrowDown, Users, ShoppingCart, CreditCard, CheckCircle } from 'lucide-react';

const FUNNEL_STEPS = [
  { name: 'Visitors', count: 50000, icon: Users, color: 'bg-blue-500' },
  { name: 'Registered', count: 12500, icon: Users, color: 'bg-blue-400', rate: '25%' },
  { name: 'Created Requirement', count: 5000, icon: ShoppingCart, color: 'bg-green-500', rate: '40%' },
  { name: 'Received Quotes', count: 3500, icon: Target, color: 'bg-yellow-500', rate: '70%' },
  { name: 'Placed Order', count: 2100, icon: CreditCard, color: 'bg-orange-500', rate: '60%' },
  { name: 'Completed', count: 1890, icon: CheckCircle, color: 'bg-green-600', rate: '90%' },
];

export default function FunnelAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Funnel Analytics</h1>
        <p className="text-slate-400">Track conversion through the purchase funnel</p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold mb-6">Conversion Funnel</h2>
        <div className="space-y-4">
          {FUNNEL_STEPS.map((step, index) => (
            <div key={step.name}>
              <div className="flex items-center gap-4">
                <div className={`p-3 ${step.color} rounded-lg`}>
                  <step.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{step.name}</span>
                    <div className="flex items-center gap-4">
                      {step.rate && (
                        <span className="text-green-400 text-sm">{step.rate} conversion</span>
                      )}
                      <span className="text-white font-semibold">{step.count.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${step.color}`}
                      style={{ width: `${(step.count / FUNNEL_STEPS[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
              {index < FUNNEL_STEPS.length - 1 && (
                <div className="flex justify-center py-2">
                  <ArrowDown className="w-5 h-5 text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
        <h2 className="text-white font-semibold mb-2">Overall Conversion Rate</h2>
        <p className="text-4xl font-bold text-green-400">3.78%</p>
        <p className="text-slate-400 text-sm mt-1">From visitor to completed order</p>
      </div>
    </div>
  );
}
