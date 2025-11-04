import { useEffect, useState } from 'react'
import { useAuth } from '../state/AuthContext'
import { api } from '../api/client'

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.email) {
      const fetchOrders = async () => {
        try {
          setLoading(true)
          const userOrders = await api.getOrdersByUser(user.email)
          setOrders(userOrders)
        } catch (e) {
          console.error('Failed to fetch orders:', e)
          setError('Failed to load orders.')
        } finally {
          setLoading(false)
        }
      }
      fetchOrders()
    }
  }, [user?.email])

  if (!user) {
    return <div className="text-center text-slate-500">Please log in to view your profile.</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="card p-6">
        <h2 className="text-2xl font-bold mb-4">User Profile</h2>
        <p className="text-lg"><strong>Email:</strong> {user.email}</p>
        <p className="text-lg"><strong>Name:</strong> {user.name}</p>
        <button onClick={logout} className="btn mt-4 bg-red-500 hover:bg-red-600">
          Logout
        </button>
      </div>

      <div className="card p-6">
        <h3 className="text-xl font-bold mb-4">Your Orders</h3>
        {loading && <div className="text-slate-500">Loading orders...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && orders.length === 0 && <div className="text-slate-500">No orders found.</div>}
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border-b pb-4">
              <p><strong>Order ID:</strong> {order.id}</p>
              <p><strong>Date:</strong> {new Date(order.timestamp).toLocaleString()}</p>
              <p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
              <p><strong>Status:</strong> {order.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}