import { createConfig, configureChains } from "wagmi";
import { http } from "viem";
import {
  createWeb3Modal,
  defaultWagmiConfig,
} from "@web3modal/wagmi";
// └─ Web3Modal v4 for Wagmi v2+ (no direct `@web3modal/ethereum` needed). :contentReference[oaicite:14]{index=14}

import type { Chain } from "viem";

/** 1) Get your WalletConnect Project ID at build time **/
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;
if (!projectId) {
  throw new Error(
    "Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID. Please set it before building."
  );
}
/** :contentReference[oaicite:15]{index=15} **/

/** 2) Define your Kaspa EVM Testnet (or any custom chain) **/
export const kaspaEVMTestnet: Chain = {
  id: 167012,
  name: "Kaspa EVM Testnet",
  network: "kaspa",
  nativeCurrency: { name: "Kaspa", symbol: "KAS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.kasplextest.xyz:167012"] },
  },
  blockExplorers: {
    default: { name: "Kaspa Explorer", url: "https://frontend.kasplextest.xyz" },
  },
  testnet: true,
};
/** :contentReference[oaicite:16]{index=16} **/

/** 3) Configure Wagmi v2 with Viem’s `http()` transport **/
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [kaspaEVMTestnet],
  [
    // The `defaultWagmiConfig` from @web3modal/wagmi wraps `w3mProvider` for you.
    defaultWagmiConfig({
      chains: [kaspaEVMTestnet],
      projectId,
      ssr: true,
    }).provider,

    // Fallback transport via Viem (use your own RPC if needed)
    ({ chain }) => {
      if (chain.id === kaspaEVMTestnet.id) {
        return { http: "https://rpc.kasplextest.xyz:167012" };
      }
      return null;
    },
  ],
  {
    // Tell Wagmi to use Viem’s `http()` as the transport layer
    transport: (chain) => http(chain.rpcUrls.default.http[0]),
  }
);
/** :contentReference[oaicite:17]{index=17} **/

/** 4) Build your `wagmiConfig` using `createWeb3Modal`’s default wagmiConfig **/
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  ssr: true,
});
/** :contentReference[oaicite:18]{index=18} **/

/**
 * 5) Initialize Web3Modal on the client only.
 *    We call `createWeb3Modal` inside a `useEffect` so no code runs on the server.
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
/** :contentReference[oaicite:19]{index=19} **/
