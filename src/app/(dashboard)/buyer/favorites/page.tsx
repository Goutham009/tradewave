'use client';

import { useState, useEffect } from 'react';
import { Heart, Building2, Star, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface Favorite {
  id: string;
  type: string;
  supplierId: string | null;
  notes: string | null;
  createdAt: string;
  supplier: {
    id: string;
    name: string;
    companyName: string | null;
    avatar: string | null;
    trustScore: number | null;
  } | null;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('SUPPLIER');

  useEffect(() => {
    fetchFavorites();
  }, [filter]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`/api/buyer/favorites?type=${filter}`);
      const data = await res.json();
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id: string) => {
    try {
      await fetch(`/api/buyer/favorites/${id}`, { method: 'DELETE' });
      setFavorites(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-gray-500">Loading favorites...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Favorite Suppliers</h1>
          <p className="text-gray-500 mt-1">Suppliers you&rsquo;ve marked as favorites</p>
        </div>
        <div className="flex gap-2">
          {['SUPPLIER', 'PRODUCT', 'CATEGORY'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}s
            </button>
          ))}
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-4">Add suppliers to your favorites for quick access</p>
          <Link href="/suppliers" className="text-blue-600 hover:underline">
            Discover Suppliers →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    {favorite.supplier?.avatar ? (
                      <img
                        src={favorite.supplier.avatar}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {favorite.supplier?.companyName || favorite.supplier?.name || 'Unknown'}
                    </h3>
                    {favorite.supplier?.trustScore && (
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        {favorite.supplier.trustScore.toFixed(1)} Trust Score
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFavorite(favorite.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {favorite.notes && (
                <p className="text-gray-500 text-sm mb-4 italic">&ldquo;{favorite.notes}&rdquo;</p>
              )}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Added {new Date(favorite.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/suppliers/${favorite.supplierId}`}
                  className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                >
                  View Profile <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
