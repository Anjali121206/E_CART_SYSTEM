import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartCtx = createContext(null)
export function useCart(){ return useContext(CartCtx) }

export function CartProvider({ children }){
  const [items, setItems] = useState(()=>{
    try { const raw = localStorage.getItem('ecart.items'); return raw ? JSON.parse(raw) : [] } catch { return [] }
  })
  function add(product){ setItems(prev => { const i = prev.find(x=>x.id===product.id); if(i){ return prev.map(x=> x.id===product.id? {...x, qty:x.qty+1}: x) } return [...prev, {...product, qty:1}] }) }
  function remove(id){ setItems(prev => prev.filter(x=>x.id!==id)) }
  function increase(id){ setItems(prev => prev.map(x=> x.id===id? {...x, qty:x.qty+1}: x)) }
  function decrease(id){ setItems(prev => prev.flatMap(x=> x.id===id? (x.qty>1? [{...x, qty:x.qty-1}] : []): [x])) }
  function setQuantity(id, qty){ setItems(prev => prev.map(x=> x.id===id? {...x, qty:Math.max(1, qty)}: x)) }
  function clear(){ setItems([]) }
  const subtotal = useMemo(()=> items.reduce((s,i)=> s + i.price*i.qty, 0), [items])
  useEffect(()=>{ try { localStorage.setItem('ecart.items', JSON.stringify(items)) } catch {} }, [items])
  return <CartCtx.Provider value={{ items, add, remove, increase, decrease, setQuantity, clear, subtotal }}>{children}</CartCtx.Provider>
}


