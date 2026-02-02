"use client";

import {
    dehydrate,
    HydrationBoundary,
    isServer,
    QueryClient,
    QueryClientProvider,
} from '@tanstack/react-query';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR Optimization: Set staleTime to avoid immediate refetching on client
        // News content is typically fresh for 5 minutes
        staleTime: 5 * 60 * 1000, // 5 minutes

        // Garbage collection: Server-side memory management
        // On server, cacheTime defaults to Infinity, but we set it for clarity
        gcTime: isServer ? 0 : 10 * 60 * 1000, // 0 on server, 10 minutes on client

        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,

        // SEO: Ensure stable rendering
        networkMode: 'always',
      },
      mutations: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        networkMode: 'always',
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Export utilities for SSR prefetching
export { dehydrate, getQueryClient, HydrationBoundary };
