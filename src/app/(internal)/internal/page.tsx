'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  ClipboardCheck,
  Package,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Truck,
  History,
} from 'lucide-react';
import Link from 'next/link';

// AM Dashboard Stats
const amStats = {
  pendingVerifications: 12,
  activeClients: 45,
  leadsAssigned: 8,
  completedToday: 5,
};

// AM Recent Activity
const amRecentActivity = [
  { id: 1, type: 'verification', title: 'KYB Review - Tech Solutions Inc', time: '10 mins ago', status: 'pending' },
  { id: 2, type: 'requirement', title: 'Requirement verified for Acme Corp', time: '25 mins ago', status: 'completed' },
  { id: 3, type: 'lead', title: 'New lead assigned - Global Traders', time: '1 hour ago', status: 'new' },
  { id: 4, type: 'negotiation', title: 'Price negotiation - Fashion Hub Ltd', time: '2 hours ago', status: 'in_progress' },
];

// Procurement Dashboard Stats
const procurementStats = {
  pendingRequirements: 18,
  suppliersMatched: 156,
  quotationsReviewed: 34,
  avgMatchTime: '2.4 hrs',
};

// Procurement Recent Activity
const procurementRecentActivity = [
  { id: 1, type: 'requirement', title: 'Steel Components - 5 suppliers matched', time: '15 mins ago', status: 'completed' },
  { id: 2, type: 'quotation', title: 'Reviewing quotes for Textile Materials', time: '30 mins ago', status: 'in_progress' },
  { id: 3, type: 'supplier', title: 'New supplier onboarded - Premium Metals', time: '1 hour ago', status: 'new' },
  { id: 4, type: 'requirement', title: 'Chemical Compounds - pending review', time: '2 hours ago', status: 'pending' },
];

function AMDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Account Manager Dashboard</h1>
        <p className="text-slate-400">Manage client verifications, requirements, and negotiations</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Verifications</p>
                <p className="text-2xl font-bold text-white">{amStats.pendingVerifications}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <ClipboardCheck className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Clients</p>
                <p className="text-2xl font-bold text-white">{amStats.activeClients}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Leads Assigned</p>
                <p className="text-2xl font-bold text-white">{amStats.leadsAssigned}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completed Today</p>
                <p className="text-2xl font-bold text-white">{amStats.completedToday}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription>Common tasks you perform frequently</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/internal/verification">
              <Button variant="outline" className="w-full justify-between border-slate-700 hover:bg-slate-800">
                <span className="flex items-center gap-2">
                  <ClipboardCheck className="h-4 w-4" />
                  Review Pending Verifications
                </span>
                <Badge variant="secondary">{amStats.pendingVerifications}</Badge>
              </Button>
            </Link>
            <Link href="/internal/leads">
              <Button variant="outline" className="w-full justify-between border-slate-700 hover:bg-slate-800">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  View Assigned Leads
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/internal/negotiations">
              <Button variant="outline" className="w-full justify-between border-slate-700 hover:bg-slate-800">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Active Negotiations
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/internal/orders/active">
              <Button variant="outline" className="w-full justify-between border-slate-700 hover:bg-slate-800">
                <span className="flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Active Orders
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/internal/orders/history">
              <Button variant="outline" className="w-full justify-between border-slate-700 hover:bg-slate-800">
                <span className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Order History
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {amRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-500/20' :
                    activity.status === 'pending' ? 'bg-yellow-500/20' :
                    activity.status === 'new' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    {activity.status === 'completed' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                     activity.status === 'pending' ? <Clock className="h-4 w-4 text-yellow-500" /> :
                     activity.status === 'new' ? <AlertCircle className="h-4 w-4 text-blue-500" /> :
                     <FileText className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ProcurementDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Procurement Dashboard</h1>
        <p className="text-slate-400">Match suppliers, review quotations, and manage procurement</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Pending Requirements</p>
                <p className="text-2xl font-bold text-white">{procurementStats.pendingRequirements}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                <Package className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Suppliers Matched</p>
                <p className="text-2xl font-bold text-white">{procurementStats.suppliersMatched}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Quotations Reviewed</p>
                <p className="text-2xl font-bold text-white">{procurementStats.quotationsReviewed}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Match Time</p>
                <p className="text-2xl font-bold text-white">{procurementStats.avgMatchTime}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Clock className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription>Common procurement tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/internal/requirements">
              <Button variant="outline" className="w-full justify-between border-slate-700 hover:bg-slate-800">
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Review Requirements Queue
                </span>
                <Badge variant="secondary">{procurementStats.pendingRequirements}</Badge>
              </Button>
            </Link>
            <Link href="/internal/quotations">
              <Button variant="outline" className="w-full justify-between border-slate-700 hover:bg-slate-800">
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Review Quotations
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription>Latest procurement updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {procurementRecentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' ? 'bg-green-500/20' :
                    activity.status === 'pending' ? 'bg-yellow-500/20' :
                    activity.status === 'new' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    {activity.status === 'completed' ? <CheckCircle className="h-4 w-4 text-green-500" /> :
                     activity.status === 'pending' ? <Clock className="h-4 w-4 text-yellow-500" /> :
                     activity.status === 'new' ? <AlertCircle className="h-4 w-4 text-blue-500" /> :
                     <FileText className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function InternalDashboard() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;

  if (userRole === 'ACCOUNT_MANAGER') {
    return <AMDashboard />;
  }

  return <ProcurementDashboard />;
}
