'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { FiHome, FiServer, FiMap, FiPlusCircle, FiSettings, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { usePrivy } from '@privy-io/react-auth';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const { logout, authenticated } = usePrivy();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Nodes', href: '/nodes', icon: FiServer },
    { name: 'Network Map', href: '/map', icon: FiMap },
    { name: 'Register Node', href: '/register', icon: FiPlusCircle },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      <div className={`md:hidden fixed inset-0 z-50 bg-gray-900/70 backdrop-blur-sm ${sidebarOpen ? 'block' : 'hidden'}`} onClick={() => setSidebarOpen(false)}></div>
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto md:h-screen`}>
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-gray-700 bg-primary/5">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-700 bg-clip-text text-transparent">OGP Core</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden p-1 rounded-full hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm rounded-lg transition-colors ${
                  isActive 
                    ? 'text-white bg-primary shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
          
          {authenticated && (
            <button 
              onClick={() => logout()}
              className="flex items-center w-full px-4 py-3 mt-8 text-sm rounded-lg text-red-500 hover:bg-red-50 transition-colors"
            >
              <FiLogOut className="w-5 h-5 mr-3" />
              Disconnect
            </button>
          )}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <header className="flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 md:px-6 sticky top-0 z-10 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-md md:hidden hover:bg-gray-100">
            <FiMenu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary to-blue-700 flex items-center justify-center text-white font-medium shadow-md">
                OG
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 