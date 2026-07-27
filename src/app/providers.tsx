import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router';
import { ToastContainer } from '@/components/ui/Toast';
import { validateClientEnv } from '@/schemas/env';
import { initTheme } from '@/store/theme.store';

validateClientEnv();
initTheme();

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        retry: 3,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function AppProviders() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <ToastContainer />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
