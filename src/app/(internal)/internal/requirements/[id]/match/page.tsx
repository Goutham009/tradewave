'use client';

import React, { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search,
  ArrowLeft,
  Building2,
  Star,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Filter,
  SortAsc,
  BarChart3,
  Shield,
  Award,
  TrendingUp,
  Send,
  X,
  Eye,
  Scale,
  DollarSign,
  Truck,
  Users,
} from 'lucide-react';

interface Supplier {
  id: string;
  name: string;
  category: string;
  rating: number;
  location: string;
  completedOrders: number;
  matchScore: number;
  responseRate: number;
  avgDeliveryTime: string;
  priceLevel: 'budget' | 'mid' | 'premium';
  certifications: string[];
  minOrderValue: number;
  verified: boolean;
  specializations: string[];
  recentActivity: string;
}

interface Requirement {
  id: string;
  title: string;
  buyerName: string;
  category: string;
  quantity: number;
  budget: number;
  deliveryLocation: string;
  deadline: string;
  specifications: string;
}

const MOCK_REQUIREMENT: Requirement = {
  id: 'REQ-001',
  title: 'Steel Components for Manufacturing',
  buyerName: 'Acme Corporation',
  category: 'Raw Materials',
  quantity: 5000,
  budget: 25000,
  deliveryLocation: 'Mumbai, India',
  deadline: '2024-02-15',
  specifications: 'Grade A steel, ISO certified, with quality certificates',
};

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-001',
    name: 'Steel Industries Ltd',
    category: 'Raw Materials',
    rating: 4.8,
    location: 'Mumbai, India',
    completedOrders: 156,
    matchScore: 95,
    responseRate: 98,
    avgDeliveryTime: '3-5 days',
    priceLevel: 'mid',
    certifications: ['ISO 9001', 'ISO 14001'],
    minOrderValue: 5000,
    verified: true,
    specializations: ['Steel', 'Metals', 'Alloys'],
    recentActivity: '2 hours ago',
  },
  {
    id: 'SUP-002',
    name: 'Premium Metals Co',
    category: 'Raw Materials',
    rating: 4.6,
    location: 'Pune, India',
    completedOrders: 89,
    matchScore: 88,
    responseRate: 95,
    avgDeliveryTime: '4-6 days',
    priceLevel: 'premium',
    certifications: ['ISO 9001', 'ASTM'],
    minOrderValue: 10000,
    verified: true,
    specializations: ['Steel', 'Stainless Steel'],
    recentActivity: '1 day ago',
  },
  {
    id: 'SUP-003',
    name: 'MetalWorks India',
    category: 'Raw Materials',
    rating: 4.5,
    location: 'Delhi, India',
    completedOrders: 67,
    matchScore: 82,
    responseRate: 90,
    avgDeliveryTime: '5-7 days',
    priceLevel: 'budget',
    certifications: ['ISO 9001'],
    minOrderValue: 2000,
    verified: true,
    specializations: ['Steel', 'Iron', 'Fabrication'],
    recentActivity: '3 hours ago',
  },
  {
    id: 'SUP-004',
    name: 'Global Steel Supplies',
    category: 'Raw Materials',
    rating: 4.3,
    location: 'Ahmedabad, India',
    completedOrders: 45,
    matchScore: 75,
    responseRate: 85,
    avgDeliveryTime: '6-8 days',
    priceLevel: 'budget',
    certifications: ['ISO 9001'],
    minOrderValue: 3000,
    verified: false,
    specializations: ['Steel', 'Metals'],
    recentActivity: '5 hours ago',
  },
  {
    id: 'SUP-005',
    name: 'National Metal Corporation',
    category: 'Raw Materials',
    rating: 4.7,
    location: 'Chennai, India',
    completedOrders: 234,
    matchScore: 91,
    responseRate: 97,
    avgDeliveryTime: '3-5 days',
    priceLevel: 'mid',
    certifications: ['ISO 9001', 'ISO 14001', 'OHSAS'],
    minOrderValue: 8000,
    verified: true,
    specializations: ['Steel', 'Aluminum', 'Copper'],
    recentActivity: '30 mins ago',
  },
  {
    id: 'SUP-006',
    name: 'Eastern Steel Traders',
    category: 'Raw Materials',
    rating: 4.4,
    location: 'Kolkata, India',
    completedOrders: 78,
    matchScore: 79,
    responseRate: 88,
    avgDeliveryTime: '5-7 days',
    priceLevel: 'budget',
    certifications: ['ISO 9001'],
    minOrderValue: 1500,
    verified: true,
    specializations: ['Steel', 'Iron'],
    recentActivity: '1 day ago',
  },
];

