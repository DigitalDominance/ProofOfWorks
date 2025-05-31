// lib/web3modal-config.ts

import { configureChains, createConfig } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { EthereumClient, w3mConnectors, w3mProvider } from "@web3modal/ethereum";
import type { Chain } from "viem";
import { Web3Modal } from "@web3modal/react";

// 1) Grab your Project ID from env (this MUST exist at build time)
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) {
  // In development, this will throw immediately so you know something is wrong.
  // In production, you must rebuild if this was ever missing at build time.
  throw new Error("Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env");
}

// 2) Define your Kaspa EVM Testnet chain descriptor
//    (make sure these fields match the “Chain” interface from viem + Wagmi)
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

// 3) Put your chains into an array (Wagmi expects an array of Chain)
export const chains = [kaspaEVMTestnet] as const;

// 4) configureChains → This sets up Wagmi’s “publicClient” and wires in Web3Modal’s provider
const { publicClient } = configureChains(chains, [
  // w3mProvider automatically points at WalletConnect’s RPC endpoints under the hood
  w3mProvider({ projectId }),
  // Always include a fallback “publicProvider” in case the user’s wallet is offline
  publicProvider(),
]);

// 5) createConfig → This is your Wagmi “wagmiConfig” object for <WagmiConfig>
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
});

// 6) EthereumClient only exists on the client. Don’t call this at build/SSR time.
let ethereumClient: EthereumClient | undefined = undefined;
if (typeof window !== "undefined") {
  ethereumClient = new EthereumClient(wagmiConfig, chains);
}

/**
 * Call this function from a top-level “useEffect” in a Client‐only component (for example, your
 * Web3Provider or inside _app.tsx), so that Web3Modal gets injected only after hydration.
 */
export function initWeb3Modal() {
  if (!ethereumClient) {
    console.warn(
      "⚠️ Cannot initialize Web3Modal: ethereumClient is undefined. Are we on the server?"
    );
    return;
  }

  new Web3Modal({
    projectId,
    themeMode: "dark", // or "light"
    // Pass the EthereumClient instance (this wires Wagmi + Web3Modal)
    ethereumClient,
    themeVariables: {
      "--w3m-accent": "#49EACB",
      "--w3m-border-radius-master": "0.75rem",
    },
  });
}
