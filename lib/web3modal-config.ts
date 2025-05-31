import { createWeb3Modal } from "@web3modal/wagmi/react"
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import type { Chain } from "viem"
// Sepolia is removed as per request to use only Kaspa EVM

// 1. Get projectId
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

if (!projectId) {
  throw new Error("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set in .env")
}

// Define your custom Kaspa EVM chain
export const kaspaEVMTestnet = {
  id: 167012,
  name: "Kaspa EVM Testnet",
  nativeCurrency: { name: "Kaspa", symbol: "KAS", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.kasplextest.xyz"] },
    public: { http: ["https://rpc.kasplextest.xyz"] },
  },
  blockExplorers: {
    default: { name: "KaspaExplorer", url: "https://frontend.kasplextest.xyz" }, // Placeholder
  },
  testnet: true,
} as const satisfies Chain

if (kaspaEVMTestnet.blockExplorers.default.url.includes("example.com")) {
  console.warn(
    "WARNING: Kaspa EVM Testnet Block Explorer URL is a placeholder. " +
      "Please replace it with an actual, working URL in lib/web3modal-config.ts " +
      "for full functionality.",
  )
}

const metadata = {
  name: "ProofOfWork Platform",
  description: "On-Chain Hiring & Payroll on Kaspa EVM",
  url: "https://pow-frontend-925b729e8cf0.herokuapp.com", // Updated URL
  icons: ["https://pow-frontend-925b729e8cf0.herokuapp.com/logo.png"], // Updated icon URL (ensure logo.png is in /public)
}

// Configure chains to use only Kaspa EVM Testnet
export const chains = [kaspaEVMTestnet] as const

export const wagmiConfig = defaultWagmiConfig({
  chains, // Now only Kaspa EVM Testnet
  projectId,
  metadata,
  ssr: true, // Important for Next.js
})

// 3. Create modal
// This initializes Web3Modal globally. WalletConnect is enabled by providing the projectId.
if (typeof window !== "undefined") {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains, // This will also now only list Kaspa EVM
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#49EACB",
      "--w3m-border-radius-master": "0.75rem",
    },
    // enableAnalytics: true // Optional
  })
}
