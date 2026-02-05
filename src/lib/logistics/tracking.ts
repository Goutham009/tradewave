import axios from 'axios';

export interface ShipmentUpdate {
  timestamp: Date;
  location: string;
  status: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

export type ShipmentStatus = 'IN_TRANSIT' | 'CUSTOMS' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'EXCEPTION';

export interface ShipmentInfo {
  trackingNumber: string;
  carrier: string;
  status: ShipmentStatus;
  origin: string;
  destination: string;
  estimatedDelivery: Date;
  currentLocation: string;
  updates: ShipmentUpdate[];
}

export type CarrierType = 'dhl' | 'fedex' | 'maersk' | 'ups';

export class LogisticsTrackingService {
  /**
   * Track shipment across multiple carriers
   */
  async trackShipment(trackingNumber: string, carrier: string): Promise<ShipmentInfo> {
    try {
      const carrierLower = carrier.toLowerCase() as CarrierType;
      switch (carrierLower) {
        case 'dhl':
          return await this.trackDHL(trackingNumber);
        case 'fedex':
          return await this.trackFedEx(trackingNumber);
        case 'maersk':
          return await this.trackMaersk(trackingNumber);
        case 'ups':
          return await this.trackUPS(trackingNumber);
        default:
          // Return mock data for unsupported carriers
          return this.getMockShipmentInfo(trackingNumber, carrier);
      }
    } catch (error) {
      console.error('Tracking error:', error);
      // Return mock data on error for demo purposes
      return this.getMockShipmentInfo(trackingNumber, carrier);
    }
  }

  /**
   * DHL Tracking Integration
   */
  private async trackDHL(trackingNumber: string): Promise<ShipmentInfo> {
    if (!process.env.DHL_API_KEY) {
      return this.getMockShipmentInfo(trackingNumber, 'DHL');
    }

    const response = await axios.get(
      'https://api-eu.dhl.com/track/shipments',
      {
        params: { trackingNumber },
        headers: { 'DHL-API-Key': process.env.DHL_API_KEY },
      }
    );

    const data = response.data.shipments[0];

    return {
      trackingNumber,
      carrier: 'DHL',
      status: this.mapDHLStatus(data.status.statusCode),
      origin: data.origin?.address?.addressLocality || 'Unknown',
      destination: data.destination?.address?.addressLocality || 'Unknown',
      estimatedDelivery: new Date(data.estimatedTimeOfDelivery),
      currentLocation: data.status?.location?.address?.addressLocality || 'Unknown',
      updates: data.events?.map((event: any) => ({
        timestamp: new Date(event.timestamp),
        location: event.location?.address?.addressLocality || 'Unknown',
        status: event.statusCode,
        description: event.description,
      })) || [],
    };
  }

