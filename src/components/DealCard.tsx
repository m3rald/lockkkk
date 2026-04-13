import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LOCKFORGE_ADDRESS, LOCKFORGE_ABI, DealStatus } from '../contracts/LockForge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatEther, parseEther } from 'viem';
import { toast } from 'sonner';
import { 
  ExternalLink, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ArrowRight,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DealCardProps {
  key?: string | number;
  deal: any;
  role: 'buyer' | 'seller';
  onAction: () => void;
  isBrowse?: boolean;
}

export default function DealCard({ deal, role, onAction, isBrowse }: DealCardProps) {
  const [proofUrl, setProofUrl] = useState('');
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);

  const { writeContract, isPending, data: hash, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1
  });

  useEffect(() => {
    if (hash) {
      console.log("Transaction hash generated:", hash);
      toast.info(
        <div className="flex flex-col gap-2">
          <span>Transaction sent!</span>
          <a 
            href={`https://explorer.testnet.arc.network/tx/${hash}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs underline flex items-center gap-1"
          >
            View on Explorer <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      );
    }
  }, [hash]);

  useEffect(() => {
    if (isConfirmed) {
      onAction();
      toast.success("Transaction confirmed!");
    }
  }, [isConfirmed, onAction]);

  useEffect(() => {
    if (error) {
      const msg = error.message || String(error);
      if (msg.includes("User rejected") || msg.includes("User denied")) {
        toast.warning("Transaction cancelled by user");
      } else {
        console.error("Transaction error:", msg);
        toast.error(msg || "Transaction failed");
      }
    }
  }, [error]);

  const handleAction = async (action: string, args: any[] = [], value?: bigint) => {
    try {
      writeContract({
        address: LOCKFORGE_ADDRESS,
        abi: LOCKFORGE_ABI as any,
        functionName: action as any,
        args: [deal.id, ...args],
        value: value
      } as any);
    } catch (err: any) {
      console.error(err.message || err);
      toast.error(`Failed to ${action}`);
    }
  };

  const statusInfo = getStatusInfo(deal.status);

  return (
    <Card className="overflow-hidden border-neutral-200 hover:shadow-md transition-shadow flex flex-col h-full">
      <CardHeader className="pb-3 border-b bg-neutral-50/50">
        <div className="flex justify-between items-start">
          <Badge className={`${statusInfo.color} border-none`}>
            {statusInfo.label}
          </Badge>
          <span className="text-xs font-mono text-neutral-400">#{deal.id.toString()}</span>
        </div>
        <div className="mt-3">
          <h3 className="font-bold text-lg line-clamp-1">{deal.descriptionIpfs}</h3>
          <div className="flex items-center gap-1 text-xs text-neutral-500 mt-1">
            <Clock className="w-3 h-3" />
            <span>Created {formatDistanceToNow(Number(deal.createdAt) * 1000)} ago</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="py-4 space-y-4 flex-grow">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Amount</p>
            <p className="font-bold text-neutral-900">{formatEther(deal.amount)} USDC</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-400">Deadline</p>
            <p className="font-bold text-neutral-900">{deal.deliveryDays.toString()} Days</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-neutral-400" />
            <span className="text-neutral-500">{role === 'buyer' ? 'Seller:' : 'Buyer:'}</span>
            <span className="font-mono text-xs">{role === 'buyer' ? deal.seller.slice(0, 10) : deal.buyer.slice(0, 10)}...</span>
          </div>
          {deal.proofIpfs && (
            <div className="flex items-center gap-2 text-sm p-2 bg-blue-50 rounded-lg border border-blue-100">
              <FileText className="w-4 h-4 text-blue-500" />
              <span className="text-blue-700 font-medium">Proof Submitted</span>
              <a href={deal.proofIpfs} target="_blank" rel="noopener noreferrer" className="ml-auto">
                <ExternalLink className="w-3 h-3 text-blue-500" />
              </a>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 px-4">
        <div className="w-full space-y-2">
          {role === 'buyer' && (
            <>
              {deal.status === DealStatus.ProofSubmitted && (
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => handleAction('approveRelease')}
                    disabled={isPending || isConfirming}
                  >
                    Approve
                  </Button>
                  <Dialog>
                    <DialogTrigger render={<Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Dispute</Button>} />
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Open Dispute</DialogTitle>
                        <DialogDescription>
                          Opening a dispute requires a 15% bond ({Number(formatEther(deal.amount)) * 0.15} USDC). 
                          This bond is returned if the dispute is resolved in your favor.
                        </DialogDescription>
                      </DialogHeader>
                      <Button 
                        variant="destructive" 
                        onClick={() => handleAction('openDispute', [], parseEther((Number(formatEther(deal.amount)) * 0.15).toString()))}
                        disabled={isPending || isConfirming}
                      >
                        Pay Bond & Open Dispute
                      </Button>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
              {deal.status === DealStatus.Created && (
                <Button variant="outline" className="w-full" disabled>
                  Waiting for Seller to Accept
                </Button>
              )}
              {deal.status === DealStatus.Accepted && (
                <Button variant="outline" className="w-full" disabled>
                  Waiting for Delivery
                </Button>
              )}
            </>
          )}

          {role === 'seller' && (
            <>
              {isBrowse && deal.status === DealStatus.Created && (
                <Button 
                  className="w-full bg-neutral-900"
                  onClick={() => handleAction('acceptDeal')}
                  disabled={isPending || isConfirming}
                >
                  Accept Deal <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
              {!isBrowse && deal.status === DealStatus.Accepted && (
                <Dialog open={isProofModalOpen} onOpenChange={setIsProofModalOpen}>
                  <DialogTrigger render={<Button className="w-full bg-blue-600 hover:bg-blue-700">Submit Proof</Button>} />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Submit Delivery Proof</DialogTitle>
                      <DialogDescription>
                        Provide a link to the completed work (IPFS, GitHub, etc.)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="proof">Proof URL / IPFS Hash</Label>
                        <Input 
                          id="proof" 
                          placeholder="https://..." 
                          value={proofUrl}
                          onChange={(e) => setProofUrl(e.target.value)}
                        />
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => {
                          handleAction('submitProof', [proofUrl]);
                          setIsProofModalOpen(false);
                        }}
                        disabled={isPending || isConfirming || !proofUrl}
                      >
                        Confirm Delivery
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              {!isBrowse && deal.status === DealStatus.ProofSubmitted && (
                <Button variant="outline" className="w-full" disabled>
                  Waiting for Approval
                </Button>
              )}
            </>
          )}

          {deal.status === DealStatus.Completed && (
            <Button variant="outline" className="w-full border-emerald-200 text-emerald-700 bg-emerald-50" disabled>
              <CheckCircle2 className="mr-2 h-4 w-4" /> Completed
            </Button>
          )}

          {deal.status === DealStatus.Disputed && (
            <Button variant="outline" className="w-full border-red-200 text-red-700 bg-red-50" disabled>
              <AlertTriangle className="mr-2 h-4 w-4" /> Under Dispute
            </Button>
          )}

          {(isPending || isConfirming) && (
            <div className="flex items-center justify-center text-xs text-neutral-500 animate-pulse">
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Processing transaction...
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}

function getStatusInfo(status: number) {
  switch (status) {
    case DealStatus.Created:
      return { label: 'Funded', color: 'bg-amber-100 text-amber-700' };
    case DealStatus.Accepted:
      return { label: 'In Progress', color: 'bg-blue-100 text-blue-700' };
    case DealStatus.ProofSubmitted:
      return { label: 'Delivered', color: 'bg-indigo-100 text-indigo-700' };
    case DealStatus.Completed:
      return { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' };
    case DealStatus.Disputed:
      return { label: 'Disputed', color: 'bg-red-100 text-red-700' };
    default:
      return { label: 'Unknown', color: 'bg-neutral-100 text-neutral-700' };
  }
}
