import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Product = {
  id: number;
  name: string;
  price: number;
  stock?: number;
  category?: string;
  type?: string;
  rating?: number;
  reviews?: number;
  image?: string;
  description?: string;
};

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category?: string;
};

export type Offer = {
  id: number;
  title: string;
  description: string;
  discount: number;
  type: 'coupon' | 'threshold' | 'bogo' | 'seasonal';
  code?: string;
  minAmount?: number;
  maxDiscount?: number;
  expiryDate?: string;
};

type CartContextType = {
  cartItems: CartItem[];
  wishlistItems: Product[];
  addToCart: (product: Product | CartItem, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (id: number) => void;
  isInWishlist: (id: number) => boolean;
  appliedOffer: Offer | null;
  applyOffer: (offer: Offer | null) => void;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  clearNotification: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const SHIPPING_BASE_COST = 5.0;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    // Default initial mock cart item for quick demonstration if empty
    return [
      {
        id: 1001,
        name: 'Smart Watch',
        price: 2500,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80',
        category: 'Electronics',
      }
    ];
  });

  const [wishlistItems, setWishlistItems] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('wishlist');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [appliedOffer, setAppliedOffer] = useState<Offer | null>(() => {
    try {
      const saved = localStorage.getItem('appliedOffer');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  useEffect(() => {
    if (appliedOffer) {
      localStorage.setItem('appliedOffer', JSON.stringify(appliedOffer));
    } else {
      localStorage.removeItem('appliedOffer');
    }
  }, [appliedOffer]);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const clearNotification = () => setNotification(null);

  const addToCart = (product: Product | CartItem, quantity: number = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      const newItem: CartItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        image: product.image || `https://placehold.co/200x200/2563eb/ffffff?text=${encodeURIComponent(product.name)}`,
        category: product.category,
      };
      return [...prev, newItem];
    });
    showNotification(`Added "${product.name}" to cart! (${quantity})`, 'success');
  };

  const removeFromCart = (id: number) => {
    const item = cartItems.find((i) => i.id === id);
    setCartItems((prev) => prev.filter((i) => i.id !== id));
    if (item) {
      showNotification(`Removed "${item.name}" from cart`, 'info');
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const addToWishlist = (product: Product) => {
    if (wishlistItems.some((i) => i.id === product.id)) {
      removeFromWishlist(product.id);
      return;
    }
    setWishlistItems((prev) => [...prev, product]);
    showNotification(`Saved "${product.name}" to wishlist! ❤️`, 'success');
  };

  const removeFromWishlist = (id: number) => {
    setWishlistItems((prev) => prev.filter((i) => i.id !== id));
    showNotification(`Removed item from wishlist`, 'info');
  };

  const isInWishlist = (id: number) => {
    return wishlistItems.some((i) => i.id === id);
  };

  const applyOffer = (offer: Offer | null) => {
    setAppliedOffer(offer);
    if (offer) {
      showNotification(`Promo offer "${offer.title}" applied! 🎉`, 'success');
    } else {
      showNotification(`Offer removed`, 'info');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (appliedOffer && subtotal > 0) {
    if (appliedOffer.minAmount && subtotal < appliedOffer.minAmount) {
      // Threshold not met
      discountAmount = 0;
    } else {
      discountAmount = (subtotal * appliedOffer.discount) / 100;
      if (appliedOffer.maxDiscount && discountAmount > appliedOffer.maxDiscount) {
        discountAmount = appliedOffer.maxDiscount;
      }
    }
  }

  const shippingCost = cartItems.length > 0 ? (subtotal > 2000 ? 0 : SHIPPING_BASE_COST) : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        appliedOffer,
        applyOffer,
        subtotal,
        discountAmount,
        shippingCost,
        total,
        notification,
        clearNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
