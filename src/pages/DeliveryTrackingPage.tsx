import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, Truck, Calendar, ShieldCheck, ArrowLeft, RefreshCw, CheckCircle, Navigation, Radio } from 'lucide-react';

type DeliveryStatus = {
  orderId: string;
  status: 'picked' | 'in_transit' | 'out_for_delivery' | 'delivered';
  estimatedDelivery: string;
  currentLocation: string;
  waypoint?: string;
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
  const [refreshing, setRefreshing] = useState(false);
  const [riderCoords, setRiderCoords] = useState({ lat: 28.5355, lng: 77.3910 });

  const fetchTracking = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${orderId}/tracking`);
      if (response.ok) {
        const data = await response.json();
        setDelivery(data);
        // Slightly simulate live waypoint movements
        setRiderCoords((prev) => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.005,
          lng: prev.lng + (Math.random() - 0.5) * 0.005,
        }));
      } else {
        // Fallback demo tracking
        setDelivery({
          orderId: orderId || 'ORD-9021',
          status: 'out_for_delivery',
          estimatedDelivery: new Date(Date.now() + 3600000 * 2).toISOString(),
          currentLocation: 'Sector 18 Express Delivery Hub, Delhi NCR',
          waypoint: 'Central Ring Road, en route to destination',
          deliveryAgent: {
            name: 'Rajesh Kumar',
            phone: '+91 98765 43210',
            vehicle: 'Electric Delivery Van (DL-01-EV-8942)',
          },
          timeline: [
            { status: 'Order Verified & Packed', time: '09:30 AM', location: 'Fulfillment Center Warehouse' },
            { status: 'In Transit to Regional Sorting Hub', time: '11:45 AM', location: 'Regional Hub - Sector 62' },
            { status: 'Dispatched with Courier', time: '02:15 PM', location: 'Delivery Vehicle - Rajesh Kumar' },
            { status: 'Arriving at Destination', time: 'Today by 6:00 PM', location: 'Customer Doorstep' },
          ],
        });
      }
    } catch (error) {
      console.error('Failed to fetch tracking:', error);
      setDelivery({
        orderId: orderId || 'ORD-9021',
        status: 'out_for_delivery',
        estimatedDelivery: new Date(Date.now() + 3600000 * 2).toISOString(),
        currentLocation: 'Sector 18 Hub, Express Delivery Route',
        waypoint: 'Expressway Route, Sector 18',
        deliveryAgent: {
          name: 'Rajesh Kumar',
          phone: '+91 98765 43210',
          vehicle: 'Electric Van (EV-8942)',
        },
        timeline: [
          { status: 'Order Verified & Packed', time: '09:30 AM', location: 'Fulfillment Center Warehouse' },
          { status: 'In Transit to Regional Hub', time: '11:45 AM', location: 'Regional Logistics Center' },
          { status: 'Out for Delivery', time: '02:15 PM', location: 'Delivery Vehicle' },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(() => {
      fetchTracking();
    }, 12000);
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Connecting to live rider GPS simulator...</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20 px-4">
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm max-w-md">
          <p className="text-slate-600 mb-6">Tracking information not found.</p>
          <Link to="/orders" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const statusSteps = ['picked', 'in_transit', 'out_for_delivery', 'delivered'];
  const currentStatusIndex = statusSteps.indexOf(delivery.status) >= 0 ? statusSteps.indexOf(delivery.status) : 2;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Link to="/orders" className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5">
            <ArrowLeft size={16} /> Back to Order History
          </Link>

          <button
            onClick={() => fetchTracking(true)}
            disabled={refreshing}
            className="text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : ''} />
            {refreshing ? 'Refreshing GPS...' : 'Refresh Live Status'}
          </button>
        </div>

        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <Radio size={12} className="animate-pulse" /> Live Telemetry
                </span>
                <span className="text-xs text-slate-400 font-mono">Order ID: #{delivery.orderId}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Out for Delivery
              </h1>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
              <p className="text-xl font-extrabold text-blue-600">Today by 6:00 PM</p>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="py-4">
            <div className="flex justify-between relative">
              {/* Line background */}
              <div className="absolute top-1/2 left-0 right-0 h-1.5 bg-slate-100 -translate-y-1/2 z-0"></div>
              <div
                className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
              ></div>

              {[
                { title: 'Confirmed', desc: 'Order placed' },
                { title: 'Packed', desc: 'Ready to ship' },
                { title: 'On the Way', desc: 'With courier' },
                { title: 'Delivered', desc: 'Package arrived' },
              ].map((step, idx) => (
                <div key={idx} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-md ${
                      idx <= currentStatusIndex
                        ? 'bg-blue-600 text-white shadow-blue-500/25'
                        : 'bg-white text-slate-400 border-2 border-slate-200'
                    }`}
                  >
                    {idx < currentStatusIndex ? <CheckCircle size={18} /> : idx + 1}
                  </div>
                  <p className="text-xs font-bold mt-2 text-slate-900">{step.title}</p>
                  <p className="text-[10px] text-slate-400 hidden sm:block">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Live Map Simulator Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Navigation size={20} className="text-blue-400 animate-pulse" />
              <h2 className="text-lg font-bold">Live GPS Waypoint Simulator</h2>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg">
              GPS: {riderCoords.lat.toFixed(4)}° N, {riderCoords.lng.toFixed(4)}° E
            </span>
          </div>

          <div className="h-56 rounded-2xl bg-slate-800/80 border border-slate-700 relative overflow-hidden flex items-center justify-center p-6 text-center backdrop-blur-md">
            {/* Animated Radar Background */}
            <div className="absolute w-72 h-72 rounded-full border border-blue-500/20 animate-ping"></div>
            <div className="absolute w-44 h-44 rounded-full border border-indigo-500/30"></div>
            <div className="absolute w-20 h-20 rounded-full bg-blue-600/20 border border-blue-400 flex items-center justify-center">
              <Truck size={24} className="text-yellow-400 animate-bounce" />
            </div>

            <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 p-3 rounded-xl text-left flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-400 flex-shrink-0" />
                <span className="font-semibold text-slate-200 line-clamp-1">
                  Current Sector: {delivery.waypoint || delivery.currentLocation}
                </span>
              </div>
              <span className="text-blue-400 font-bold hidden sm:inline">Speed: ~34 km/h</span>
            </div>
          </div>
        </div>

        {/* Agent & Timeline Details */}
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* Delivery Agent Card */}
          {delivery.deliveryAgent && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Truck size={18} className="text-blue-600" /> Assigned Delivery Agent
              </h3>
              <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-lg">
                  {delivery.deliveryAgent.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{delivery.deliveryAgent.name}</p>
                  <p className="text-xs text-slate-500">{delivery.deliveryAgent.vehicle}</p>
                  <p className="text-xs font-semibold text-emerald-600">Verified Courier Partner (Rating 4.9★)</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${delivery.deliveryAgent.phone}`}
                  className="flex-1 bg-slate-900 hover:bg-black text-white text-xs font-bold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <Phone size={14} /> Call Driver
                </a>
              </div>
            </div>
          )}

          {/* Delivery Timeline Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" /> Dispatch Milestones
            </h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-1 text-xs">
              {delivery.timeline.map((event, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 flex-shrink-0 shadow-sm shadow-blue-500"></div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{event.status}</p>
                    <p className="text-slate-500 font-mono text-[11px]">{event.time} • {event.location}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Support Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck size={28} className="text-blue-600 flex-shrink-0" />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Need help with your shipment?</h4>
              <p className="text-xs text-slate-500">Our customer support team is available 24/7 to assist with rescheduling or instructions.</p>
            </div>
          </div>
          <button
            onClick={() => alert('Support ticket created. An agent will contact you within 5 minutes.')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-5 py-2.5 rounded-xl transition whitespace-nowrap cursor-pointer"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
