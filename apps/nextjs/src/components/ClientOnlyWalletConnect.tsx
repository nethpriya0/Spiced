import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Check, AlertCircle, Loader2 } from 'lucide-react';

interface ClientOnlyWalletConnectProps {
  onConnectionChange?: (connected: boolean, address?: string) => void;
}

export default function ClientOnlyWalletConnect({ onConnectionChange }: ClientOnlyWalletConnectProps) {
  const { address, isConnected } = useAccount();
  const { connectors, connect, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && onConnectionChange) {
      onConnectionChange(isConnected, address);
    }
  }, [isConnected, address, onConnectionChange, mounted]);

  if (!mounted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔐 Connect Your Wallet</CardTitle>
          <p className="text-sm text-gray-600">
            Initializing wallet connection...
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

  if (isConnected && address) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span>Wallet Connected</span>
          </CardTitle>
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Wallet className="w-3 h-3 mr-1" />
              Connected
            </Badge>
            <p className="text-sm text-gray-600 font-mono bg-gray-50 p-2 rounded">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => disconnect()}
            variant="outline"
            className="w-full"
          >
            Disconnect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🔐 Connect Your Wallet</CardTitle>
        <p className="text-sm text-gray-600">
          Choose your preferred wallet to connect to the Spice Platform
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        )}

        <div className="space-y-2">
          {connectors.map((connector) => (
            <Button
              key={connector.uid}
              onClick={() => connect({ connector })}
              disabled={isPending}
              variant="outline"
              className="w-full flex items-center justify-between p-4 h-auto"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <span className="font-medium">{connector.name}</span>
              </div>
              {isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
            </Button>
          ))}
        </div>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-gray-500">
            Don't have a wallet?{' '}
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Get MetaMask
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}