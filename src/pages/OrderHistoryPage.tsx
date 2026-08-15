import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Package, Download, Eye } from 'lucide-react';

type Order = {
  id: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
  trackingId?: string;
};

export function OrderHistoryPage() {
  const { isLoggedIn } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/orders', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isLoggedIn) {
      fetchOrders();
    }
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please login to view your orders</p>
      </div>
    );
  }

  const filteredOrders = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const getStatusColor = (status: Order['status']) => {
    const colors: Record<Order['status'], string> = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      processing: 'bg-blue-50 text-blue-700 border-blue-200',
      shipped: 'bg-purple-50 text-purple-700 border-purple-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200',
    };
    return colors[status];
  };

  const getStatusIcon = (status: Order['status']) => {
    const icons: Record<Order['status'], string> = {
      pending: '⏳',
      processing: '⚙️',
      shipped: '📦',
      delivered: '✅',
      cancelled: '❌',
    };
    return icons[status];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Package size={32} />
          Order History
        </h1>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-gray-600">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No orders found</h2>
            <p className="text-gray-600">You haven't placed any orders yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">Order #{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">
                      Placed on {new Date(order.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 text-sm">{order.items} items</p>
                    {order.trackingId && (
                      <p className="text-gray-600 text-sm">Tracking: {order.trackingId}</p>
                    )}
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 mb-4">₹{order.total}</p>
                    <div className="flex gap-2 flex-col sm:flex-row">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                        <Eye size={18} />
                        View Details
                      </button>
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
                        <Download size={18} />
                        Invoice
                      </button>
                    </div>
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
