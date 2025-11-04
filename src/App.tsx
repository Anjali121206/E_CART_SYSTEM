import { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, ArrowLeft } from 'lucide-react';

type CartItemType = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
};

const initialCartItems = [
  {
    id: 1,
    name: 'Classic C++ Textbook',
    price: 59.99,
    quantity: 1,
    image: 'https://placehold.co/100x100/e2e8f0/334155?text=C++ Book',
  },
  {
    id: 2,
    name: 'OOP Design Patterns',
    price: 45.5,
    quantity: 1,
    image: 'https://placehold.co/100x100/e2e8f0/334155?text=OOP Book',
  },
  {
    id: 3,
    name: 'Data Structures in C++',
    price: 65.0,
    quantity: 2,
    image: 'https://placehold.co/100x100/e2e8f0/334155?text=Data Structures',
  },
];

const SHIPPING_COST = 5.0;

function CartItem({
  item,
  onQuantityChange,
  onRemove,
}: {
  item: CartItemType;
  onQuantityChange: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
}) {
  return (
    <tr key={item.id}>
      <td className="py-4">
        <div className="flex items-center">
          <img className="h-16 w-16 mr-4" src={item.image} alt={item.name} />
          <span className="font-semibold">{item.name}</span>
        </div>
      </td>
      <td className="py-4">${item.price.toFixed(2)}</td>
      <td className="py-4">
        <div className="flex items-center">
          <button onClick={() => onQuantityChange(item.id, -1)} className="border rounded-md py-2 px-4 mr-2" aria-label="Remove one item"><Minus size={16} /></button>
          <span className="text-center w-8">{item.quantity}</span>
          <button onClick={() => onQuantityChange(item.id, 1)} className="border rounded-md py-2 px-4 ml-2" aria-label="Add one item"><Plus size={16} /></button>
        </div>
      </td>
      <td className="py-4">${(item.price * item.quantity).toFixed(2)}</td>
      <td className="py-4">
        <button onClick={() => onRemove(item.id)} className="text-gray-500 hover:text-red-600" aria-label="Remove item">
          <Trash2 size={20} />
        </button>
      </td>
    </tr>
  );
}

function CartSummary({
  subtotal,
}: {
  subtotal: number;
}) {
  const total = subtotal + SHIPPING_COST;
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-lg font-semibold mb-4">Summary</h2>
      <div className="flex justify-between mb-2">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span>Shipping</span>
        <span>${SHIPPING_COST.toFixed(2)}</span>
      </div>
      <hr className="my-2" />
      <div className="flex justify-between mb-2">
        <span className="font-semibold">Total</span>
        <span className="font-semibold">${total.toFixed(2)}</span>
      </div>
      <button onClick={() => navigate('/payment')} className="bg-blue-500 text-white py-2 px-4 rounded-lg mt-4 w-full">Checkout</button>
    </div>
  );
}

function PaymentPage({
  cartItems,
  subtotal,
}: {
  cartItems: CartItemType[];
  subtotal: number;
}) {
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const total = subtotal + SHIPPING_COST;
  const navigate = useNavigate();

  const handlePlaceOrder = () => {
    // In a real app, you'd handle order submission here
    alert(`Order placed successfully with ${paymentMethod}! Total: $${total.toFixed(2)}`);
  };

  return (
    <div className="container mx-auto px-4">
      <Link to="/" className="text-blue-500 hover:underline mb-4 inline-flex items-center">
        <ArrowLeft size={16} className="mr-1" /> Back to Cart
      </Link>
      <h1 className="text-2xl font-semibold mb-4">Confirm Your Order</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-3/5 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
          {cartItems.map(item => (
            <div key={item.id} className="flex justify-between items-center border-b py-2">
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
              </div>
              <p>${(item.price * item.quantity).toFixed(2)}</p>
            </div>
          ))}
          <div className="flex justify-between mt-4"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between mt-2"><span>Shipping</span><span>${SHIPPING_COST.toFixed(2)}</span></div>
          <hr className="my-2" />
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>
        <div className="lg:w-2/5 bg-white rounded-lg shadow-md p-6 h-fit">
          <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
          <div className="space-y-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" value="UPI" checked={paymentMethod === 'UPI'} onChange={() => setPaymentMethod('UPI')} className="form-radio" />
              <span className="ml-3">UPI / Net Banking</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" value="Card" checked={paymentMethod === 'Card'} onChange={() => setPaymentMethod('Card')} className="form-radio" />
              <span className="ml-3">Credit / Debit Card</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} className="form-radio" />
              <span className="ml-3">Cash on Delivery (COD)</span>
            </label>
          </div>
          <button onClick={handlePlaceOrder} className="bg-green-500 text-white py-2 px-4 rounded-lg mt-6 w-full">Place Order</button>
        </div>
      </div>
    </div>
  );
}

function CartPage() {
  const [cartItems, setCartItems] = useState<CartItemType[]>(initialCartItems);

  const handleQuantityChange = (id: number, delta: number) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: number) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };
  
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-semibold mb-4">Shopping Cart</h1>
        {cartItems.length > 0 ? (
          <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-3/4">
              <div className="bg-white rounded-lg shadow-md p-6 mb-4">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left font-semibold">Product</th>
                      <th className="text-left font-semibold">Price</th>
                      <th className="text-left font-semibold">Quantity</th>
                      <th className="text-left font-semibold">Total</th>
                      <th className="text-left font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onQuantityChange={handleQuantityChange}
                        onRemove={handleRemoveItem}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="md:w-1/4">
              <CartSummary subtotal={subtotal} />
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold">Your cart is empty.</h2>
          </div>
        )}
      </div>
    </div>
  );
}

function App() {
  // In a real app, cart state would be managed globally (e.g., with Context or Redux)
  // For simplicity, we'll pass it down for now.
  const [cartItems] = useState<CartItemType[]>(initialCartItems);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <Routes>
      <Route path="/" element={<CartPage />} />
      <Route
        path="/payment"
        element={<PaymentPage cartItems={cartItems} subtotal={subtotal} />}
      />
    </Routes>
  );
}

export default App;
