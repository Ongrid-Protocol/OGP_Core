import { NodeData, DeviceCounters, CountryInfo } from '@/lib/types';


// Wallet addresses for permissioned access (these would typically come from a database or API)
export const authorizedWallets = [
  '0x123456789abcdef123456789abcdef123456789a',
  '0xabcdef123456789abcdef123456789abcdef1234',
  '0x9876543210abcdef9876543210abcdef98765432',
  '0xaDdb303C89c84cDC484AF0fE4701f330ca01aFD6' // User's wallet address
];


// List of available countries with their regions
export const countries: CountryInfo[] = [
  { code: 'KE', name: 'Kenya', region: 'Africa' },
  { code: 'ZA', name: 'South Africa', region: 'Africa' },
  { code: 'NG', name: 'Nigeria', region: 'Africa' },
  { code: 'EG', name: 'Egypt', region: 'Africa' },
  { code: 'GH', name: 'Ghana', region: 'Africa' },
  { code: 'IN', name: 'India', region: 'Asia' },
  { code: 'CN', name: 'China', region: 'Asia' },
  { code: 'JP', name: 'Japan', region: 'Asia' },
  { code: 'SG', name: 'Singapore', region: 'Asia' },
  { code: 'AE', name: 'United Arab Emirates', region: 'Asia' },
  { code: 'US', name: 'United States', region: 'North America' },
  { code: 'CA', name: 'Canada', region: 'North America' },
  { code: 'MX', name: 'Mexico', region: 'North America' },
  { code: 'BR', name: 'Brazil', region: 'South America' },
  { code: 'AR', name: 'Argentina', region: 'South America' },
  { code: 'GB', name: 'United Kingdom', region: 'Europe' },
  { code: 'DE', name: 'Germany', region: 'Europe' },
  { code: 'FR', name: 'France', region: 'Europe' },
  { code: 'IT', name: 'Italy', region: 'Europe' },
  { code: 'ES', name: 'Spain', region: 'Europe' },
  { code: 'AU', name: 'Australia', region: 'Oceania' },
  { code: 'NZ', name: 'New Zealand', region: 'Oceania' }
];

// Current counts of devices by type and country - for ID generation
export const deviceCounters: DeviceCounters = {
  'generator': {
    'KE': 4, 'NG': 2, 'ZA': 3, 'EG': 1, 'GH': 1,
    'IN': 2, 'CN': 3, 'JP': 1, 'SG': 2, 'AE': 1,
    'US': 5, 'CA': 2, 'MX': 1, 'BR': 2, 'AR': 1,
    'GB': 3, 'DE': 2, 'FR': 2, 'IT': 1, 'ES': 1,
    'AU': 2, 'NZ': 1
  },
  'consumer': {
    'KE': 3, 'NG': 1, 'ZA': 2, 'EG': 1, 'GH': 0,
    'IN': 3, 'CN': 2, 'JP': 2, 'SG': 1, 'AE': 1,
    'US': 4, 'CA': 1, 'MX': 1, 'BR': 1, 'AR': 0,
    'GB': 2, 'DE': 3, 'FR': 1, 'IT': 2, 'ES': 1,
    'AU': 1, 'NZ': 1
  }
};

// Mock location counts by country - for ID generation
export const locationCounters: Record<string, number> = {
  'KE': 2, 'NG': 2, 'ZA': 2, 'EG': 1, 'GH': 1,
  'IN': 3, 'CN': 3, 'JP': 2, 'SG': 1, 'AE': 1,
  'US': 5, 'CA': 3, 'MX': 2, 'BR': 2, 'AR': 1,
  'GB': 2, 'DE': 3, 'FR': 2, 'IT': 2, 'ES': 1,
  'AU': 2, 'NZ': 1
};

// Mock nodes for dashboard
export const mockNodes: NodeData[] = [
  {
    id: 'SG1001KE01',
    name: 'Solar Generator 001',
    status: 'active',
    type: 'Solar Generator',
    peerId: '12D3KooWDGYVsHj3H2qa6KjJVGCTPaKUS2YS9Urjuwo2mcRWbhAr',
    ipAddress: '41.204.190.12',
    location: {
      lat: -1.2921,
      lng: 36.8219,
      country: 'KE',
      region: 'Africa'
    },
    lastSeen: new Date().toISOString(),
    uptime: 99.8,
    version: '1.2.0'
  },
  {
    id: 'SC1001US01',
    name: 'Solar Consumer 001',
    status: 'active',
    type: 'Solar Consumer',
    peerId: '12D3KooWJ2Fsh4VTYNmFFCFbFbW9VyZkHbDBbPTpgTK6QEgJkiMd',
    ipAddress: '104.28.31.85',
    location: {
      lat: 37.7749,
      lng: -122.4194,
      country: 'US',
      region: 'North America'
    },
    lastSeen: new Date().toISOString(),
    uptime: 99.5,
    version: '1.2.0'
  },
  {
    id: 'SG1002ZA01',
    name: 'Solar Generator 002',
    status: 'inactive',
    type: 'Solar Generator',
    peerId: '12D3KooWBQbGbVPXKdvh9mhYEhCBXAq3TFdvgGJQsTTYgBHjp5yr',
    ipAddress: '196.20.168.8',
    location: {
      lat: -33.9249,
      lng: 18.4241,
      country: 'ZA',
      region: 'Africa'
    },
    lastSeen: new Date(Date.now() - 86400000).toISOString(),
    uptime: 87.3,
    version: '1.1.0'
  },
  {
    id: 'SC1002IN01',
    name: 'Solar Consumer 002',
    status: 'active',
    type: 'Solar Consumer',
    peerId: '12D3KooWHrMjXXarJD7jEJxMQJ7xkLD7CFqEhPpVvPXJb3PH82LK',
    ipAddress: '103.6.184.5',
    location: {
      lat: 19.0760,
      lng: 72.8777,
      country: 'IN',
      region: 'Asia'
    },
    lastSeen: new Date().toISOString(),
    uptime: 99.9,
    version: '1.2.0'
  }
]; 