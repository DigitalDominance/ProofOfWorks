// lib/web3modal-config.ts

import { configureChains, createConfig } from "@wagmi/core";
// └─ Wagmi v2+ now lives under @wagmi/core; configureChains sets up clients and transports. :contentReference[oaicite:11]{index=11}

import { http } from "viem";
// └─ Viem’s HTTP transport replaces Wagmi’s old publicProvider / jsonRpcProvider. :contentReference[oaicite:12]{index=12}

import {
  EthereumClient,
  w3mConnectors,
  w3mProvider,
} from "@web3modal/ethereum";
// └─ Web3Modal v2 integrates with Wagmi v2; w3mProvider sets up WalletConnect under the hood. :contentReference[oaicite:13]{index=13}

import type { Chain } from "viem";
// └─ viem’s Chain interface used to define custom chains (Kaspa EVM). :contentReference[oaicite:14]{index=14}


// 1) Ensure your WalletConnect “Project ID” is present at build time.
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Please set it in your environment variables."
  );
}
// └─ Throw early to avoid silent 500s at runtime if the env-var was never set. :contentReference[oaicite:15]{index=15}


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
// └─ All custom chains must adhere to viem’s Chain interface. :contentReference[oaicite:16]{index=16}


// 3) Configure Wagmi’s chains + clients using Viem’s HTTP transport
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [kaspaEVMTestnet],
  [
    // 3a) Web3Modal’s provider (WalletConnect v2)  
    w3mProvider({ projectId }),
    // 3b) Fallback HTTP transport for Kaspa EVM testnet  
    ({ chain }) => {
      if (chain.id === kaspaEVMTestnet.id) {
        return { http: "https://rpc.kasplextest.xyz:167012" };
      }
      return null;
    },
  ],
  {
    // Optional: explicitly define the Viem transport for all chains
    transport: (chain) => http(chain.rpcUrls.default.http[0]),
  }
);
// └─ Wagmi v2 uses `configureChains` → { chains, publicClient, webSocketPublicClient }. :contentReference[oaicite:17]{index=17}


// 4) Create Wagmi configuration (formerly `createConfig`) for React
export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, chains }),
  publicClient,
  webSocketPublicClient,
});
// └─ `w3mConnectors` automatically wraps `WalletConnectConnector` from @wagmi/connectors. :contentReference[oaicite:18]{index=18}


// 5) Instantiate EthereumClient **only** on the client (no SSR)
let ethereumClient: EthereumClient | undefined = undefined;
if (typeof window !== "undefined") {
  ethereumClient = new EthereumClient(wagmiConfig, chains);
}
// └─ Must run in browser; avoids “window is not defined” SSR errors. :contentReference[oaicite:19]{index=19}


// 6) Export an **async** initializer to mount Web3Modal on the client
export async function initWeb3Modal() {
  if (!ethereumClient) {
    console.warn(
      "⚠️ Web3Modal init skipped—ethereumClient is undefined (likely SSR)."
    );
    return;
  }

  // Dynamically load the React Web3Modal component **only** in the browser
  const { Web3Modal } = await import("@web3modal/react");
  new Web3Modal({
    projectId,
    ethereumClient,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#49EACB",
      "--w3m-border-radius-master": "0.75rem",
    },
  });
}
// └─ Declared `async` so that `await import("@web3modal/react")` is valid syntax. :contentReference[oaicite:20]{index=20}
