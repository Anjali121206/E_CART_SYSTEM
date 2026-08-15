import { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, BrowserRouter } from 'react-router-dom';
import { Plus, Minus, Trash2, ArrowLeft, Package, Loader } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OffersDisplay } from './components/OffersDisplay';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { ProductSearchPage } from './pages/ProductSearchPage';
import { WishlistPage } from './pages/WishlistPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { DeliveryTrackingPage } from './pages/DeliveryTrackingPage';
import { AdminPanel } from './pages/AdminPanel';

type CartItemType = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const SHIPPING_COST = 5.0;

function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItemType;
  onQuantityChange: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <img className="h-16 w-16 rounded object-cover" src={item.image} alt={item.name} />
          <span className="font-semibold text-gray-800">{item.name}</span>
        </div>
      </td>
      <td className="py-4 text-gray-800">₹{item.price.toFixed(2)}</td>
      <td className="py-4">
        <div className="flex items-center border border-gray-300 rounded-lg inline-flex">
          <button
            onClick={() => onQuantityChange(item.id, -1)}
            className="p-1 hover:bg-gray-100 transition-colors"
            aria-label="Remove one item"
          >
            <Minus size={16} className="text-gray-600" />
          </button>
          <span className="px-3 py-1 text-center w-8">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.id, 1)}
            className="p-1 hover:bg-gray-100 transition-colors"
            aria-label="Add one item"
          >
            <Plus size={16} className="text-gray-600" />
          </button>
        </div>
      </td>
      <td className="py-4 font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</td>
      <td className="py-4">
        <button
          onClick={() => onRemove(item.id)}
          className="text-gray-400 hover:text-red-600 transition-colors"
          aria-label="Remove item"
        >
          <Trash2 size={20} />
        </button>
      </td>
    </tr>
  );
}

