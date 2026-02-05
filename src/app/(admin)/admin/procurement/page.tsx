'use client';

import { useState } from 'react';
import { 
  Search, Users, Star, Shield, CheckCircle, Send, 
  Package, Clock, Building2, Award, Filter, Sparkles
} from 'lucide-react';

interface Supplier {
  id: string;
  companyName: string;
  rating: number;
  totalTransactions: number;
  complianceTier: 'TRUSTED' | 'VERIFIED' | 'STANDARD';
  categories: string[];
  location: string;
  matchScore: number;
  certifications: string[];
}

interface Requirement {
  id: string;
  buyerCompany: string;
  buyerEmail: string;
  productType: string;
  quantity: number;
  unit: string;
  targetDeliveryDate: string;
  additionalNotes: string;
  status: 'VERIFIED' | 'AWAITING_SUPPLIER_SELECTION' | 'INVITATIONS_SENT' | 'AWAITING_QUOTATIONS' | 'QUOTATIONS_RECEIVED';
  verifiedAt: string;
  accountManager: string;
}

const mockRequirements: Requirement[] = [
  {
    id: 'REQ-2024-001',
    buyerCompany: 'TechCorp Industries',
    buyerEmail: 'john@techcorp.com',
    productType: 'Industrial Sensors',
    quantity: 5000,
    unit: 'pieces',
    targetDeliveryDate: '2024-03-15',
    additionalNotes: 'ISO 9001 certified suppliers preferred',
    status: 'VERIFIED',
    verifiedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    accountManager: 'Sarah Johnson',
  },
  {
    id: 'REQ-2024-002',
    buyerCompany: 'Global Manufacturing Co.',
    buyerEmail: 'mike@globalmanuf.com',
    productType: 'Steel Beams - Construction Grade',
    quantity: 100,
    unit: 'tons',
    targetDeliveryDate: '2024-04-01',
    additionalNotes: 'Need ASTM A36 grade',
    status: 'INVITATIONS_SENT',
    verifiedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    accountManager: 'David Chen',
  },
  {
    id: 'REQ-2024-003',
    buyerCompany: 'Premier Retail Ltd',
    buyerEmail: 'lisa@premierretail.com',
    productType: 'LED Display Panels',
    quantity: 200,
    unit: 'units',
    targetDeliveryDate: '2024-02-28',
    additionalNotes: '55-inch commercial grade displays',
    status: 'QUOTATIONS_RECEIVED',
    verifiedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    accountManager: 'Sarah Johnson',
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: 's1',
    companyName: 'SensorTech Solutions',
    rating: 4.9,
    totalTransactions: 342,
    complianceTier: 'TRUSTED',
    categories: ['Electronics', 'Sensors', 'IoT'],
    location: 'Shenzhen, China',
    matchScore: 95,
    certifications: ['ISO 9001', 'ISO 14001', 'CE'],
  },
  {
    id: 's2',
    companyName: 'Precision Components Ltd',
    rating: 4.7,
    totalTransactions: 189,
    complianceTier: 'VERIFIED',
    categories: ['Electronics', 'Sensors'],
    location: 'Seoul, South Korea',
    matchScore: 88,
    certifications: ['ISO 9001', 'RoHS'],
  },
  {
    id: 's3',
    companyName: 'Global Sensor Manufacturing',
    rating: 4.6,
    totalTransactions: 256,
    complianceTier: 'TRUSTED',
    categories: ['Sensors', 'Automation'],
    location: 'Tokyo, Japan',
    matchScore: 85,
    certifications: ['ISO 9001', 'ISO 14001', 'JIS'],
  },
  {
    id: 's4',
    companyName: 'SmartSense Technologies',
    rating: 4.5,
    totalTransactions: 124,
    complianceTier: 'VERIFIED',
    categories: ['Electronics', 'Sensors', 'Industrial'],
    location: 'Mumbai, India',
    matchScore: 82,
    certifications: ['ISO 9001', 'BIS'],
  },
  {
    id: 's5',
    companyName: 'EuroSensor GmbH',
    rating: 4.8,
    totalTransactions: 198,
    complianceTier: 'TRUSTED',
    categories: ['Sensors', 'Automation', 'Industrial'],
    location: 'Munich, Germany',
    matchScore: 79,
    certifications: ['ISO 9001', 'ISO 14001', 'CE', 'TUV'],
  },
];

