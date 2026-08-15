import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, Grid, List } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  price: number;
  rating?: number;
  image?: string;
  category?: string;
};

export function ProductSearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [sortBy, setSortBy] = useState('relevance');
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        if (response.ok) {
          const data = await response.json();
          setProducts(data);
          const uniqueCategories = [...new Set(data.map((p: Product) => p.category || 'Other'))];
          setCategories(uniqueCategories as string[]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  const renderProductCard = (product: Product) => (
    <Link
      key={product.id}
      to={`/product/${product.id}`}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden group"
    >
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
        <img
          src={product.image || `https://via.placeholder.com/200?text=${product.name}`}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
            wishlist.push(product);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            alert('Added to wishlist!');
          }}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow hover:bg-gray-100"
        >
          <Heart size={20} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 line-clamp-2 mb-2">{product.name}</h3>
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
              />
            ))}
          </div>
        )}
        <p className="text-lg font-bold text-blue-600">₹{product.price}</p>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Shop Products</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20 space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price Range</label>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: parseInt(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>₹{priceRange.min}</span>
                    <span>₹{priceRange.max}</span>
                  </div>
                </div>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating</option>
                </select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* View Toggle */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewType('grid')}
                  className={`p-2 rounded ${
                    viewType === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 rounded ${
                    viewType === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-gray-600">Loading products...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600">No products found matching your criteria.</p>
              </div>
            ) : viewType === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(renderProductCard)}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow flex gap-4"
                  >
                    <div className="w-24 h-24 bg-gray-100 rounded flex-shrink-0">
                      <img
                        src={product.image || `https://via.placeholder.com/100?text=${product.name}`}
                        alt={product.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{product.name}</h3>
                      {product.rating && (
                        <div className="flex items-center gap-1 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                      )}
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.category}</p>
                      <p className="text-lg font-bold text-blue-600">₹{product.price}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
