"use client"

import React from "react"
import { WagmiConfig } from "wagmi"
import { QueryClientProvider } from "@tanstack/react-query"
import { queryClient, wagmiConfig } from "@/lib"

export function Web3Provider({
  children,
  initialState,
}: {
  children: React.ReactNode
  initialState?: unknown
}) {
  return (
    <WagmiConfig config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiConfig>
  )
}
