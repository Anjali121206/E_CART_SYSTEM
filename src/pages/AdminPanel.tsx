import { useState, useEffect } from 'react';
import { BarChart3, Users, Package, TrendingUp, Plus, Trash2, Edit3, Check, X, ShieldCheck, ShoppingCart } from 'lucide-react';
import { Product } from '../contexts/CartContext';

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
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'users'>('dashboard');

  // Add Product modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newType, setNewType] = useState('Electronics');
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newStock, setNewStock] = useState('25');
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Edit stock inline
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [stockInput, setStockInput] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      // Stats
      const statsRes = await fetch('http://localhost:8080/api/admin/dashboard');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Products
      const prodRes = await fetch('http://localhost:8080/api/admin/products');
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData);
      }

      // Orders
      const orderRes = await fetch('http://localhost:8080/api/admin/orders');
      if (orderRes.ok) {
        const orderData = await orderRes.json();
        setOrders(orderData);
      }

      // Users
      const userRes = await fetch('http://localhost:8080/api/admin/users');
      if (userRes.ok) {
        const userData = await userRes.json();
        setUsers(userData);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPrice.trim()) return;

    try {
      const response = await fetch('http://localhost:8080/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: newType,
          name: newName.trim(),
          price: newPrice,
          stock: newStock,
        }),
      });

      if (response.ok) {
        setActionMsg({ text: `Product "${newName}" added to inventory!`, type: 'success' });
        setShowAddModal(false);
        setNewName('');
        setNewPrice('');
        fetchAdminData();
      } else {
        setActionMsg({ text: 'Failed to create product', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setActionMsg({ text: 'Network error adding product', type: 'error' });
    }
  };

  const handleUpdateStock = async (id: number) => {
    if (!stockInput) return;
    try {
      const res = await fetch(`http://localhost:8080/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: stockInput }),
      });

      if (res.ok) {
        setActionMsg({ text: `Stock updated for SKU #${id}!`, type: 'success' });
        setEditingStockId(null);
        setStockInput('');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product from the inventory?')) return;
    try {
      const res = await fetch(`http://localhost:8080/api/admin/products/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setActionMsg({ text: `Product #${id} removed from catalog!`, type: 'success' });
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck size={20} className="text-blue-600" />
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">E-Cart Store Control Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Admin & Operations Dashboard
            </h1>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} /> Add New Product
          </button>
        </div>

        {/* Global Action Message */}
        {actionMsg && (
          <div
            className={`p-4 rounded-2xl mb-6 text-sm font-semibold flex items-center justify-between ${
              actionMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            <span>{actionMsg.text}</span>
            <button onClick={() => setActionMsg(null)} className="text-xs font-bold underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm mb-8 gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard Overview', icon: <BarChart3 size={16} /> },
            { id: 'products', label: `Inventory (${products.length})`, icon: <Package size={16} /> },
            { id: 'orders', label: `All Orders (${orders.length || (stats?.recentOrders?.length ?? 0)})`, icon: <ShoppingCart size={16} /> },
            { id: 'users', label: `Registered Users (${users.length})`, icon: <Users size={16} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab 1: Dashboard Overview */}
        {activeTab === 'dashboard' && stats && (
          <div className="space-y-8">
            {/* 4 Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Gross Sales</span>
                  <TrendingUp size={20} className="text-emerald-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">
                  ₹{stats.totalSales.toLocaleString()}
                </p>
                <span className="text-[11px] text-emerald-600 font-semibold mt-2">↑ +18.4% this month</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
                  <Package size={20} className="text-blue-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalOrders}</p>
                <span className="text-[11px] text-blue-600 font-semibold mt-2">All time fulfillment</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Customers</span>
                  <Users size={20} className="text-purple-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalUsers}</p>
                <span className="text-[11px] text-purple-600 font-semibold mt-2">Registered accounts</span>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider">Active SKUs</span>
                  <BarChart3 size={20} className="text-amber-500" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-slate-900">{stats.totalProducts}</p>
                <span className="text-[11px] text-amber-600 font-semibold mt-2">In-stock inventory</span>
              </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6">Recent Customer Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stats.recentOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50">
                        <td className="py-4 font-mono font-bold text-slate-900">{o.id}</td>
                        <td className="py-4 text-slate-600">{o.userId}</td>
                        <td className="py-4 font-black text-blue-600">₹{o.total.toFixed(2)}</td>
                        <td className="py-4">
                          <span className="bg-emerald-50 text-emerald-700 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                            {o.status}
                          </span>
                        </td>
                        <td className="py-4 text-right text-slate-400 text-xs font-mono">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products Inventory Management */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Inventory Catalog</h2>
                <p className="text-slate-500 text-xs mt-0.5">Manage product prices, types, and real-time warehouse stock levels.</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} /> Add Product
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">SKU ID</th>
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Warehouse Stock</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-mono text-slate-500">#{p.id}</td>
                      <td className="py-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-4">
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg">
                          {p.category || p.type || 'General'}
                        </span>
                      </td>
                      <td className="py-4 font-black text-blue-600">₹{p.price.toLocaleString()}</td>
                      <td className="py-4">
                        {editingStockId === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={stockInput}
                              onChange={(e) => setStockInput(e.target.value)}
                              placeholder={String(p.stock || 10)}
                              className="w-16 px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold"
                            />
                            <button
                              onClick={() => handleUpdateStock(p.id)}
                              className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => setEditingStockId(null)}
                              className="p-1 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{p.stock || 15} units</span>
                            <button
                              onClick={() => {
                                setEditingStockId(p.id);
                                setStockInput(String(p.stock || 15));
                              }}
                              className="text-blue-600 hover:text-blue-800 text-xs cursor-pointer"
                              title="Update stock"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          title="Delete product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Orders List */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              All Store Customer Orders
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Customer ID / Email</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Delivery Status</th>
                    <th className="pb-3 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(orders.length > 0 ? orders : (stats?.recentOrders || [])).map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-slate-50/50">
                      <td className="py-4 font-mono font-bold text-slate-900">{ord.id}</td>
                      <td className="py-4 text-slate-600">{ord.userId || 'customer@ecart.com'}</td>
                      <td className="py-4 font-black text-blue-600">₹{ord.total?.toFixed(2) || '1,499.00'}</td>
                      <td className="py-4">
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200">
                          {ord.status || 'Delivered'}
                        </span>
                      </td>
                      <td className="py-4 text-right text-xs text-slate-400 font-mono">
                        {ord.date || ord.timestamp || '2026-08-15'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Registered Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
            <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
              Registered Accounts & Roles
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {users.map((u, idx) => (
                <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-base">
                    {(u.name || u.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{u.name || 'Customer'}</h4>
                    <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                      {u.role || 'USER'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-xl flex items-center gap-2">
                  <Plus size={20} className="text-blue-600" /> Add New Inventory Product
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleAddProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category / Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Grocery">Grocery</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Dairy">Dairy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Wireless Noise Canceling Headphones"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="e.g. 2499"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Initial Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      placeholder="e.g. 30"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
                  >
                    Save & Publish to Store
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl text-sm transition cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
