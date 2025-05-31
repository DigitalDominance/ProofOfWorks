// lib/web3modal-config.ts

import { configureChains, createConfig } from "@wagmi/core";
// └─ Wagmi v2+ moved to @wagmi/core; configureChains defines publicClient & webSocketPublicClient {{turn1search0}}

import { publicProvider } from "@wagmi/core/providers/public";
// └─ publicProvider now exported from @wagmi/core/providers/public (not from “wagmi/providers/public”) {{turn1search0}}

import { walletConnectProvider } from "@wagmi/core/providers/walletConnect";
// └─ walletConnectProvider resides under @wagmi/core/providers/walletConnect {{turn1search3}}

import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
// └─ jsonRpcProvider from @wagmi/core/providers/jsonRpc for custom chains, if needed {{turn1search9}}

import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
// └─ Web3Modal v2’s EthereumClient, connectors & provider live under @web3modal/ethereum {{turn0search8}}

import type { Chain } from "viem";
// └─ viem’s `Chain` interface to define your Kaspa EVM Testnet chain {{turn0search0}}


// 1) Ensure WalletConnect projectId is defined at build time
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in environment. Please set it before building."
  );
}
// └─ Web3Modal v2 requires a WalletConnect projectId; throwing on missing prevents runtime 500s {{turn0search8}}


// 2) Define your custom Kaspa EVM Testnet chain
export const kaspaEVMTestnet: Chain = {
  id: 167012,
  name: "Kaspa EVM Testnet",
  network: "kaspa",
  nativeCurrency: { name: "Kaspa", symbol: "KAS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.kasplextest.xyz:167012"] },
    public: { http: ["https://rpc.kasplextest.xyz:167012"] },
  },
  blockExplorers: {
    default: {
      name: "Kaspa Explorer",
      url: "https://frontend.kasplextest.xyz",
    },
  },
  testnet: true,
};
// └─ All viem `Chain` definitions now go here. JSON-RPC + explorer URLs must be valid. {{turn0search0}}


// 3) Configure Wagmi chains & clients (SSR-safe)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [kaspaEVMTestnet],
  [
    w3mProvider({ projectId }),                // Web3Modal-provided provider using WalletConnect v2 {{turn0search8}}
    publicProvider(),                           // Fallback public RPC provider for any chain {{turn1search0}}
    jsonRpcProvider({                           // Explicitly define JSON-RPC if needed (optional)
      rpc: (chain) => {
        if (chain.id === 167012) {
          return { http: "https://rpc.kasplextest.xyz:167012" };
        }
        return null;
      },
    }),
  ]
);
// └─ `configureChains` gives us `chains`, `publicClient`, `webSocketPublicClient` for Wagmi v2+ {{turn1search0}}


// 4) Create a Wagmi configuration for React
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
  webSocketPublicClient,
});
// └─ In Wagmi v2, `createClient` was renamed to `createConfig`; connectors come from `w3mConnectors` {{turn1search0}}


// 5) Initialize EthereumClient only in the browser
let ethereumClient: EthereumClient | undefined = undefined;
if (typeof window !== "undefined") {
  ethereumClient = new EthereumClient(wagmiConfig, chains);
}
// └─ EthereumClient bundles Wagmi + Web3Modal; must run only on client where `window` exists {{turn0search8}}


// 6) Export an async function to initialize Web3Modal in a client-side effect
export async function initWeb3Modal() {
  if (!ethereumClient) {
    console.warn(
      "⚠️ EthereumClient is undefined—Web3Modal initialization skipped (likely SSR)."
    );
    return;
  }

  // Dynamically import Web3Modal’s React component so that no code from "@web3modal/react"
  // gets evaluated during SSR. `await` here is allowed because this function is `async`.
  const { Web3Modal } = await import("@web3modal/react");
  new Web3Modal({
    projectId,
    themeMode: "dark",
    ethereumClient,
    themeVariables: {
      "--w3m-accent": "#49EACB",
      "--w3m-border-radius-master": "0.75rem",
    },
  });
}
// └─ Marked `async` so that `await import("@web3modal/react")` is valid syntax {{turn0search4turn0search5}}  
