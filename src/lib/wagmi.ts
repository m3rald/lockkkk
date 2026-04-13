import { http, createConfig } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { defineChain } from 'viem';
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors';

export const arcTestnet = defineChain({
  id: 123456, // Example ID for Arc Testnet
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://explorer.testnet.arc.network' },
  },
  testnet: true,
  fees: {
    baseFeeMultiplier: 1.2,
  },
});

export const config = createConfig({
  chains: [arcTestnet, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({ appName: 'LockForge' }),
  ],
  pollingInterval: 4_000,
  transports: {
    [arcTestnet.id]: http(undefined, {
      batch: true,
    }),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
