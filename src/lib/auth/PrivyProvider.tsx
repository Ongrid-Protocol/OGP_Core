'use client';

import { ReactNode, useEffect, useState } from 'react';
import { PrivyProvider as BasePrivyProvider, usePrivy } from '@privy-io/react-auth';
import { useRouter, usePathname } from 'next/navigation';
import { authorizedWallets } from '@/lib/api/mockData';

// Public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/login', '/access-denied'];

function AuthGuard({ children }: { children: ReactNode }) {
  const { ready, authenticated, user } = usePrivy();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ready) {
      // If on a public route, allow access
      if (PUBLIC_ROUTES.includes(pathname)) {
        setHasAccess(true);
        setLoading(false);
        return;
      }

      // If not authenticated, redirect to login
      if (!authenticated) {
        router.push('/login');
        setLoading(false);
        return;
      }

      // If authenticated, check if the wallet address is in the permissioned list
      if (user?.wallet?.address) {
        const userAddress = user.wallet.address.toLowerCase();
        const hasPermission = authorizedWallets.some(
          address => address.toLowerCase() === userAddress
        );

        setHasAccess(hasPermission);
        
        if (!hasPermission) {
          router.push('/access-denied');
        }
      }
      
      setLoading(false);
    }
  }, [ready, authenticated, user, pathname, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess && !PUBLIC_ROUTES.includes(pathname)) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
}

interface PrivyProviderProps {
  children: ReactNode;
}

export default function PrivyProvider({ children }: PrivyProviderProps) {
  return (
    <BasePrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'cm8p1ihc7009p23akq2ysqlbu'}
      config={{
        loginMethods: ['wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#3b82f6', // primary blue color
          logo: 'https://your-logo-url.com/logo.png', // Replace with your logo URL
        },
      }}
    >
      <AuthGuard>{children}</AuthGuard>
    </BasePrivyProvider>
  );
} 