const PRICE_LEVEL_CONFIG = {
  budget: { label: 'Budget', className: 'bg-green-500/20 text-green-400' },
  mid: { label: 'Mid-Range', className: 'bg-blue-500/20 text-blue-400' },
  premium: { label: 'Premium', className: 'bg-purple-500/20 text-purple-400' },
};

export default function SupplierMatchingPage() {
  const params = useParams();
  const router = useRouter();
  const requirementId = params.id as string;

  const [search, setSearch] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [sending, setSending] = useState(false);

  // Filters
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [priceLevelFilter, setPriceLevelFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('matchScore');

  const requirement = MOCK_REQUIREMENT;

  const filteredSuppliers = useMemo(() => {
    let result = MOCK_SUPPLIERS.filter((supplier) => {
      const matchesSearch = supplier.name.toLowerCase().includes(search.toLowerCase()) ||
        supplier.location.toLowerCase().includes(search.toLowerCase()) ||
        supplier.specializations.some(s => s.toLowerCase().includes(search.toLowerCase()));
      const matchesLocation = locationFilter === 'all' || supplier.location.includes(locationFilter);
      const matchesPriceLevel = priceLevelFilter === 'all' || supplier.priceLevel === priceLevelFilter;
      const matchesVerified = !verifiedOnly || supplier.verified;
      const matchesRating = minRating === 'all' || supplier.rating >= parseFloat(minRating);

      return matchesSearch && matchesLocation && matchesPriceLevel && matchesVerified && matchesRating;
    });

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return b.matchScore - a.matchScore;
        case 'rating':
          return b.rating - a.rating;
        case 'orders':
          return b.completedOrders - a.completedOrders;
        case 'responseRate':
          return b.responseRate - a.responseRate;
        default:
          return 0;
      }
    });

    return result;
  }, [search, locationFilter, priceLevelFilter, verifiedOnly, minRating, sortBy]);

  const handleSelectSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleSendToSuppliers = async () => {
    if (selectedSuppliers.length === 0) return;
    setSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSending(false);
    router.push('/internal/requirements');
  };

  const selectedSuppliersData = MOCK_SUPPLIERS.filter(s => selectedSuppliers.includes(s.id));
  const uniqueLocations = Array.from(new Set(MOCK_SUPPLIERS.map(s => s.location.split(',')[0])));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/internal/requirements')}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Match Suppliers</h1>
            <p className="text-slate-400">Find the best suppliers for this requirement</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCompareMode(!compareMode)}
            className={`border-slate-700 ${compareMode ? 'bg-blue-500/20 border-blue-500 text-blue-400' : ''}`}
            disabled={selectedSuppliers.length < 2}
          >
            <Scale className="h-4 w-4 mr-2" />
            Compare ({selectedSuppliers.length})
          </Button>
          <Button
            onClick={handleSendToSuppliers}
            disabled={selectedSuppliers.length === 0 || sending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="h-4 w-4 mr-2" />
            {sending ? 'Sending...' : `Send to ${selectedSuppliers.length} Suppliers`}
          </Button>
        </div>
      </div>

      {/* Requirement Summary */}
      <Card className="bg-gradient-to-r from-purple-900/30 to-slate-900 border-purple-500/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white">{requirement.title}</h3>
              <p className="text-slate-400 mt-1">{requirement.buyerName} • {requirement.category}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <span className="flex items-center gap-1 text-slate-300">
                  <Package className="h-4 w-4 text-slate-500" />
                  Qty: {requirement.quantity.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  Budget: ${requirement.budget.toLocaleString()}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  {requirement.deliveryLocation}
                </span>
                <span className="flex items-center gap-1 text-slate-300">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Deadline: {requirement.deadline}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters Section */}
      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search suppliers by name, location, specialization..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Location Filter */}
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700 text-white">
                <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Locations</SelectItem>
                {uniqueLocations.map((loc) => (
                  <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Price Level Filter */}
            <Select value={priceLevelFilter} onValueChange={setPriceLevelFilter}>
              <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700 text-white">
                <DollarSign className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Price Level" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">All Prices</SelectItem>
                <SelectItem value="budget">Budget</SelectItem>
                <SelectItem value="mid">Mid-Range</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>

            {/* Min Rating Filter */}
            <Select value={minRating} onValueChange={setMinRating}>
              <SelectTrigger className="w-[160px] bg-slate-800 border-slate-700 text-white">
                <Star className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Min Rating" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="all">Any Rating</SelectItem>
                <SelectItem value="4.5">4.5+ Stars</SelectItem>
                <SelectItem value="4.0">4.0+ Stars</SelectItem>
                <SelectItem value="3.5">3.5+ Stars</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-slate-800 border-slate-700 text-white">
                <SortAsc className="h-4 w-4 mr-2 text-slate-400" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="matchScore">Match Score</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="orders">Completed Orders</SelectItem>
                <SelectItem value="responseRate">Response Rate</SelectItem>
              </SelectContent>
            </Select>

            {/* Verified Only */}
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
              <Checkbox
                id="verified"
                checked={verifiedOnly}
                onCheckedChange={(checked) => setVerifiedOnly(checked as boolean)}
              />
              <label htmlFor="verified" className="text-sm text-slate-300 cursor-pointer">
                Verified Only
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compare Mode */}
      {compareMode && selectedSuppliers.length >= 2 && (
        <Card className="bg-slate-900 border-blue-500/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Scale className="h-5 w-5 text-blue-400" />
                Supplier Comparison
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setCompareMode(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-3 px-4 text-slate-400 font-medium">Metric</th>
                    {selectedSuppliersData.map((supplier) => (
                      <th key={supplier.id} className="text-left py-3 px-4 text-white font-medium">
                        {supplier.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-400">Match Score</td>
                    {selectedSuppliersData.map((supplier) => (
                      <td key={supplier.id} className="py-3 px-4">
                        <span className={`font-bold ${supplier.matchScore >= 90 ? 'text-green-400' : supplier.matchScore >= 80 ? 'text-blue-400' : 'text-yellow-400'}`}>
                          {supplier.matchScore}%
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-400">Rating</td>
                    {selectedSuppliersData.map((supplier) => (
                      <td key={supplier.id} className="py-3 px-4 text-yellow-400">
                        ⭐ {supplier.rating}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-400">Completed Orders</td>
                    {selectedSuppliersData.map((supplier) => (
                      <td key={supplier.id} className="py-3 px-4 text-white">
                        {supplier.completedOrders}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-400">Response Rate</td>
                    {selectedSuppliersData.map((supplier) => (
                      <td key={supplier.id} className="py-3 px-4 text-white">
                        {supplier.responseRate}%
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-400">Avg Delivery</td>
                    {selectedSuppliersData.map((supplier) => (
                      <td key={supplier.id} className="py-3 px-4 text-white">
                        {supplier.avgDeliveryTime}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-400">Price Level</td>
                    {selectedSuppliersData.map((supplier) => (
                      <td key={supplier.id} className="py-3 px-4">
                        <Badge className={PRICE_LEVEL_CONFIG[supplier.priceLevel].className}>
                          {PRICE_LEVEL_CONFIG[supplier.priceLevel].label}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-slate-800">
                    <td className="py-3 px-4 text-slate-400">Min Order</td>
                    {selectedSuppliersData.map((supplier) => (
                      <td key={supplier.id} className="py-3 px-4 text-white">
                        ${supplier.minOrderValue.toLocaleString()}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-3 px-4 text-slate-400">Certifications</td>
                    {selectedSuppliersData.map((supplier) => (
                      <td key={supplier.id} className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {supplier.certifications.map((cert) => (
                            <Badge key={cert} variant="outline" className="text-xs border-slate-600 text-slate-300">
                              {cert}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Suppliers Bar */}
      {selectedSuppliers.length > 0 && !compareMode && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium">{selectedSuppliers.length} suppliers selected</span>
            <div className="flex -space-x-2">
              {selectedSuppliersData.slice(0, 5).map((supplier) => (
                <div
                  key={supplier.id}
                  className="h-8 w-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-white"
                  title={supplier.name}
                >
                  {supplier.name.charAt(0)}
                </div>
              ))}
              {selectedSuppliers.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-slate-600 border-2 border-slate-900 flex items-center justify-center text-xs font-medium text-white">
                  +{selectedSuppliers.length - 5}
                </div>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedSuppliers([])}
            className="text-slate-400 hover:text-white"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredSuppliers.map((supplier) => (
          <Card
            key={supplier.id}
            className={`bg-slate-900 border-slate-800 cursor-pointer transition-all hover:border-slate-600 ${
              selectedSuppliers.includes(supplier.id) ? 'ring-2 ring-blue-500 border-blue-500' : ''
            }`}
            onClick={() => handleSelectSupplier(supplier.id)}
          >
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Checkbox
                    checked={selectedSuppliers.includes(supplier.id)}
                    onCheckedChange={() => handleSelectSupplier(supplier.id)}
                    className="absolute -top-1 -left-1 z-10"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="h-14 w-14 rounded-lg bg-slate-800 flex items-center justify-center ml-2">
                    <Building2 className="h-7 w-7 text-slate-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-white">{supplier.name}</h3>
                    {supplier.verified && (
                      <Badge className="bg-green-500/20 text-green-400 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge className={PRICE_LEVEL_CONFIG[supplier.priceLevel].className}>
                      {PRICE_LEVEL_CONFIG[supplier.priceLevel].label}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {supplier.location}
                  </p>

                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-4 mt-3 text-sm">
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      {supplier.rating}
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Package className="h-4 w-4 text-slate-500" />
                      {supplier.completedOrders} orders
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <TrendingUp className="h-4 w-4 text-slate-500" />
                      {supplier.responseRate}% response
                    </span>
                    <span className="flex items-center gap-1 text-slate-300">
                      <Truck className="h-4 w-4 text-slate-500" />
                      {supplier.avgDeliveryTime}
                    </span>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {supplier.specializations.map((spec) => (
                      <Badge key={spec} variant="outline" className="text-xs border-slate-700 text-slate-400">
                        {spec}
                      </Badge>
                    ))}
                  </div>

                  {/* Certifications */}
                  <div className="flex items-center gap-2 mt-3">
                    <Award className="h-4 w-4 text-slate-500" />
                    <div className="flex gap-1">
                      {supplier.certifications.map((cert) => (
                        <span key={cert} className="text-xs text-slate-400">{cert}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Match Score */}
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    supplier.matchScore >= 90 ? 'text-green-400' :
                    supplier.matchScore >= 80 ? 'text-blue-400' :
                    'text-yellow-400'
                  }`}>
                    {supplier.matchScore}%
                  </div>
                  <p className="text-xs text-slate-500">match</p>
                  <p className="text-xs text-slate-500 mt-2">Active {supplier.recentActivity}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <Card className="bg-slate-900 border-slate-800">
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">No suppliers found</h3>
            <p className="text-slate-400">Try adjusting your filters or search terms.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
