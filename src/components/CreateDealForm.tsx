import React, { useState, useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { LOCKFORGE_ADDRESS, LOCKFORGE_ABI } from '../contracts/LockForge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { parseEther, isAddress, getAddress } from 'viem';
import { toast } from 'sonner';
import { Loader2, ShieldCheck, ExternalLink } from 'lucide-react';

interface CreateDealFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateDealForm({ isOpen, onClose, onSuccess }: CreateDealFormProps) {
  const [description, setDescription] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('7');

  const { data: hash, writeContract, isPending, error } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1,
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
      onSuccess();
      toast.success("Transaction confirmed!");
    }
  }, [isConfirmed, onSuccess]);

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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !sellerAddress || !amount || !deliveryDays) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!isAddress(sellerAddress)) {
      toast.error("Invalid seller wallet address");
      return;
    }

    try {
      writeContract({
        address: LOCKFORGE_ADDRESS,
        abi: LOCKFORGE_ABI as any,
        functionName: 'createDeal',
        args: [
          description,
          getAddress(sellerAddress),
          parseEther(amount),
          BigInt(deliveryDays),
        ],
        value: parseEther(amount),
      } as any);
    } catch (err: any) {
      console.error("Write contract catch:", err.message || err);
      toast.error(err.message || "Failed to initiate transaction");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="text-emerald-500" />
            Create New Escrow
          </DialogTitle>
          <DialogDescription>
            Funds will be locked in the smart contract until delivery is approved.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="description">Project Description (IPFS)</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the work to be done..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seller">Seller Wallet Address</Label>
            <Input 
              id="seller" 
              placeholder="0x..." 
              value={sellerAddress}
              onChange={(e) => setSellerAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input 
                id="amount" 
                type="number" 
                step="0.01" 
                placeholder="0.00" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Delivery Days (7-60)</Label>
              <Input 
                id="days" 
                type="number" 
                min="7" 
                max="60" 
                value={deliveryDays}
                onChange={(e) => setDeliveryDays(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Escrow Amount</span>
              <span className="font-medium">{amount || '0'} USDC</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-neutral-500">Platform Fee (0%)</span>
              <span className="font-medium text-emerald-600">Free (Beta)</span>
            </div>
            <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold">
              <span>Total to Lock</span>
              <span>{amount || '0'} USDC</span>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-neutral-900 h-12 text-lg" 
            disabled={isPending || isConfirming}
          >
            {(isPending || isConfirming) ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isConfirming ? 'Confirming...' : 'Pending Wallet...'}
              </>
            ) : (
              'Fund & Create Deal'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
