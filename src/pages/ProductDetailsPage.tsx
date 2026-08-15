import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, Star, Plus, Minus, Share2 } from 'lucide-react';

type Product = {
  id: number;
  name: string;
  price: number;
  description?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  stock?: number;
  category?: string;
};

type ReviewType = {
  id: number;
  author: string;
  rating: number;
  text: string;
  date: string;
};

export function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/products/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleAddToCart = () => {
    const cartItem = {
      ...product,
      quantity,
    };
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === product?.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push(cartItem);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate('/cart');
  };

  const handleAddToWishlist = () => {
    setWishlist(!wishlist);
    const wishlistItems = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlist) {
      wishlistItems.push(product);
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    } else {
      const filtered = wishlistItems.filter((item: any) => item.id !== product?.id);
      localStorage.setItem('wishlist', JSON.stringify(filtered));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <button
          onClick={() => navigate('/')}
          className="mb-6 text-blue-600 hover:underline"
        >
          ← Back to Products
        </button>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-lg shadow-md p-8">
          {/* Product Image */}
          <div className="flex items-center justify-center bg-gray-100 rounded-lg h-96">
            <div className="text-center text-gray-400">
              <img
                src={product.image || `https://via.placeholder.com/400?text=${product.name}`}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.round(product.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product.rating} ({product.reviews || 0} reviews)
              </span>
            </div>

            <div className="mb-6">
              <span className="text-4xl font-bold text-blue-600">₹{product.price}</span>
              <p className="text-green-600 text-sm mt-2">In Stock: {product.stock || 10}</p>
            </div>

            <p className="text-gray-600 mb-6">{product.description || 'High-quality product'}</p>

            {/* Quantity Selector */}
            <div className="mb-6 flex items-center gap-4">
              <span className="text-gray-700">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus size={18} />
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Add to Cart
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 ${
                  wishlist
                    ? 'bg-red-50 text-red-600 border border-red-300'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <Heart size={20} fill={wishlist ? 'currentColor' : 'none'} />
                {wishlist ? 'Added to Wishlist' : 'Add to Wishlist'}
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 flex items-center justify-center gap-2">
                <Share2 size={20} />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'details' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Product Details</h3>
                <div className="space-y-2 text-gray-600">
                  <p><strong>Category:</strong> {product.category || 'Electronics'}</p>
                  <p><strong>SKU:</strong> PROD-{product.id}</p>
                  <p><strong>Availability:</strong> In Stock</p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Reviews</h3>
                {reviews.length === 0 ? (
                  <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                ) : (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b border-gray-200 pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{review.author}</span>
                          <span className="text-sm text-gray-500">{review.date}</span>
                        </div>
                        <div className="flex gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        <p className="text-gray-700">{review.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
