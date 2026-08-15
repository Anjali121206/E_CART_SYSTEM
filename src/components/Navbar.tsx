import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Heart, User, LogOut, Menu, X, Search } from 'lucide-react';

type NavbarProps = {
  cartCount: number;
  wishlistCount: number;
  onSearch: (query: string) => void;
};

export function Navbar({ cartCount, wishlistCount, onSearch }: NavbarProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            E-Cart
          </Link>

          {/* Search Bar (Desktop) */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-8">
            <div className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <Search size={20} />
              </button>
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isLoggedIn && (
              <div className="flex items-center gap-4">
                <Link
                  to="/wishlist"
                  className="relative flex items-center text-gray-700 hover:text-blue-600 transition"
                >
                  <Heart size={24} />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link
                  to="/cart"
                  className="relative flex items-center text-gray-700 hover:text-blue-600 transition"
                >
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Link>

                <div className="flex items-center gap-2">
                  <User size={20} />
                  <span className="text-sm font-medium">{user?.name?.split(' ')[0]}</span>
                </div>

                <div className="relative group">
                  <button className="text-gray-700 hover:text-blue-600">
                    <User size={24} />
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Order History
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 last:rounded-b-lg flex items-center gap-2"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoggedIn && (
              <div className="flex gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button type="submit" className="absolute right-3 top-2.5">
                  <Search size={20} />
                </button>
              </div>
            </form>

            {isLoggedIn && (
              <div className="space-y-2">
                <Link
                  to="/wishlist"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
                >
                  ❤️ Wishlist ({wishlistCount})
                </Link>
                <Link to="/cart" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  🛒 Cart ({cartCount})
                </Link>
                <Link to="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  👤 My Profile
                </Link>
                <Link to="/orders" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                  📋 Order History
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded"
                >
                  Logout
                </button>
              </div>
            )}

            {!isLoggedIn && (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-center text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-center bg-blue-600 text-white rounded hover:bg-blue-700"
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