function CartSummary({
  subtotal,
  discountAmount,
  appliedOffer,
  total,
}: {
  subtotal: number;
  discountAmount: number;
  appliedOffer?: any;
  total: number;
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Summary</h2>
      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>₹{subtotal.toFixed(2)}</span>
      </div>
      {discountAmount > 0 && (
        <div className="flex justify-between mb-2 text-green-600">
          <span>Discount {appliedOffer && `(${appliedOffer.title})`}</span>
          <span>-₹{discountAmount.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between mb-2">
        <span>Shipping</span>
        <span>₹{SHIPPING_COST.toFixed(2)}</span>
      </div>
      <hr className="my-2" />
      <div className="flex justify-between mb-4">
        <span className="font-semibold">Total</span>
        <span className="font-semibold text-lg">₹{total.toFixed(2)}</span>
      </div>
      <button
        onClick={() => navigate('/payment')}
        className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg mt-4 w-full font-semibold transition-colors"
      >
        Checkout
      </button>
    </div>
  );
}

function PaymentPage({
  cartItems,
  subtotal,
  discountAmount,
  total,
}: {
  cartItems: CartItemType[];
  subtotal: number;
  discountAmount: number;
  total: number;
}) {
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const handlePlaceOrder = async () => {
    if (!isLoggedIn) {
      alert('Please login to place an order');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          items: cartItems,
          paymentMethod,
          total,
          subtotal,
          discount: discountAmount,
          shipping: SHIPPING_COST,
        }),
      });

      if (response.ok) {
        alert(`Order placed successfully with ${paymentMethod.toUpperCase()}! Total: ₹${total.toFixed(2)}`);
        navigate('/orders');
      }
    } catch (error) {
      alert('Failed to place order. Please try again.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <Package size={48} className="mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-semibold mb-4">Please login to checkout</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <Link to="/" className="text-blue-600 hover:underline mb-4 inline-flex items-center">
          <ArrowLeft size={16} className="mr-1" /> Back to Cart
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Confirm Your Order</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-semibold">₹{(item.price * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{SHIPPING_COST.toFixed(2)}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-8 h-fit sticky top-20">
            <h2 className="text-xl font-semibold mb-6">Payment Method</h2>
            <div className="space-y-3 mb-6">
              {[
                { value: 'upi', label: 'UPI / Net Banking', icon: '🏦' },
                { value: 'card', label: 'Credit / Debit Card', icon: '💳' },
                { value: 'wallet', label: 'Digital Wallet', icon: '💰' },
                { value: 'cod', label: 'Cash on Delivery', icon: '📦' },
              ].map((method) => (
                <label
                  key={method.value}
                  className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.value}
                    checked={paymentMethod === method.value}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span className="ml-3 flex items-center gap-2">
                    {method.icon} {method.label}
                  </span>
                </label>
              ))}
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? 'Processing...' : 'Place Order'}
            </button>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800">
                ✓ Secure checkout with 128-bit SSL encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartPage({
  cartItems,
  loading,
  error,
  handleQuantityChange,
  handleRemoveItem,
  subtotal,
  discountAmount,
  appliedOffer,
  setAppliedOffer,
  total,
}: {
  cartItems: CartItemType[];
  loading: boolean;
  error: string | null;
  handleQuantityChange: (id: number, delta: number) => void;
  handleRemoveItem: (id: number) => void;
  subtotal: number;
  discountAmount: number;
  appliedOffer?: any;
  setAppliedOffer?: (offer: any) => void;
  total: number;
}) {
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 text-center">
        <h1 className="text-2xl font-semibold">Loading...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen py-8 text-center">
        <h1 className="text-2xl font-semibold text-red-500">Error: {error}</h1>
        <p className="text-gray-600">Please make sure the backend server is running.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shopping Cart</h1>
        {cartItems.length > 0 ? (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left font-semibold text-gray-800 py-3">Product</th>
                      <th className="text-left font-semibold text-gray-800 py-3">Price</th>
                      <th className="text-left font-semibold text-gray-800 py-3">Quantity</th>
                      <th className="text-left font-semibold text-gray-800 py-3">Total</th>
                      <th className="text-left font-semibold text-gray-800 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Sidebar with Offers and Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Offers */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <OffersDisplay
                  onApplyOffer={setAppliedOffer || (() => {})}
                  appliedOffer={appliedOffer}
                />
              </div>

              {/* Cart Summary */}
              <CartSummary
                subtotal={subtotal}
                discountAmount={discountAmount}
                appliedOffer={appliedOffer}
                total={total}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty.</h2>
            <p className="text-gray-600 mb-6">Start shopping to add items to your cart!</p>
            <Link
              to="/search"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-block transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function AppContent() {
  const [cartItems, setCartItems] = useState<CartItemType[]>([]);
  const [wishlistItems, setWishlistItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedOffer, setAppliedOffer] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const products = await response.json();
        const fetchedCartItems = products.map((product: any) => ({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: `https://placehold.co/100x100/e2e8f0/334155?text=${product.name.replace(/\s/g, '+')}`,
        }));
        setCartItems(fetchedCartItems);
        
        // Load wishlist from localStorage
        const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setWishlistItems(savedWishlist);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigate('/search');
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const discountAmount = appliedOffer
    ? Math.min(
        (subtotal * appliedOffer.discount) / 100,
        appliedOffer.maxDiscount || Infinity
      )
    : 0;

  const finalSubtotal = subtotal - discountAmount;
  const total = finalSubtotal + SHIPPING_COST;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        cartCount={cartItems.length}
        wishlistCount={wishlistItems.length}
        onSearch={handleSearch}
      />
      
      <main className="flex-grow">
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main Routes */}
          <Route
            path="/"
            element={
              <CartPage
                cartItems={cartItems}
                loading={loading}
                error={error}
                handleQuantityChange={handleQuantityChange}
                handleRemoveItem={handleRemoveItem}
                subtotal={finalSubtotal}
                discountAmount={discountAmount}
                appliedOffer={appliedOffer}
                setAppliedOffer={setAppliedOffer}
                total={total}
              />
            }
          />

          <Route
            path="/payment"
            element={<PaymentPage cartItems={cartItems} subtotal={finalSubtotal} discountAmount={discountAmount} total={total} />}
          />

          {/* Product Routes */}
          <Route path="/product/:productId" element={<ProductDetailsPage />} />
          <Route path="/search" element={<ProductSearchPage />} />

          {/* User Routes */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId/tracking" element={<DeliveryTrackingPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
