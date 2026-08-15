import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, TrendingUp, AlertCircle } from 'lucide-react';

type AdminStats = {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  recentOrders: Array<{
    id: string;
    userId: string;
    total: number;
    status: string;
    date: string;
  }>;
};

export function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch admin stats:', error);
        // Mock data for demo
        setStats({
          totalSales: 125000,
          totalOrders: 450,
          totalUsers: 1200,
          totalProducts: 350,
          recentOrders: [
            { id: 'ORD001', userId: 'user123', total: 5999, status: 'delivered', date: '2024-01-15' },
            { id: 'ORD002', userId: 'user456', total: 3499, status: 'shipped', date: '2024-01-14' },
            { id: 'ORD003', userId: 'user789', total: 12999, status: 'processing', date: '2024-01-13' },
          ],
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center py-12">Loading admin dashboard...</div>;
  }

  if (!stats) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-800">Admin Access Required</h3>
            <p className="text-red-600 text-sm">You need admin privileges to access this panel.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <BarChart3 size={32} />
          Admin Dashboard
        </h1>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {['dashboard', 'orders', 'users', 'products'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold capitalize transition-colors ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Sales */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Sales</p>
                  <p className="text-3xl font-bold text-gray-800">₹{stats.totalSales.toLocaleString()}</p>
                </div>
                <TrendingUp size={32} className="text-green-600" />
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Orders</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalOrders}</p>
                </div>
                <Package size={32} className="text-blue-600" />
              </div>
            </div>

            {/* Total Users */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Users</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalUsers}</p>
                </div>
                <Users size={32} className="text-purple-600" />
              </div>
            </div>

            {/* Total Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Products</p>
                  <p className="text-3xl font-bold text-gray-800">{stats.totalProducts}</p>
                </div>
                <BarChart3 size={32} className="text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Recent Orders */}
        {activeTab === 'dashboard' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">User ID</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-800 font-semibold">{order.id}</td>
                      <td className="py-3 px-4 text-gray-600">{order.userId}</td>
                      <td className="py-3 px-4 text-gray-800 font-semibold">₹{order.total.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'shipped'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other Tabs Placeholder */}
        {activeTab !== 'dashboard' && (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 text-lg">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} management coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
