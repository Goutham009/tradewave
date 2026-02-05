'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Download, Users, Building2, MapPin, Award, Star, CheckCircle } from 'lucide-react';

interface Supplier {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  tier: 'TRUSTED' | 'STANDARD' | 'REVIEW';
  productCategories: string[];
  location: string;
  certifications: string[];
  rating: number;
  completedTransactions: number;
}

interface InternalSupplierSearchToolProps {
  requirementId?: string;
  onSuppliersSelected?: (supplierIds: string[]) => void;
}

const mockSuppliers: Supplier[] = [
  {
    id: 'sup-001',
    companyName: 'Industrial Solutions Ltd',
    contactName: 'Robert Chen',
    email: 'robert@industrialsolutions.com',
    tier: 'TRUSTED',
    productCategories: ['Industrial Sensors', 'Automation Equipment'],
    location: 'Shenzhen, China',
    certifications: ['ISO 9001', 'ISO 14001'],
    rating: 4.8,
    completedTransactions: 156,
  },
  {
    id: 'sup-002',
    companyName: 'TechParts Manufacturing',
    contactName: 'Sarah Kim',
    email: 'sarah@techparts.com',
    tier: 'TRUSTED',
    productCategories: ['Electronic Components', 'Industrial Sensors'],
    location: 'Seoul, South Korea',
    certifications: ['ISO 9001', 'CE'],
    rating: 4.7,
    completedTransactions: 89,
  },
  {
    id: 'sup-003',
    companyName: 'Global Precision Co.',
    contactName: 'Michael Wang',
    email: 'michael@globalprecision.com',
    tier: 'STANDARD',
    productCategories: ['Precision Instruments', 'Industrial Sensors'],
    location: 'Taipei, Taiwan',
    certifications: ['ISO 9001'],
    rating: 4.5,
    completedTransactions: 45,
  },
  {
    id: 'sup-004',
    companyName: 'MetalWorks Industries',
    contactName: 'James Miller',
    email: 'james@metalworks.com',
    tier: 'STANDARD',
    productCategories: ['Steel Products', 'Metal Components'],
    location: 'Mumbai, India',
    certifications: ['ISO 9001', 'ASTM'],
    rating: 4.3,
    completedTransactions: 67,
  },
  {
    id: 'sup-005',
    companyName: 'NewTech Suppliers',
    contactName: 'Emily Zhang',
    email: 'emily@newtech.com',
    tier: 'REVIEW',
    productCategories: ['Electronic Components', 'LED Products'],
    location: 'Guangzhou, China',
    certifications: ['CE'],
    rating: 4.0,
    completedTransactions: 12,
  },
];

