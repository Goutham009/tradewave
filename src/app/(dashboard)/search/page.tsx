'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, Bookmark, Grid, List, ChevronDown } from 'lucide-react';

interface SearchResult {
  id: string;
  resultType: string;
  title?: string;
  name?: string;
  companyName?: string;
  description?: string;
  category?: string;
  budgetMin?: number;
  budgetMax?: number;
}

interface SavedSearch {
  id: string;
  searchName: string;
  searchQuery: string;
  searchType: string;
  notifyOnNewMatches: boolean;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [searchType, setSearchType] = useState('PRODUCT');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    category: ''
  });

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const res = await fetch('/api/search/saved');
      const data = await res.json();
      setSavedSearches(data.savedSearches || []);
    } catch (error) {
      console.error('Failed to fetch saved searches:', error);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          type: searchType,
          filters: {
            minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
            maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
            category: filters.category || undefined
          },
          page,
          limit: 20
        })
      });
      const data = await res.json();
      setResults(data.results || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSearch = async () => {
    if (!query.trim()) return;

    try {
      const res = await fetch('/api/search/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchName: query,
          searchQuery: query,
          searchFilters: filters,
          searchType,
          notifyOnNewMatches: false
        })
      });

      if (res.ok) {
        fetchSavedSearches();
      }
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const deleteSavedSearch = async (id: string) => {
    try {
      await fetch(`/api/search/saved?id=${id}`, { method: 'DELETE' });
      fetchSavedSearches();
    } catch (error) {
      console.error('Failed to delete saved search:', error);
    }
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setQuery(search.searchQuery);
    setSearchType(search.searchType);
    handleSearch();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Search</h1>
        <p className="text-slate-400">Find products, sellers, and buyers</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for products, sellers, or buyers..."
              className="w-full pl-12 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
            className="px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
          >
            <option value="PRODUCT">Products</option>
            <option value="SELLER">Sellers</option>
            <option value="BUYER">Buyers</option>
            <option value="ALL">All</option>
          </select>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-lg border ${
              showFilters ? 'bg-blue-600 border-blue-600' : 'bg-slate-900 border-slate-700'
            } text-white`}
          >
            <Filter className="w-5 h-5" />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-lg text-white font-medium"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="10000"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Category</label>
                <input
                  type="text"
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  placeholder="Electronics"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Saved Searches</h3>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <div
                key={search.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 rounded-lg"
              >
                <button
                  onClick={() => loadSavedSearch(search)}
                  className="text-slate-300 hover:text-white text-sm"
                >
                  {search.searchName}
                </button>
                <button
                  onClick={() => deleteSavedSearch(search.id)}
                  className="text-slate-500 hover:text-red-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      {results.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-slate-400">
            Found <span className="text-white font-semibold">{total}</span> results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={saveSearch}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm"
            >
              <Bookmark className="w-4 h-4" /> Save Search
            </button>
            <div className="flex bg-slate-800 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg ${viewMode === 'grid' ? 'bg-blue-600' : ''}`}
              >
                <Grid className="w-4 h-4 text-white" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg ${viewMode === 'list' ? 'bg-blue-600' : ''}`}
              >
                <List className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : results.length === 0 && query ? (
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 text-center">
          <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Results Found</h3>
          <p className="text-slate-400">Try adjusting your search terms or filters</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-4'
        }>
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-slate-900 rounded-xl border border-slate-800 p-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-0.5 rounded text-xs ${
                  result.resultType === 'PRODUCT' ? 'bg-blue-500/20 text-blue-400' :
                  result.resultType === 'SELLER' ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  {result.resultType}
                </span>
              </div>
              <h3 className="text-white font-semibold mb-1">
                {result.title || result.name || result.companyName || 'Unknown'}
              </h3>
              {result.description && (
                <p className="text-slate-400 text-sm line-clamp-2 mb-2">{result.description}</p>
              )}
              {result.category && (
                <p className="text-slate-500 text-sm">Category: {result.category}</p>
              )}
              {(result.budgetMin || result.budgetMax) && (
                <p className="text-green-400 font-semibold mt-2">
                  ${result.budgetMin?.toLocaleString()} - ${result.budgetMax?.toLocaleString()}
                </p>
              )}
              <a
                href={`/${result.resultType.toLowerCase()}s/${result.id}`}
                className="mt-3 block text-center px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 text-sm"
              >
                View Details
              </a>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => { setPage(p => Math.max(1, p - 1)); handleSearch(); }}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-white"
          >
            Previous
          </button>
          <span className="text-slate-400">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            onClick={() => { setPage(p => p + 1); handleSearch(); }}
            disabled={page >= Math.ceil(total / 20)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 rounded-lg text-white"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
