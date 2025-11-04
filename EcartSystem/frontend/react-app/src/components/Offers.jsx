import { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Offers() {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8080/api/offers')
        if (!response.ok) throw new Error('Failed to fetch offers')
        const data = await response.json()
        setOffers(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOffers()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error loading offers: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Special Offers</h1>
        <p className="text-slate-600">Discover amazing deals and discounts on our products</p>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No offers available at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {offers.map((offer, index) => (
            <div key={index} className="card border-2 border-dashed border-brand/20 bg-gradient-to-br from-brand/5 to-transparent">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-brand text-white rounded-full mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2 capitalize">
                  {offer.type} Offer
                </h3>
                <p className="text-slate-600">{offer.description}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-slate-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold mb-2">How to Apply Offers</h3>
        <p className="text-slate-600 mb-4">
          Simply add products to your cart and eligible offers will be automatically applied at checkout.
        </p>
        <a href="/" className="btn inline-block">
          Shop Now
        </a>
      </div>
    </div>
  )
}
