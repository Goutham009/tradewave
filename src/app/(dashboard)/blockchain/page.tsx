'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Link as LinkIcon,
  FileCheck,
  Shield,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
  Hash,
  FileText,
  Activity,
  Database,
} from 'lucide-react';

const mockDocuments = [
  {
    id: 'DOC-001',
    name: 'Invoice_TXN-2024-001.pdf',
    type: 'INVOICE',
    transactionId: 'TXN-2024-001',
    hash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    registeredAt: '2024-01-15T10:30:00Z',
    registeredBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE14',
    verified: true,
    blockNumber: 18945632,
    txHash: '0x8a7d45ff3b892dc18148a1d65dfc2d4b1fa3d677284addd200126d90697f83b1',
  },
  {
    id: 'DOC-002',
    name: 'Quality_Certificate.pdf',
    type: 'CERTIFICATE',
    transactionId: 'TXN-2024-001',
    hash: '0x3e23e8160039594a33894f6564e1b1348bbd7a0088d42c4acb73eeaed59c009d',
    registeredAt: '2024-01-20T14:45:00Z',
    registeredBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE14',
    verified: true,
    blockNumber: 18956789,
    txHash: '0x9b8e56ff4c903ed29259b2e76gfd3e5c2gb4e788395bef301237e01798g94c2',
  },
  {
    id: 'DOC-003',
    name: 'Packing_List.pdf',
    type: 'PACKING_LIST',
    transactionId: 'TXN-2024-001',
    hash: '0xa591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    registeredAt: '2024-01-22T09:15:00Z',
    registeredBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE14',
    verified: true,
    blockNumber: 18967890,
    txHash: '0x1c9f67gg5d014fe3a360c3f87hge4f6d3hc5f899406cfg412348f12809h05d3',
  },
];

const mockAuditLogs = [
  {
    id: 1,
    action: 'TRANSACTION_INITIATED',
    transactionId: 'TXN-2024-001',
    entityType: 'Transaction',
    actor: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE14',
    timestamp: '2024-01-15T10:00:00Z',
    blockNumber: 18945600,
    txHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    details: 'Transaction initiated for Steel Components order',
  },
  {
    id: 2,
    action: 'ESCROW_FUNDS_HELD',
    transactionId: 'TXN-2024-001',
    entityType: 'Escrow',
    actor: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE14',
    timestamp: '2024-01-15T10:30:00Z',
    blockNumber: 18945632,
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    details: 'Escrow funds held: $22,500 USD',
  },
  {
    id: 3,
    action: 'DOCUMENT_REGISTERED',
    transactionId: 'TXN-2024-001',
    entityType: 'Document',
    actor: '0x742d35Cc6634C0532925a3b844Bc9e7595f8fE14',
    timestamp: '2024-01-15T10:35:00Z',
    blockNumber: 18945640,
    txHash: '0xfedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
    details: 'Invoice document hash registered on blockchain',
  },
  {
    id: 4,
    action: 'STATUS_UPDATED',
    transactionId: 'TXN-2024-001',
    entityType: 'Transaction',
    actor: '0x891e56Dd7745D1643926b4c955Cd0a8696f9gH25',
    timestamp: '2024-01-17T16:00:00Z',
    blockNumber: 18950100,
    txHash: '0x5678901234abcdef5678901234abcdef5678901234abcdef5678901234abcdef',
    details: 'Status changed to PRODUCTION',
  },
  {
    id: 5,
    action: 'MILESTONE_RECORDED',
    transactionId: 'TXN-2024-001',
    entityType: 'Milestone',
    actor: '0x891e56Dd7745D1643926b4c955Cd0a8696f9gH25',
    timestamp: '2024-01-22T11:00:00Z',
    blockNumber: 18967500,
    txHash: '0x9012345678abcdef9012345678abcdef9012345678abcdef9012345678abcdef',
    details: 'Order shipped - tracking number added',
  },
];

const truncateHash = (hash: string) => {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
};

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export default function BlockchainPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [verifyHash, setVerifyHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<null | { verified: boolean; document?: any }>(null);

  const handleVerify = () => {
    const found = mockDocuments.find(doc => 
      doc.hash.toLowerCase() === verifyHash.toLowerCase()
    );
    if (found) {
      setVerificationResult({ verified: true, document: found });
    } else {
      setVerificationResult({ verified: false });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Blockchain Records</h1>
          <p className="text-muted-foreground">
            Verify documents and view immutable audit trail
          </p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1">
          <Activity className="mr-1 h-3 w-3" />
          Network: Sepolia
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <FileCheck className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockDocuments.length}</div>
                <p className="text-sm text-muted-foreground">Verified Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Activity className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">{mockAuditLogs.length}</div>
                <p className="text-sm text-muted-foreground">Audit Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">2</div>
                <p className="text-sm text-muted-foreground">Smart Contracts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Shield className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <div className="text-2xl font-bold">100%</div>
                <p className="text-sm text-muted-foreground">Verification Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Document Verification
          </CardTitle>
          <CardDescription>
            Enter a document hash to verify its authenticity on the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Hash className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter document hash (0x...)"
                value={verifyHash}
                onChange={(e) => setVerifyHash(e.target.value)}
                className="pl-10 font-mono text-sm"
              />
            </div>
            <Button onClick={handleVerify} variant="gradient">
              <Search className="mr-2 h-4 w-4" />
              Verify
            </Button>
          </div>

          {verificationResult && (
            <div className={`mt-4 p-4 rounded-lg ${
              verificationResult.verified 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {verificationResult.verified ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-semibold">Document Verified</span>
                  </div>
                  <div className="text-sm text-green-600">
                    <p>Document: {verificationResult.document?.name}</p>
                    <p>Registered: {new Date(verificationResult.document?.registeredAt).toLocaleString()}</p>
                    <p>Block: #{verificationResult.document?.blockNumber}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700">
                  <Shield className="h-5 w-5" />
                  <span className="font-semibold">Document Not Found</span>
                  <span className="text-sm">- This hash is not registered on the blockchain</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">
            <FileText className="mr-2 h-4 w-4" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="audit">
            <Activity className="mr-2 h-4 w-4" />
            Audit Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          {mockDocuments.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <FileCheck className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{doc.name}</h4>
                        <Badge variant="success">Verified</Badge>
                        <Badge variant="outline">{doc.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Transaction: {doc.transactionId}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                        <span>Hash: {truncateHash(doc.hash)}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(doc.hash)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Block #{doc.blockNumber}</p>
                    <p className="text-muted-foreground">
                      {new Date(doc.registeredAt).toLocaleDateString()}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View on Explorer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          {mockAuditLogs.map((log) => (
            <Card key={log.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      <Activity className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{log.action.replace(/_/g, ' ')}</h4>
                        <Badge variant="outline">{log.entityType}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Transaction: {log.transactionId}</span>
                        <span className="font-mono">Actor: {truncateHash(log.actor)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Block #{log.blockNumber}</p>
                    <p className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </p>
                    <Button variant="ghost" size="sm" className="mt-2">
                      <ExternalLink className="mr-1 h-3 w-3" />
                      View TX
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
