'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { IconoirProvider } from 'iconoir-react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000, // 30s
            retry: 2,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <IconoirProvider
        iconProps={{
          strokeWidth: 1.6,
        }}
      >
        {children}
      </IconoirProvider>
    </QueryClientProvider>
  );
}
