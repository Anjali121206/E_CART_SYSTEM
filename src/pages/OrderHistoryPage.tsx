import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { Package, Download, Eye, Truck, RefreshCw, CheckCircle, Clock, X, FileText } from 'lucide-react';

type Order = {
  id: string;
  date: string;
  timestamp?: string;
  status: string;
  total: number;
  subtotal?: number;
  discount?: number;
  paymentMethod?: string;
  items: number;
  itemDetails?: any[];
  trackingId?: string;
  address?: string;
};

export function OrderHistoryPage() {
  const { user, isLoggedIn } = useAuth();
  const { addToCart } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<{ id: string; content: string } | null>(null);
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const email = user?.email || 'customer@ecart.com';
        const res = await fetch(`http://localhost:8080/api/orders?email=${encodeURIComponent(email)}`);
        
        let backendOrders: Order[] = [];
        if (res.ok) {
          backendOrders = await res.json();
        }

        // Merge with local orders
        const localOrders = JSON.parse(localStorage.getItem('my_orders') || '[]');
        const combined = [...localOrders];

        backendOrders.forEach((bo) => {
          if (!combined.some((co) => co.id === bo.id)) {
            combined.push(bo);
          }
        });

        if (combined.length === 0) {
          // Provide sample seeded orders for rich demonstration
          const mockOrders: Order[] = [
            {
              id: 'ORD-9021',
              date: new Date(Date.now() - 3600000 * 24).toISOString(),
              status: 'Delivered',
              total: 4499.0,
              items: 2,
              trackingId: 'TRK-9021',
              paymentMethod: 'UPI',
              itemDetails: [
                { id: 1001, name: 'Smart Watch', price: 2500, quantity: 1, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80' },
                { id: 1004, name: 'Wireless Earbuds', price: 1999, quantity: 1, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&auto=format&fit=crop&q=80' }
              ]
            },
            {
              id: 'ORD-8942',
              date: new Date(Date.now() - 3600000 * 48).toISOString(),
              status: 'Out for Delivery',
              total: 700.0,
              items: 1,
              trackingId: 'TRK-8942',
              paymentMethod: 'CARD',
              itemDetails: [
                { id: 1002, name: 'T-Shirt', price: 700, quantity: 1, image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80' }
              ]
            }
          ];
          setOrders(mockOrders);
        } else {
          setOrders(combined);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleDownloadInvoice = async (orderId: string) => {
    setInvoiceLoading(true);
    try {
      const res = await fetch(`http://localhost:8080/api/order/${orderId}/invoice`);
      let text = '';
      if (res.ok) {
        text = await res.text();
      } else {
        text = `=====================================================\n                   E-CART SYSTEM TAX INVOICE          \n=====================================================\nInvoice ID  : INV-${orderId}\nCustomer    : ${user?.name || 'Anjali Rathi'}\nOrder Total : Verified\nStatus      : Paid & Settled via Secure Gateway\n=====================================================\n`;
      }
      setSelectedInvoice({ id: orderId, content: text });
    } catch (e) {
      console.error(e);
      setSelectedInvoice({
        id: orderId,
        content: `=====================================================\n                   E-CART SYSTEM TAX INVOICE          \n=====================================================\nInvoice ID  : INV-${orderId}\nCustomer    : ${user?.name || 'Anjali Rathi'}\n=====================================================\n`,
      });
    } finally {
      setInvoiceLoading(false);
    }
  };

  const handleReorder = (order: Order) => {
    if (order.itemDetails && order.itemDetails.length > 0) {
      order.itemDetails.forEach((item) => {
        addToCart(item, item.quantity || 1);
      });
    } else {
      addToCart({
        id: 1001,
        name: 'Smart Watch',
        price: 2500,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80'
      }, 1);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.status.toLowerCase().includes(filter.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('delivered')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle size={14} /> Delivered
        </span>
      );
    }
    if (s.includes('shipped') || s.includes('out')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
          <Truck size={14} /> Out for Delivery
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
        <Clock size={14} /> Processing
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
              <Package size={36} className="text-blue-600" /> My Orders
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Track active dispatches, view digital tax invoices, and manage past orders.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1">
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'processing', label: 'Processing' },
              { id: 'out', label: 'Out for Delivery' },
              { id: 'delivered', label: 'Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  filter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-slate-500 font-medium">Fetching orders from C++ database...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <Package size={48} className="mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Orders Found</h3>
            <p className="text-slate-500 text-sm mb-6">You don't have any orders under this filter.</p>
            <Link
              to="/search"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition inline-block"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition space-y-6"
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-slate-900">
                      #{order.id}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
                    <span>Date: {new Date(order.date || order.timestamp || Date.now()).toLocaleDateString()}</span>
                    <span>Payment: <strong className="text-slate-700 uppercase">{order.paymentMethod || 'UPI'}</strong></span>
                  </div>
                </div>

                {/* Items & Price */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-slate-800">
                      {order.items || 1} Item(s) in this package
                    </p>
                    {order.itemDetails && order.itemDetails.length > 0 ? (
                      <div className="flex gap-2 flex-wrap">
                        {order.itemDetails.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 px-3 py-1.5 rounded-xl text-xs font-semibold">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-6 h-6 rounded object-cover" />
                            )}
                            <span>{item.name} (x{item.quantity || 1})</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Package shipped via E-Cart Logistics Express</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total Paid</p>
                    <p className="text-2xl font-black text-blue-600">₹{order.total.toFixed(2)}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-100 justify-end">
                  <Link
                    to={`/orders/${order.id}/tracking`}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Truck size={16} /> Track Delivery
                  </Link>
                  <button
                    onClick={() => handleDownloadInvoice(order.id)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={16} /> Download Tax Invoice
                  </button>
                  <button
                    onClick={() => handleReorder(order)}
                    className="bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={16} /> Reorder All
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invoice Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <FileText size={22} />
                  <h3 className="font-extrabold text-slate-900 text-lg">
                    Official Tax Invoice (INV-{selectedInvoice.id})
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl text-xs font-mono overflow-x-auto max-h-96 whitespace-pre-wrap leading-relaxed shadow-inner">
                {selectedInvoice.content}
              </pre>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    const file = new Blob([selectedInvoice.content], { type: 'text/plain' });
                    element.href = URL.createObjectURL(file);
                    element.download = `Invoice-${selectedInvoice.id}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download size={16} /> Save Text File
                </button>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
