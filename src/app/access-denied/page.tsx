'use client';

import { usePrivy } from '@privy-io/react-auth';
import { FiAlertTriangle, FiExternalLink } from 'react-icons/fi';
import Link from 'next/link';

export default function AccessDenied() {
  const { user, logout } = usePrivy();
  const walletAddress = user?.wallet?.address || '';
  
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
          OGP Core
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
              <FiAlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
              <p className="text-gray-600">
                Your wallet address is not authorized to access the OGP Core dashboard.
              </p>
            </div>
            
            {walletAddress && (
              <div className="bg-gray-50 p-4 rounded-lg w-full text-center">
                <p className="text-sm text-gray-500 mb-1">Connected wallet:</p>
                <p className="font-mono text-xs break-all">{walletAddress}</p>
              </div>
            )}
            
            <div className="space-y-3 w-full">
              <a 
                href="https://docs.ogpnetwork.com/access-request" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Request Access</span>
                <FiExternalLink className="w-4 h-4" />
              </a>
              
              <button
                onClick={() => logout()}
                className="w-full py-3 px-4 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Disconnect Wallet
              </button>
              
              <Link 
                href="/"
                className="w-full py-3 px-4 text-center text-gray-500 hover:text-gray-700 text-sm"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto py-6 px-4 border-t border-gray-200">
        <div className="flex justify-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} OnGrid Protocol. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 