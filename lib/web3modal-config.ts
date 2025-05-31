// lib/web3modal-config.ts

/**
 * Replace all `@web3modal/ethereum@2.x` usage with `@web3modal/wagmi@4.x`.
 * Wagmi v2 configuration now uses 'wagmi' and Viem transports.
 */

import { createConfig, configureChains } from "wagmi";
// └─ Wagmi v2’s top‐level package exports configureChains, createConfig. :contentReference[oaicite:12]{index=12}

import { http } from "viem";
// └─ Use Viem’s http() instead of old Wagmi providers. 

import { defaultWagmiConfig, createWeb3Modal } from "@web3modal/wagmi";
// └─ Web3Modal v4 for Wagmi v2+ (no more @web3modal/ethereum). :contentReference[oaicite:14]{index=14}

import type { Chain } from "viem";
// └─ For custom chain definitions (e.g., Kaspa EVM). :contentReference[oaicite:15]{index=15}

/** 1) Ensure WalletConnect Project ID is set at build time **/
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Please set it before building."
  );
}
/** :contentReference[oaicite:16]{index=16} **/

/** 2) Custom Kaspa EVM Testnet chain **/
export const kaspaEVMTestnet: Chain = {
  id: 167012,
  name: "Kaspa EVM Testnet",
  network: "kaspa",
  nativeCurrency: { name: "Kaspa", symbol: "KAS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.kasplextest.xyz:167012"] },
  },
  blockExplorers: {
    default: {
      name: "Kaspa Explorer",
      url: "https://frontend.kasplextest.xyz",
    },
  },
  testnet: true,
};
/** :contentReference[oaicite:17]{index=17} **/

/** 3) Configure Wagmi v2 chains + Viem transport **/
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [kaspaEVMTestnet],
  [
    // 3a) Web3Modal’s built‐in Wagmi provider for WalletConnect v2
    defaultWagmiConfig({
      chains: [kaspaEVMTestnet],
      projectId,
      ssr: true,
    }).provider,

    // 3b) Viem HTTP transport fallback
    ({ chain }) => {
      if (chain.id === kaspaEVMTestnet.id) {
        return { http: "https://rpc.kasplextest.xyz:167012" };
      }
      return null;
    },
  ],
  {
    // Tell Wagmi to use Viem’s http() as transport for RPC calls
    transport: (chain) => http(chain.rpcUrls.default.http[0]),
  }
);
/** :contentReference[oaicite:18]{index=18} **/

/** 4) Create Wagmi v2 configuration **/
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  ssr: true,
});
/** :contentReference[oaicite:19]{index=19} **/

/**
 * 5) Initialize Web3Modal on the client side only.
 *    We export a function that can be called inside a React `useEffect`.
 */
export function initWeb3Modal() {
  if (typeof window === "undefined") return; // SSR guard

  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#49EACB",
      "--w3m-border-radius-master": "0.75rem",
    },
  });
}
/** :contentReference[oaicite:20]{index=20} **/
