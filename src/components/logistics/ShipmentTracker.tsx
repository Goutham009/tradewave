'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Clock, Package, AlertTriangle, CheckCircle, Map } from 'lucide-react';

interface ShipmentTrackerProps {
  transactionId: string;
}

interface ShipmentUpdate {
  timestamp: string;
  location: string;
  status: string;
  description: string;
}

interface ShipmentInfo {
  trackingNumber: string;
  carrier: string;
  status: 'IN_TRANSIT' | 'CUSTOMS' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'EXCEPTION';
  origin: string;
  destination: string;
  estimatedDelivery: string;
  currentLocation: string;
  updates: ShipmentUpdate[];
}

const STATUS_CONFIG = {
  IN_TRANSIT: { color: 'blue', icon: Truck, label: 'In Transit' },
  CUSTOMS: { color: 'yellow', icon: Package, label: 'Customs Clearance' },
  OUT_FOR_DELIVERY: { color: 'purple', icon: Truck, label: 'Out for Delivery' },
  DELIVERED: { color: 'green', icon: CheckCircle, label: 'Delivered' },
  EXCEPTION: { color: 'red', icon: AlertTriangle, label: 'Exception' },
};

export function ShipmentTracker({ transactionId }: ShipmentTrackerProps) {
  const [shipmentInfo, setShipmentInfo] = useState<ShipmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchShipmentInfo();
    const interval = setInterval(fetchShipmentInfo, 120000);
    return () => clearInterval(interval);
  }, [transactionId]);

  const fetchShipmentInfo = async () => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}/shipment`);
      if (response.ok) {
        const data = await response.json();
        setShipmentInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch shipment info:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-neutral-100 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!shipmentInfo) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Package className="w-12 h-12 mx-auto text-neutral-300 mb-4" />
          <p className="text-neutral-500">Shipment information not available yet</p>
          <p className="text-sm text-neutral-400 mt-1">Tracking will be available once goods are dispatched</p>
        </div>
      </Card>
    );
  }

  const statusConfig = STATUS_CONFIG[shipmentInfo.status] || STATUS_CONFIG.IN_TRANSIT;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="space-y-6">
      {/* Shipment Summary */}
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-2">Shipment Tracking</h3>
            <p className="text-sm text-neutral-600">
              Tracking #: <span className="font-mono font-semibold">{shipmentInfo.trackingNumber}</span>
            </p>
          </div>
          <Badge variant={statusConfig.color as any} className="flex items-center gap-1">
            <StatusIcon className="w-3 h-3" />
            {statusConfig.label}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Carrier</p>
            <p className="font-semibold">{shipmentInfo.carrier}</p>
          </div>
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Current Location</p>
            <p className="font-semibold flex items-center gap-1">
              <MapPin className="w-4 h-4 text-teal-500" />
              {shipmentInfo.currentLocation}
            </p>
          </div>
          <div className="bg-neutral-50 p-3 rounded-lg">
            <p className="text-sm text-neutral-600 mb-1">Est. Delivery</p>
            <p className="font-semibold flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              {new Date(shipmentInfo.estimatedDelivery).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Route Display */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg">
          <div className="flex-1">
            <p className="text-xs text-neutral-500 mb-1">From</p>
            <p className="font-semibold text-teal-700">{shipmentInfo.origin}</p>
          </div>
          <div className="flex items-center">
            <div className="w-8 h-0.5 bg-teal-300"></div>
            <Truck className="w-6 h-6 text-teal-500 mx-2" />
            <div className="w-8 h-0.5 bg-blue-300"></div>
          </div>
          <div className="flex-1 text-right">
            <p className="text-xs text-neutral-500 mb-1">To</p>
            <p className="font-semibold text-blue-700">{shipmentInfo.destination}</p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowMap(!showMap)}
        >
          <Map className="w-4 h-4 mr-2" />
          {showMap ? 'Hide Map' : 'Show Route Map'}
        </Button>
      </Card>

      {/* Map View */}
      {showMap && (
        <Card className="p-6">
          <div className="w-full h-64 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <Map className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500">Map visualization</p>
              <p className="text-sm text-neutral-400">Integrate with Google Maps or Mapbox</p>
            </div>
          </div>
        </Card>
      )}

      {/* Tracking Updates */}
      <Card className="p-6">
        <h4 className="font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Tracking Updates
        </h4>
        <div className="space-y-4">
          {shipmentInfo.updates.map((update, index) => (
            <div
              key={index}
              className="flex gap-4 pb-4 border-b border-neutral-100 last:border-0 last:pb-0"
            >
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full ${
                  index === 0 ? 'bg-teal-500' : 'bg-neutral-300'
                }`} />
                {index < shipmentInfo.updates.length - 1 && (
                  <div className="w-0.5 flex-1 bg-neutral-200 mt-2" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-medium">{update.description}</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(update.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-neutral-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {update.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
