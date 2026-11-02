import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Package, MapPin, ShieldCheck, LogOut, Truck, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../services/api';
import { formatCurrency } from '../lib/utils';

export const AccountPage = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const fetchOrders = async () => {
      try {
        const res = await orderService.getMyOrders();
        if (res.orders) {
          setOrders(res.orders);
        }
      } catch (err) {
        console.error('Fetch orders error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="py-12 bg-pearl min-h-screen">
      <div className="container-bl">
        
        {/* Profile Banner */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gold-300 shadow-sm mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-crimson-700 text-white font-display text-2xl font-bold flex items-center justify-center border-2 border-gold-400 shadow-crimson">
              {user?.name?.[0]?.toUpperCase() || 'B'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold text-charcoal">{user?.name}</h1>
                {user?.role === 'admin' && (
                  <span className="bg-crimson-100 text-crimson-800 text-[10px] font-bold px-2 py-0.5 rounded-pill font-body">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-body">{user?.email}</p>
              <p className="text-[11px] text-gold-700 font-semibold font-body mt-0.5">
                ✦ BL Jewels Auspicious Member
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-crimson-700 hover:bg-crimson-800 text-white rounded-xl text-xs font-semibold font-body transition-colors"
              >
                Admin Dashboard
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold font-body transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-4 mb-6 border-b border-border-light pb-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`font-accent text-xs font-bold tracking-wider uppercase pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'border-crimson-700 text-crimson-700'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Order History ({orders.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`font-accent text-xs font-bold tracking-wider uppercase pb-2 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'border-crimson-700 text-crimson-700'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Saved Addresses</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-2xl border border-border-light space-y-3">
                <Package className="w-10 h-10 text-stone-300 mx-auto" />
                <p className="font-display text-lg font-bold text-charcoal">No Orders Placed Yet</p>
                <p className="text-xs text-stone-500 font-body">Your auspicious trousseau journey awaits.</p>
                <Link to="/collections" className="inline-block px-6 py-2.5 bg-crimson-700 text-white rounded-xl text-xs font-semibold font-body">
                  Explore Collections
                </Link>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord._id}
                  className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-border-light">
                    <div>
                      <span className="font-accent text-sm font-bold text-crimson-700 tracking-wider">
                        {ord.orderNumber}
                      </span>
                      <p className="text-[11px] text-stone-400 font-body">
                        Placed on {new Date(ord.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold px-3 py-1 rounded-pill uppercase tracking-wider font-body">
                        {ord.status || 'Confirmed'}
                      </span>
                      <span className="font-accent text-base font-bold text-charcoal">
                        ₹{formatCurrency(ord.pricing?.total)}
                      </span>
                    </div>
                  </div>

                  {/* Items in this order */}
                  <div className="space-y-3">
                    {ord.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-xs font-body">
                        <img
                          src={item.snapshot?.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80'}
                          alt={item.snapshot?.name}
                          className="w-14 h-14 rounded-lg object-cover border border-gold-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-charcoal truncate">{item.snapshot?.name}</h4>
                          <p className="text-stone-500 text-[11px]">Qty: {item.quantity} • {item.snapshot?.variant?.label || '22K Gold'}</p>
                        </div>
                        <span className="font-accent font-bold text-crimson-700">
                          ₹{formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping / Tracking note */}
                  <div className="pt-3 border-t border-border-light flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-stone-600 font-body gap-2">
                    <div className="flex items-center gap-1.5 text-stone-700">
                      <Truck className="w-4 h-4 text-gold-600" />
                      <span>{ord.tracking?.carrier || 'Blue Dart Luxury Express'} (Tracking: {ord.tracking?.trackingId || 'In Transit'})</span>
                    </div>
                    <Link
                      to={`/order/success/${ord._id}`}
                      className="text-crimson-700 font-semibold hover:underline"
                    >
                      View Full Invoice Details →
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-border-light shadow-sm space-y-2">
              <span className="bg-gold-100 text-gold-900 text-[10px] font-bold px-2 py-0.5 rounded-pill uppercase tracking-wider font-body">
                Primary Residence
              </span>
              <h3 className="font-display text-base font-bold text-charcoal">{user?.name}</h3>
              <p className="text-xs text-stone-600 font-body leading-relaxed">
                Flat 402, Royale Meadows, Juhu Tara Road, Mumbai, Maharashtra 400049, India
              </p>
              <p className="text-xs text-stone-500 font-body pt-1">Phone: +91 98200 12345</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

