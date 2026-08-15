import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Truck, Calendar } from 'lucide-react';

type DeliveryStatus = {
  orderId: string;
  status: 'picked' | 'in_transit' | 'out_for_delivery' | 'delivered';
  estimatedDelivery: string;
  currentLocation: string;
  deliveryAgent?: {
    name: string;
    phone: string;
    vehicle: string;
  };
  timeline: Array<{
    status: string;
    time: string;
    location: string;
  }>;
};

export function DeliveryTrackingPage() {
  const { orderId } = useParams();
  const [delivery, setDelivery] = useState<DeliveryStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await fetch(
          `http://localhost:8080/api/orders/${orderId}/tracking`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setDelivery(data);
        }
      } catch (error) {
        console.error('Failed to fetch tracking:', error);
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchTracking();
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading tracking information...</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Tracking information not found</p>
      </div>
    );
  }

  const statusSteps = ['picked', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statusSteps.indexOf(delivery.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <Truck size={32} />
          Track Your Delivery
        </h1>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Order #{delivery.orderId}</h2>
              <p className="text-gray-600">Expected Delivery: {new Date(delivery.estimatedDelivery).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <span className={`px-4 py-2 rounded-full font-semibold ${
                delivery.status === 'delivered'
                  ? 'bg-green-100 text-green-800'
                  : delivery.status === 'out_for_delivery'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {delivery.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      index <= currentStatusIndex
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <p className="text-xs mt-2 text-center capitalize">{step.replace('_', ' ')}</p>
                </div>
              ))}
            </div>
            <div className="flex mb-4">
              {statusSteps.map((step, index) => (
                <div
                  key={step}
                  className={`flex-1 h-1 ${
                    index < currentStatusIndex ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Delivery Agent */}
          {delivery.deliveryAgent && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Delivery Agent</h3>
              <div className="space-y-2">
                <p><strong>Name:</strong> {delivery.deliveryAgent.name}</p>
                <p className="flex items-center gap-2">
                  <Phone size={18} />
                  {delivery.deliveryAgent.phone}
                </p>
                <p><strong>Vehicle:</strong> {delivery.deliveryAgent.vehicle}</p>
              </div>
            </div>
          )}

          {/* Current Location */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <MapPin size={20} />
              Current Location
            </h3>
            <p className="text-gray-600">{delivery.currentLocation}</p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Delivery Timeline
            </h3>
            <div className="space-y-4">
              {delivery.timeline.map((event, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-2 h-12 bg-blue-600 rounded-full flex-shrink-0 mt-1"></div>
                  <div>
                    <p className="font-semibold text-gray-800">{event.status}</p>
                    <p className="text-gray-600 text-sm">{event.time}</p>
                    <p className="text-gray-500 text-sm">{event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">Contact our support team for any queries about your delivery.</p>
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
