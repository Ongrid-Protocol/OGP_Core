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
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm ${sidebarOpen ? 'block' : 'hidden'}`} 
        onClick={() => setSidebarOpen(false)}
      ></div>
      
      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-aydo transition-transform duration-300 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 md:static md:inset-auto md:h-screen`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-gray-100">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
              OGP Core
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)} 
            className="md:hidden p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
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
                className={`flex items-center px-4 py-3 text-sm rounded-lg transition-all ${
                  isActive 
                    ? 'text-primary bg-primary/5 font-medium' 
                    : 'text-gray-600 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                {item.name}
              </Link>
            );
          })}
          
          {authenticated && (
            <button 
              onClick={() => logout()}
              className="flex items-center w-full px-4 py-3 mt-8 text-sm rounded-lg text-gray-600 hover:text-primary hover:bg-gray-50 transition-colors"
            >
              <FiLogOut className="w-5 h-5 mr-3 text-gray-400" />
              Disconnect
            </button>
          )}
        </nav>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between h-20 px-6 bg-card border-b border-gray-100">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="p-2 rounded-md md:hidden hover:bg-gray-50 transition-colors"
          >
            <FiMenu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center ml-auto space-x-4">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                OG
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
} 