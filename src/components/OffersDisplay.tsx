import { useState, useEffect } from 'react';
import { Gift, Tag, Percent, TrendingUp } from 'lucide-react';

type Offer = {
  id: number;
  title: string;
  description: string;
  discount: number;
  type: 'coupon' | 'threshold' | 'bogo' | 'seasonal';
  code?: string;
  minAmount?: number;
  maxDiscount?: number;
  expiryDate: string;
  applicableProducts?: number[];
};

type OffersDisplayProps = {
  onApplyOffer: (offer: Offer) => void;
  appliedOffer?: Offer | null;
};

export function OffersDisplay({ onApplyOffer, appliedOffer }: OffersDisplayProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/offers');
        if (response.ok) {
          const data = await response.json();
          setOffers(data);
        }
      } catch (error) {
        console.error('Failed to fetch offers:', error);
        // Mock data for demo
        setOffers([
          {
            id: 1,
            title: 'Welcome Discount',
            description: 'Get 10% off on your first purchase',
            discount: 10,
            type: 'coupon',
            code: 'WELCOME10',
            expiryDate: '2024-12-31',
          },
          {
            id: 2,
            title: 'Spend & Save',
            description: 'Get 20% off on orders above ₹500',
            discount: 20,
            type: 'threshold',
            minAmount: 500,
            expiryDate: '2024-12-31',
          },
          {
            id: 3,
            title: 'Buy One Get One',
            description: '50% off on second item',
            discount: 50,
            type: 'bogo',
            expiryDate: '2024-12-31',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const getOfferIcon = (type: Offer['type']) => {
    switch (type) {
      case 'coupon':
        return <Tag size={24} />;
      case 'threshold':
        return <TrendingUp size={24} />;
      case 'bogo':
        return <Gift size={24} />;
      case 'seasonal':
        return <Percent size={24} />;
      default:
        return <Gift size={24} />;
    }
  };

  const getOfferColor = (type: Offer['type']) => {
    switch (type) {
      case 'coupon':
        return 'bg-blue-50 border-blue-200';
      case 'threshold':
        return 'bg-green-50 border-green-200';
      case 'bogo':
        return 'bg-purple-50 border-purple-200';
      case 'seasonal':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return <p className="text-gray-600">Loading offers...</p>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Gift size={24} />
        Available Offers
      </h3>

      {offers.length === 0 ? (
        <p className="text-gray-600 text-sm">No offers available at the moment</p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`border-2 rounded-lg p-4 transition-all ${getOfferColor(offer.type)} ${
                appliedOffer?.id === offer.id ? 'border-green-500 bg-green-100' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="text-blue-600 mt-1">{getOfferIcon(offer.type)}</div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{offer.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{offer.description}</p>
                    {offer.code && (
                      <p className="text-sm font-mono bg-white px-2 py-1 rounded inline-block">
                        Code: <span className="font-bold">{offer.code}</span>
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{offer.discount}%</p>
                  <button
                    onClick={() => onApplyOffer(offer)}
                    className={`mt-2 px-3 py-1 rounded text-sm font-semibold transition-colors ${
                      appliedOffer?.id === offer.id
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {appliedOffer?.id === offer.id ? '✓ Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
