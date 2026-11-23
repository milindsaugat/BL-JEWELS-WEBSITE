import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { orderService } from '../services/api';
import { toast } from 'sonner';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const handleOpenOrder = async (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || order.orderStatus || 'confirmed');
    setTrackingId(order.tracking?.trackingId || order.trackingNumber || '');

    if (order.adminViewed === false) {
      try {
        await orderService.markViewed(order._id);
        setOrders((prev) =>
          prev.map((o) => (o._id === order._id ? { ...o, adminViewed: true } : o))
        );
        window.dispatchEvent(new CustomEvent('bl-badges-refresh'));
      } catch (err) {
        console.warn('Failed to mark order viewed:', err);
      }
    }
  };

  const handleMarkAllOrdersViewed = async () => {
    try {
      await orderService.markAllViewed();
      setOrders((prev) => prev.map((o) => ({ ...o, adminViewed: true })));
      window.dispatchEvent(new CustomEvent('bl-badges-refresh'));
    } catch (err) {
      console.warn('Failed to mark all orders viewed:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await orderService.getAllOrders();
      if (res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedOrder]);

  const handleVerifyBankPayment = async (orderId, paymentStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await orderService.updateStatus(orderId, {
        paymentStatus,
        note:
          paymentStatus === 'paid'
            ? 'Direct Bank / QR transfer payment verified by admin.'
            : 'Direct Bank / QR payment proof rejected.',
      });
      toast.success(
        paymentStatus === 'paid'
          ? 'Payment verified & order marked Paid!'
          : 'Payment marked failed / rejected.'
      );
      await fetchOrders();
      if (res?.order && selectedOrder?._id === orderId) {
        setSelectedOrder(res.order);
      }
    } catch {
      toast.error('Failed to update payment verification status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateStatus = async (orderId) => {
    if (!newStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await orderService.updateStatus(orderId, {
        status: newStatus,
        orderStatus: newStatus,
        trackingNumber: trackingId || undefined,
        carrier: 'Blue Dart Armored Security Logistics'
      });
      toast.success('Order status updated successfully!');
      await fetchOrders();
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res?.order || (prev => ({ ...prev, status: newStatus, orderStatus: newStatus, trackingNumber: trackingId || prev.trackingNumber })));
      }
    } catch {
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <Truck className="w-3.5 h-3.5" />
            In Armored Transit
          </span>
        );
      case 'processing':
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5" />
            Hallmark Verification
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-300">
            <Clock className="w-3.5 h-3.5" />
            {status || 'Pending'}
          </span>
        );
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-stone-900">
            Vault Dispatches & Client Orders
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Track and oversee insured fine jewelry shipments, Blue Dart armored dispatches, and BIS hallmark certifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {orders.some((o) => o.adminViewed === false) && (
            <button
              type="button"
              onClick={handleMarkAllOrdersViewed}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#930303] border border-red-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>✓ Mark All Viewed</span>
            </button>
          )}
          <div className="px-4 py-2 bg-white rounded-xl border border-stone-200 shadow-sm text-xs font-semibold text-stone-700">
            Total Orders: <span className="text-[#930303] font-bold">{orders.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order ID, customer, city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-gold-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-stone-500 font-medium whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Status:
          </span>
          {['ALL', 'pending', 'confirmed', 'dispatched', 'delivered'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap capitalize ${
                statusFilter === st
                  ? 'bg-[#930303] text-white shadow-sm'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-stone-500 text-sm">Loading fine jewelry vault orders...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-stone-500 text-sm">
            <Package className="w-10 h-10 mx-auto text-stone-300 mb-3" />
            No orders found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-stone-600 font-semibold uppercase tracking-wider text-[11px] border-b border-stone-200">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4">Items / Pure Gold</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Fulfillment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-stone-900 font-mono text-[11px]">
                          #{order._id?.slice(-8).toUpperCase()}
                        </span>
                        {order.adminViewed === false && (
                          <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded bg-red-600 text-white animate-pulse">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-900">
                        {order.shippingAddress?.name || 'Valued Customer'}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        {order.shippingAddress?.city || 'India'}, {order.shippingAddress?.state || ''}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {order.shippingAddress?.phone || '+91 98XXX XXXXX'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">
                        {order.items?.length || 1} Masterpiece(s)
                      </div>
                      <div className="text-[10px] text-stone-400 truncate max-w-[160px]">
                        {order.items?.[0]?.product?.name || order.items?.[0]?.name || '22K Gold Heirloom'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#930303]">
                      ₹{(order.pricing?.total ?? order.totalAmount ?? 0).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4">
                      {(() => {
                        const payStatus = order.payment?.status || order.paymentStatus || 'pending';
                        const isBank = order.payment?.method === 'bank_transfer';
                        return (
                          <div className="space-y-1">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              payStatus === 'paid'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : payStatus === 'verification_pending'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-stone-100 text-stone-700 border border-stone-200'
                            }`}>
                              {payStatus.replaceAll('_', ' ')}
                            </span>
                            {isBank && (
                              <span className="block text-[10px] font-medium text-[#930303]">
                                Bank / QR Transfer
                              </span>
                            )}
                          </div>
                        );
                      })()}
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(order.status || order.orderStatus || 'pending')}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenOrder(order)}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-gold-50 hover:text-gold-900 text-stone-700 rounded-lg font-medium transition-colors border border-stone-200 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details & Status Modal */}
      {selectedOrder && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div role="dialog" aria-modal="true" className="bg-white rounded-2xl max-w-xl w-full p-4 sm:p-5 max-h-[90vh] my-auto overflow-y-auto space-y-4 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div>
                <span className="text-[10px] font-accent uppercase tracking-widest text-[#930303] font-bold block">
                  BL Jewels • Insured Vault Dispatch
                </span>
                <h2 className="font-heading text-lg font-bold text-stone-900 mt-0.5">
                  Order #{selectedOrder._id?.slice(-8).toUpperCase()}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-7 h-7 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center text-sm leading-none transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Quick Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-stone-200 text-xs">
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Total Price</span>
                <span className="font-bold text-[#930303] text-sm">
                  ₹{(selectedOrder.pricing?.total ?? selectedOrder.totalAmount ?? 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Payment</span>
                <span className="font-semibold text-emerald-700 capitalize">
                  {(selectedOrder.payment?.status || selectedOrder.paymentStatus || 'pending').replaceAll('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Current State</span>
                <span className="font-semibold text-stone-800 capitalize">
                  {(selectedOrder.status || selectedOrder.orderStatus || 'pending').replaceAll('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px] uppercase font-semibold">Security</span>
                <span className="font-semibold text-stone-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Insured
                </span>
              </div>
            </div>

            {/* Direct Bank Transfer Proof & Verification */}
            {selectedOrder.payment?.method === 'bank_transfer' && (
              <div className="bg-[#FFF8EE] border border-amber-300 rounded-2xl p-4 space-y-3 text-xs">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#930303]">
                      Direct Bank / UPI QR Transfer Verification
                    </p>
                    <p className="font-semibold text-stone-900 mt-0.5">
                      {selectedOrder.payment?.bankLabel || selectedOrder.payment?.bankName || 'Showroom Bank Account'}
                      {selectedOrder.payment?.accountNumberLast4 ? ` (•••• ${selectedOrder.payment.accountNumberLast4})` : ''}
                    </p>
                  </div>
                  <span className="font-mono font-bold px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-[#930303]">
                    Ref: {selectedOrder.payment?.transactionId || 'N/A'}
                  </span>
                </div>

                {selectedOrder.payment?.proofImage && (
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={selectedOrder.payment.proofImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-24 h-24 rounded-xl border border-amber-200 bg-white overflow-hidden shrink-0"
                    >
                      <img
                        src={selectedOrder.payment.proofImage}
                        alt="Customer bank transfer proof"
                        className="w-full h-full object-cover"
                      />
                    </a>
                    <div className="space-y-2">
                      <a
                        href={selectedOrder.payment.proofImage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#930303] font-semibold hover:underline"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Inspect Full Payment Screenshot</span>
                      </a>
                      {selectedOrder.payment?.status !== 'paid' && (
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={updatingStatus}
                            onClick={() => handleVerifyBankPayment(selectedOrder._id, 'paid')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold cursor-pointer"
                          >
                            Verify & Mark Paid
                          </button>
                          <button
                            type="button"
                            disabled={updatingStatus}
                            onClick={() => handleVerifyBankPayment(selectedOrder._id, 'failed')}
                            className="px-3 py-1.5 rounded-lg bg-white border border-red-300 text-red-700 hover:bg-red-50 font-semibold cursor-pointer"
                          >
                            Reject Proof
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cancelled Details (if applicable) */}
            {selectedOrder.status === 'cancelled' && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-800">
                  <AlertCircle className="w-4 h-4 text-rose-700" />
                  <span>Order Cancelled</span>
                </div>
                <p className="text-stone-700">
                  <strong>Reason:</strong> {selectedOrder.cancelReason || selectedOrder.statusHistory?.find((s) => s.status === 'cancelled')?.note || 'Customer requested cancellation'}
                </p>
                {selectedOrder.cancelComments && (
                  <p className="text-stone-600 italic">
                    <strong>Customer Comments:</strong> "{selectedOrder.cancelComments}"
                  </p>
                )}
                {selectedOrder.cancelledAt && (
                  <p className="text-stone-400 text-[10px]">
                    Cancelled on: {new Date(selectedOrder.cancelledAt).toLocaleString('en-IN')}
                  </p>
                )}
              </div>
            )}

            {/* Update Order Status */}
            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Update Dispatch & Delivery Status
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-stone-600 mb-1 font-medium">Status Pipeline</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-gold-400"
                  >
                    <option value="pending">Pending Hallmark Check</option>
                    <option value="confirmed">Confirmed & Allocated</option>
                    <option value="processing">Velvet Box Packaging</option>
                    <option value="dispatched">Dispatched via Blue Dart Armored</option>
                    <option value="delivered">Safely Delivered & Handovered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-stone-600 mb-1 font-medium">Armored Tracking Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BDAT-916-202688"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-gold-400"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus(selectedOrder._id)}
                  className="px-4 py-2 bg-[#930303] hover:bg-[#7A0303] disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  {updatingStatus ? 'Updating Records...' : 'Save & Notify Customer'}
                </button>
              </div>
            </div>

            {/* Shipping Details */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                Client Shipping & Vault Destination
              </h3>
              <div className="p-3.5 bg-white border border-stone-200 rounded-xl space-y-1 text-stone-700">
                <p className="font-semibold text-stone-900">{selectedOrder.shippingAddress?.name}</p>
                <p>{selectedOrder.shippingAddress?.line1}, {selectedOrder.shippingAddress?.line2}</p>
                <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} - {selectedOrder.shippingAddress?.pincode}</p>
                <p className="text-stone-500 pt-1">Contact: {selectedOrder.shippingAddress?.phone}</p>
              </div>
            </div>

            {/* Items Ordered */}
            <div className="space-y-2 text-xs">
              <h3 className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                Jewelry Masterpieces in this Order
              </h3>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-300">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-stone-900">{item.name || item.product?.name || 'Jewelry Piece'}</h4>
                        <p className="text-[11px] text-stone-500">Qty: {item.quantity || 1} • 22K (916) Pure Gold</p>
                      </div>
                    </div>
                    <div className="text-right font-semibold text-stone-900">
                      ₹{((item.price || selectedOrder.totalAmount || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-semibold transition-colors"
              >
                Close Modal
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

