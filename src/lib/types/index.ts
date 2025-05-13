export type NodeStatus = 'active' | 'inactive' | 'warning';

export type SolarSetupType = 'generator' | 'consumer';

export type GeoLocation = {
  lat: number;
  lng: number;
  altitude: number;
  accuracy: number;
  satellites: number;
  timestamp: number;
};

export interface NodeData {
  id: string;
  name: string;
  location: GeoLocation;
  status: NodeStatus;
  lastSeen: string; // ISO date string
  peerId: string;
  ip?: string;
  port?: number;
  version?: string;
  owner?: string;
  walletAddress?: string;
  contractSigned?: boolean;
  cpu?: number; // CPU usage percentage
  memory?: number; // Memory usage percentage
  bandwidth?: {
    up: number; // Upload in MB/s
    down: number; // Download in MB/s
  };
  peers?: number;
  uptime?: number; // In seconds
}

export interface NodeRegistrationData {
  id: string;
  name: string;
  device_type: string;
  location: GeoLocation & {
    country: string;
    region: string;
  };
  peerId: string;
  port: number;
  walletAddress: string;
  ownerEmail?: string;
  specifications: {
    max_wattage: number;
    voltage_range: string;
    frequency_range: string;
    battery_capacity: string;
    phase_type: 'single' | 'three';
  };

}

export interface NodeFilterOptions {
  status?: NodeStatus[];
  lastSeenAfter?: string;
  search?: string;
}

export interface DashboardStats {
  totalNodes: number;
  activeNodes: number;
  inactiveNodes: number;
  warningNodes: number;
  averageUptime: number;
  totalPeers: number;
  networkBandwidth: {
    up: number;
    down: number;
  };
}

export interface Web3Config {
  chainId: number;
  contractAddress: string;
  rpcUrl: string;
}

export interface AuthState {
  isAdmin: boolean;
  walletAddress?: string;
} 