import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { User, Mail, Phone, MapPin, Save, ShieldCheck, ShoppingBag, Heart, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { wishlistItems } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || 'Anjali Rathi');
      setEmail(user.email || 'anjali@example.com');
      setPhone(user.phone || '+91 98765 43210');
      setAddress(user.address || '221B Baker Street, Central District, New Delhi - 110001');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({
        name,
        phone,
        address,
      });
      setSuccess('Profile information saved successfully!');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 flex items-center gap-3">
              <User size={36} className="text-blue-600" /> Account & Profile
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Manage your personal credentials, contact numbers, and default shipping addresses.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left Column: User Summary Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm text-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
                {(name || 'A').charAt(0).toUpperCase()}
              </div>

              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">{name || 'Customer'}</h3>
                <p className="text-xs text-slate-500 font-mono">{email}</p>
                <span className="inline-block mt-2 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-3 py-0.5 rounded-full">
                  {user?.role || 'Verified Member'}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold">Wishlist</p>
                  <p className="text-lg font-black text-slate-900">{wishlistItems.length}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <p className="text-xs text-slate-400 font-bold">Rewards</p>
                  <p className="text-lg font-black text-emerald-600">450 Pts</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3 text-xs text-slate-600">
              <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" /> Account Security
              </h4>
              <p>Two-Factor Authentication: <span className="text-emerald-600 font-bold">Enabled</span></p>
              <p>Member Status: <span className="font-bold text-slate-800">Active VIP</span></p>
              <p>SSL Encryption: <span className="font-mono text-slate-800">TLS 1.3 Active</span></p>
            </div>
          </div>

          {/* Right 2 Columns: Edit Profile Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-900 text-xl border-b border-slate-100 pb-4">
                Personal Information
              </h3>

              {success && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
                  ✓ {success}
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
                  ✗ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 border border-slate-200 rounded-xl text-sm text-slate-500 font-mono cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Contact customer support to update verified email.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Primary Phone Number
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Default Delivery Address & PIN
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3.5 top-3 text-slate-400" />
                    <textarea
                      rows={3}
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    ></textarea>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer text-sm"
                  >
                    <Save size={18} /> {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
