import { useState, useEffect } from 'react';
import { Gift, Tag, Percent, TrendingUp } from 'lucide-react';
import { Offer } from '../contexts/CartContext';

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
        setOffers([
          {
            id: 1,
            title: 'Mega 20% Discount',
            description: 'Get 20% instant flat discount',
            discount: 20,
            type: 'coupon',
            code: 'SAVE20',
            maxDiscount: 1000,
          },
          {
            id: 2,
            title: 'Spend & Save ₹50',
            description: 'Automatic ₹50 discount on orders above ₹500',
            discount: 10,
            type: 'threshold',
            minAmount: 500,
            code: 'SPEND500',
          },
          {
            id: 3,
            title: 'Buy One Get One',
            description: '50% off on second item',
            discount: 50,
            type: 'bogo',
            code: 'BOGO50',
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
        return <Tag size={20} />;
      case 'threshold':
        return <TrendingUp size={20} />;
      case 'bogo':
        return <Gift size={20} />;
      case 'seasonal':
        return <Percent size={20} />;
      default:
        return <Gift size={20} />;
    }
  };

  const getOfferColor = (type: Offer['type']) => {
    switch (type) {
      case 'coupon':
        return 'bg-blue-50/70 border-blue-200 text-blue-900';
      case 'threshold':
        return 'bg-emerald-50/70 border-emerald-200 text-emerald-900';
      case 'bogo':
        return 'bg-purple-50/70 border-purple-200 text-purple-900';
      case 'seasonal':
        return 'bg-amber-50/70 border-amber-200 text-amber-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  if (loading) {
    return <p className="text-slate-500 text-xs font-medium">Loading promotional offers...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <Gift size={18} className="text-blue-600" />
          Available Store Discounts
        </h3>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
          {offers.length} Active
        </span>
      </div>

      {offers.length === 0 ? (
        <p className="text-slate-500 text-xs">No promotional offers active at the moment.</p>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const isApplied = appliedOffer?.id === offer.id || appliedOffer?.code === offer.code;
            return (
              <div
                key={offer.id}
                className={`border-2 rounded-2xl p-4 transition-all ${getOfferColor(offer.type)} ${
                  isApplied ? 'border-emerald-500 bg-emerald-50 shadow-sm' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-0.5">{getOfferIcon(offer.type)}</div>
                    <div>
                      <h4 className="font-bold text-sm">{offer.title}</h4>
                      <p className="text-xs text-slate-600 mb-2 leading-relaxed">{offer.description}</p>
                      {offer.code && (
                        <span className="text-xs font-mono font-bold bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg inline-block shadow-2xs">
                          {offer.code}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xl font-black text-emerald-600">{offer.discount}% OFF</p>
                    <button
                      onClick={() => onApplyOffer(offer)}
                      className={`mt-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-sm ${
                        isApplied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isApplied ? '✓ Applied' : 'Apply'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
