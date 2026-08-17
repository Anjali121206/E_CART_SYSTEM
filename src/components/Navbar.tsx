import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, Heart, User, LogOut, Menu, X, Search, ShieldAlert, Sparkles } from 'lucide-react';

export function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { cartItems, wishlistItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdown, setUserDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdown(false);
    navigate('/login');
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
              <ShoppingBag size={22} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                E-Cart<span className="text-blue-600">.</span>
              </span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest -mt-1 hidden sm:block">
                Ultra Fast Store
              </p>
            </div>
          </Link>

          {/* Quick Nav Links (Desktop) */}
          <div className="hidden lg:flex items-center gap-6 text-sm font-bold text-slate-600">
            <Link to="/" className="hover:text-blue-600 transition">
              Home
            </Link>
            <Link to="/search" className="hover:text-blue-600 transition flex items-center gap-1">
              Shop All
            </Link>
            <Link to="/cart" className="hover:text-blue-600 transition flex items-center gap-1">
              <Sparkles size={15} className="text-amber-500" /> Offers & Cart
            </Link>
            <Link to="/orders" className="hover:text-blue-600 transition">
              Track Order
            </Link>
          </div>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="w-full relative">
              <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, groceries..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none focus:bg-white transition"
              />
            </div>
          </form>

          {/* Desktop Right Nav: Wishlist, Cart, User */}
          <div className="hidden md:flex items-center gap-4">
            {/* Wishlist Icon */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-2xl text-slate-600 hover:text-red-500 hover:bg-slate-50 transition"
              title="My Wishlist"
            >
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-2xl text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition"
              title="Shopping Cart"
            >
              <ShoppingBag size={22} />
              {totalCartCount > 0 && (
                <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-extrabold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                  {totalCartCount}
                </span>
              )}
            </Link>

            <div className="h-6 w-px bg-slate-200 mx-1"></div>

            {/* User Account / Profile */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdown(!userDropdown)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl hover:bg-slate-50 border border-slate-200/80 transition cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                    {(user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-slate-900 line-clamp-1">{user?.name?.split(' ')[0]}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{user?.role || 'USER'}</p>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-slate-200 p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 text-sm">{user?.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdown(false)}
                      className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                    >
                      👤 My Profile & Addresses
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setUserDropdown(false)}
                      className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                    >
                      📦 Order History & Invoices
                    </Link>
                    <Link
                      to="/wishlist"
                      onClick={() => setUserDropdown(false)}
                      className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 rounded-xl transition"
                    >
                      ❤️ Saved Wishlist
                    </Link>
                    <Link
                      to="/admin"
                      onClick={() => setUserDropdown(false)}
                      className="block px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition"
                    >
                      🛡️ Admin Dashboard
                    </Link>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md shadow-blue-500/25 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex md:hidden items-center gap-3">
            <Link to="/cart" className="relative p-2 text-slate-700">
              <ShoppingBag size={22} />
              {totalCartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {totalCartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-xl focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-6 pt-2 border-t border-slate-100 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </form>

            <div className="space-y-1 font-semibold text-sm text-slate-700">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                🏠 Home
              </Link>
              <Link
                to="/search"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                🛍️ Browse Catalog
              </Link>
              <Link
                to="/cart"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                🛒 Shopping Cart ({totalCartCount})
              </Link>
              <Link
                to="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                ❤️ Saved Wishlist ({wishlistItems.length})
              </Link>
              <Link
                to="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                📦 Track & Orders
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-slate-50"
              >
                👤 My Account
              </Link>
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl hover:bg-blue-50 text-blue-600 font-bold"
              >
                🛡️ Admin Panel
              </Link>
            </div>

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2"
              >
                <LogOut size={16} /> Logout ({user?.email})
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold border border-slate-200 rounded-xl"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
