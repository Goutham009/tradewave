'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  CheckCircle,
  Download,
  Clock,
  User,
  Globe,
  CreditCard,
  Shield,
  AlertTriangle,
  History,
} from 'lucide-react';
import Link from 'next/link';

const MOCK_VERIFICATION_DETAILS = [
  {
    id: 'VER-001',
    type: 'kyb' as const,
    status: 'pending',
    priority: 'high' as const,
    submittedAt: '2024-01-20',
    company: {
      name: 'Tech Solutions Inc',
      registrationNumber: 'TSI-2024-001234',
      taxId: 'TAX-987654321',
      incorporationDate: '2018-05-15',
      type: 'Private Limited',
      industry: 'Technology',
      website: 'https://techsolutions.com',
      employeeCount: '50-100',
      annualRevenue: '$5M - $10M',
    },
    contact: {
      name: 'John Smith',
      designation: 'CEO',
      email: 'john@techsolutions.com',
      phone: '+1 234 567 8900',
      alternatePhone: '+1 234 567 8901',
    },
    address: {
      street: '123 Tech Park, Building A',
      city: 'San Francisco',
      state: 'California',
      country: 'United States',
      postalCode: '94102',
    },
    bankDetails: {
      bankName: 'Chase Bank',
      accountNumber: '****4567',
      routingNumber: '****1234',
      accountType: 'Business Checking',
    },
    documents: [
      { name: 'Business License', status: 'verified', uploadedAt: '2024-01-18', size: '2.4 MB' },
      { name: 'Tax Certificate', status: 'pending', uploadedAt: '2024-01-19', size: '1.8 MB' },
      { name: 'Bank Statement', status: 'pending', uploadedAt: '2024-01-20', size: '3.2 MB' },
      { name: 'Certificate of Incorporation', status: 'verified', uploadedAt: '2024-01-18', size: '1.1 MB' },
      { name: 'Directors ID Proof', status: 'pending', uploadedAt: '2024-01-20', size: '0.8 MB' },
    ],
    history: [
      { action: 'Submitted for verification', user: 'System', date: '2024-01-20 10:30 AM', notes: 'Auto-submitted after document upload' },
      { action: 'Document verified', user: 'Sarah Johnson', date: '2024-01-19 02:15 PM', notes: 'Business License verified successfully' },
      { action: 'Additional documents requested', user: 'Sarah Johnson', date: '2024-01-18 11:00 AM', notes: 'Requested bank statement for last 3 months' },
    ],
    riskScore: 'Low',
    verificationChecks: [
      { name: 'Company Registration', status: 'passed', details: 'Verified with state registry' },
      { name: 'Tax ID Verification', status: 'passed', details: 'Valid tax identification' },
      { name: 'Address Verification', status: 'pending', details: 'Awaiting physical verification' },
      { name: 'Bank Account Verification', status: 'pending', details: 'Micro-deposit pending' },
      { name: 'Director Background Check', status: 'in_progress', details: 'Background check in progress' },
    ],
  },
  {
    id: 'VER-002',
    type: 'requirement' as const,
    status: 'pending',
    priority: 'medium' as const,
    submittedAt: '2024-01-19',
    company: {
      name: 'Acme Corporation',
      registrationNumber: 'ACM-2022-77421',
      taxId: 'TAX-ACM-778899',
      incorporationDate: '2012-09-20',
      type: 'Corporation',
      industry: 'Manufacturing',
      website: 'https://acmecorp.example',
      employeeCount: '200-500',
      annualRevenue: '$25M - $50M',
    },
    contact: {
      name: 'Priya Shah',
      designation: 'Procurement Director',
      email: 'priya@acmecorp.com',
      phone: '+1 415 555 1200',
      alternatePhone: '+1 415 555 1211',
    },
    address: {
      street: '88 Industrial Parkway',
      city: 'Chicago',
      state: 'Illinois',
      country: 'United States',
      postalCode: '60606',
    },
    bankDetails: {
      bankName: 'Bank of America',
      accountNumber: '****9123',
      routingNumber: '****5544',
      accountType: 'Corporate',
    },
    documents: [
      { name: 'Requirement Brief', status: 'pending', uploadedAt: '2024-01-19', size: '0.9 MB' },
      { name: 'Purchase Forecast', status: 'pending', uploadedAt: '2024-01-19', size: '1.2 MB' },
    ],
    history: [
      { action: 'Requirement submitted', user: 'System', date: '2024-01-19 09:00 AM', notes: 'Awaiting admin review' },
    ],
    riskScore: 'Medium',
    verificationChecks: [
      { name: 'Requirement Completeness', status: 'pending', details: 'Specs missing for delivery timeline' },
      { name: 'Budget Validation', status: 'in_progress', details: 'Checking budget alignment' },
    ],
  },
  {
    id: 'VER-003',
    type: 'kyb' as const,
    status: 'pending',
    priority: 'low' as const,
    submittedAt: '2024-01-18',
    company: {
      name: 'Global Traders LLC',
      registrationNumber: 'GTL-2017-11902',
      taxId: 'TAX-88442211',
      incorporationDate: '2017-03-12',
      type: 'LLC',
      industry: 'Trading',
      website: 'https://globaltraders.example',
      employeeCount: '20-50',
      annualRevenue: '$3M - $5M',
    },
    contact: {
      name: 'Sarah Johnson',
      designation: 'Managing Partner',
      email: 'sarah@globaltraders.com',
      phone: '+1 345 678 9012',
      alternatePhone: '+1 345 678 9022',
    },
    address: {
      street: '500 Market Street',
      city: 'Austin',
      state: 'Texas',
      country: 'United States',
      postalCode: '73301',
    },
    bankDetails: {
      bankName: 'Wells Fargo',
      accountNumber: '****2345',
      routingNumber: '****6789',
      accountType: 'Business Checking',
    },
    documents: [
      { name: 'Business License', status: 'pending', uploadedAt: '2024-01-17', size: '1.9 MB' },
      { name: 'Tax Certificate', status: 'pending', uploadedAt: '2024-01-18', size: '1.3 MB' },
    ],
    history: [
      { action: 'Submitted for verification', user: 'System', date: '2024-01-18 11:45 AM', notes: 'Awaiting admin review' },
    ],
    riskScore: 'Low',
    verificationChecks: [
      { name: 'Company Registration', status: 'pending', details: 'Verification in queue' },
      { name: 'Tax ID Verification', status: 'pending', details: 'Pending automated checks' },
    ],
  },
  {
    id: 'VER-004',
    type: 'requirement' as const,
    status: 'pending',
    priority: 'high' as const,
    submittedAt: '2024-01-17',
    company: {
      name: 'Fashion Hub Ltd',
      registrationNumber: 'FHL-2014-77201',
      taxId: 'TAX-991177',
      incorporationDate: '2014-08-02',
      type: 'Private Limited',
      industry: 'Textiles',
      website: 'https://fashionhub.example',
      employeeCount: '100-200',
      annualRevenue: '$8M - $12M',
    },
    contact: {
      name: 'Emily Davis',
      designation: 'Head of Procurement',
      email: 'emily@fashionhub.com',
      phone: '+1 567 890 1234',
      alternatePhone: '+1 567 890 1255',
    },
    address: {
      street: '14 Textile Avenue',
      city: 'Los Angeles',
      state: 'California',
      country: 'United States',
      postalCode: '90001',
    },
    bankDetails: {
      bankName: 'Citibank',
      accountNumber: '****7788',
      routingNumber: '****8899',
      accountType: 'Business',
    },
    documents: [
      { name: 'Requirement Brief', status: 'pending', uploadedAt: '2024-01-17', size: '0.7 MB' },
      { name: 'Material Specs', status: 'pending', uploadedAt: '2024-01-17', size: '1.0 MB' },
    ],
    history: [
      { action: 'Requirement submitted', user: 'System', date: '2024-01-17 04:30 PM', notes: 'Priority matching requested' },
    ],
    riskScore: 'Medium',
    verificationChecks: [
      { name: 'Requirement Completeness', status: 'pending', details: 'Awaiting supplier shortlist' },
      { name: 'Budget Validation', status: 'pending', details: 'Budget review pending' },
    ],
  },
];

