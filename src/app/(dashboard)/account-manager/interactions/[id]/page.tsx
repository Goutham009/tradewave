'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Mail,
  MessageSquare,
  Phone,
  User,
  Video,
} from 'lucide-react';

type InteractionType = 'call' | 'message' | 'meeting';
type InteractionStatus = 'completed' | 'scheduled';

type InteractionDetail = {
  id: string;
  type: InteractionType;
  subject: string;
  date: string;
  status: InteractionStatus;
  summary: string;
  objective: string;
  owner: string;
  participants: string[];
  keyNotes: string[];
  nextSteps: string[];
};

const INTERACTIONS: Record<string, InteractionDetail> = {
  'INT-2026-001': {
    id: 'INT-2026-001',
    type: 'call',
    subject: 'Quarterly Business Review',
    date: '2026-02-21T10:30:00Z',
    status: 'completed',
    summary: 'Reviewed purchase trends, margin targets, and next-quarter sourcing opportunities.',
    objective: 'Align procurement roadmap for Q2 and identify priority supplier categories.',
    owner: 'Sarah Johnson',
    participants: ['Sarah Johnson', 'Demo Buyer Team', 'Procurement Analyst'],
    keyNotes: [
      'Average lead time reduced by 12% in previous quarter.',
      'Suggested adding two backup suppliers for copper and aluminum lines.',
      'Buyer asked for monthly supplier scorecard summary.',
    ],
    nextSteps: [
      'Share supplier scorecard deck by Monday.',
      'Schedule follow-up negotiation prep call.',
      'Review upcoming high-volume requirements for price benchmarking.',
    ],
  },
  'INT-2026-002': {
    id: 'INT-2026-002',
    type: 'message',
    subject: 'New supplier recommendations',
    date: '2026-02-16T08:10:00Z',
    status: 'completed',
    summary: 'Shared three audited suppliers aligned with your preferred lead-time and MOQ ranges.',
    objective: 'Shortlist backup suppliers for electronics category requirements.',
    owner: 'Sarah Johnson',
    participants: ['Sarah Johnson', 'Buyer Operations Team'],
    keyNotes: [
      'All suggested suppliers have KYB and quality verification complete.',
      'Two suppliers offer 45-day payment terms on repeat orders.',
      'One supplier can support urgent 2-week pilot shipment.',
    ],
    nextSteps: [
      'Buyer to confirm preferred supplier shortlist.',
      'AM to set intro call with top two suppliers.',
    ],
  },
  'INT-2026-003': {
    id: 'INT-2026-003',
    type: 'meeting',
    subject: 'Onboarding session',
    date: '2026-02-09T14:00:00Z',
    status: 'completed',
    summary: 'Completed workflow onboarding and reviewed requirement posting best practices.',
    objective: 'Train procurement team on requirement creation, quotation comparison, and order flow.',
    owner: 'Sarah Johnson',
    participants: ['Sarah Johnson', 'Buyer Team Lead', 'Operations Coordinator'],
    keyNotes: [
      'Demonstrated requirement posting with target price and payment terms.',
      'Reviewed quotation comparison workflow and negotiation handoff.',
      'Shared returns and payments tracking checklist.',
    ],
    nextSteps: [
      'Buyer team to publish first production requirement.',
      'AM to monitor first quotation cycle and provide feedback.',
    ],
  },
};

function getInteractionById(interactionId: string): InteractionDetail {
  const found = INTERACTIONS[interactionId];
  if (found) {
    return found;
  }

  return {
    id: interactionId,
    type: 'message',
    subject: 'Recent account manager interaction',
    date: new Date().toISOString(),
    status: 'scheduled',
    summary: 'This interaction was recently logged and details are being prepared.',
    objective: 'Validate interaction metadata and attach notes.',
    owner: 'Account Manager',
    participants: ['Account Manager', 'Client Team'],
    keyNotes: ['Interaction created from recent activity.'],
    nextSteps: ['Awaiting detailed note submission.'],
  };
}

function getTypeIcon(type: InteractionType) {
  if (type === 'call') {
    return <Phone className="h-5 w-5 text-blue-600" />;
  }
  if (type === 'meeting') {
    return <Video className="h-5 w-5 text-purple-600" />;
  }
  return <MessageSquare className="h-5 w-5 text-cyan-600" />;
}

function getStatusBadge(status: InteractionStatus) {
  if (status === 'completed') {
    return <Badge variant="success">Completed</Badge>;
  }
  return <Badge variant="warning">Scheduled</Badge>;
}

export default function InteractionDetailPage() {
  const params = useParams();
  const interactionId = params.id as string;
  const interaction = getInteractionById(interactionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/account-manager" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Account Manager
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Interaction Details</h1>
          <p className="text-muted-foreground">Reference {interaction.id}</p>
        </div>
        {getStatusBadge(interaction.status)}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Interaction Type</p>
            <div className="mt-2 flex items-center gap-2 font-medium capitalize">
              {getTypeIcon(interaction.type)}
              {interaction.type}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Owner</p>
            <p className="mt-2 font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              {interaction.owner}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Date</p>
            <p className="mt-2 font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(interaction.date).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Participants</p>
            <p className="mt-2 font-medium">{interaction.participants.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{interaction.subject}</CardTitle>
          <CardDescription>{interaction.summary}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border p-4">
            <p className="text-sm text-muted-foreground mb-2">Objective</p>
            <p className="font-medium">{interaction.objective}</p>
          </div>

          <div className="rounded-md border p-4">
            <p className="text-sm text-muted-foreground mb-3">Participants</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {interaction.participants.map((participant) => (
                <div key={participant} className="text-sm rounded-md bg-muted/40 px-3 py-2">
                  {participant}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Key Notes
            </CardTitle>
            <CardDescription>Important highlights captured during this interaction.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {interaction.keyNotes.map((note) => (
              <div key={note} className="rounded-md border p-3 text-sm">
                {note}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Next Steps
            </CardTitle>
            <CardDescription>Action items generated from this discussion.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {interaction.nextSteps.map((step) => (
              <div key={step} className="rounded-md border p-3 text-sm flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-amber-600" />
                {step}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-2">
        <Link href="mailto:sarah.johnson@tradewave.io">
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Contact Account Manager
          </Button>
        </Link>
        <Link href="/account-manager">
          <Button variant="gradient">Done</Button>
        </Link>
      </div>
    </div>
  );
}
