'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import PendingNodesTable from '@/components/nodes/PendingNodesTable';
import { FiClock, FiInfo } from 'react-icons/fi';
import Link from 'next/link';

export default function PendingNodesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="aydo-title text-2xl lg:text-3xl">Pending Nodes</h1>
          <Link href="/register" className="aydo-button flex items-center gap-2">
            Register New Node
          </Link>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 flex items-start">
          <FiInfo className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">About Pending Nodes</p>
            <p className="mt-1 text-sm">
              Nodes awaiting approval are registered but not yet operational on the network. 
              Approval typically takes 24-48 hours. You'll receive a notification once your node is approved.
            </p>
          </div>
        </div>
        
        <div className="aydo-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Nodes Awaiting Approval</h2>
            <div className="flex items-center text-sm text-gray-500">
              <FiClock className="mr-1 h-4 w-4" />
              Auto-refreshes every 5 minutes
            </div>
          </div>
          
          <PendingNodesTable />
        </div>
      </div>
    </DashboardLayout>
  );
} 