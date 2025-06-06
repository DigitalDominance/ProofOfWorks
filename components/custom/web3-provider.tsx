// components/custom/web3-provider.tsx
"use client";

import React, { useEffect } from "react";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, initWeb3Modal } from "@/lib/web3modal-config";

// Create a singleton React Query client
const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Web3Modal only on the client (no SSR)
    initWeb3Modal();
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}
