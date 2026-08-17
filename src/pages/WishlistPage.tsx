import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export function WishlistPage() {
  const { wishlistItems, removeFromWishlist, addToCart } = useCart();

  const handleMoveAllToCart = () => {
    wishlistItems.forEach((item) => {
      addToCart(item, 1);
      removeFromWishlist(item.id);
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
              <Heart size={36} className="text-red-500" fill="currentColor" /> My Saved Wishlist
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Save your favorite items now and checkout whenever you're ready.
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <button
              onClick={handleMoveAllToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
            >
              <ShoppingBag size={16} /> Move All to Cart
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={38} />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Your Wishlist is Empty</h2>
            <p className="text-slate-500 text-sm mb-6">
              Tap the heart icon on any product in our store to save it here for later.
            </p>
            <Link
              to="/search"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition inline-flex items-center gap-2"
            >
              Explore Products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition group"
              >
                <div className="relative">
                  <Link to={`/product/${item.id}`} className="block h-48 bg-slate-100 overflow-hidden">
                    <img
                      src={item.image || `https://via.placeholder.com/300?text=${item.name}`}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/90 text-red-500 hover:bg-red-50 shadow-md transition cursor-pointer"
                    title="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                  <span className="absolute bottom-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold px-2 py-0.5 rounded-md">
                    {item.category || 'General'}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <Link to={`/product/${item.id}`} className="hover:text-blue-600 transition">
                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1 mb-1">{item.name}</h3>
                    </Link>
                    <p className="text-base font-black text-blue-600">₹{item.price.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        addToCart(item, 1);
                        removeFromWishlist(item.id);
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <ShoppingBag size={14} /> Move to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2 rounded-xl text-xs transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
