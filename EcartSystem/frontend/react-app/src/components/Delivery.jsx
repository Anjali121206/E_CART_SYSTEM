import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

export default function Delivery() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const [deliveryInfo, setDeliveryInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [bookingStatus, setBookingStatus] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchDeliveryStatus()
    }
  }, [orderId])

  const fetchDeliveryStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8080/api/delivery/${orderId}/status`)
      if (!response.ok) throw new Error('Failed to fetch delivery status')
      const data = await response.json()
      setDeliveryInfo(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const bookDeliverySlot = async () => {
    if (!selectedSlot || !orderId) return

    try {
      setBookingStatus('Booking...')
      const response = await fetch('http://localhost:8080/api/delivery/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ orderId, slot: selectedSlot })
      })

      if (!response.ok) throw new Error('Failed to book delivery slot')

      const data = await response.json()
      if (data.success) {
        setBookingStatus('Slot booked successfully!')
        fetchDeliveryStatus() // Refresh status
      } else {
        setBookingStatus('Failed to book slot')
      }
    } catch (err) {
      setBookingStatus('Error booking slot: ' + err.message)
    }
  }

  const availableSlots = [
    '9:00 AM - 11:00 AM',
    '11:00 AM - 1:00 PM',
    '1:00 PM - 3:00 PM',
    '3:00 PM - 5:00 PM',
    '5:00 PM - 7:00 PM',
    '7:00 PM - 9:00 PM'
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Delivery Management</h1>
        <p className="text-slate-600">Book your preferred delivery slot and track your order</p>
      </div>

      {orderId && deliveryInfo ? (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Delivery Status</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span>
              <span>{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                deliveryInfo.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                deliveryInfo.status === 'Out for Delivery' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {deliveryInfo.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Selected Slot:</span>
              <span>{deliveryInfo.slot || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Estimated Time:</span>
              <span>{deliveryInfo.estimate} minutes</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Book Delivery Slot</h2>

          {!orderId ? (
            <div className="text-center py-6">
              <p className="text-slate-600 mb-4">Enter your order ID to manage delivery</p>
              <input
                type="text"
                placeholder="Order ID"
                className="input w-full max-w-xs"
                onChange={(e) => navigate(`/delivery/${e.target.value}`)}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Delivery Slot</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Choose a slot</option>
                  {availableSlots.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={bookDeliverySlot}
                disabled={!selectedSlot || bookingStatus === 'Booking...'}
                className="btn w-full"
              >
                {bookingStatus || 'Book Slot'}
              </button>

              {bookingStatus && (
                <p className={`text-sm text-center ${
                  bookingStatus.includes('successfully') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {bookingStatus}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="card bg-slate-50">
        <h3 className="font-semibold mb-3">Delivery Information</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li>• Free delivery on orders above ₹500</li>
          <li>• Express delivery available for ₹50 extra</li>
          <li>• Track your order in real-time</li>
          <li>• Contact support for any delivery issues</li>
        </ul>
      </div>
    </div>
  )
}
