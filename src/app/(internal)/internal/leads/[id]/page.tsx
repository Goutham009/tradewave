'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Globe,
  Calendar,
  CheckCircle,
  Clock,
  UserPlus,
  TrendingUp,
  Users,
  MessageSquare,
  Shield,
  Target,
} from 'lucide-react';

interface LeadDetail {
  id: string;
  companyName: string;
  contactPerson: string;
  title: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  companySize: string;
  location: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted';
  assignedAt: string;
  lastTouch: string;
  potentialValue: number;
  likelihood: number;
  requirements: string[];
  activity: { id: string; type: string; notes: string; date: string }[];
}

const MOCK_LEADS: LeadDetail[] = [
  {
    id: 'LEAD-001',
    companyName: 'Global Imports Co',
    contactPerson: 'David Brown',
    title: 'Head of Procurement',
    email: 'david@globalimports.com',
    phone: '+1 234 567 8900',
    website: 'https://globalimports.example',
    industry: 'Import/Export',
    companySize: '50-100',
    location: 'New York, USA',
    source: 'Website',
    status: 'new',
    assignedAt: '2024-01-20',
    lastTouch: '2024-01-20',
    potentialValue: 120000,
    likelihood: 65,
    requirements: ['Steel components', 'Logistics support', 'Flexible payment terms'],
    activity: [
      { id: 'ACT-01', type: 'Assigned', notes: 'Lead assigned to AM queue', date: '2024-01-20 09:30 AM' },
    ],
  },
  {
    id: 'LEAD-002',
    companyName: 'Premium Exports Ltd',
    contactPerson: 'Lisa Wang',
    title: 'Operations Lead',
    email: 'lisa@premiumexports.com',
    phone: '+1 345 678 9012',
    website: 'https://premiumexports.example',
    industry: 'Textiles',
    companySize: '100-200',
    location: 'Chicago, USA',
    source: 'Referral',
    status: 'contacted',
    assignedAt: '2024-01-18',
    lastTouch: '2024-01-19',
    potentialValue: 89000,
    likelihood: 72,
    requirements: ['Cotton fabric sourcing', 'Q2 supply plan', 'Quality certifications'],
    activity: [
      { id: 'ACT-02', type: 'Call', notes: 'Intro call completed, requested MOQ details', date: '2024-01-18 03:10 PM' },
      { id: 'ACT-03', type: 'Email', notes: 'Sent follow-up deck + supplier shortlist', date: '2024-01-19 10:00 AM' },
    ],
  },
  {
    id: 'LEAD-003',
    companyName: 'Metro Supplies',
    contactPerson: 'James Miller',
    title: 'COO',
    email: 'james@metrosupplies.com',
    phone: '+1 456 789 0123',
    website: 'https://metrosupplies.example',
    industry: 'Industrial',
    companySize: '200-500',
    location: 'Dallas, USA',
    source: 'Trade Show',
    status: 'qualified',
    assignedAt: '2024-01-15',
    lastTouch: '2024-01-18',
    potentialValue: 140000,
    likelihood: 86,
    requirements: ['Industrial chemicals', 'Fast delivery SLA', 'Escrow payments'],
    activity: [
      { id: 'ACT-04', type: 'Meeting', notes: 'Qualified lead, ready for KYB initiation', date: '2024-01-17 02:00 PM' },
      { id: 'ACT-05', type: 'KYB', notes: 'Requested KYB docs from contact', date: '2024-01-18 11:30 AM' },
    ],
  },
];

const STATUS_LABELS = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
};

const STATUS_COLORS = {
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  qualified: 'bg-purple-500/20 text-purple-400',
  converted: 'bg-green-500/20 text-green-400',
};

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState('');

  const lead = useMemo(
    () => MOCK_LEADS.find((item) => item.id === params.id) ?? MOCK_LEADS[0],
    [params.id]
  );

  const [status, setStatus] = useState<LeadDetail['status']>(lead.status);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white" onClick={() => router.push('/internal/leads')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{lead.companyName}</h1>
              <Badge className={STATUS_COLORS[status]}>{STATUS_LABELS[status]}</Badge>
              <Badge variant="outline" className="text-xs">{lead.source}</Badge>
            </div>
            <p className="text-slate-400 mt-1">Assigned {lead.assignedAt} • Last touch {lead.lastTouch}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
            <Mail className="h-4 w-4 mr-2" />
            Send Email
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white">
            <Phone className="h-4 w-4 mr-2" />
            Call Lead
          </Button>
          {status !== 'converted' && (
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setStatus('converted')}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Convert to User
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Lead Overview</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  {lead.industry} • {lead.companySize} employees
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Globe className="h-4 w-4 text-slate-500" />
                  {lead.website}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  {lead.location}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-300">
                  <UserPlus className="h-4 w-4 text-slate-500" />
                  {lead.contactPerson} • {lead.title}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="h-4 w-4 text-slate-500" />
                  {lead.email}
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="h-4 w-4 text-slate-500" />
                  {lead.phone}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-400" />
                Opportunity Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-slate-800">
                <p className="text-sm text-slate-400">Potential Value</p>
                <p className="text-2xl font-bold text-white">${lead.potentialValue.toLocaleString()}</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800">
                <p className="text-sm text-slate-400">Conversion Likelihood</p>
                <p className="text-2xl font-bold text-green-400">{lead.likelihood}%</p>
              </div>
              <div className="p-4 rounded-lg bg-slate-800">
                <p className="text-sm text-slate-400">Status</p>
                <p className="text-lg font-semibold text-white">{STATUS_LABELS[status]}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-sm text-slate-400 mb-2">Key Requirements</p>
                <div className="flex flex-wrap gap-2">
                  {lead.requirements.map((req) => (
                    <Badge key={req} variant="outline" className="text-xs border-slate-600 text-slate-300">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Lead Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lead.activity.map((item) => (
                  <div key={item.id} className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center">
                      <Clock className="h-4 w-4 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.type}</p>
                      <p className="text-slate-400 text-sm">{item.notes}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-400" />
                AM Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Capture discovery call notes, objections, and next steps..."
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-28"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Save Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Lead Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                <Users className="h-4 w-4 mr-2" />
                Schedule Demo
              </Button>
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white">
                <Shield className="h-4 w-4 mr-2" />
                Request KYB Documents
              </Button>
              <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Create Follow-up Task
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Progress Tracker</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(['new', 'contacted', 'qualified', 'converted'] as LeadDetail['status'][]).map((step) => (
                <div key={step} className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${step === status ? 'bg-green-400' : 'bg-slate-700'}`} />
                  <span className={`text-sm ${step === status ? 'text-white' : 'text-slate-500'}`}>
                    {STATUS_LABELS[step]}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
