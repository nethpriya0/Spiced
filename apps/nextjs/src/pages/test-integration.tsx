import { useState } from 'react';
import Head from 'next/head';
import WalletConnect from '@/components/WalletConnect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/utils/api';

export default function TestIntegration() {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  // API mutations for testing
  const registerFarmer = api.farmers.register.useMutation();
  const getFarmerByWallet = api.farmers.getByWallet.useQuery(
    { walletAddress },
    { enabled: !!walletAddress }
  );
  const getAllProducts = api.products.getAll.useQuery({});
  const createAuthSession = api.auth.createSession.useMutation();

  const handleWalletConnection = (connected: boolean, address?: string) => {
    setIsConnected(connected);
    setWalletAddress(address || '');
    if (connected && address) {
      addTestResult(`✅ Wallet connected: ${address}`);
    } else {
      addTestResult('❌ Wallet disconnected');
      setTestResults([]);
    }
  };

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${result}`]);
  };

  const testFarmerRegistration = async () => {
    if (!walletAddress) {
      addTestResult('❌ Wallet not connected');
      return;
    }

    try {
      const result = await registerFarmer.mutateAsync({
        walletAddress,
        name: 'Test Farmer',
        email: 'farmer@test.com',
        farmLocation: 'Test Farm, Test Country',
        certifications: ['Organic', 'Fair Trade']
      });

      addTestResult(`✅ Farmer registered: ${result.farmer.name}`);
    } catch (error) {
      addTestResult(`❌ Farmer registration failed: ${error}`);
    }
  };

  const testAuthSession = async () => {
    if (!walletAddress) {
      addTestResult('❌ Wallet not connected');
      return;
    }

    try {
      const result = await createAuthSession.mutateAsync({
        walletAddress,
        signature: 'mock_signature',
        message: 'mock_message',
        userType: 'farmer'
      });

      addTestResult(`✅ Auth session created: ${result.sessionId}`);
    } catch (error) {
      addTestResult(`❌ Auth session failed: ${error}`);
    }
  };

  const testSmartContractConnection = () => {
    const contractAddress = process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS;
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;

    if (contractAddress && rpcUrl) {
      addTestResult(`✅ Smart contracts configured:`);
      addTestResult(`   Diamond: ${contractAddress}`);
      addTestResult(`   RPC: ${rpcUrl}`);
    } else {
      addTestResult('❌ Smart contract configuration missing');
    }
  };

  return (
    <>
      <Head>
        <title>Integration Test - Spice Platform</title>
        <meta name="description" content="Test page for Spice Platform integration" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🌶️ Spice Platform Integration Test
            </h1>
            <p className="text-gray-600">
              Test the complete Web3 integration: Wallet → Backend APIs → Smart Contracts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Wallet Connection */}
            <div className="space-y-4">
              <WalletConnect onConnectionChange={handleWalletConnection} />

              {/* Test Controls */}
              {isConnected && (
                <Card>
                  <CardHeader>
                    <CardTitle>🧪 Integration Tests</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={testFarmerRegistration}
                      disabled={registerFarmer.isLoading}
                      className="w-full"
                    >
                      {registerFarmer.isLoading ? '⏳' : '👨‍🌾'} Test Farmer Registration
                    </Button>

                    <Button
                      onClick={testAuthSession}
                      disabled={createAuthSession.isLoading}
                      variant="outline"
                      className="w-full"
                    >
                      {createAuthSession.isLoading ? '⏳' : '🔐'} Test Auth Session
                    </Button>

                    <Button
                      onClick={testSmartContractConnection}
                      variant="outline"
                      className="w-full"
                    >
                      ⛓️ Test Contract Connection
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Results and Data */}
            <div className="space-y-4">
              {/* Test Results */}
              <Card>
                <CardHeader>
                  <CardTitle>📊 Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-40 overflow-y-auto bg-gray-100 p-3 rounded text-sm font-mono">
                    {testResults.length === 0 ? (
                      <div className="text-gray-500">Connect wallet to start testing...</div>
                    ) : (
                      testResults.map((result, index) => (
                        <div key={index} className="mb-1">
                          {result}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Sample Data */}
              <Card>
                <CardHeader>
                  <CardTitle>🛒 Sample Marketplace Data</CardTitle>
                </CardHeader>
                <CardContent>
                  {getAllProducts.isLoading ? (
                    <div>Loading products...</div>
                  ) : getAllProducts.data ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">
                        Found {getAllProducts.data.products.length} products
                      </div>
                      {getAllProducts.data.products.slice(0, 3).map(product => (
                        <div key={product.id} className="border-l-4 border-orange-500 pl-3 py-1">
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-gray-600">
                            {product.spiceType} • ${product.pricePerUnit}/{product.unit}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500">No products available</div>
                  )}
                </CardContent>
              </Card>

              {/* Environment Info */}
              <Card>
                <CardHeader>
                  <CardTitle>⚙️ Environment</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <div>🌐 Chain ID: {process.env.NEXT_PUBLIC_CHAIN_ID}</div>
                  <div>🔗 RPC: {process.env.NEXT_PUBLIC_RPC_URL}</div>
                  <div>💎 Diamond: {process.env.NEXT_PUBLIC_DIAMOND_PROXY_ADDRESS?.slice(0, 10)}...</div>
                  <div>🌱 Farmer Registry: {process.env.NEXT_PUBLIC_FARMER_REGISTRY_ADDRESS?.slice(0, 10)}...</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}