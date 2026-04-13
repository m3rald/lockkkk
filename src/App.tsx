import React, { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { Web3Provider } from './lib/Web3Provider';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, Shield, ShoppingCart, Store, LogOut, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

type Role = 'buyer' | 'seller' | null;

function AppContent() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [role, setRole] = useState<Role>(null);

  // Persist role in local storage for demo purposes
  useEffect(() => {
    const savedRole = localStorage.getItem('lockforge-role') as Role;
    if (savedRole) setRole(savedRole);
  }, []);

  const handleSetRole = (newRole: Role) => {
    setRole(newRole);
    if (newRole) localStorage.setItem('lockforge-role', newRole);
    else localStorage.removeItem('lockforge-role');
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="bg-neutral-900 p-4 rounded-2xl shadow-xl">
              <Shield className="w-12 h-12 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-900">LockForge</h1>
            <p className="text-neutral-500">Decentralized Escrow on Arc Network</p>
          </div>
          
          <Card className="border-neutral-200 shadow-sm">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Select your preferred wallet to access the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {connectors.map((connector) => (
                <Button 
                  key={connector.uid}
                  onClick={() => connect({ connector })}
                  variant={connector.name === 'Injected' ? 'default' : 'outline'}
                  className={`w-full py-6 text-lg justify-start px-6 ${connector.name === 'Injected' ? 'bg-neutral-900 hover:bg-neutral-800 text-white' : ''}`}
                >
                  <Wallet className="mr-3 h-5 w-5" />
                  {connector.name}
                </Button>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-center gap-4">
             <DisclaimerModal />
          </div>
        </motion.div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full space-y-8"
        >
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-neutral-900">Choose Your Role</h2>
            <p className="text-neutral-500">Select how you want to use LockForge today.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleCard 
              title="Buyer"
              description="Create escrow requests, fund deals, and approve delivery."
              icon={<ShoppingCart className="w-8 h-8" />}
              onClick={() => handleSetRole('buyer')}
              color="bg-blue-50 text-blue-600 border-blue-100"
            />
            <RoleCard 
              title="Seller"
              description="Browse funded requests, accept deals, and submit proof of work."
              icon={<Store className="w-8 h-8" />}
              onClick={() => handleSetRole('seller')}
              color="bg-emerald-50 text-emerald-600 border-emerald-100"
            />
          </div>

          <div className="flex justify-center">
            <Button variant="ghost" onClick={() => disconnect()} className="text-neutral-500">
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect {address?.slice(0, 6)}...{address?.slice(-4)}
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleSetRole(null)}>
              <Shield className="w-8 h-8 text-neutral-900" />
              <span className="font-bold text-xl tracking-tight">LockForge</span>
              <span className="ml-2 px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[10px] font-bold uppercase rounded tracking-wider">
                {role}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-xs font-medium text-neutral-500">Connected Wallet</p>
                <p className="text-sm font-mono text-neutral-900">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleSetRole(null)}>
                Switch Role
              </Button>
              <Button variant="ghost" size="icon" onClick={() => disconnect()}>
                <LogOut className="h-5 w-5 text-neutral-500" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {role === 'buyer' ? <BuyerDashboard /> : <SellerDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>
      <Toaster />
    </div>
  );
}

function RoleCard({ title, description, icon, onClick, color }: { 
  title: string, 
  description: string, 
  icon: React.ReactNode, 
  onClick: () => void,
  color: string
}) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-all border-2 border-transparent hover:border-neutral-200 group"
      onClick={onClick}
    >
      <CardHeader className="space-y-4">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color} transition-transform group-hover:scale-110`}>
          {icon}
        </div>
        <div>
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="text-base mt-2">{description}</CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

function DisclaimerModal() {
  return (
    <Dialog>
      <DialogTrigger render={
        <Button variant="link" className="text-neutral-400 text-xs">
          <Info className="mr-1 h-3 w-3" />
          Terms & Disclaimers
        </Button>
      } />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>LockForge Protocol Disclaimer</DialogTitle>
          <DialogDescription>
            Please read carefully before using the platform.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 text-sm text-neutral-600">
          <p>
            LockForge is a decentralized protocol running on the Arc Network Testnet. 
            All transactions are final and immutable once confirmed on the blockchain.
          </p>
          <div className="bg-neutral-50 p-3 rounded-lg border border-neutral-100">
            <h4 className="font-bold text-neutral-900 mb-1">Key Rules:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Funds are locked in the smart contract upon deal creation.</li>
              <li>Sellers must provide proof of delivery via IPFS.</li>
              <li>Disputes require a 15% bond to prevent spam.</li>
              <li>This is a testnet version; do not use real assets.</li>
            </ul>
          </div>
          <p className="text-xs italic">
            By connecting your wallet, you acknowledge that you are using experimental software 
            and assume all risks associated with smart contract interactions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <AppContent />
    </Web3Provider>
  );
}
