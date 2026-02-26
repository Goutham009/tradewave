'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, Phone, Mail, Calendar, MessageSquare, 
  Clock, CheckCircle, Star, Send, Headphones, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

type Interaction = {
  id: string;
  type: 'call' | 'message' | 'meeting';
  subject: string;
  date: string;
  status: 'completed' | 'scheduled';
  summary: string;
};

export default function AccountManagerPage() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const accountManager = {
    name: 'Sarah Johnson',
    role: 'Senior Account Manager',
    email: 'sarah.johnson@tradewave.io',
    phone: '+1 (555) 123-4567',
    avatar: '/avatars/sarah.jpg',
    availability: 'Available',
    responseTime: '< 2 hours',
    rating: 4.9,
    totalClients: 45,
  };

  const recentInteractions: Interaction[] = [
    {
      id: 'INT-2026-001',
      type: 'call',
      subject: 'Quarterly Business Review',
      date: '2026-02-21T10:30:00Z',
      status: 'completed',
      summary: 'Reviewed purchase trends, margin targets, and next-quarter sourcing opportunities.',
    },
    {
      id: 'INT-2026-002',
      type: 'message',
      subject: 'New supplier recommendations',
      date: '2026-02-16T08:10:00Z',
      status: 'completed',
      summary: 'Shared three audited suppliers aligned with your preferred lead-time and MOQ ranges.',
    },
    {
      id: 'INT-2026-003',
      type: 'meeting',
      subject: 'Onboarding session',
      date: '2026-02-09T14:00:00Z',
      status: 'completed',
      summary: 'Completed workflow onboarding and reviewed requirement posting best practices.',
    },
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setMessage('');
    alert('Message sent to your account manager!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Account Manager</h1>
        <p className="text-gray-500 mt-1">Your dedicated support contact for all platform needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Manager Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{accountManager.name}</h2>
              <p className="text-gray-500">{accountManager.role}</p>
              
              <div className="flex items-center justify-center gap-1 mt-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">{accountManager.rating}</span>
                <span className="text-gray-400 text-sm">({accountManager.totalClients} clients)</span>
              </div>

              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {accountManager.availability}
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <a 
                href={`mailto:${accountManager.email}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Mail className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{accountManager.email}</span>
              </a>
              <a 
                href={`tel:${accountManager.phone}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Phone className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{accountManager.phone}</span>
              </a>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Response time: {accountManager.responseTime}</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Call
              </Button>
              <Button className="w-full">
                <Headphones className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Message */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Send a Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Type your message here... Your account manager will respond within 2 hours during business hours."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="mb-4"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Average response time: <span className="font-medium text-green-600">{accountManager.responseTime}</span>
              </p>
              <Button onClick={handleSendMessage} disabled={!message.trim() || sending}>
                <Send className="w-4 h-4 mr-2" />
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Interactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Interactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentInteractions.map((interaction) => (
              <div 
                key={interaction.id}
                className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    {interaction.type === 'call' && <Phone className="w-5 h-5 text-blue-600" />}
                    {interaction.type === 'message' && <MessageSquare className="w-5 h-5 text-blue-600" />}
                    {interaction.type === 'meeting' && <Calendar className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{interaction.subject}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(interaction.date).toLocaleDateString()} • {interaction.summary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm capitalize">{interaction.status}</span>
                  </div>
                  <Link href={`/account-manager/interactions/${interaction.id}`}>
                    <Button variant="outline" size="sm">
                      View details
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
