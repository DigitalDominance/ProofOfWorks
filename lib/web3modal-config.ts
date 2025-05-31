// lib/web3modal-config.ts

import { createWeb3Modal } from "@web3modal/wagmi/react"
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import type { Chain } from "viem"

// 1. Get projectId (fallback to empty string so it never throws)
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? ""

// Define your custom Kaspa EVM chain
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
}

export const chains = [kaspaEVMTestnet] as const

// (Optional) Add metadata if you like
const metadata = {
  name: "ProofOfWork Platform",
  description: "On-Chain Hiring & Payroll on Kaspa EVM",
  url: "https://pow-frontend-925b729e8cf0.herokuapp.com",
}

// 2. Build the wagmiConfig (SSR-safe)
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
})

// 3. Only initialize Web3Modal on the client *and* if projectId is non‐empty
if (typeof window !== "undefined" && projectId) {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#49EACB",
      "--w3m-border-radius-master": "0.75rem",
    },
    // enableAnalytics: true // optional
  })
} else if (typeof window !== "undefined") {
  console.warn(
    "⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is missing; Web3Modal will not be initialized on the client."
  )
}
