import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// This component will only render on client side to avoid SSR issues
const ClientOnlyWalletConnect = dynamic(
  () => import('./ClientOnlyWalletConnect'),
  {
    ssr: false,
    loading: () => (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔐 Connect Your Wallet</CardTitle>
          <p className="text-sm text-gray-600">
            Loading wallet connection options...
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
);

interface WalletConnectProps {
  onConnectionChange?: (connected: boolean, address?: string) => void;
}

export default function WalletConnect({ onConnectionChange }: WalletConnectProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔐 Connect Your Wallet</CardTitle>
          <p className="text-sm text-gray-600">
            Preparing wallet connection...
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="animate-pulse space-y-2">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <ClientOnlyWalletConnect onConnectionChange={onConnectionChange} />;
}