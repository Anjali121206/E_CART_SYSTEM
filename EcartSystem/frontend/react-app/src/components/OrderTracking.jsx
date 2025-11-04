import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

const apiBase = 'http://localhost:8080'

export default function OrderTracking(){
  const { id } = useParams()
  const [status, setStatus] = useState('Placed')
  const [waypoints, setWaypoints] = useState([])

  useEffect(()=>{
    const t1 = setInterval(async ()=>{
      try { const res = await fetch(`${apiBase}/api/order/${id}/status`); const j = await res.json(); if (j.status) setStatus(j.status) } catch {}
    }, 3000)
    const t2 = setInterval(async ()=>{
      try { const res = await fetch(`${apiBase}/api/order/${id}/track`); const j = await res.json(); if (j.waypoint) setWaypoints(w=>[...w, { at: new Date().toLocaleTimeString(), where: j.waypoint }]) } catch {}
    }, 5000)
    return ()=>{ clearInterval(t1); clearInterval(t2) }
  }, [id])

  const steps = useMemo(()=>['Placed','Packed','Out for delivery','Delivered'], [])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Order Tracking</h2>
      <div className="card">
        <div className="flex items-center justify-between">
          {steps.map(s => (
            <div key={s} className={`flex-1 text-center ${steps.indexOf(s) <= steps.indexOf(status) ? 'text-brand font-semibold' : 'text-slate-400'}`}>{s}</div>
          ))}
        </div>
      </div>
      <div className="card">
        <h3 className="text-lg font-semibold mb-2">Rider timeline</h3>
        <ul className="space-y-1">
          {waypoints.slice(-8).map((w,i)=> (
            <li key={i} className="text-sm text-slate-700">[{w.at}] {w.where}</li>
          ))}
        </ul>
      </div>
      <div className="card">
        <a href={`/order/${id}/invoice`} className="btn">View Invoice</a>
      </div>
    </div>
  )
}


