import { useMemo, useState } from 'react'
import { api } from '../api/client'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../state/CartContext'
import { useAuth } from '../state/AuthContext'

export default function CartPage() {
  const { items, increase, decrease, remove } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [status, setStatus] = useState('')
  const [selectedPayment, setSelectedPayment] = useState('UPI')
  const [showPaymentOptions, setShowPaymentOptions] = useState(false)
  const [invoiceText, setInvoiceText] = useState('')
  const [showInvoice, setShowInvoice] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items])
  const discount = 200
  const tax = (subtotal - discount) * 0.05
  const total = subtotal - discount + tax

  async function fetchInvoiceWithRetry(orderId, maxRetries = 3, delay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const invoice = await api.getInvoice(orderId)
        return invoice
      } catch (err) {
        console.error(`Invoice fetch attempt ${attempt} failed:`, err)
        
        // If it's a 404, the invoice might not be ready yet
        if (err.response?.status === 404 && attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
        
        // If it's the last attempt or a different error, throw
        if (attempt === maxRetries) {
          throw err
        }
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    throw new Error('Invoice not available after multiple attempts')
  }

  async function pay() {
    setStatus('')
    setError(null)
    setIsLoading(true)

    const payload = items.map(i => ({ productId: i.id, quantity: i.qty }))
    
    try {
      // Step 1: Process checkout
      const res = await api.checkout(payload, selectedPayment, user?.email || 'guest@example.com', 'FIXED200')
      setStatus(`Order ${res.orderId} placed. Total ₹ ${res.total}`)

      // Step 2: Fetch invoice with retry logic
      try {
        const invoice = await fetchInvoiceWithRetry(res.orderId)
        setInvoiceText(typeof invoice === 'string' ? invoice : JSON.stringify(invoice, null, 2))
        setShowInvoice(true)
      } catch (invoiceError) {
        console.error('Invoice fetch failed:', invoiceError)
        setError('Invoice generation is taking longer than expected. You can view it from your order details.')
        // Still show success screen but without invoice
        setTimeout(() => setShowInvoice(true), 500)
      }

    } catch (e) {
      console.error('Checkout failed:', e)
      setError(e.response?.data?.message || 'Checkout failed. Please try again.')
      setStatus('Checkout failed')
    } finally {
      setIsLoading(false)
    }
  }

  const paymentMethods = ['UPI', 'Card', 'COD', 'Google Pay', 'PayPal', 'PhonePe']

  if (showInvoice) {
    return (
      <div className="max-w-3xl mx-auto space-y-3">
        <h2 className="text-2xl font-bold">Invoice</h2>
        <div className="text-green-700 font-medium">Payment successful!</div>
        <button className="btn mt-2" onClick={() => navigate(`/order/${status.split(' ')[1]}`)}>
          Track Order
        </button>
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Items Purchased</h3>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-slate-500">Quantity: {item.qty}</p>
                </div>
                <p className="font-semibold">₹ {(item.price * item.qty).toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
        {invoiceText ? (
          <pre className="card whitespace-pre-wrap text-sm">{invoiceText}</pre>
        ) : (
          <div className="card text-slate-500">
            Invoice is being generated. You can view it from your order details page.
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
      <div className="space-y-3">
        {items.length === 0 && <div className="text-slate-500">Your cart is empty.</div>}
        {items.map(i => (
          <div key={i.id} className="card flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-medium truncate">{i.name}</div>
              <div className="text-sm text-slate-500">₹ {i.price}</div>
            </div>
            <div className="flex items-center gap-2">
              <button className="btn" onClick={() => decrease(i.id)} disabled={isLoading}>-</button>
              <div className="w-8 text-center">{i.qty}</div>
              <button className="btn" onClick={() => increase(i.id)} disabled={isLoading}>+</button>
            </div>
            <div className="font-semibold whitespace-nowrap">₹ {i.price * i.qty}</div>
            <button className="btn" onClick={() => remove(i.id)} disabled={isLoading}>Remove</button>
          </div>
        ))}
      </div>
      <aside className="card h-fit">
        <h3 className="text-lg font-semibold mb-3">Summary</h3>
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>₹ {subtotal.toFixed(0)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Discount</span>
          <span className="text-green-700">- ₹ {discount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (5%)</span>
          <span>₹ {tax.toFixed(0)}</span>
        </div>
        <hr className="my-3" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₹ {total.toFixed(0)}</span>
        </div>
        {!showPaymentOptions ? (
          <button 
            className="btn w-full mt-4" 
            onClick={() => setShowPaymentOptions(true)}
            disabled={isLoading || items.length === 0}
          >
            Proceed to Pay
          </button>
        ) : (
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Select Payment Method</h4>
            <div className="space-y-2">
              {paymentMethods.map(method => (
                <label key={method} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={selectedPayment === method}
                    onChange={(e) => setSelectedPayment(e.target.value)}
                    disabled={isLoading}
                  />
                  <span>{method}</span>
                </label>
              ))}
            </div>
            <button 
              className="btn w-full mt-4" 
              onClick={pay}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Confirm Payment'}
            </button>
            <button 
              className="btn w-full mt-2 bg-gray-500" 
              onClick={() => setShowPaymentOptions(false)}
              disabled={isLoading}
            >
              Back
            </button>
          </div>
        )}
        {status && <div className="text-sm mt-2 text-green-600">{status}</div>}
        {error && <div className="text-sm mt-2 text-red-600">{error}</div>}
      </aside>
    </div>
  )
}