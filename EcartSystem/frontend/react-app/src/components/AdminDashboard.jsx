import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AdminDashboard(){
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ type: 'Electronics', name: '', price: 0, stock: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  async function fetchProducts() {
    try {
      const { data } = await axios.get('http://localhost:8080/api/products')
      setProducts(data)
    } catch (err) {
      setError('Failed to load products')
      console.error(err)
    }
  }

  async function add() {
    if (!form.name || form.price <= 0 || form.stock <= 0) {
      setError('Please fill all fields with valid values')
      return
    }
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        type: form.type,
        name: form.name,
        price: form.price.toString(),
        stock: form.stock.toString()
      })
      await axios.post('http://localhost:8080/api/admin/products', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      setForm({ type: 'Electronics', name: '', price: 0, stock: 0 })
      await fetchProducts() // Refresh list
    } catch (err) {
      setError('Failed to add product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function remove(id) {
    setLoading(true)
    setError('')
    try {
      await axios.delete(`http://localhost:8080/api/admin/products/${id}`)
      await fetchProducts() // Refresh list
    } catch (err) {
      setError('Failed to remove product')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
      <div className="space-y-3">
        {error && <div className="text-red-600">{error}</div>}
        {products.map(p => (
          <div key={p.id} className="card flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-slate-500">₹ {p.price} • Stock {p.stock} • {p.type}</div>
            </div>
            <button className="btn" onClick={()=>remove(p.id)} disabled={loading}>Remove</button>
          </div>
        ))}
      </div>
      <aside className="card h-fit">
        <h3 className="text-lg font-semibold mb-3">Add Product</h3>
        <div className="space-y-2">
          <select className="input" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option>Electronics</option>
            <option>Clothing</option>
            <option>Grocery</option>
          </select>
          <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          <input className="input" placeholder="Price" type="number" value={form.price} onChange={e=>setForm({...form, price:Number(e.target.value)})} />
          <input className="input" placeholder="Stock" type="number" value={form.stock} onChange={e=>setForm({...form, stock:Number(e.target.value)})} />
          <button className="btn w-full" onClick={add} disabled={loading}>{loading ? 'Adding...' : 'Add'}</button>
        </div>
      </aside>
    </div>
  )
}


