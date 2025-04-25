import { NodeData } from '../types';

// Wallet addresses for permissioned access (these would typically come from a database or API)
export const authorizedWallets = [
  '0x123456789abcdef123456789abcdef123456789a',
  '0xabcdef123456789abcdef123456789abcdef1234',
  '0x9876543210abcdef9876543210abcdef98765432',
  '0xaDdb303C89c84cDC484AF0fE4701f330ca01aFD6' // User's wallet address
];

// Mock nodes data for development
export const mockNodes: NodeData[] = [
  {
    id: "SG1004KE04",
    name: "Solar Generator 004",
    location: { lat: -4.0435, lng: 39.6682 },
    status: "active",
    lastSeen: new Date().toISOString(),
    ip: "192.168.1.102",
    port: 3000,
    peerId: "12D3KooWR5Q8UGPwEp6EBh8G5aDfHNHcNfXhX2kKgGPgBVUPrn3F",
    walletAddress: "0x123456789abcdef123456789abcdef123456789a",
    cpu: 32,
    memory: 45,
    uptime: 842400 // 9.75 days in seconds
  },
  {
    id: "SGC1003KE03",
    name: "Solar Generator and Consumer 003",
    location: { lat: -1.3031, lng: 36.8262 },
    status: "active",
    lastSeen: new Date().toISOString(),
    ip: "192.168.1.101",
    port: 3000,
    peerId: "12D3KooWBx5p7xCCxNUDTL2BFmCrmW7n3jVNyQmahTaE2YhrqFqF",
    walletAddress: "0x123456789abcdef123456789abcdef123456789a",
    cpu: 12,
    memory: 32,
    uptime: 1209600 // 14 days in seconds
  },
  {
    id: "SG1001US01",
    name: "Solar Generator 001",
    location: { lat: 40.7128, lng: -74.0060 },
    status: "inactive",
    lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    ip: "192.168.1.100",
    port: 3000,
    peerId: "12D3KooWA1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z",
    walletAddress: "0xabcdef123456789abcdef123456789abcdef1234",
    cpu: 0,
    memory: 0,
    uptime: 259200 // 3 days in seconds
  },
  {
    id: "WG2001IN01",
    name: "Wind Generator 001",
    location: { lat: 19.0760, lng: 72.8777 },
    status: "warning",
    lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    ip: "192.168.1.103",
    port: 3000,
    peerId: "12D3KooWQjKLR7cafcVTJYrmQHXR2z1LLYVoAfm7hk2BBtLUvM9V",
    walletAddress: "0x9876543210abcdef9876543210abcdef98765432",
    cpu: 89,
    memory: 92,
    uptime: 432000 // 5 days in seconds
  },
  {
    id: "SC2002JP01",
    name: "Solar Consumer 002",
    location: { lat: 35.6762, lng: 139.6503 },
    status: "active",
    lastSeen: new Date().toISOString(),
    ip: "192.168.1.104",
    port: 3000,
    peerId: "12D3KooWZvEGZL2arY47RMK5TZ6QqzTSuiQVDNubNeTwh3YLxEAK",
    walletAddress: "0x123456789abcdef123456789abcdef123456789a",
    cpu: 18,
    memory: 24,
    uptime: 604800 // 7 days in seconds
  },
  {
    id: "BG3001UK01",
    name: "Battery Storage Node 001",
    location: { lat: 51.5074, lng: -0.1278 },
    status: "active",
    lastSeen: new Date().toISOString(),
    ip: "192.168.1.105",
    port: 3000,
    peerId: "12D3KooWJN1EmVJv83xZQbGYTSjWdtgELv7CQ16pPHuEGhGZqbE8",
    walletAddress: "0xaDdb303C89c84cDC484AF0fE4701f330ca01aFD6",
    cpu: 22,
    memory: 36,
    uptime: 518400 // 6 days in seconds
  }
]; 