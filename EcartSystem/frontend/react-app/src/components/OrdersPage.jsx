import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../state/AuthContext'

export default function OrdersPage(){
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  useEffect(()=>{
    if (!user?.email) return
    fetch(`http://localhost:8080/api/orders?email=${encodeURIComponent(user.email)}`)
      .then(r=>r.json()).then(setOrders).catch(()=>setOrders([]))
  }, [user])
  if (!user) return <div className="card">Please login to view your orders.</div>
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold">My Orders</h2>
      {orders.length===0 && <div className="card">No orders yet.</div>}
      {orders.map(o => (
        <div key={o.id} className="card flex items-center justify-between">
          <div>
            <div className="font-medium">Order #{o.id}</div>
            <div className="text-sm text-slate-500">{o.timestamp} • ₹ {o.total} • {o.status}</div>
          </div>
          <div className="flex gap-2">
            <Link className="btn" to={`/order/${o.id}`}>Track</Link>
            <Link className="btn" to={`/order/${o.id}/invoice`}>Invoice</Link>
          </div>
        </div>
      ))}
    </div>
  )
}


