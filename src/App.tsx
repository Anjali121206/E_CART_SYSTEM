import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { CartPage } from './pages/CartPage';
import { ProductSearchPage } from './pages/ProductSearchPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { PaymentPage } from './pages/PaymentPage';
import { OrderHistoryPage } from './pages/OrderHistoryPage';
import { DeliveryTrackingPage } from './pages/DeliveryTrackingPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPanel } from './pages/AdminPanel';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CheckCircle, Info, AlertTriangle, X } from 'lucide-react';

function GlobalNotification() {
  const { notification, clearNotification } = useCart();
  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-bold text-white ${
          notification.type === 'success'
            ? 'bg-slate-900 border border-slate-700'
            : notification.type === 'error'
            ? 'bg-red-600'
            : 'bg-blue-600'
        }`}
      >
        {notification.type === 'success' && <CheckCircle size={18} className="text-emerald-400" />}
        {notification.type === 'error' && <AlertTriangle size={18} className="text-yellow-300" />}
        {notification.type === 'info' && <Info size={18} className="text-blue-300" />}
        <span>{notification.message}</span>
        <button
          onClick={clearNotification}
          className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <Navbar />
      <GlobalNotification />

      <main className="flex-1">
        <Routes>
          {/* Storefront & Discovery */}
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ProductSearchPage />} />
          <Route path="/search" element={<ProductSearchPage />} />
          <Route path="/product/:productId" element={<ProductDetailsPage />} />

          {/* Cart & Checkout */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<PaymentPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* Orders & Tracking */}
          <Route path="/orders" element={<OrderHistoryPage />} />
          <Route path="/orders/:orderId/tracking" element={<DeliveryTrackingPage />} />

          {/* User Management & Saved Items */}
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Admin Management */}
          <Route path="/admin" element={<AdminPanel />} />

          {/* Authentication */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* 404 Catch-All */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainLayout />
      </CartProvider>
    </AuthProvider>
  );
}
