import { createWeb3Modal } from "@web3modal/wagmi/react"
import { defaultWagmiConfig } from "@web3modal/wagmi/react/config"
import type { Chain } from "viem"
import { sepolia } from "viem/chains"

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
    default: { name: "KaspaExplorer", url: "https://testnet.kaspa.guru" },
  },
  testnet: true,
} as const satisfies Chain

const metadata = {
  name: "ProofOfWork Platform",
  description: "On-Chain Hiring & Payroll on Kaspa EVM",
  url: "https://your-platform-url.com", // origin must match your domain & subdomain
  icons: ["https://your-platform-url.com/logo.png"], // Add your logo URL
}

// Only include Kaspa EVM Testnet for now
export const chains = [kaspaEVMTestnet] as const

// Create wagmi config with only Kaspa EVM chain
export const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true, // Important for Next.js
  enableWalletConnect: true, // Enable WalletConnect
  defaultChainId: kaspaEVMTestnet.id, // Set Kaspa EVM as default chain
})

// 3. Create modal
// Ensure this only runs on the client side
if (typeof window !== "undefined") {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    chains,
    themeMode: "dark", // Or 'light', or 'system'
    themeVariables: {
      "--w3m-accent": "#49EACB", // Your accent color
      "--w3m-border-radius-master": "0.75rem", // Matches your --radius
    },
    // enableAnalytics: true // Optional - defaults to your Cloud configuration
  })
}
