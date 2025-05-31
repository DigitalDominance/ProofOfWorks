// components/custom/web3-provider.tsx
"use client";

import React, { useEffect } from "react";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, initWeb3Modal } from "@/lib/web3modal-config";

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // You can catch errors so unhandled rejections don’t appear
    initWeb3Modal().catch(console.error);
  }, []);

  return (
    <WagmiConfig config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiConfig>
  );
}
