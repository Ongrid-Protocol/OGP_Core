'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dynamic from 'next/dynamic';
import { NodeData } from '@/lib/types';

// Dynamically import the NodeMap component with SSR disabled
const NodeMap = dynamic(() => import('@/components/map/NodeMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-gray-100 dark:bg-gray-900 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
});

export default function MapPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [mapKey, setMapKey] = useState(Date.now().toString());
  
  useEffect(() => {
    // Reset map if page is revisited
    const handleRouteChange = () => {
      setMapKey(Date.now().toString());
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, []);
  
  useEffect(() => {
    // Fetch nodes data (mocked for now)
    const fetchData = async () => {
      try {
        // Only run this on the client side to prevent hydration mismatches
        if (typeof window === 'undefined') return;
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Create stable timestamps for SSR/CSR consistency
        const now = new Date();
        const nowISO = now.toISOString();
        const threeDaysAgo = new Date(now);
        threeDaysAgo.setDate(now.getDate() - 3);
        const threeDaysAgoISO = threeDaysAgo.toISOString();
        
        // Mock data with stabilized timestamps
        const mockNodes: NodeData[] = [
          {
            id: "SG1004KE04",
            name: "Solar Generator 004",
            location: { lat: -4.0435, lng: 39.6682 },
            status: "active",
            lastSeen: nowISO,
            ip: "192.168.1.102",
            port: 3000,
            peerId: "12D3KooWR5Q8UGPwEp6EBh8G5aDfHNHcNfXhX2kKgGPgBVUPrn3F"
          },
          {
            id: "SGC1003KE03",
            name: "Solar Generator and Consumer 003",
            location: { lat: -1.3031, lng: 36.8262 },
            status: "active",
            lastSeen: nowISO,
            ip: "192.168.1.101",
            port: 3000,
            peerId: "12D3KooWBx5p7xCCxNUDTL2BFmCrmW7n3jVNyQmahTaE2YhrqFqF"
          },
          {
            id: "SG1001US01",
            name: "Solar Generator 001",
            location: { lat: 40.7128, lng: -74.0060 },
            status: "inactive",
            lastSeen: threeDaysAgoISO,
            ip: "192.168.1.100",
            port: 3000,
            peerId: "12D3KooWA1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z"
          }
        ];
        
        setNodes(mockNodes);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching node data:", error);
        setIsLoading(false);
        // Set empty nodes array in case of error
        setNodes([]);
      }
    };
    
    fetchData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Network Map</h1>
          <div className="text-sm text-gray-500">
            {nodes.length} nodes in network
          </div>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          {isLoading ? (
            <div className="flex justify-center items-center h-[600px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <NodeMap 
              key={mapKey}
              nodes={nodes}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 