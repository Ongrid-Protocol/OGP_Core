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
  node_creation_number: number; // Will be converted to u64 when sent to canister
  device_type: string;
  contract_address: string;
  wallet_address: string;
  location: {
    latitude: number; // Will be converted to f64 when sent to canister
    longitude: number; // Will be converted to f64 when sent to canister
    altitude: number; // Altitude in meters
    accuracy: number; // Accuracy of location in meters
    satellites: number; // Number of satellites used for location
    timestamp: number; // Timestamp in seconds since epoch
    country: {
      code: string;
      name: string;
      region: string;
    }
  };
  specifications: {
    max_wattage: number; // Maximum wattage in watts
    voltage_range: string; // Range of voltage e.g. "220-240"
    frequency_range: number; // Frequency in Hz
    battery_capacity: number; // Battery capacity in Ah
    phase_type: string; // "single" or "three"
  };
}

export type DeviceCounters = Record<SolarSetupType, Record<string, number>>;

export interface CountryInfo {
  code: string;
  name: string;
  region: string;
}

// Interface for canister API calls to ensure type safety
export interface CanisterNodeDetails {
  id: string;
  nodeName: string;
  deviceType: string;
  contractAddress: string;
  walletAddress: string;
  latitude: number; // Must be a valid floating-point number (f64 in Rust)
  longitude: number; // Must be a valid floating-point number (f64 in Rust)
  altitude: number; // Altitude in meters (f64 in Rust)
  accuracy: number; // Accuracy of location in meters (f32 in Rust)
  satellites: number; // Number of satellites used for location (u8 in Rust)
  timestamp: number; // Timestamp in seconds since epoch (u64 in Rust)
  countryCode: string;
  countryName: string;
  countryRegion: string;
  maxWattage: number; // Maximum wattage in watts (u32 in Rust)
  voltageRange: string; // Range of voltage e.g. "220-240"
  frequencyRange: number; // Frequency in Hz (u32 in Rust)
  batteryCapacity: number; // Battery capacity in Ah (u32 in Rust)
  phaseType: string; // "single" or "three"
} 