export default function VerificationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [requestNotes, setRequestNotes] = useState('');

  const data = MOCK_VERIFICATION_DETAILS.find((item) => item.id === params.id) ?? MOCK_VERIFICATION_DETAILS[0];

  const handleSendRequest = async () => {
    if (!requestNotes.trim()) return;
    setProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setProcessing(false);
    setShowRequestDialog(false);
    setRequestNotes('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'passed':
        return <Badge className="bg-green-500/20 text-green-400">Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Pending</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-500/20 text-blue-400">In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-400">Failed</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internal/verification">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Queue
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{data.company.name}</h1>
              <Badge className="bg-yellow-500/20 text-yellow-400">{data.priority} Priority</Badge>
              <Badge className="bg-blue-500/20 text-blue-400">
                {data.type === 'kyb' ? 'KYB Verification' : 'Requirement Review'}
              </Badge>
            </div>
            <p className="text-slate-400 mt-1">Verification ID: {data.id} • Submitted on {data.submittedAt}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowRequestDialog(true)}
            disabled={processing}
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-500/10"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            Request Documents
          </Button>
        </div>
      </div>

      {/* Risk Score Banner */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-green-400" />
              <div>
                <p className="text-sm text-slate-300">Risk Assessment Score</p>
                <p className="text-xl font-bold text-green-400">{data.riskScore} Risk</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-300">Verification Progress</p>
              <p className="text-xl font-bold text-white">3/5 Checks Completed</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-slate-800 border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Overview</TabsTrigger>
          <TabsTrigger value="documents" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Documents</TabsTrigger>
          <TabsTrigger value="checks" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Verification Checks</TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Company Information */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-400" />
                  Company Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Registration Number</p>
                    <p className="text-white font-medium">{data.company.registrationNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Tax ID</p>
                    <p className="text-white font-medium">{data.company.taxId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Incorporation Date</p>
                    <p className="text-white font-medium">{data.company.incorporationDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Company Type</p>
                    <p className="text-white font-medium">{data.company.type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Industry</p>
                    <p className="text-white font-medium">{data.company.industry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Employees</p>
                    <p className="text-white font-medium">{data.company.employeeCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Annual Revenue</p>
                    <p className="text-white font-medium">{data.company.annualRevenue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Website</p>
                    <a href={data.company.website} target="_blank" className="text-blue-400 hover:underline font-medium flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Visit Website
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-400" />
                  Primary Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white">
                    {data.contact.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-white">{data.contact.name}</p>
                    <p className="text-slate-400">{data.contact.designation}</p>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <span className="text-white">{data.contact.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-white">{data.contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span className="text-white">{data.contact.alternatePhone} (Alternate)</span>
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
                  <p className="text-white">{data.address.street}</p>
                  <p className="text-white">{data.address.city}, {data.address.state} {data.address.postalCode}</p>
                  <p className="text-white">{data.address.country}</p>
                </div>
              </CardContent>
            </Card>

            {/* Bank Details */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-400" />
                  Bank Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-400">Bank Name</p>
                    <p className="text-white font-medium">{data.bankDetails.bankName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Account Type</p>
                    <p className="text-white font-medium">{data.bankDetails.accountType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Account Number</p>
                    <p className="text-white font-medium">{data.bankDetails.accountNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Routing Number</p>
                    <p className="text-white font-medium">{data.bankDetails.routingNumber}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Notes */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Add Verification Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this verification..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 min-h-24"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Submitted Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{doc.name}</p>
                        <p className="text-sm text-slate-400">{doc.size} • Uploaded {doc.uploadedAt}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(doc.status)}
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300 hover:text-white">
                        <Download className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checks" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Verification Checks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.verificationChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        check.status === 'passed' ? 'bg-green-500/20' :
                        check.status === 'pending' ? 'bg-yellow-500/20' :
                        check.status === 'in_progress' ? 'bg-blue-500/20' : 'bg-red-500/20'
                      }`}>
                        {check.status === 'passed' ? <CheckCircle className="h-5 w-5 text-green-400" /> :
                         check.status === 'in_progress' ? <Clock className="h-5 w-5 text-blue-400" /> :
                         <Clock className="h-5 w-5 text-yellow-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-white">{check.name}</p>
                        <p className="text-sm text-slate-400">{check.details}</p>
                      </div>
                    </div>
                    {getStatusBadge(check.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <History className="h-5 w-5 text-slate-400" />
                Verification History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.history.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b border-slate-800 last:border-0">
                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.action}</p>
                      <p className="text-sm text-slate-400">By {item.user} • {item.date}</p>
                      {item.notes && <p className="text-sm text-slate-300 mt-1">{item.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="bg-slate-900 border-slate-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Request Additional Documents</DialogTitle>
            <DialogDescription>
              {data.company.name} - Request missing KYB documents on behalf of admin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Request Notes</label>
              <Textarea
                placeholder="List the specific documents needed and any clarification..."
                value={requestNotes}
                onChange={(e) => setRequestNotes(e.target.value)}
                className="mt-1 bg-slate-800 border-slate-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestDialog(false)} className="border-slate-700">
              Cancel
            </Button>
            <Button
              onClick={handleSendRequest}
              disabled={processing || !requestNotes.trim()}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {processing ? 'Sending...' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
