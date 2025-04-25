'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiLock, FiArrowRight } from 'react-icons/fi';

export default function LoginPage() {
  const { login, ready, authenticated } = usePrivy();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      setIsLoading(false);
      if (authenticated) {
        router.push('/dashboard');
      }
    }
  }, [ready, authenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="container mx-auto py-6 px-4 flex justify-between items-center">
        <div className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">
          OGP Core
        </div>
        <div className="flex space-x-2">
          <a
            href="https://docs.ogpnetwork.com"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Docs
          </a>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="max-w-4xl w-full flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2 space-y-6">
            <h1 className="text-4xl font-bold text-gray-900">
              Manage and monitor your OGP nodes
            </h1>
            
            <p className="text-gray-600 text-lg">
              OGP Core provides a powerful dashboard to register, monitor, and manage your Open Grid Protocol nodes.
            </p>
            
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <FiArrowRight className="w-5 h-5" />
                </div>
                <span className="text-gray-700">Register new nodes to the network</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <FiArrowRight className="w-5 h-5" />
                </div>
                <span className="text-gray-700">Monitor performance and status</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <FiArrowRight className="w-5 h-5" />
                </div>
                <span className="text-gray-700">View your nodes on the global map</span>
              </div>
            </div>
          </div>
          
          <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <FiLock className="w-10 h-10 text-primary" />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">Access Dashboard</h2>
                <p className="text-gray-600">
                  Connect your wallet to access the OGP Core dashboard
                </p>
              </div>
              
              <button
                onClick={() => login()}
                className="w-full py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
              >
                <span>Connect Wallet</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
              
              <p className="text-xs text-gray-500 text-center">
                Only authorized wallet addresses have access to the dashboard.
                <br />
                Contact admin if you need access.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto py-6 px-4 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} Open Grid Protocol. All rights reserved.
          </div>
          
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-gray-700">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
} 