"use client"

import type React from "react"
import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { wagmiConfig } from "@/lib/web3modal-config"
import { createWeb3Modal } from "@web3modal/wagmi/react"
import { Web3Modal } from "@web3modal/wagmi/react"

const queryClient = new QueryClient()

// Initialize Web3Modal
if (typeof window !== "undefined") {
  createWeb3Modal({
    wagmiConfig,
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    themeMode: "dark",
    themeVariables: {
      "--w3m-accent": "#49EACB",
      "--w3m-border-radius-master": "0.75rem",
    },
  })
}

export function Web3Provider({ children, initialState }: { children: React.ReactNode; initialState?: any }) {
  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        <Web3Modal>{children}</Web3Modal>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
