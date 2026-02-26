'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Building2, Star, MapPin, Package, Filter, Eye, Send, CheckCircle } from 'lucide-react';

const CATEGORIES = ['All', 'Raw Materials', 'Textiles', 'Chemicals', 'Electronics', 'Plastics', 'Machinery'];
const LOCATIONS = ['All', 'Mumbai', 'Delhi', 'Chennai', 'Bangalore', 'Pune', 'Ahmedabad'];

const SUPPLIERS = [
  { id: 'SUP-001', name: 'Steel Industries Ltd', category: 'Raw Materials', location: 'Mumbai', rating: 4.8, orders: 156, products: ['Steel', 'Iron', 'Aluminum'], verified: true, responseTime: '2 hrs' },
  { id: 'SUP-002', name: 'Textile Masters', category: 'Textiles', location: 'Delhi', rating: 4.7, orders: 89, products: ['Cotton', 'Silk', 'Polyester'], verified: true, responseTime: '4 hrs' },
  { id: 'SUP-003', name: 'ChemPro Industries', category: 'Chemicals', location: 'Chennai', rating: 4.9, orders: 234, products: ['Industrial Chemicals', 'Solvents', 'Acids'], verified: true, responseTime: '1 hr' },
  { id: 'SUP-004', name: 'ElectroComponents', category: 'Electronics', location: 'Bangalore', rating: 4.5, orders: 67, products: ['Capacitors', 'Resistors', 'PCBs'], verified: true, responseTime: '3 hrs' },
  { id: 'SUP-005', name: 'Global Plastics', category: 'Plastics', location: 'Pune', rating: 4.3, orders: 45, products: ['PVC', 'HDPE', 'Packaging'], verified: false, responseTime: '6 hrs' },
  { id: 'SUP-006', name: 'Premium Metals Co', category: 'Raw Materials', location: 'Ahmedabad', rating: 4.6, orders: 112, products: ['Copper', 'Brass', 'Bronze'], verified: true, responseTime: '2 hrs' },
  { id: 'SUP-007', name: 'Cotton World', category: 'Textiles', location: 'Mumbai', rating: 4.4, orders: 78, products: ['Raw Cotton', 'Cotton Yarn', 'Fabric'], verified: true, responseTime: '5 hrs' },
  { id: 'SUP-008', name: 'Industrial Chemicals Co', category: 'Chemicals', location: 'Delhi', rating: 4.7, orders: 189, products: ['Paints', 'Coatings', 'Adhesives'], verified: true, responseTime: '2 hrs' },
];

export default function SupplierSearchPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [location, setLocation] = useState('All');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  const filtered = SUPPLIERS.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.products.some((p) => p.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === 'All' || s.category === category;
    const matchLocation = location === 'All' || s.location === location;
    const matchVerified = !verifiedOnly || s.verified;
    return matchSearch && matchCategory && matchLocation && matchVerified;
  });

  const toggleSelect = (id: string) => {
    setSelectedSuppliers((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Supplier Search</h1>
          <p className="text-slate-400">Find and select suppliers for requirements</p>
        </div>
        {selectedSuppliers.length > 0 && (
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Send className="h-4 w-4 mr-2" />
            Send Requirement to {selectedSuppliers.length} Suppliers
          </Button>
        )}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search suppliers or products..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className="px-3 py-2 rounded-md bg-slate-800 border border-slate-700 text-white">
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
            <Button variant={verifiedOnly ? 'default' : 'outline'} onClick={() => setVerifiedOnly(!verifiedOnly)} className="border-slate-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Verified Only
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-sm text-slate-400">{filtered.length} suppliers found</div>

      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((supplier) => (
          <Card key={supplier.id} className={`bg-slate-900 border-slate-800 cursor-pointer transition-all ${selectedSuppliers.includes(supplier.id) ? 'ring-2 ring-blue-500' : ''}`} onClick={() => toggleSelect(supplier.id)}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{supplier.name}</h3>
                      {supplier.verified && <Badge className="bg-green-500/20 text-green-400 text-xs">Verified</Badge>}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">{supplier.rating}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-slate-400">
                    <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">{supplier.category}</Badge>
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{supplier.location}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {supplier.products.map((p) => <Badge key={p} className="bg-slate-800 text-slate-300 text-xs">{p}</Badge>)}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800 text-sm">
                    <span className="text-slate-400"><Package className="h-4 w-4 inline mr-1" />{supplier.orders} orders</span>
                    <span className="text-slate-400">Response: {supplier.responseTime}</span>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); }} className="text-blue-400 hover:text-blue-300">
                      <Eye className="h-4 w-4 mr-1" />View Profile
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
