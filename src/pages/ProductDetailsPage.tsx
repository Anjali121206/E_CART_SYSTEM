import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Star, Plus, Minus, Share2, ShieldCheck, Truck, RotateCcw, ShoppingBag, ArrowLeft, Send, Check } from 'lucide-react';
import { useCart, Product } from '../contexts/CartContext';
import { MOCK_PRODUCTS, MOCK_REVIEWS } from '../data/mockProducts';

type ReviewType = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

export function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart, addToWishlist, isInWishlist } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<ReviewType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'shipping'>('details');

  // Review Form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (productId) {
      const id = parseInt(productId);
      const found = MOCK_PRODUCTS.find((p) => p.id === id);
      setProduct(found || null);
      setAllProducts(MOCK_PRODUCTS);
      setReviews(MOCK_REVIEWS[id] || []);
      setLoading(false);
    }
  }, [productId]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;
    setSubmittingReview(true);
    // Save review locally (no backend needed)
    setTimeout(() => {
      setReviews((prev) => [
        {
          author: reviewAuthor.trim() || 'Verified Customer',
          rating: reviewRating,
          text: reviewText.trim(),
          date: new Date().toISOString().split('T')[0],
        },
        ...prev,
      ]);
      setReviewText('');
      setReviewAuthor('');
      setReviewSuccess(true);
      setSubmittingReview(false);
      setTimeout(() => setReviewSuccess(false), 4000);
    }, 600);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Fetching product specs...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Product Not Found</h2>
          <p className="text-slate-500 mb-6">The requested product does not exist or has been retired.</p>
          <Link
            to="/search"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl inline-block"
          >
            Browse All Products
          </Link>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = allProducts.filter(
    (p) => p.id !== product.id && (p.category === product.category || Math.abs(p.price - product.price) < 2000)
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-sm font-semibold text-slate-600 hover:text-blue-600 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </button>

        {/* Product Main Showcase Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10 mb-10">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Gallery Image */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/60 aspect-square group">
              <img
                src={product.image || `https://via.placeholder.com/600?text=${product.name}`}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider">
                {product.category || 'General'}
              </span>
              <button
                onClick={() => addToWishlist(product)}
                aria-label="Add to wishlist"
                className={`absolute top-4 right-4 p-3 rounded-full shadow-lg backdrop-blur-md transition-all cursor-pointer ${
                  inWishlist
                    ? 'bg-red-50 text-red-500 border border-red-200'
                    : 'bg-white text-slate-600 hover:text-red-500'
                }`}
              >
                <Heart size={20} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Product Meta & Purchase Controls */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    In Stock ({product.stock || 25} available)
                  </span>
                  <span className="text-xs text-slate-400 font-mono">SKU: PRD-{product.id}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 leading-tight">
                  {product.name}
                </h1>
              </div>

              {/* Rating breakdown */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={i < Math.floor(product.rating || 4.5) ? 'currentColor' : 'none'}
                      className={i < Math.floor(product.rating || 4.5) ? '' : 'text-slate-300'}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700">{product.rating || 4.5}</span>
                <span className="text-xs text-slate-400">({reviews.length + (product.reviews || 40)} verified ratings)</span>
              </div>

              {/* Pricing */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl font-black text-blue-600">
                  ₹{product.price.toLocaleString()}
                </span>
                <span className="text-base text-slate-400 line-through">
                  ₹{(product.price * 1.25).toFixed(0)}
                </span>
                <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-lg">
                  20% Flat Discount Available
                </span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed">
                {product.description || 'High-performance authentic merchandise with fast doorstep dispatch.'}
              </p>

              {/* Quantity Stepper */}
              <div className="flex items-center gap-4 pt-2">
                <span className="text-sm font-bold text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 text-base font-bold text-slate-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="p-2 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
                <button
                  onClick={() => {
                    addToCart(product, quantity);
                    navigate('/payment');
                  }}
                  className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 px-6 rounded-2xl transition flex items-center justify-center gap-2 text-base cursor-pointer"
                >
                  Buy Now &rarr;
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center text-xs text-slate-600">
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50">
                  <Truck size={20} className="text-blue-600" />
                  <span className="font-semibold">Fast 2-Hr Delivery</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50">
                  <RotateCcw size={20} className="text-purple-600" />
                  <span className="font-semibold">7 Days Easy Return</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-slate-50">
                  <ShieldCheck size={20} className="text-emerald-600" />
                  <span className="font-semibold">1 Year Warranty</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Section: Details, Interactive Reviews, Shipping */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-12">
          <div className="flex border-b border-slate-200 bg-slate-50/50">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-8 py-4 font-bold text-sm transition cursor-pointer ${
                activeTab === 'details'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Product Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`px-8 py-4 font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer Reviews
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-extrabold">
                {reviews.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('shipping')}
              className={`px-8 py-4 font-bold text-sm transition cursor-pointer ${
                activeTab === 'shipping'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Shipping & Returns
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'details' && (
              <div className="space-y-6 max-w-2xl">
                <h3 className="text-xl font-bold text-slate-900">Technical Overview</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-slate-400 text-xs">Category</p>
                    <p className="font-bold text-slate-800">{product.category || 'General'}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-slate-400 text-xs">Inventory Status</p>
                    <p className="font-bold text-emerald-600">Verified Ready to Ship</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-slate-400 text-xs">Model SKU</p>
                    <p className="font-bold text-slate-800 font-mono">ECART-P{product.id}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="text-slate-400 text-xs">Origin</p>
                    <p className="font-bold text-slate-800">Certified Manufacturer</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {product.description} All electronic devices and accessories undergo rigorous factory diagnostics and come with standard protection guarantee against defects.
                </p>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid lg:grid-cols-2 gap-10">
                {/* Reviews List */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Verified Customer Feedback</h3>
                  {reviews.length === 0 ? (
                    <p className="text-slate-500 text-sm">No reviews yet for this product. Be the first to share your experience!</p>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {reviews.map((rev, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900 text-sm">{rev.author}</span>
                            <span className="text-xs text-slate-400">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                fill={i < rev.rating ? 'currentColor' : 'none'}
                                className={i < rev.rating ? '' : 'text-slate-300'}
                              />
                            ))}
                          </div>
                          <p className="text-slate-700 text-sm">{rev.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Write Review Form */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Write a Review</h3>
                  {reviewSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-semibold flex items-center gap-2 mb-4">
                      <Check size={16} /> Thank you! Your review was recorded.
                    </div>
                  )}
                  <form onSubmit={handleAddReview} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                      <input
                        type="text"
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 text-amber-400 hover:scale-110 transition cursor-pointer"
                          >
                            <Star size={24} fill={star <= reviewRating ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Review Comments</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        rows={3}
                        required
                        placeholder="What did you like or dislike about this product?"
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition flex items-center gap-2 cursor-pointer"
                    >
                      <Send size={16} /> {submittingReview ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {activeTab === 'shipping' && (
              <div className="space-y-4 max-w-2xl text-sm text-slate-600">
                <h3 className="text-xl font-bold text-slate-900">Doorstep Delivery Policy</h3>
                <p>
                  All orders placed before 4:00 PM are dispatched same day from our local fulfillment hub. You can track real-time courier movement and driver waypoints through our interactive tracking page.
                </p>
                <ul className="list-disc pl-5 space-y-1.5">
                  <li>Standard Express Shipping: Free on orders above ₹2000 (otherwise ₹5 flat).</li>
                  <li>Delivery Slots: Morning (8-11 AM), Afternoon (1-4 PM), Evening (6-9 PM).</li>
                  <li>No-Contact Delivery option available at checkout.</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Related Recommendations</h2>
                <p className="text-xs text-slate-500">More products from {product.category || 'this category'}</p>
              </div>
              <Link to="/search" className="text-sm font-semibold text-blue-600 hover:underline">
                View All &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((rel) => (
                <div key={rel.id} className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm hover:shadow-lg transition flex flex-col justify-between">
                  <div>
                    <Link to={`/product/${rel.id}`} className="block h-40 bg-slate-100 rounded-xl overflow-hidden mb-3">
                      <img src={rel.image} alt={rel.name} className="w-full h-full object-cover" />
                    </Link>
                    <h4 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{rel.name}</h4>
                    <p className="text-xs font-bold text-blue-600 mb-3">₹{rel.price.toLocaleString()}</p>
                  </div>
                  <button
                    onClick={() => addToCart(rel, 1)}
                    className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer"
                  >
                    Add to Cart
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