const tierColors = {
  TRUSTED: 'bg-green-100 text-green-700',
  VERIFIED: 'bg-blue-100 text-blue-700',
  STANDARD: 'bg-gray-100 text-gray-700',
};

export default function ProcurementDashboard() {
  const [selectedReq, setSelectedReq] = useState<Requirement | null>(mockRequirements[0]);
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSupplierSelection = (id: string) => {
    if (selectedSuppliers.includes(id)) {
      setSelectedSuppliers(prev => prev.filter(s => s !== id));
    } else if (selectedSuppliers.length < 10) {
      setSelectedSuppliers(prev => [...prev, id]);
    }
  };

  const sendInvitations = () => {
    alert(`Quotation invitations sent to ${selectedSuppliers.length} suppliers!`);
    setSelectedSuppliers([]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Procurement Dashboard</h1>
          <p className="text-slate-400 mt-1">Curate top suppliers for verified requirements</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Requirements Queue */}
        <div className="bg-slate-800 rounded-xl border border-slate-700">
          <div className="p-4 border-b border-slate-700">
            <h2 className="text-lg font-semibold text-white">Ready for Matching</h2>
          </div>
          <div className="divide-y divide-slate-700">
            {mockRequirements.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedReq(req)}
                className={`p-4 cursor-pointer hover:bg-slate-700/50 transition-colors ${
                  selectedReq?.id === req.id ? 'bg-slate-700/50 border-l-2 border-blue-500' : ''
                }`}
              >
                <h3 className="font-medium text-white mb-1">{req.productType}</h3>
                <p className="text-sm text-slate-400">{req.buyerCompany}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {req.quantity.toLocaleString()} {req.unit}
                </p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-xs ${
                  req.status === 'VERIFIED' ? 'bg-blue-500/20 text-blue-400' :
                  req.status === 'INVITATIONS_SENT' ? 'bg-purple-500/20 text-purple-400' :
                  req.status === 'QUOTATIONS_RECEIVED' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {req.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Matching */}
        <div className="lg:col-span-3 space-y-6">
          {/* Manual Supplier Selection Info */}
          {selectedReq && (
            <div className="bg-gradient-to-r from-blue-900/50 to-slate-900/50 rounded-xl p-4 border border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white">Manual Supplier Selection</h3>
                  <p className="text-sm text-slate-300">
                    Browse and select suppliers for &quot;{selectedReq.productType}&quot; • Select 5-10 suppliers to send quotation requests
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-400">Verified by: <span className="text-white">{selectedReq.accountManager}</span></p>
                  <p className="text-slate-500">Buyer: {selectedReq.buyerCompany}</p>
                </div>
              </div>
            </div>
          )}

          {/* Selection Status */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">
                Selected: <strong className="text-white">{selectedSuppliers.length}</strong> suppliers (recommend 5-10)
              </span>
              {selectedSuppliers.length >= 5 && (
                <span className="text-green-400 text-sm">✓ Ready to send quotation requests</span>
              )}
            </div>
            <button
              onClick={sendInvitations}
              disabled={selectedSuppliers.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send Invitations ({selectedSuppliers.length})
            </button>
          </div>

          {/* Internal Search */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search internal supplier database..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400"
                />
              </div>
              <button className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {/* Suppliers Grid */}
            <div className="space-y-3">
              {suppliers.slice(0, 10).map((supplier, index) => (
                <div
                  key={supplier.id}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedSuppliers.includes(supplier.id)
                      ? 'bg-blue-900/30 border-blue-500'
                      : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => toggleSupplierSelection(supplier.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold">{supplier.companyName.charAt(0)}</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-white border border-slate-600">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{supplier.companyName}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tierColors[supplier.complianceTier]}`}>
                            {supplier.complianceTier}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">{supplier.location}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            {supplier.rating}
                          </span>
                          <span className="text-slate-400">
                            {supplier.totalTransactions} orders
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {supplier.certifications.slice(0, 3).map((cert) => (
                            <span key={cert} className="px-2 py-0.5 bg-slate-600 text-slate-300 text-xs rounded">
                              {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm text-slate-400">Match Score</span>
                        <span className={`text-lg font-bold ${
                          supplier.matchScore >= 90 ? 'text-green-400' :
                          supplier.matchScore >= 80 ? 'text-blue-400' :
                          'text-yellow-400'
                        }`}>
                          {supplier.matchScore}%
                        </span>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedSuppliers.includes(supplier.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-slate-500'
                      }`}>
                        {selectedSuppliers.includes(supplier.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
