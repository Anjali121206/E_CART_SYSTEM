import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import { useCart } from '../state/CartContext'

export default function ProductList(){
  const [products, setProducts] = useState([])
  const [query, setQuery] = useState('')
  useEffect(()=>{ api.getProducts().then(setProducts).catch(()=>setProducts([])) }, [])
  const { add } = useCart()
  const navigate = useNavigate()
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('relevance')
  const filtered = useMemo(()=>{
    let list = products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    if (category !== 'All') list = list.filter(p => p.type === category)
    if (sort === 'price-asc') list = [...list].sort((a,b)=>a.price-b.price)
    if (sort === 'price-desc') list = [...list].sort((a,b)=>b.price-a.price)
    return list
  }, [products, query, category, sort])
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-xl font-semibold">Products</h2>
        <div className="flex items-center gap-2">
          <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
            <option>All</option>
            <option>Electronics</option>
            <option>Clothing</option>
            <option>Grocery</option>
            <option>Snack</option>
            <option>Beverage</option>
            <option>Dairy</option>
          </select>
          <select className="input" value={sort} onChange={e=>setSort(e.target.value)}>
            <option value="relevance">Sort: Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
          <input className="input" placeholder="Search products" value={query} onChange={e=>setQuery(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(p => (
          <article key={p.id} className="card">
            <div className="text-sm text-slate-500">{p.type}</div>
            <h3 className="text-lg font-semibold cursor-pointer" onClick={()=>navigate(`/p/${p.id}`)}>{p.name}</h3>
            <div className="text-brand font-semibold">₹ {p.price}</div>
            <div className="text-xs text-slate-500">Stock: {p.stock}</div>
            <button className="btn mt-3" onClick={()=>{ add({ id: p.id, name: p.name, price: p.price }); }}>Add to cart</button>
          </article>
        ))}
      </div>
    </div>
  )
}


