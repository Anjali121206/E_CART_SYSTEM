import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Tag, Check, ArrowLeft, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { OffersDisplay } from '../components/OffersDisplay';

export function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    discountAmount,
    shippingCost,
    total,
    appliedOffer,
    applyOffer,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');
  const navigate = useNavigate();

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'SAVE20') {
      applyOffer({
        id: 1,
        title: 'Mega 20% Discount',
        description: 'Get 20% instant flat discount',
        discount: 20,
        type: 'coupon',
        code: 'SAVE20',
        maxDiscount: 1000,
      });
      setPromoCode('');
    } else if (code === 'SPEND500') {
      applyOffer({
        id: 2,
        title: 'Spend & Save ₹50',
        description: 'Automatic ₹50 discount on orders above ₹500',
        discount: 10,
        type: 'threshold',
        minAmount: 500,
        code: 'SPEND500',
      });
      setPromoCode('');
    } else if (code === 'BOGO50') {
      applyOffer({
        id: 3,
        title: 'Buy 1 Get 1 Special',
        description: '50% off on 2nd item',
        discount: 50,
        type: 'bogo',
        code: 'BOGO50',
      });
      setPromoCode('');
    } else if (code === 'WELCOME15' || code === 'WELCOME10') {
      applyOffer({
        id: 4,
        title: 'Welcome Special',
        description: '15% off for all registered customers',
        discount: 15,
        type: 'seasonal',
        code: code,
      });
      setPromoCode('');
    } else {
      setPromoError('Invalid coupon code. Try SAVE20, SPEND500, or BOGO50');
    }
  };

  const freeShippingThreshold = 2000;
  const amountNeededForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="container mx-auto max-w-2xl">
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} />
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Your Cart is Empty</h1>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">
              Looks like you haven't added any items to your shopping cart yet. Discover great deals in our catalog!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-blue-500/25 transition"
              >
                Start Shopping Now
              </Link>
              <Link
                to="/wishlist"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-6 py-3.5 rounded-xl transition"
              >
                View Wishlist
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link to="/" className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1 mb-2">
              <ArrowLeft size={16} /> Continue Shopping
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Shopping Cart <span className="text-lg font-bold text-slate-400">({cartItems.length} items)</span>
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={14} /> Clear Cart
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-white rounded-2xl p-4 mb-8 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Truck size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-slate-700">
                {amountNeededForFreeShipping === 0 ? (
                  <span className="text-green-600 font-extrabold">🎉 You unlocked FREE Express Shipping!</span>
                ) : (
                  <span>Add <strong className="text-blue-600">₹{amountNeededForFreeShipping.toFixed(2)}</strong> more for FREE Shipping!</span>
                )}
              </span>
              <span className="text-slate-500">{freeShippingProgress.toFixed(0)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden divide-y divide-slate-100">
              {cartItems.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                    />
                    <div>
                      <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                        {item.category || 'General'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-base line-clamp-1">{item.name}</h3>
                      <p className="text-sm font-semibold text-slate-500">₹{item.price.toFixed(2)} / unit</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-3 text-sm font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    {/* Total for item */}
                    <div className="text-right min-w-[80px]">
                      <p className="text-base font-extrabold text-slate-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-red-600 p-2 rounded-lg transition cursor-pointer"
                      title="Remove item"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Available Promotional Offers Component */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <OffersDisplay
                onApplyOffer={(offer) => applyOffer(offer)}
                appliedOffer={appliedOffer}
              />
            </div>
          </div>

          {/* Right Summary Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24">
            {/* Promo Code Input Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="font-bold text-slate-900 text-base mb-3 flex items-center gap-2">
                <Tag size={18} className="text-blue-600" /> Have a Promo Code?
              </h3>
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. SAVE20"
                    className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-xs text-red-600 font-medium">{promoError}</p>}
                {appliedOffer && (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-xl text-xs font-semibold text-green-800 mt-2">
                    <span className="flex items-center gap-1.5">
                      <Check size={16} /> Code applied: <strong>{appliedOffer.code || appliedOffer.title}</strong> (-{appliedOffer.discount}%)
                    </span>
                    <button
                      type="button"
                      onClick={() => applyOffer(null)}
                      className="text-red-600 hover:underline cursor-pointer text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Cost Breakdown & Checkout Button */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount {appliedOffer && `(${appliedOffer.title})`}</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Shipping & Delivery</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      `₹${shippingCost.toFixed(2)}`
                    )}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-base font-bold text-slate-900">Grand Total</span>
                    <p className="text-xs text-slate-400">Inclusive of all applicable taxes</p>
                  </div>
                  <span className="text-2xl font-black text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate('/payment')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                <ShieldCheck size={16} className="text-green-600" />
                <span>Encrypted 256-Bit Checkout Protection</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
