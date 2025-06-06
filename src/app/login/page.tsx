'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { FiArrowRight } from 'react-icons/fi';

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
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="container mx-auto pt-8 pb-6 px-4 flex justify-between items-center">
        <div className="aydo-title">OGP Core</div>
        <div className="flex space-x-4">
          <a
            href="https://docs.ogpnetwork.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-primary transition-colors"
          >
            Documentation
          </a>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="flex flex-col justify-center space-y-8">
            <div>
              <h1 className="aydo-title text-4xl md:text-6xl">
                Manage your OGP nodes
              </h1>
              <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                OGP Core provides a powerful dashboard to register, monitor, 
                and manage OnGrid Protocol nodes with ease.
              </p>
            </div>

            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FiArrowRight className="w-5 h-5" />
                </div>
                <span className="text-gray-700">Register nodes to the network</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FiArrowRight className="w-5 h-5" />
                </div>
                <span className="text-gray-700">Monitor performance and status</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <FiArrowRight className="w-5 h-5" />
                </div>
                <span className="text-gray-700">View nodes on the global map</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-card rounded-2xl shadow-aydo">
              <div className="flex flex-col items-center space-y-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg 
                    width="32" 
                    height="32" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    className="text-primary"
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                
                <div className="text-center space-y-2 w-full">
                  <h2 className="text-2xl font-bold text-gray-900">Access Dashboard</h2>
                  <p className="text-gray-600">
                    Connect your wallet to access the OGP Core dashboard
                  </p>
                </div>
                
                <button
                  onClick={() => login()}
                  className="aydo-button w-full py-4 flex items-center justify-center space-x-2"
                >
                  <span>Connect Wallet</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
                
                <p className="text-sm text-gray-500 text-center">
                  Only authorized wallet addresses can access the dashboard.
                  <br />
                  Contact admin if you need access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto py-8 px-4 mt-16 border-t border-gray-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-500">
            © {new Date().getFullYear()} OnGrid Protocol. All rights reserved.
          </div>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-500 hover:text-primary transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
} 