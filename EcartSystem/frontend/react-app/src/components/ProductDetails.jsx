import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useCart } from '../state/CartContext'

export default function ProductDetails(){
  const { id } = useParams()
  const { add } = useCart()
  const [p, setP] = useState(null)
  useEffect(()=>{ fetch(`http://localhost:8080/api/products/${id}`).then(r=>r.json()).then(setP) }, [id])
  const discountPct = useMemo(()=> 0, [])
  if (!p) return <div className="card">Loading...</div>
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="card h-[320px] flex items-center justify-center text-slate-400">Image</div>
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <div className="text-sm text-slate-500">Category: {p.type}</div>
        <div className="text-2xl font-semibold text-brand">₹ {p.price} {discountPct>0 && <span className="text-sm text-slate-500 line-through ml-2">MRP</span>}</div>
        <div className="text-sm">Stock: {p.stock>0? 'Available' : 'Out of Stock'}</div>
        <button className="btn" onClick={()=>add({ id: p.id, name: p.name, price: p.price })}>Add to cart</button>
        <div className="card mt-4">
          <h3 className="font-semibold mb-2">Specifications</h3>
          <ul className="text-sm text-slate-600 list-disc ml-5">
            <li>Type: {p.type}</li>
            <li>ID: {p.id}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}


