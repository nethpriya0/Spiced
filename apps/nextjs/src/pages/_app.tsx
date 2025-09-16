import { type AppType } from "next/app";
import { Inter } from "next/font/google";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ToastContainer } from "@/components/common/Toast";
// import { PerformanceMonitor } from "@/components/monitoring/PerformanceMonitor";
import { useToast } from "@/hooks/useToast";

import { api } from "~/utils/api";

import "~/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ErrorBoundary>
      <div className={`font-sans ${inter.variable}`}>
        <Component {...pageProps} />
        <ToastContainer toasts={[]} onRemoveToast={() => {}} />
      </div>
    </ErrorBoundary>
  );
};

export default api.withTRPC(MyApp);