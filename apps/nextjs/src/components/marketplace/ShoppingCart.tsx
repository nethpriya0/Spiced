import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Truck
} from 'lucide-react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  image: string;
  farmer: string;
  inStock: number;
}

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: {[key: string]: number};
  products: any[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export function ShoppingCartModal({
  isOpen,
  onClose,
  cart,
  products,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}: ShoppingCartProps) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isOpen) return null;

  const cartItems: CartItem[] = Object.entries(cart).map(([productId, quantity]) => {
    const product = products.find(p => p.id === productId);
    return {
      id: productId,
      name: product?.name || '',
      price: product?.price || 0,
      quantity,
      unit: product?.unit || '',
      image: product?.image || '📦',
      farmer: product?.farmer?.name || '',
      inStock: product?.inStock || 0
    };
  }).filter(item => item.name); // Filter out invalid items

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = totalValue > 50 ? 0 : 9.99;
  const finalTotal = totalValue + shipping;

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate checkout
    onCheckout();
    setIsCheckingOut(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
            {totalItems > 0 && (
              <Badge className="bg-green-600">{totalItems} items</Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-4">Add some premium spices to get started</p>
              <Button onClick={onClose}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{item.image}</div>

                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">by {item.farmer}</p>
                      <p className="text-lg font-bold text-green-600">${item.price.toFixed(2)} per {item.unit}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2 border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="h-8 w-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onUpdateQuantity(item.id, Math.min(item.inStock, item.quantity + 1))}
                          className="h-8 w-8 p-0"
                          disabled={item.quantity >= item.inStock}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="font-semibold text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        {item.quantity >= item.inStock && (
                          <div className="text-xs text-orange-600">Max stock</div>
                        )}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="border-t p-6 space-y-4">

            {/* Order Summary */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalValue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="flex items-center space-x-1">
                  <Truck className="w-4 h-4" />
                  <span>Shipping</span>
                </span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <div className="text-xs text-gray-500">
                  Free shipping on orders over $50
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <div className="space-y-2">
              <Button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isCheckingOut ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <CreditCard className="w-4 h-4" />
                    <span>Proceed to Checkout</span>
                  </div>
                )}
              </Button>

              <div className="text-center">
                <Button variant="ghost" onClick={onClose} className="text-sm">
                  Continue Shopping
                </Button>
              </div>
            </div>

            {/* Security Notice */}
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>🔒 Secure blockchain-verified transactions</p>
              <p>📦 Direct from verified farmers • 🚚 Global shipping available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}