  /**
   * FedEx Tracking Integration
   */
  private async trackFedEx(trackingNumber: string): Promise<ShipmentInfo> {
    if (!process.env.FEDEX_ACCESS_TOKEN) {
      return this.getMockShipmentInfo(trackingNumber, 'FedEx');
    }

    const response = await axios.post(
      'https://apis.fedex.com/track/v1/trackingnumbers',
      {
        trackingInfo: [{ trackingNumberInfo: { trackingNumber } }],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.FEDEX_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data.output.completeTrackResults[0].trackResults[0];

    return {
      trackingNumber,
      carrier: 'FedEx',
      status: this.mapFedExStatus(data.latestStatusDetail?.code || ''),
      origin: data.shipperInformation?.address?.city || 'Unknown',
      destination: data.recipientInformation?.address?.city || 'Unknown',
      estimatedDelivery: new Date(data.estimatedDeliveryTimeWindow?.window?.begins || Date.now()),
      currentLocation: data.latestStatusDetail?.scanLocation?.city || 'Unknown',
      updates: data.scanEvents?.map((event: any) => ({
        timestamp: new Date(event.date),
        location: event.scanLocation?.city || 'Unknown',
        status: event.eventType,
        description: event.eventDescription,
      })) || [],
    };
  }

  /**
   * Maersk Container Tracking (for sea freight)
   */
  private async trackMaersk(containerNumber: string): Promise<ShipmentInfo> {
    if (!process.env.MAERSK_API_KEY) {
      return this.getMockShipmentInfo(containerNumber, 'Maersk');
    }

    const response = await axios.get(
      `https://api.maersk.com/track/${containerNumber}`,
      {
        headers: { 'Consumer-Key': process.env.MAERSK_API_KEY },
      }
    );

    const data = response.data;

    return {
      trackingNumber: containerNumber,
      carrier: 'Maersk',
      status: this.mapMaerskStatus(data.status),
      origin: data.originLocation?.name || 'Unknown',
      destination: data.destinationLocation?.name || 'Unknown',
      estimatedDelivery: new Date(data.estimatedTimeOfArrival || Date.now()),
      currentLocation: data.currentLocation?.name || 'Unknown',
      updates: data.events?.map((event: any) => ({
        timestamp: new Date(event.eventDateTime),
        location: event.location?.name || 'Unknown',
        status: event.eventType,
        description: event.description,
        latitude: event.location?.latitude,
        longitude: event.location?.longitude,
      })) || [],
    };
  }

  /**
   * UPS Tracking Integration
   */
  private async trackUPS(trackingNumber: string): Promise<ShipmentInfo> {
    if (!process.env.UPS_ACCESS_TOKEN) {
      return this.getMockShipmentInfo(trackingNumber, 'UPS');
    }

    const response = await axios.post(
      `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${process.env.UPS_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data.trackResponse.shipment[0].package[0];

    return {
      trackingNumber,
      carrier: 'UPS',
      status: this.mapUPSStatus(data.currentStatus?.code || ''),
      origin: data.packageAddress?.[0]?.address?.city || 'Unknown',
      destination: data.packageAddress?.[1]?.address?.city || 'Unknown',
      estimatedDelivery: new Date(data.deliveryDate?.[0]?.date || Date.now()),
      currentLocation: data.currentStatus?.location || 'Unknown',
      updates: data.activity?.map((event: any) => ({
        timestamp: new Date(`${event.date} ${event.time}`),
        location: event.location?.address?.city || 'Unknown',
        status: event.status?.code,
        description: event.status?.description,
      })) || [],
    };
  }

  /**
   * Generate mock shipment data for demo/testing
   */
  private getMockShipmentInfo(trackingNumber: string, carrier: string): ShipmentInfo {
    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    
    return {
      trackingNumber,
      carrier,
      status: 'IN_TRANSIT',
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
      estimatedDelivery,
      currentLocation: 'Pacific Ocean - En Route',
      updates: [
        {
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          location: 'Shanghai Port, China',
          status: 'DEPARTED',
          description: 'Shipment departed from origin port',
        },
        {
          timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          location: 'Pacific Ocean',
          status: 'IN_TRANSIT',
          description: 'Shipment in transit via sea freight',
        },
        {
          timestamp: now,
          location: 'Pacific Ocean',
          status: 'IN_TRANSIT',
          description: 'Vessel on schedule - ETA 5 days',
        },
      ],
    };
  }

  // Status mapping helpers
  private mapDHLStatus(code: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      'transit': 'IN_TRANSIT',
      'customs': 'CUSTOMS',
      'delivery': 'OUT_FOR_DELIVERY',
      'delivered': 'DELIVERED',
    };
    return statusMap[code.toLowerCase()] || 'IN_TRANSIT';
  }

  private mapFedExStatus(code: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      'IT': 'IN_TRANSIT',
      'OD': 'OUT_FOR_DELIVERY',
      'DL': 'DELIVERED',
      'DE': 'EXCEPTION',
    };
    return statusMap[code] || 'IN_TRANSIT';
  }

  private mapMaerskStatus(status: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      'IN_TRANSIT': 'IN_TRANSIT',
      'CUSTOMS': 'CUSTOMS',
      'DELIVERED': 'DELIVERED',
    };
    return statusMap[status] || 'IN_TRANSIT';
  }

  private mapUPSStatus(code: string): ShipmentStatus {
    const statusMap: Record<string, ShipmentStatus> = {
      'I': 'IN_TRANSIT',
      'X': 'EXCEPTION',
      'D': 'DELIVERED',
      'O': 'OUT_FOR_DELIVERY',
    };
    return statusMap[code] || 'IN_TRANSIT';
  }
}

// Singleton instance
let trackingServiceInstance: LogisticsTrackingService | null = null;

export function getTrackingService(): LogisticsTrackingService {
  if (!trackingServiceInstance) {
    trackingServiceInstance = new LogisticsTrackingService();
  }
  return trackingServiceInstance;
}
