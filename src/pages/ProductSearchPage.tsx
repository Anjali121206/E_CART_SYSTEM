import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Grid, List, Search, SlidersHorizontal, ShoppingBag, X } from 'lucide-react';
import { useCart, Product } from '../contexts/CartContext';
import { MOCK_PRODUCTS } from '../data/mockProducts';

export function ProductSearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);

  const { addToCart, addToWishlist, isInWishlist } = useCart();

  useEffect(() => {
    // Use mock data directly — no backend required
    const uniqueCategories = Array.from(
      new Set(MOCK_PRODUCTS.map((p: Product) => p.category || 'General'))
    ) as string[];
    setProducts(MOCK_PRODUCTS);
    setCategories(uniqueCategories);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = products.filter((product) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        product.name.toLowerCase().includes(q) ||
        product.category?.toLowerCase().includes(q) ||
        product.description?.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'all' ||
        product.category?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesPrice =
        product.price >= priceRange.min && product.price <= priceRange.max;

      const matchesStock = !inStockOnly || (product.stock && product.stock > 0);

      return matchesSearch && matchesCategory && matchesPrice && matchesStock;
    });

    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy, inStockOnly]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange({ min: 0, max: 10000 });
    setSortBy('relevance');
    setInStockOnly(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Shop & Explore</h1>
          <p className="text-slate-500 text-sm">
            Search across our entire catalog with real-time filtering and sorting.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm sticky top-24 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-blue-600" /> Filters
                </h3>
                <button
                  onClick={resetFilters}
                  className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Search text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Keyword Search
                </label>
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, type..."
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">All Categories ({products.length})</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Max Price
                  </label>
                  <span className="text-xs font-extrabold text-blue-600 font-mono">
                    ₹{priceRange.max.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000"
                  step="100"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange({ ...priceRange, max: parseInt(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>₹0</span>
                  <span>₹10,000+</span>
                </div>
              </div>

              {/* In Stock toggle */}
              <div>
                <label className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Products Results */}
          <div className="lg:col-span-3">
            {/* Control Bar: Count, Sort, Grid/List view */}
            <div className="bg-white rounded-2xl p-4 mb-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-600">
                Showing <span className="font-extrabold text-slate-900">{filteredProducts.length}</span> of {products.length} products
              </p>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewType('grid')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewType === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="Grid View"
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => setViewType('list')}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      viewType === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                    title="List View"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-500 text-sm font-medium">Loading catalog...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
                <Search size={48} className="mx-auto mb-4 text-slate-300" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">No matching products found</h3>
                <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
                  Try adjusting your filters, searching for a different keyword, or resetting your price range.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : viewType === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const inWishlist = isInWishlist(product.id);
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                    >
                      <div className="relative">
                        <Link to={`/product/${product.id}`} className="block h-48 overflow-hidden bg-slate-100">
                          <img
                            src={product.image || `https://via.placeholder.com/300?text=${product.name}`}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                        <button
                          onClick={() => addToWishlist(product)}
                          aria-label="Add to wishlist"
                          className={`absolute top-3 right-3 p-2 rounded-full shadow-md backdrop-blur-md transition-all cursor-pointer ${
                            inWishlist
                              ? 'bg-red-50 text-red-500 border border-red-200'
                              : 'bg-white/90 text-slate-600 hover:bg-white hover:text-red-500'
                          }`}
                        >
                          <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                        </button>
                        <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                          {product.category || 'General'}
                        </span>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold mb-1">
                            <Star size={13} fill="currentColor" />
                            <span>{product.rating || 4.5}</span>
                            <span className="text-slate-400">({product.reviews || 30})</span>
                          </div>
                          <Link to={`/product/${product.id}`} className="hover:text-blue-600 transition">
                            <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{product.name}</h3>
                          </Link>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                            {product.description || 'High quality certified item.'}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <p className="text-[10px] text-slate-400 uppercase">Price</p>
                            <p className="text-lg font-black text-blue-600">₹{product.price.toLocaleString()}</p>
                          </div>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                          >
                            <ShoppingBag size={14} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="space-y-4">
                {filteredProducts.map((product) => {
                  const inWishlist = isInWishlist(product.id);
                  return (
                    <div
                      key={product.id}
                      className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <Link to={`/product/${product.id}`} className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                        </Link>
                        <div>
                          <span className="text-xs font-bold text-blue-600 uppercase">{product.category}</span>
                          <Link to={`/product/${product.id}`} className="hover:text-blue-600">
                            <h3 className="font-bold text-slate-900 text-base">{product.name}</h3>
                          </Link>
                          <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold my-1">
                            <Star size={12} fill="currentColor" />
                            <span>{product.rating || 4.5}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 max-w-md">{product.description}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                        <div className="text-right">
                          <p className="text-xl font-black text-blue-600">₹{product.price.toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => addToWishlist(product)}
                            className={`p-2.5 rounded-xl border transition cursor-pointer ${
                              inWishlist ? 'bg-red-50 text-red-500 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            <Heart size={16} fill={inWishlist ? 'currentColor' : 'none'} />
                          </button>
                          <button
                            onClick={() => addToCart(product, 1)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                          >
                            <ShoppingBag size={14} /> Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
