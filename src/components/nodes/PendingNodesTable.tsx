'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiMapPin, FiServer, FiAlertTriangle, FiCheck, FiX, FiUser } from 'react-icons/fi';
import Link from 'next/link';

// Define the pending node type
interface PendingNode {
  id: string;
  peer_id: string;
  node_name: string;
  device_type: string;
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
  created_at: string;
  status: 'pending' | 'rejected' | 'approved';
}

export default function PendingNodesTable() {
  const [pendingNodes, setPendingNodes] = useState<PendingNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchPendingNodes() {
      setIsLoading(true);
      try {
        // In a real implementation, this would call the ICP canister
        // For demo, we'll simulate a response with mock data
        const response = await fetchNodesAwaitingApproval();
        setPendingNodes(response);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch pending nodes:', err);
        setError('Failed to load pending nodes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchPendingNodes();
  }, []);
  
  // Format timestamp to relative time
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  if (isLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-600 flex items-center">
        <FiAlertTriangle className="w-5 h-5 mr-2" />
        {error}
      </div>
    );
  }
  
  if (pendingNodes.length === 0) {
    return (
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-500">No nodes pending approval at this time.</p>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Node
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Wallet
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Submitted
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {pendingNodes.map((node) => (
            <tr key={node.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <FiServer className="h-5 w-5 text-primary" />
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {node.node_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {node.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{node.location.country.name}</div>
                <div className="text-xs text-gray-500">{node.location.country.region}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {node.device_type}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center text-xs text-gray-500">
                  <FiUser className="mr-1 h-3 w-3" />
                  {node.wallet_address.substring(0, 6)}...{node.wallet_address.substring(node.wallet_address.length - 4)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <FiClock className="mr-1 h-3 w-3" />
                  {getRelativeTime(node.created_at)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {node.status === 'pending' && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Pending
                  </span>
                )}
                {node.status === 'approved' && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Approved
                  </span>
                )}
                {node.status === 'rejected' && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Rejected
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Link href={`/nodes/pending/${node.id}`} className="text-primary hover:text-primary-dark">
                    View Details
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mock function to simulate fetching data from the ICP canister
// In a real implementation, this would call the actual canister function
async function fetchNodesAwaitingApproval(): Promise<PendingNode[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data
  return [
    {
      id: 'SG1001KE01',
      peer_id: '12D3KooWDGYVsHj3H2qa6KjJVGCTPaKUS2YS9Urjuwo2mcRWbhAr',
      node_name: 'AristotleBaboon',
      device_type: 'Solar Generator',
      wallet_address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      location: {
        latitude: -1.2921,
        longitude: 36.8219,
        country: {
          code: 'KE',
          name: 'Kenya',
          region: 'Africa'
        }
      },
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      status: 'pending'
    },
    {
      id: 'SC1002NG01',
      peer_id: '12D3KooWRxHeFNAPDSU5h1kNGAwJCps56PxzXVH8UHXrUjUzgRbD',
      node_name: 'BabylonTiger',
      device_type: 'Solar Consumer',
      wallet_address: '0x2546BcD3c84621e976D8185a91A922aE77ECEc30',
      location: {
        latitude: 9.0765,
        longitude: 7.3986,
        country: {
          code: 'NG',
          name: 'Nigeria',
          region: 'Africa'
        }
      },
      created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      status: 'pending'
    },
    {
      id: 'SG1001ZA01',
      peer_id: '12D3KooWL1NF783rKGN91XNvQCYwvtVdRNVEYmj9uVJsBextnmae',
      node_name: 'CarthageEinstein',
      device_type: 'Solar Generator',
      wallet_address: '0xdD870fA1b7C4700F2BD7f44238821C26f7392148',
      location: {
        latitude: -33.9249,
        longitude: 18.4241,
        country: {
          code: 'ZA',
          name: 'South Africa',
          region: 'Africa'
        }
      },
      created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      status: 'approved'
    }
  ];
} 