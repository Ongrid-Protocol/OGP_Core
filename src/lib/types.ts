export interface NodeData {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'warning';
  type: string;
  peerId: string;
  ipAddress: string;
  location: {
    lat: number;
    lng: number;
    country: string;
    region: string;
  };
  lastSeen: string;
  uptime: number;
  version: string;
}

export type SolarSetupType = 'generator' | 'consumer';

export interface NodeRegistrationData {
  id: string;
  peer_id: string;
  node_name: string;
  node_creation_number: number;
  device_type: string;
  contract_address: string;
  wallet_address: string;
  location: {
    latitude: number;
    longitude: number;
    country: {
      code: string;
      name: string;
      region: string;
    }
  };
  specifications: {
    max_daily_wattage: string;
    voltage_range: string;
    frequency_range: string;
    battery_capacity: string;
    phase_type: string;
  };
}

export type DeviceCounters = Record<SolarSetupType, Record<string, number>>;

export interface CountryInfo {
  code: string;
  name: string;
  region: string;
} 