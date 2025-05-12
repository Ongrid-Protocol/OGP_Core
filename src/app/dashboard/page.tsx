'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePrivy } from '@privy-io/react-auth';
import { FiServer, FiActivity, FiClock, FiZap, FiAlertCircle, FiMapPin, FiArrowRight } from 'react-icons/fi';
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
      <div className="space-y-8">
        {/* Welcome section */}
        <div className="aydo-card bg-gradient-radial from-primary/5 to-transparent border-0">
          <h1 className="aydo-title text-3xl">Welcome to OGP Core</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor your Open Grid Protocol nodes from a single dashboard.
          </p>
          <div className="mt-4 text-xs bg-primary/10 text-primary p-2 rounded-md inline-block font-mono">
            {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'Wallet connected'}
          </div>
        </div>
        
        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="aydo-stat">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Total Nodes</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800">{stats.total}</h3>
              </div>
              <div className="aydo-circle-icon bg-primary/10 text-primary">
                <FiServer className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="aydo-stat">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Active</p>
                <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.active}</h3>
              </div>
              <div className="aydo-circle-icon bg-green-100 text-green-600">
                <FiActivity className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="aydo-stat">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Inactive</p>
                <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.inactive}</h3>
              </div>
              <div className="aydo-circle-icon bg-red-100 text-red-600">
                <FiAlertCircle className="h-5 w-5" />
              </div>
            </div>
          </div>
          
          <div className="aydo-stat">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wider">Warning</p>
                <h3 className="text-2xl font-bold mt-1 text-yellow-600">{stats.warning}</h3>
              </div>
              <div className="aydo-circle-icon bg-yellow-100 text-yellow-600">
                <FiZap className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent activity section */}
        <div className="aydo-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <Link href="/nodes" className="text-sm text-primary flex items-center gap-1 hover:underline">
              View all nodes
              <FiArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {isLoading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : nodes.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-gray-500 mb-4">No nodes registered yet.</p>
                <Link href="/register" className="aydo-button inline-block">
                  Register a Node
                </Link>
              </div>
            ) : (
              <>
                {nodes.slice(0, 5).map((node) => (
                  <div key={node.id} className="py-4 hover:bg-gray-50/50 px-4 -mx-4 rounded-lg transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          node.status === 'active' ? 'node-active' : 
                          node.status === 'inactive' ? 'node-inactive' : 'node-warning'
                        }`}></div>
                        <div>
                          <h3 className="font-medium text-gray-900">{node.name}</h3>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <FiClock className="h-3 w-3 mr-1" />
                            <span>Last seen {getRelativeTime(node.lastSeen)}</span>
                            <span className="mx-2">•</span>
                            <FiMapPin className="h-3 w-3 mr-1" />
                            <span>ID: {node.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                      
                      <Link href={`/nodes/${node.id}`} className="text-sm text-primary flex items-center gap-1 hover:underline">
                        Details
                        <FiArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
                
                {nodes.length > 5 && (
                  <div className="pt-4 text-center">
                    <Link href="/nodes" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
                      View all {nodes.length} nodes
                      <FiArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Quick actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/register" className="aydo-card card-hover border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">Register Node</h3>
            <p className="text-sm text-gray-600">Add a new node to the OGP network with custom settings.</p>
            <div className="flex justify-end mt-4">
              <div className="aydo-circle-icon bg-primary/10 text-primary">
                <FiArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
          
          {/* <Link href="/nodes/pending" className="aydo-card card-hover border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">Pending Nodes</h3>
            <p className="text-sm text-gray-600">View nodes awaiting approval and check their status.</p>
            <div className="flex justify-end mt-4">
              <div className="aydo-circle-icon bg-primary/10 text-primary">
                <FiArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link> */}
          
          <Link href="/map" className="aydo-card card-hover border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">Network Map</h3>
            <p className="text-sm text-gray-600">View the global distribution of OGP nodes on the map.</p>
            <div className="flex justify-end mt-4">
              <div className="aydo-circle-icon bg-primary/10 text-primary">
                <FiArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
          
          <Link href="/settings" className="aydo-card card-hover border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-2">Settings</h3>
            <p className="text-sm text-gray-600">Configure your account and notification preferences.</p>
            <div className="flex justify-end mt-4">
              <div className="aydo-circle-icon bg-primary/10 text-primary">
                <FiArrowRight className="h-4 w-4" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
} 