import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Clock, Package, Eye, Search } from 'lucide-react';
import { orderService } from '../../services/api';
import { formatCurrency } from '../../lib/utils';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAllOrders();
      if (res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Fetch admin orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateStatus(orderId, { status: newStatus });
      fetchOrders();
    } catch {
      alert('Failed to update status');
    }
  };

  const filtered = orders.filter(o => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-stone-200 gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-stone-900">
            Trousseau Orders & Dispatch
          </h1>
          <p className="text-xs text-stone-500 font-body">
            Track luxury shipments, update Blue Dart express statuses, and manage fulfillment.
          </p>
        </div>

        <div className="text-xs font-accent font-bold text-crimson-700 bg-crimson-50 px-3 py-1.5 rounded-lg border border-crimson-200">
          Total Orders: {orders.length}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-sm max-w-md flex-1">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-stone-900 placeholder-stone-400 focus:outline-none font-body"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200 text-xs font-body overflow-x-auto no-scrollbar">
          {['all', 'confirmed', 'processing', 'shipped', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap font-medium transition-all ${
                statusFilter === st ? 'bg-crimson-700 text-white font-semibold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-[#FAF7F2] border-b border-stone-200 text-stone-600 uppercase font-semibold">
              <tr>
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Items Summary</th>
                <th className="p-4">Valuation</th>
                <th className="p-4">Carrier & Status</th>
                <th className="p-4">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((ord) => (
                <tr key={ord._id} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4">
                    <strong className="font-accent font-bold text-crimson-700 text-sm block">
                      {ord.orderNumber}
                    </strong>
                    <span className="text-[11px] text-stone-400">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </span>
                  </td>
                  <td className="p-4">
                    <strong className="block text-stone-900">{ord.shippingAddress?.name || 'Customer'}</strong>
                    <span className="text-stone-500 text-[11px] block">{ord.shippingAddress?.phone}</span>
                    <span className="text-stone-400 text-[10px]">{ord.shippingAddress?.city}, {ord.shippingAddress?.state}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-stone-800 block">
                      {ord.items?.length || 1} jewelry creation(s)
                    </span>
                    <span className="text-[11px] text-stone-500 line-clamp-1">
                      {ord.items?.[0]?.snapshot?.name || 'Fine Jewelry'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-accent text-sm font-bold text-stone-900 block">
                      ₹{formatCurrency(ord.pricing?.total)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium">Paid via {ord.payment?.method || 'Razorpay'}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-1 rounded-pill text-[10px] font-bold uppercase tracking-wider mb-1 ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ord.status === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status || 'Confirmed'}
                    </span>
                    <p className="text-[10px] text-stone-500 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-gold-600" />
                      <span>{ord.tracking?.trackingId || 'Blue Dart Express'}</span>
                    </p>
                  </td>
                  <td className="p-4">
                    <select
                      value={ord.status || 'confirmed'}
                      onChange={(e) => handleUpdateStatus(ord._id, e.target.value)}
                      className="bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 text-xs text-stone-800 focus:outline-none focus:border-gold-400 font-medium"
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing Jadau</option>
                      <option value="shipped">Shipped via Blue Dart</option>
                      <option value="delivered">Delivered to Patron</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
