'use client';

import { useState, useEffect } from 'react';
import { Target, DollarSign, TrendingUp, AlertTriangle, Plus, Edit2 } from 'lucide-react';

interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: string;
}

export default function BudgetTrackingPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBudget, setTotalBudget] = useState(100000);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    // Mock data for demo
    const mockBudgets = [
      { id: '1', category: 'Electronics', allocated: 30000, spent: 22500, period: '2024' },
      { id: '2', category: 'Raw Materials', allocated: 25000, spent: 18000, period: '2024' },
      { id: '3', category: 'Machinery', allocated: 20000, spent: 15000, period: '2024' },
      { id: '4', category: 'Textiles', allocated: 15000, spent: 8500, period: '2024' },
      { id: '5', category: 'Chemicals', allocated: 10000, spent: 6000, period: '2024' },
    ];
    setBudgets(mockBudgets);
    setTotalSpent(mockBudgets.reduce((sum, b) => sum + b.spent, 0));
    setLoading(false);
  }, []);

  const getProgressColor = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusLabel = (spent: number, allocated: number) => {
    const percentage = (spent / allocated) * 100;
    if (percentage >= 100) return { text: 'Over Budget', color: 'text-red-600 bg-red-100' };
    if (percentage >= 90) return { text: 'Critical', color: 'text-red-600 bg-red-100' };
    if (percentage >= 70) return { text: 'Warning', color: 'text-yellow-600 bg-yellow-100' };
    return { text: 'On Track', color: 'text-green-600 bg-green-100' };
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading budget data...</div>
      </div>
    );
  }

  const remainingBudget = totalBudget - totalSpent;
  const budgetUsagePercent = (totalSpent / totalBudget) * 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Tracking</h1>
          <p className="text-gray-500 mt-1">Monitor and manage your procurement budgets</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Budget
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudget.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Remaining</p>
              <p className="text-2xl font-bold text-green-600">${remainingBudget.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Usage</p>
              <p className="text-2xl font-bold text-gray-900">{budgetUsagePercent.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Overall Budget Usage</h2>
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${budgetUsagePercent >= 90 ? 'bg-red-500' : budgetUsagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'} transition-all`}
            style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>${totalSpent.toLocaleString()} spent</span>
          <span>${remainingBudget.toLocaleString()} remaining</span>
        </div>
      </div>

      {/* Category Budgets */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-semibold text-gray-900">Category Budgets</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {budgets.map((budget) => {
            const percentage = (budget.spent / budget.allocated) * 100;
            const status = getStatusLabel(budget.spent, budget.allocated);
            
            return (
              <div key={budget.id} className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{budget.category}</h3>
                    <p className="text-sm text-gray-500">
                      ${budget.spent.toLocaleString()} of ${budget.allocated.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.text}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(budget.spent, budget.allocated)} transition-all`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>{percentage.toFixed(1)}% used</span>
                  <span>${(budget.allocated - budget.spent).toLocaleString()} left</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
