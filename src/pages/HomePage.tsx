import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Star, Heart, ArrowRight, ShieldCheck, Zap, RefreshCw, Truck, Tag, Sparkles } from 'lucide-react';
import { useCart, Product } from '../contexts/CartContext';
import { MOCK_PRODUCTS } from '../data/mockProducts';

export function HomePage() {
  const [products] = useState<Product[]>(MOCK_PRODUCTS);
  const [loading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const { addToCart, addToWishlist, isInWishlist, applyOffer } = useCart();
  const navigate = useNavigate();

  const categories = [
    { name: 'All', icon: '✨', count: products.length },
    { name: 'Electronics', icon: '🎧', count: products.filter((p) => p.category === 'Electronics').length || 2 },
    { name: 'Clothing', icon: '👕', count: products.filter((p) => p.category === 'Clothing').length || 4 },
    { name: 'Grocery', icon: '🥑', count: products.filter((p) => p.category === 'Grocery').length || 3 },
  ];

  const filteredProducts =
    selectedCategory === 'All'
      ? products
      : products.filter((p) => p.category?.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Notification / Promo Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 text-white text-xs sm:text-sm py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
        <Sparkles size={16} className="text-yellow-300 animate-pulse" />
        <span>Grand Festive Sale Live! Use code <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold tracking-wide">SAVE20</span> for 20% flat discount on checkout.</span>
        <button 
          onClick={() => {
            applyOffer({
              id: 1,
              title: 'Mega 20% Discount',
              description: 'Get 20% instant flat discount',
              discount: 20,
              type: 'coupon',
              code: 'SAVE20',
              maxDiscount: 1000
            });
            navigate('/cart');
          }}
          className="underline ml-2 hover:text-yellow-300 font-semibold cursor-pointer"
        >
          Claim Now &rarr;
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-16 sm:py-24 px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.18),transparent_50%)]"></div>
        <div className="container mx-auto relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-400 text-sm font-semibold tracking-wide backdrop-blur-md">
              <Zap size={16} className="text-yellow-400" /> Next-Gen C++ OOP Powered E-Commerce
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              Premium Shopping <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                Delivered in Minutes
              </span>
            </h1>
            <p className="text-slate-300 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0">
              Discover curated electronics, trending apparel, and everyday groceries backed by an ultra-fast C++ order dispatch & live delivery tracking pipeline.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <Link
                to="/search"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <ShoppingBag size={20} />
                Explore Products
              </Link>
              <Link
                to="/cart"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-md transition-all flex items-center gap-2"
              >
                View Cart & Offers
                <ArrowRight size={18} />
              </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 text-center lg:text-left">
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-white">100%</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Authentic Brands</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-blue-400">2 Hr</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Express Dispatch</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-400">4.9★</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider">Customer Rating</p>
              </div>
            </div>
          </div>

          {/* Hero Visual Card Carousel */}
          <div className="relative">
            <div className="relative mx-auto max-w-md bg-gradient-to-b from-slate-800/90 to-slate-900/90 rounded-3xl p-6 border border-slate-700 shadow-2xl backdrop-blur-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/20 px-3 py-1 rounded-full">
                  🔥 Trending Deal of the Day
                </span>
                <span className="text-xs text-green-400 font-semibold">In Stock</span>
              </div>
              <div className="h-64 rounded-2xl overflow-hidden mb-5 bg-slate-950 relative group">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80"
                  alt="Smart Watch"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  20% OFF
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">Smart Watch AMOLED Pro</h3>
                    <p className="text-sm text-slate-400">Heart Rate, SPO2, GPS & 7-Day Battery</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-blue-400">₹2,500</p>
                    <p className="text-xs text-slate-500 line-through">₹3,125</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-yellow-400 pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                  <span className="text-xs text-slate-300 ml-2">4.8 (128 reviews)</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    onClick={() => {
                      addToCart({
                        id: 1001,
                        name: 'Smart Watch',
                        price: 2500,
                        category: 'Electronics',
                        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'
                      });
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition text-sm flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={18} /> Add to Cart
                  </button>
                  <Link
                    to="/product/1001"
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-xl transition text-sm flex items-center justify-center"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions Bar */}
      <section className="bg-white border-y border-slate-200 py-8 shadow-sm">
        <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl flex-shrink-0">
              <Truck size={28} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">Free Express Shipping</h4>
              <p className="text-xs text-slate-500">On all orders above ₹2000</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl flex-shrink-0">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">100% Secure Checkout</h4>
              <p className="text-xs text-slate-500">256-bit SSL & UPI verification</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl flex-shrink-0">
              <RefreshCw size={28} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">7-Day Easy Returns</h4>
              <p className="text-xs text-slate-500">No questions asked refund</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl flex-shrink-0">
              <Tag size={28} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm sm:text-base">Best Price Guarantee</h4>
              <p className="text-xs text-slate-500">Direct from manufacturers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs & Product Showcase */}
      <section className="py-16 px-4 container mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600">Browse Catalog</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Featured Products</h2>
            <p className="text-slate-600 text-sm">Hand-picked bestsellers ready for rapid dispatch</p>
          </div>

          {/* Category Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  selectedCategory === cat.name ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-600'
                }`}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Loading catalog from C++ backend...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <p className="text-slate-600 font-medium mb-4">No products in this category yet.</p>
            <button
              onClick={() => setSelectedCategory('All')}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold hover:bg-blue-700"
            >
              Show All Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const inWishlist = isInWishlist(product.id);
              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  <div className="relative">
                    <Link to={`/product/${product.id}`} className="block h-52 overflow-hidden bg-slate-100 relative">
                      <img
                        src={product.image || `https://via.placeholder.com/300?text=${product.name}`}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                    </Link>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        addToWishlist(product);
                      }}
                      aria-label="Add to wishlist"
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer ${
                        inWishlist
                          ? 'bg-red-50 text-red-500 border border-red-200'
                          : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
                      }`}
                    >
                      <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
                    </button>

                    {/* Category tag */}
                    <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                      {product.category || 'General'}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
                        <Star size={14} fill="currentColor" />
                        <span>{product.rating || 4.5}</span>
                        <span className="text-slate-400">({product.reviews || 40})</span>
                      </div>
                      <Link to={`/product/${product.id}`} className="hover:text-blue-600 transition">
                        <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1">{product.name}</h3>
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                        {product.description || 'High-grade genuine product with rapid delivery.'}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-xs text-slate-400">Price</p>
                        <p className="text-xl font-extrabold text-blue-600">₹{product.price.toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => addToCart(product, 1)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition cursor-pointer"
                        >
                          <ShoppingBag size={14} />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Promotional Offers Grid Banner */}
      <section className="bg-gradient-to-b from-slate-100 to-slate-50 py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600">Special Promos</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Unlock Instant Savings</h2>
            <p className="text-slate-600 text-sm">Apply these verified promotional discount codes directly to your cart.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-2">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Coupon Offer</span>
                <h3 className="text-2xl font-black">20% Flat OFF</h3>
                <p className="text-blue-100 text-sm">Enjoy 20% discount on every item in your shopping cart up to ₹1,000.</p>
              </div>
              <div className="pt-6 flex items-center justify-between">
                <span className="bg-white text-blue-900 font-mono font-extrabold px-3 py-1.5 rounded-lg text-sm">
                  SAVE20
                </span>
                <button
                  onClick={() => {
                    applyOffer({
                      id: 1,
                      title: 'Mega 20% Discount',
                      description: 'Get 20% instant flat discount',
                      discount: 20,
                      type: 'coupon',
                      code: 'SAVE20',
                      maxDiscount: 1000
                    });
                    navigate('/cart');
                  }}
                  className="bg-blue-950 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Apply & Checkout
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-2">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Threshold Bonus</span>
                <h3 className="text-2xl font-black">₹50 Cash Off</h3>
                <p className="text-emerald-100 text-sm">Automatic instant deduction on all order totals crossing ₹500.</p>
              </div>
              <div className="pt-6 flex items-center justify-between">
                <span className="bg-white text-emerald-900 font-mono font-extrabold px-3 py-1.5 rounded-lg text-sm">
                  SPEND500
                </span>
                <button
                  onClick={() => {
                    applyOffer({
                      id: 2,
                      title: 'Spend & Save ₹50',
                      description: 'Automatic ₹50 discount on orders above ₹500',
                      discount: 10,
                      type: 'threshold',
                      minAmount: 500,
                      code: 'SPEND500'
                    });
                    navigate('/cart');
                  }}
                  className="bg-emerald-950 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Apply & Checkout
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-600 to-pink-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-2">
                <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">BOGO Special</span>
                <h3 className="text-2xl font-black">50% Off 2nd Item</h3>
                <p className="text-purple-100 text-sm">Buy snacks or apparel items and receive 50% discount on the combo.</p>
              </div>
              <div className="pt-6 flex items-center justify-between">
                <span className="bg-white text-purple-900 font-mono font-extrabold px-3 py-1.5 rounded-lg text-sm">
                  BOGO50
                </span>
                <button
                  onClick={() => {
                    applyOffer({
                      id: 3,
                      title: 'Buy 1 Get 1 Special',
                      description: '50% discount on 2nd bundle item',
                      discount: 50,
                      type: 'bogo',
                      code: 'BOGO50'
                    });
                    navigate('/cart');
                  }}
                  className="bg-purple-950 hover:bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Apply & Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
