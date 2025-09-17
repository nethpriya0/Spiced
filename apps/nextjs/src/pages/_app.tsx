import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastContainer } from "@/components/common/Toast";
import { wagmiConfig } from '@/lib/wagmi-config';

import { api } from "~/utils/api";
import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>
          <div className={`font-sans ${inter.variable}`}>
            <Component {...pageProps} />
            <ToastContainer toasts={[]} onRemoveToast={() => {}} />
          </div>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default api.withTRPC(MyApp);