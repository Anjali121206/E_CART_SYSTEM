import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function InvoicePage(){
  const { id } = useParams()
  const [text, setText] = useState('Loading...')
  const preRef = useRef(null)
  useEffect(()=>{
    fetch(`http://localhost:8080/api/order/${id}/invoice`).then(r=>r.text()).then(setText).catch(()=>setText('Failed to load invoice'))
  }, [id])
  function onPrint(){ window.print() }
  function onDownload(){ const blob = new Blob([text], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=`invoice-${id}.txt`; a.click(); URL.revokeObjectURL(url); }
  return (
    <div className="max-w-3xl mx-auto space-y-3">
      <h2 className="text-2xl font-bold">Invoice</h2>
      <div className="flex gap-2">
        <button className="btn" onClick={onPrint}>Print</button>
        <button className="btn" onClick={onDownload}>Download</button>
      </div>
      <pre ref={preRef} className="card whitespace-pre-wrap text-sm">{text}</pre>
    </div>
  )
}


