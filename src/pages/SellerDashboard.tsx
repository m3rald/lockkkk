import React, { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { LOCKFORGE_ADDRESS, LOCKFORGE_ABI, DealStatus } from '../contracts/LockForge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Search, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import DealCard from '../components/DealCard';
import { Card, CardContent } from '@/components/ui/card';

export default function SellerDashboard() {
  const { address } = useAccount();

  // Get deals where I am the seller
  const { data: myDeals, isLoading: isMyDealsLoading, refetch: refetchMyDeals } = useReadContract({
    address: LOCKFORGE_ADDRESS,
    abi: LOCKFORGE_ABI,
    functionName: 'getDealsBySeller',
    args: [address as `0x${string}`],
  });

  // Get all available deals in "Created" state
  const { data: availableDeals, isLoading: isAvailableLoading, refetch: refetchAvailable } = useReadContract({
    address: LOCKFORGE_ADDRESS,
    abi: LOCKFORGE_ABI,
    functionName: 'getCreatedDeals',
  });

  const handleRefresh = () => {
    refetchMyDeals();
    refetchAvailable();
  };

  const myActiveDeals = myDeals?.filter(d => d.status !== DealStatus.Completed) || [];
  const myCompletedDeals = myDeals?.filter(d => d.status === DealStatus.Completed) || [];
  
  // Filter available deals to exclude those where I am already the seller (if the contract allows specific sellers)
  // or just show all "Created" deals that haven't been accepted yet.
  const browseDeals = availableDeals?.filter(d => d.status === DealStatus.Created) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Seller Dashboard</h1>
          <p className="text-neutral-500">Browse funded requests and manage your active deliverables.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isMyDealsLoading || isAvailableLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${(isMyDealsLoading || isAvailableLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="My Active Jobs" 
          value={myActiveDeals.length.toString()} 
          icon={<Briefcase className="text-blue-500" />} 
        />
        <StatCard 
          title="Available Jobs" 
          value={browseDeals.length.toString()} 
          icon={<Search className="text-amber-500" />} 
        />
        <StatCard 
          title="Total Earned" 
          value={`${myCompletedDeals.reduce((acc, d) => acc + Number(d.amount), 0)} USDC`} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
        />
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="browse">Browse Jobs ({browseDeals.length})</TabsTrigger>
          <TabsTrigger value="active">My Jobs ({myActiveDeals.length})</TabsTrigger>
          <TabsTrigger value="completed">History ({myCompletedDeals.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="mt-6">
          {browseDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {browseDeals.map((deal) => (
                <DealCard key={deal.id.toString()} deal={deal} role="seller" onAction={() => handleRefresh()} isBrowse />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No jobs available" 
              description="Check back later for new funded escrow requests." 
              icon={<Search className="w-8 h-8 text-neutral-300" />}
            />
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          {myActiveDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myActiveDeals.map((deal) => (
                <DealCard key={deal.id.toString()} deal={deal} role="seller" onAction={() => handleRefresh()} />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No active jobs" 
              description="Accept a job from the browse tab to get started." 
              icon={<Briefcase className="w-8 h-8 text-neutral-300" />}
            />
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {myCompletedDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myCompletedDeals.map((deal) => (
                <DealCard key={deal.id.toString()} deal={deal} role="seller" onAction={() => handleRefresh()} />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No history" 
              description="Your completed jobs will appear here." 
              icon={<CheckCircle2 className="w-8 h-8 text-neutral-300" />}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <Card className="border-neutral-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-500">{title}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{value}</p>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ title, description, icon }: { 
  title: string, 
  description: string, 
  icon: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-neutral-200">
      <div className="bg-neutral-50 p-4 rounded-full mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="text-neutral-500 max-w-xs text-center mt-1">{description}</p>
    </div>
  );
}
