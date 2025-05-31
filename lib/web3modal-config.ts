// lib/web3modal-config.ts

import { configureChains, createConfig } from "@wagmi/core";
// └─ Configure Wagmi’s chain settings and clients {{turn1search0}}

import { publicProvider } from "@wagmi/core/providers/public";
// └─ The publicProvider now lives under @wagmi/core/providers/public {{turn1search0}}

import { walletConnectProvider } from "@wagmi/core/providers/walletConnect";
// └─ WalletConnect’s provider is under @wagmi/core/providers/walletConnect {{turn1search3}}

import { jsonRpcProvider } from "@wagmi/core/providers/jsonRpc";
// └─ If you need a custom JSON-RPC provider, import from @wagmi/core/providers/jsonRpc {{turn1search9}}

import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
// └─ Web3Modal’s EthereumClient + connectors come from @web3modal/ethereum {{turn0search8}}

import type { Chain } from "viem";
// └─ viem’s Chain type is still used to define custom chains (e.g., Kaspa EVM) {{turn0search0}}


// 1. Ensure the WalletConnect “Project ID” is available at build time
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) {
  // If missing, this will fail the build immediately so you know to set it before deployment.
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID—set it in your .env or in Heroku config vars."
  );
}
// └─ Web3Modal v2 requires a Project ID; throwing here prevents a silent 500 at runtime {{turn0search8}}


// 2. Define a custom Kaspa EVM Testnet chain (replace RPC and explorer URLs as needed)
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
// └─ All custom chains must satisfy viem’s Chain interface (copied from wagmi docs) {{turn0search0}}


// 3. Configure Wagmi chains and clients (SSR-safe)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [kaspaEVMTestnet],
  [
    // Web3Modal’s Wagmi provider that uses WalletConnect V2 under the hood
    w3mProvider({ projectId }),
    // Fallback RPC provider that anyone can use—no sign-in required
    publicProvider(),
    // If you want to explicitly point to Kaspa’s RPC (redundant here since w3mProvider + publicProvider cover it)
    jsonRpcProvider({
      rpc: (chain) => {
        if (chain.id === 167012) {
          return { http: "https://rpc.kasplextest.xyz:167012" };
        }
        return null;
      },
    }),
  ]
);
// └─ configureChains returns “chains” + “publicClient” + “webSocketPublicClient” for Wagmi v2+ {{turn1search0}}


// 4. Create a Wagmi config object
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
  webSocketPublicClient,
});
// └─ createConfig (formerly createClient) wires up Wagmi with React Query and connectors {{turn1search0}}


// 5. Initialize EthereumClient (client-side only)
let ethereumClient: EthereumClient | undefined = undefined;
if (typeof window !== "undefined") {
  ethereumClient = new EthereumClient(wagmiConfig, chains);
}
// └─ EthereumClient ties Wagmi’s config + chains to Web3Modal; only in browser {{turn0search8}}


// 6. Export a helper to initialize Web3Modal on the client
export function initWeb3Modal() {
  if (!ethereumClient) {
    console.warn(
      "🔸 Web3Modal init skipped—ethereumClient is undefined (likely running SSR)."
    );
    return;
  }

  new (await import("@web3modal/react")).Web3Modal({
    projectId,
    themeMode: "dark",
    ethereumClient,
    themeVariables: {
      "--w3m-accent": "#49EACB",
      "--w3m-border-radius-master": "0.75rem",
    },
  });
}
// └─ Dynamically import Web3Modal’s React component so it never runs at build/SSR time {{turn0search8}}
