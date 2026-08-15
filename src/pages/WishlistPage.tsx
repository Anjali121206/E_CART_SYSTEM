import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';

type WishlistItem = {
  id: number;
  name: string;
  price: number;
  image?: string;
};

export function WishlistPage() {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistItems(items);
  }, []);

  const handleRemove = (productId: number) => {
    const updated = wishlistItems.filter((item) => item.id !== productId);
    setWishlistItems(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
  };

  const handleAddToCart = (item: WishlistItem) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((cartItem: any) => cartItem.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to cart!');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Heart className="text-red-500" fill="currentColor" />
          My Wishlist
        </h1>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Heart size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">Start adding your favorite products!</p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <img
                    src={item.image || `https://via.placeholder.com/200?text=${item.name}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{item.name}</h3>
                  <p className="text-lg font-bold text-blue-600 mb-4">₹{item.price}</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="w-full border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} />
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
