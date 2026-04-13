import React, { useState } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { LOCKFORGE_ADDRESS, LOCKFORGE_ABI, DealStatus } from '../contracts/LockForge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw, AlertCircle, CheckCircle2, Clock, Shield } from 'lucide-react';
import CreateDealForm from '../components/CreateDealForm';
import DealCard from '../components/DealCard';
import { toast } from 'sonner';
import { formatEther } from 'viem';

export default function BuyerDashboard() {
  const { address } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: deals, isLoading, refetch } = useReadContract({
    address: LOCKFORGE_ADDRESS,
    abi: LOCKFORGE_ABI,
    functionName: 'getDealsByBuyer',
    args: [address as `0x${string}`],
  });

  const activeDeals = deals?.filter(d => d.status !== DealStatus.Completed) || [];
  const completedDeals = deals?.filter(d => d.status === DealStatus.Completed) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Buyer Dashboard</h1>
          <p className="text-neutral-500">Manage your escrow requests and secure your transactions.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="bg-neutral-900">
            <Plus className="h-4 w-4 mr-2" />
            Create New Deal
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Deals" 
          value={activeDeals.length.toString()} 
          icon={<Clock className="text-blue-500" />} 
        />
        <StatCard 
          title="Completed" 
          value={completedDeals.length.toString()} 
          icon={<CheckCircle2 className="text-emerald-500" />} 
        />
        <StatCard 
          title="Total Locked" 
          value={`${activeDeals.reduce((acc, d) => acc + Number(formatEther(d.amount)), 0).toFixed(2)} USDC`} 
          icon={<AlertCircle className="text-amber-500" />} 
        />
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="active">Active Requests ({activeDeals.length})</TabsTrigger>
          <TabsTrigger value="completed">History ({completedDeals.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active" className="mt-6">
          {activeDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeDeals.map((deal) => (
                <DealCard key={deal.id.toString()} deal={deal} role="buyer" onAction={() => refetch()} />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No active deals" 
              description="You haven't created any escrow requests yet." 
              action={() => setIsCreateModalOpen(true)}
              actionLabel="Create your first deal"
            />
          )}
        </TabsContent>
        <TabsContent value="completed" className="mt-6">
          {completedDeals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedDeals.map((deal) => (
                <DealCard key={deal.id.toString()} deal={deal} role="buyer" onAction={() => refetch()} />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No history" 
              description="Your completed deals will appear here." 
            />
          )}
        </TabsContent>
      </Tabs>

      <CreateDealForm 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refetch();
          toast.success("Deal created successfully!");
        }}
      />
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

function EmptyState({ title, description, action, actionLabel }: { 
  title: string, 
  description: string, 
  action?: () => void,
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-neutral-200">
      <div className="bg-neutral-50 p-4 rounded-full mb-4">
        <Shield className="w-8 h-8 text-neutral-300" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
      <p className="text-neutral-500 max-w-xs text-center mt-1">{description}</p>
      {action && (
        <Button onClick={action} className="mt-6 bg-neutral-900">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
