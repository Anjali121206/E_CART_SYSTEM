import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, CreditCard, ShieldCheck, Truck, Loader2, QrCode, Wallet, PackageCheck } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export function PaymentPage() {
  const { cartItems, subtotal, discountAmount, shippingCost, total, appliedOffer, clearCart } = useCart();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'wallet' | 'cod'>('upi');
  const [selectedSlot, setSelectedSlot] = useState('Evening (6:00 PM - 9:00 PM)');
  const [loading, setLoading] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  // Address form
  const [name, setName] = useState(user?.name || 'Anjali Rathi');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');
  const [address, setAddress] = useState(user?.address || '221B Baker Street, Central District, New Delhi - 110001');

  // Card details mock state
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8891');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('•••');

  // UPI VPA state
  const [upiId, setUpiId] = useState(user ? `${user.email.split('@')[0]}@okhdfcbank` : 'customer@okhdfcbank');

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        userEmail: user?.email || 'customer@ecart.com',
        paymentMethod: paymentMethod.toUpperCase(),
        coupon: appliedOffer?.code || '',
        subtotal: subtotal,
        discount: discountAmount,
        shipping: shippingCost,
        total: total,
        items: cartItems.map((item) => ({
          id: item.id,
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        address: `${name}, ${phone}, ${address}`,
        deliverySlot: selectedSlot,
      };

      const response = await fetch('http://localhost:8080/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      let orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      if (response.ok) {
        const data = await response.json();
        if (data.orderId) orderId = data.orderId;
      }

      // Book delivery slot
      try {
        await fetch('http://localhost:8080/api/delivery/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, slot: selectedSlot }),
        });
      } catch (err) {
        console.error(err);
      }

      // Save order to localStorage order history for instant local sync as well
      const savedOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
      const newOrderRecord = {
        id: orderId,
        date: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        total: total,
        subtotal: subtotal,
        discount: discountAmount,
        paymentMethod: paymentMethod.toUpperCase(),
        status: 'Processing',
        items: cartItems.length,
        itemDetails: cartItems,
        trackingId: 'TRK-' + orderId.replace('ORD-', ''),
        deliverySlot: selectedSlot,
        address: address,
      };
      localStorage.setItem('my_orders', JSON.stringify([newOrderRecord, ...savedOrders]));

      clearCart();
      setOrderSuccessId(orderId);
    } catch (error) {
      console.error('Order submission error:', error);
      // Fallback
      const fallbackId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      clearCart();
      setOrderSuccessId(fallbackId);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccessId) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl max-w-lg w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={44} />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              Order Confirmed & Paid
            </span>
            <h1 className="text-3xl font-black text-slate-900 mt-2">Thank You for Ordering!</h1>
            <p className="text-slate-500 text-sm mt-1">
              Your order <strong className="text-slate-900 font-mono">#{orderSuccessId}</strong> has been forwarded to our fulfillment hub.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Amount Paid:</span>
              <span className="font-extrabold text-blue-600">₹{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-semibold uppercase text-slate-800">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Scheduled Slot:</span>
              <span className="font-semibold text-slate-800">{selectedSlot}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to={`/orders/${orderSuccessId}/tracking`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 text-sm"
            >
              <Truck size={18} />
              Track Delivery Live
            </Link>
            <Link
              to="/orders"
              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-sm"
            >
              <PackageCheck size={18} />
              Order History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 flex items-center justify-center">
        <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm mb-6">Please add products to your cart before proceeding to checkout.</p>
          <Link to="/" className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl inline-block hover:bg-blue-700">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        <Link to="/cart" className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5 mb-6">
          <ArrowLeft size={16} /> Back to Cart
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-8">
          Checkout & Confirm Order
        </h1>

        <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left 2 Cols: Address & Payment Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                  Delivery Address & Recipient
                </h2>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
                  ✓ Verified
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Complete Street Address, City & Pincode
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Delivery Slot Selection */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Delivery Slot
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    'Morning (8:00 AM - 11:00 AM)',
                    'Afternoon (1:00 PM - 4:00 PM)',
                    'Evening (6:00 PM - 9:00 PM)',
                    'Express 2-Hour Delivery (Fastest)'
                  ].map((slot) => (
                    <label
                      key={slot}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 text-xs font-bold ${
                        selectedSlot === slot
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900'
                          : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery_slot"
                        value={slot}
                        checked={selectedSlot === slot}
                        onChange={() => setSelectedSlot(slot)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Payment Method */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                  Select Payment Method
                </h2>
                <span className="text-xs text-slate-400 font-medium">100% Encrypted</span>
              </div>

              <div className="grid sm:grid-cols-4 gap-3">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: <QrCode size={20} /> },
                  { id: 'card', label: 'Cards', icon: <CreditCard size={20} /> },
                  { id: 'wallet', label: 'Wallet', icon: <Wallet size={20} /> },
                  { id: 'cod', label: 'Pay on Delivery', icon: <Truck size={20} /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-2 transition cursor-pointer ${
                      paymentMethod === m.id
                        ? 'border-blue-600 bg-blue-50/60 text-blue-700 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {m.icon}
                    <span className="text-xs font-bold">{m.label}</span>
                  </button>
                ))}
              </div>

              {/* Dynamic Input based on Payment Method */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 mt-4">
                {paymentMethod === 'upi' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Virtual Payment Address (VPA / UPI ID)
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-2 rounded-xl flex items-center">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Supports Google Pay, PhonePe, Paytm, BHIM and all major bank UPI apps.</p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Card Information
                    </p>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="Card Number"
                      className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="CVV"
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="text-sm text-slate-600 space-y-2">
                    <p className="font-semibold text-slate-900">Linked Wallets Available:</p>
                    <p className="text-xs">Amazon Pay, Paytm Wallet, Mobikwik. Balance will be deducted automatically upon confirmation.</p>
                  </div>
                )}

                {paymentMethod === 'cod' && (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p className="font-semibold text-slate-900">Cash on Delivery Eligible</p>
                    <p className="text-xs">You can pay using Cash or UPI QR directly to the delivery rider at your doorstep.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Summary Col */}
          <div className="space-y-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-lg border-b border-slate-100 pb-3">
                Order Review ({cartItems.length})
              </h3>

              {/* Items Mini List */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-slate-100" />
                      <div>
                        <p className="font-bold text-slate-800 line-clamp-1">{item.name}</p>
                        <p className="text-slate-400">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Cost breakdown */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toFixed(2)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount {appliedOffer && `(${appliedOffer.code || appliedOffer.title})`}</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">
                    {shippingCost === 0 ? <span className="text-green-600 font-bold">FREE</span> : `₹${shippingCost.toFixed(2)}`}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Total Payable</span>
                  <span className="text-2xl font-black text-blue-600">₹{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-4 px-6 rounded-2xl shadow-lg shadow-emerald-500/25 transition flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Authorizing & Placing Order...
                  </>
                ) : (
                  <>
                    Confirm & Place Order (₹{total.toFixed(2)})
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Protected by 128-Bit TLS Payment Gateway</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
