'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePrivy } from '@privy-io/react-auth';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiBell, FiLock, FiServer, FiCheck, FiAlertTriangle, FiClock, FiPlus, FiSearch, FiX, FiFilter } from 'react-icons/fi';
import { mockNodes } from '@/lib/api/mockData';
import { NodeData } from '@/lib/types';

export default function Settings() {
  const { user } = usePrivy();
  const [activeTab, setActiveTab] = useState('profile');
  const [userNodes, setUserNodes] = useState<NodeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAddress, setFilterAddress] = useState('');
  const [filteredNodes, setFilteredNodes] = useState<NodeData[]>([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(true);

  // Get nodes registered by this wallet
  useEffect(() => {
    if (user?.wallet?.address) {
      const walletAddress = user.wallet.address.toLowerCase();
      // Filter nodes by wallet address
      const userWalletNodes = mockNodes.filter(
        node => node.walletAddress?.toLowerCase() === walletAddress
      );
      setUserNodes(userWalletNodes);
      setFilteredNodes(userWalletNodes);
      setIsLoading(false);
    }
  }, [user]);

  // Filter nodes by provided address
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterAddress(e.target.value);
  };

  const applyFilter = () => {
    if (!filterAddress) {
      // Reset to user's nodes if filter is empty
      setFilteredNodes(userNodes);
      setIsFiltering(false);
      setIsValidAddress(true);
      return;
    }

    // Simple validation: Check if the address is in the right format
    const isValidEthAddress = /^0x[a-fA-F0-9]{40}$/i.test(filterAddress);
    setIsValidAddress(isValidEthAddress);

    if (isValidEthAddress) {
      const address = filterAddress.toLowerCase();
      const filtered = mockNodes.filter(
        node => node.walletAddress?.toLowerCase() === address
      );
      setFilteredNodes(filtered);
      setIsFiltering(true);
    }
  };

  const clearFilter = () => {
    setFilterAddress('');
    setFilteredNodes(userNodes);
    setIsFiltering(false);
    setIsValidAddress(true);
  };

  const calculateNodeStats = (nodes: NodeData[]) => {
    if (!nodes.length) return { active: 0, inactive: 0, warning: 0, totalUptime: 0, avgUptime: 0 };

    const active = nodes.filter(node => node.status === 'active').length;
    const inactive = nodes.filter(node => node.status === 'inactive').length;
    const warning = nodes.filter(node => node.status === 'warning').length;
    const totalUptime = nodes.reduce((sum, node) => sum + (node.uptime || 0), 0);
    const avgUptime = totalUptime / nodes.length;

    return { active, inactive, warning, avgUptime };
  };

  // Calculate stats based on currently displayed nodes
  const stats = calculateNodeStats(filteredNodes);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h1>
          
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-4 px-1 ${
                  activeTab === 'profile'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                } flex items-center`}
              >
                <FiUser className="mr-2 h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`pb-4 px-1 ${
                  activeTab === 'notifications'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                } flex items-center`}
              >
                <FiBell className="mr-2 h-4 w-4" />
                Notifications
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`pb-4 px-1 ${
                  activeTab === 'security'
                    ? 'border-b-2 border-blue-600 text-blue-600 font-medium'
                    : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
                } flex items-center`}
              >
                <FiLock className="mr-2 h-4 w-4" />
                Security
              </button>
            </div>
          </div>
          
          {/* Profile Tab Content */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <div className="flex flex-col items-center p-6 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl mb-4">
                      {user?.wallet?.address ? user.wallet.address.slice(2, 4).toUpperCase() : 'U'}
                    </div>
                    <span className="text-sm font-mono text-gray-500 mb-2">
                      {user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : ''}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      Connected via {user?.wallet?.walletClientType || 'Wallet'}
                    </span>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        id="displayName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="telegramUsername" className="block text-sm font-medium text-gray-700 mb-1">
                        Telegram Username (for notifications)
                      </label>
                      <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          @
                        </span>
                        <input
                          type="text"
                          id="telegramUsername"
                          className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="username"
                        />
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Notifications Tab Content */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Node Status Alerts</h3>
                    <p className="text-xs text-gray-500 mt-1">Receive notifications when nodes go offline or have issues</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Performance Updates</h3>
                    <p className="text-xs text-gray-500 mt-1">Weekly summary of node performance and statistics</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Security Alerts</h3>
                    <p className="text-xs text-gray-500 mt-1">Get notified about security incidents or updates</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                    <p className="text-xs text-gray-500 mt-1">Receive updates via email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
          
          {/* Security Tab Content */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mb-6">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <FiAlertTriangle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Security Note</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>
                          Your account is secured via your connected wallet. To change security settings,
                          please use your wallet's security features.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-sm font-medium text-gray-900">Connected Wallet</h3>
                  </div>
                  
                  <div className="px-6 py-5 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FiUser className="h-5 w-5" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">
                          {user?.wallet?.walletClientType || 'Web3 Wallet'}
                        </p>
                        <p className="text-xs font-mono text-gray-500 mt-1">
                          {user?.wallet?.address ? `${user.wallet.address.slice(0, 10)}...${user.wallet.address.slice(-8)}` : ''}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-sm text-green-600">
                      <FiCheck className="mr-1 h-4 w-4" />
                      Connected
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button className="bg-red-50 text-red-600 px-4 py-2 rounded-md hover:bg-red-100 transition-colors border border-red-100">
                    Disconnect Wallet
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Node Statistics Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {isFiltering ? "Filtered Node Statistics" : "Your Node Statistics"}
              </h2>
              {isFiltering && (
                <p className="text-sm text-gray-500 mt-1">
                  Viewing nodes for wallet: {filterAddress.slice(0, 6)}...{filterAddress.slice(-4)}
                </p>
              )}
            </div>
            {isLoading ? (
              <div className="w-5 h-5 border-t-2 border-blue-600 rounded-full animate-spin mt-2 md:mt-0"></div>
            ) : (
              <span className="text-sm text-gray-500 mt-2 md:mt-0">{filteredNodes.length} nodes registered</span>
            )}
          </div>
          
          {/* Filter section */}
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-3">
              <div className="flex-grow">
                <label htmlFor="addressFilter" className="block text-sm font-medium text-gray-700 mb-1">
                  <FiFilter className="inline-block mr-1 h-4 w-4" />
                  Filter by Wallet/Contract Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    id="addressFilter"
                    className={`block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${!isValidAddress ? 'border-red-300' : 'border-gray-300'}`}
                    placeholder="0x..."
                    value={filterAddress}
                    onChange={handleFilterChange}
                  />
                  {filterAddress && (
                    <button 
                      onClick={clearFilter}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FiX className="h-4 w-4 text-gray-400 hover:text-gray-500" />
                    </button>
                  )}
                </div>
                {!isValidAddress && (
                  <p className="mt-1 text-sm text-red-600">Please enter a valid Ethereum address (0x...)</p>
                )}
              </div>
              <div className="flex space-x-2 md:self-end">
                <button
                  onClick={applyFilter}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiSearch className="mr-2 h-4 w-4" />
                  Search
                </button>
                {isFiltering && (
                  <button
                    onClick={clearFilter}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiX className="mr-2 h-4 w-4" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="h-40 flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <FiServer className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <h3 className="text-gray-800 font-medium mb-1">
                {isFiltering ? "No Nodes Found for This Address" : "No Nodes Registered"}
              </h3>
              <p className="text-gray-500 text-sm mb-4">
                {isFiltering 
                  ? "The specified wallet address hasn't registered any nodes"
                  : "You haven't registered any nodes yet with this wallet"
                }
              </p>
              {!isFiltering && (
                <a href="/register" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                  <FiPlus className="mr-2 h-4 w-4" />
                  Register a Node
                </a>
              )}
            </div>
          ) : (
            <>
              {/* Node Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h3 className="text-xs text-blue-500 uppercase font-medium mb-1">Total Nodes</h3>
                  <p className="text-2xl font-bold text-blue-700">{filteredNodes.length}</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h3 className="text-xs text-green-500 uppercase font-medium mb-1">Active</h3>
                  <p className="text-2xl font-bold text-green-700">{stats.active}</p>
                </div>
                
                <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                  <h3 className="text-xs text-red-500 uppercase font-medium mb-1">Inactive</h3>
                  <p className="text-2xl font-bold text-red-700">{stats.inactive}</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                  <h3 className="text-xs text-purple-500 uppercase font-medium mb-1">Avg Uptime</h3>
                  <p className="text-2xl font-bold text-purple-700">{formatUptime(stats.avgUptime)}</p>
                </div>
              </div>
              
              {/* Node List */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900">
                    {isFiltering ? "Filtered Nodes" : "Your Registered Nodes"}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {filteredNodes.slice(0, 5).map((node) => (
                    <div key={node.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${
                            node.status === 'active' ? 'bg-green-500' : 
                            node.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                          }`}></div>
                          <span className="ml-3 font-medium text-gray-900">{node.name}</span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-gray-500">
                            <FiClock className="mr-1 h-4 w-4" />
                            {formatUptime(node.uptime || 0)}
                          </div>
                          
                          <div className="flex items-center text-gray-500">
                            <span className="font-mono">
                              {node.ip}:{node.port}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredNodes.length > 5 && (
                    <div className="px-6 py-4 bg-gray-50 text-center">
                      <a href="/nodes" className="text-sm text-blue-600 hover:text-blue-800">
                        View all {filteredNodes.length} nodes
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
} 