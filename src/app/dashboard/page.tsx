'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePrivy } from '@privy-io/react-auth';
import { FiServer, FiActivity, FiClock, FiZap, FiAlertCircle, FiMapPin } from 'react-icons/fi';
import Link from 'next/link';
import { NodeData } from '@/lib/types';
import { mockNodes } from '@/lib/api/mockData';

export default function Dashboard() {
  const { user } = usePrivy();
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch nodes data
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user?.wallet?.address) {
        // Filter nodes by wallet address in a real app
        setNodes(mockNodes);
      }
      setIsLoading(false);
    };
    
    fetchData();
  }, [user]);

  // Calculate statistics
  const stats = {
    total: nodes.length,
    active: nodes.filter(node => node.status === 'active').length,
    inactive: nodes.filter(node => node.status === 'inactive').length,
    warning: nodes.filter(node => node.status === 'warning').length,
  };

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-md">
          <h1 className="text-2xl font-bold mb-2">Welcome to OGP Core</h1>
          <p className="opacity-90">
            Manage and monitor your Open Grid Protocol nodes from a single dashboard.
          </p>
          <div className="mt-4 text-xs bg-white/20 p-2 rounded inline-block">
            <span className="font-mono">{user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Wallet connected'}</span>
          </div>
        </div>
        
        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase font-medium">Total Nodes</p>
                <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiServer className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase font-medium">Active</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.active}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiActivity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase font-medium">Inactive</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.inactive}</h3>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <FiAlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500 uppercase font-medium">Warning</p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">{stats.warning}</h3>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiZap className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent activity section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Recent Activity</h2>
            <Link href="/nodes" className="text-sm text-primary hover:underline">
              View all nodes
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : nodes.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No nodes registered yet.</p>
                <Link href="/register" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg text-sm">
                  Register a Node
                </Link>
              </div>
            ) : (
              <>
                {nodes.slice(0, 5).map((node) => (
                  <div key={node.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          node.status === 'active' ? 'bg-green-500' : 
                          node.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{node.name}</h3>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <FiClock className="h-3 w-3 mr-1" />
                            <span>Last seen {getRelativeTime(node.lastSeen)}</span>
                            <span className="mx-2">•</span>
                            <FiMapPin className="h-3 w-3 mr-1" />
                            <span>ID: {node.id}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Link href={`/nodes/${node.id}`} className="text-sm text-primary hover:underline">
                        Details
                      </Link>
                    </div>
                  </div>
                ))}
                
                {nodes.length > 5 && (
                  <div className="p-4 text-center border-t border-gray-100 bg-gray-50">
                    <Link href="/nodes" className="text-sm text-primary hover:underline">
                      View all {nodes.length} nodes
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/register" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-800 mb-2">Register Node</h3>
            <p className="text-sm text-gray-600">Add a new node to the OGP network with custom settings.</p>
          </Link>
          
          <Link href="/map" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-800 mb-2">Network Map</h3>
            <p className="text-sm text-gray-600">View the global distribution of OGP nodes on the map.</p>
          </Link>
          
          <Link href="/settings" className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="font-semibold text-gray-800 mb-2">Settings</h3>
            <p className="text-sm text-gray-600">Configure your account and notification preferences.</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
} 