export function InternalSupplierSearchTool({ requirementId, onSuppliersSelected }: InternalSupplierSearchToolProps) {
  const [filters, setFilters] = useState({
    productCategory: '',
    location: '',
    certifications: '',
    minTier: '',
  });
  
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filtered = [...mockSuppliers];
    
    if (filters.productCategory) {
      filtered = filtered.filter(s => 
        s.productCategories.some(cat => 
          cat.toLowerCase().includes(filters.productCategory.toLowerCase())
        )
      );
    }
    
    if (filters.location) {
      filtered = filtered.filter(s => 
        s.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    
    if (filters.certifications) {
      filtered = filtered.filter(s => 
        s.certifications.some(cert => 
          cert.toLowerCase().includes(filters.certifications.toLowerCase())
        )
      );
    }
    
    if (filters.minTier) {
      if (filters.minTier === 'TRUSTED') {
        filtered = filtered.filter(s => s.tier === 'TRUSTED');
      } else if (filters.minTier === 'STANDARD') {
        filtered = filtered.filter(s => s.tier === 'TRUSTED' || s.tier === 'STANDARD');
      }
    }
    
    setSuppliers(filtered);
    setHasSearched(true);
    setIsSearching(false);
    setSelectedSuppliers([]);
    setSelectAll(false);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedSuppliers([]);
      setSelectAll(false);
    } else {
      setSelectedSuppliers(suppliers.map(s => s.id));
      setSelectAll(true);
    }
    onSuppliersSelected?.(selectAll ? [] : suppliers.map(s => s.id));
  };

  const toggleSupplierSelection = (id: string) => {
    let newSelected: string[];
    if (selectedSuppliers.includes(id)) {
      newSelected = selectedSuppliers.filter(s => s !== id);
    } else {
      newSelected = [...selectedSuppliers, id];
    }
    setSelectedSuppliers(newSelected);
    setSelectAll(newSelected.length === suppliers.length);
    onSuppliersSelected?.(newSelected);
  };

  const handleBulkSendQuotations = async () => {
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier');
      return;
    }

    if (!requirementId) {
      alert('No requirement selected');
      return;
    }

    try {
      const response = await fetch('/api/admin/quotation-requests/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requirementId,
          supplierIds: selectedSuppliers,
        }),
      });

      if (response.ok) {
        alert(`Quotation requests sent to ${selectedSuppliers.length} suppliers`);
        setSelectedSuppliers([]);
        setSelectAll(false);
      } else {
        alert('Failed to send quotation requests');
      }
    } catch {
      alert('Error sending quotation requests');
    }
  };

  const handleBulkAddToShortlist = async () => {
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier');
      return;
    }

    try {
      const response = await fetch('/api/admin/suppliers/add-to-shortlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierIds: selectedSuppliers,
        }),
      });

      if (response.ok) {
        alert(`${selectedSuppliers.length} suppliers added to shortlist`);
      } else {
        alert('Failed to add suppliers to shortlist');
      }
    } catch {
      alert('Error adding suppliers to shortlist');
    }
  };

  const convertToCSV = (data: Supplier[]) => {
    const headers = ['Company Name', 'Contact', 'Email', 'Tier', 'Location', 'Rating', 'Transactions', 'Certifications'];
    const rows = data.map(s => [
      s.companyName,
      s.contactName,
      s.email,
      s.tier,
      s.location,
      s.rating.toString(),
      s.completedTransactions.toString(),
      s.certifications.join('; '),
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  };

  const handleBulkExport = () => {
    if (selectedSuppliers.length === 0) {
      alert('Please select at least one supplier');
      return;
    }

    const selectedData = suppliers.filter(s => selectedSuppliers.includes(s.id));
    const csv = convertToCSV(selectedData);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-suppliers.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'TRUSTED': return 'success';
      case 'STANDARD': return 'info';
      case 'REVIEW': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Search className="w-5 h-5" />
          Supplier Search Filters
        </h3>
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Product Category
            </label>
            <input
              type="text"
              placeholder="e.g., Industrial Sensors"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filters.productCategory}
              onChange={(e) => setFilters({ ...filters, productCategory: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Location
            </label>
            <input
              type="text"
              placeholder="e.g., China, India"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Certifications
            </label>
            <input
              type="text"
              placeholder="e.g., ISO 9001"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filters.certifications}
              onChange={(e) => setFilters({ ...filters, certifications: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Minimum Tier
            </label>
            <select
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={filters.minTier}
              onChange={(e) => setFilters({ ...filters, minTier: e.target.value })}
            >
              <option value="">All Tiers</option>
              <option value="TRUSTED">Trusted Only</option>
              <option value="STANDARD">Standard & Above</option>
            </select>
          </div>
        </div>

        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? 'Searching...' : 'Search Suppliers'}
        </Button>
      </Card>

      {/* Supplier Results with Bulk Actions */}
      {hasSearched && (
        <div>
          {suppliers.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-neutral-500">No suppliers found matching your criteria.</p>
            </Card>
          ) : (
            <>
              {/* Bulk Action Bar */}
              <Card className="p-4 mb-4 bg-neutral-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                      <span className="text-sm font-medium">Select All</span>
                    </div>
                    <span className="text-sm text-neutral-600">
                      {selectedSuppliers.length} of {suppliers.length} selected
                    </span>
                  </div>

                  {selectedSuppliers.length > 0 && (
                    <div className="flex gap-2">
                      <Button 
                        size="sm"
                        onClick={handleBulkSendQuotations}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Send Quotation Requests ({selectedSuppliers.length})
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleBulkAddToShortlist}
                      >
                        Add to Shortlist
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleBulkExport}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Selected
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Supplier List */}
              <div className="space-y-4">
                {suppliers.map((supplier) => (
                  <Card key={supplier.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedSuppliers.includes(supplier.id)}
                        onCheckedChange={() => toggleSupplierSelection(supplier.id)}
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Building2 className="w-5 h-5 text-neutral-500" />
                          <h4 className="text-lg font-bold">{supplier.companyName}</h4>
                          <Badge variant={getTierBadgeVariant(supplier.tier)}>
                            {supplier.tier}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-neutral-600 mb-1">
                              <strong>Contact:</strong> {supplier.contactName}
                            </p>
                            <p className="text-sm text-neutral-600 mb-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {supplier.location}
                            </p>
                            <p className="text-sm text-neutral-600">
                              <strong>Products:</strong> {supplier.productCategories.join(', ')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-neutral-600 mb-1 flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              <strong>Certifications:</strong> {supplier.certifications.join(', ')}
                            </p>
                            <div className="flex gap-4 mt-2">
                              <span className="text-sm flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                {supplier.rating.toFixed(1)}/5.0
                              </span>
                              <span className="text-sm flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                {supplier.completedTransactions} completed orders
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
