import { useState } from 'react'

export default function PaymentPage(){
  const [method, setMethod] = useState('UPI')
  const [paid, setPaid] = useState(false)
  function pay(){ setPaid(true) }
  return (
    <div className="max-w-lg mx-auto card">
      <h2 className="text-xl font-semibold mb-4">Payment</h2>
      <div className="space-y-2">
        {['UPI','Card','COD'].map(m => (
          <label key={m} className="flex items-center gap-2">
            <input type="radio" name="method" checked={method===m} onChange={()=>setMethod(m)} />
            <span>{m}</span>
          </label>
        ))}
      </div>
      <button className="btn mt-4" onClick={pay}>Pay Now</button>
      {paid && (
        <div className="mt-4">
          <div className="text-green-700 font-medium">Payment successful!</div>
          <pre className="bg-slate-50 p-3 rounded mt-2 text-sm whitespace-pre-wrap">{`========================================
         E-CART INVOICE
========================================
Customer: Anjali
Items:
1. Smart Watch  - Rs. 2500
2. T-Shirt      - Rs. 700
----------------------------------------
Subtotal: Rs. 3200
Discount: Rs. 200
Tax (5%): Rs. 150
----------------------------------------
Total: Rs. 3150
Payment Mode: ${method}
----------------------------------------
Thank you for shopping with us!`}</pre>
        </div>
      )}
    </div>
  )
}


