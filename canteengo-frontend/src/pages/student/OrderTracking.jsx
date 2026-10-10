import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllOrders } from '../../services/api';
import { normalizeOrderStatus } from '../../utils/orderFormat';

const STATUS_STEPS = [
  { id: 'Pending', label: 'Order Received', desc: 'Your order has been placed successfully.' },
  { id: 'Preparing', label: 'Preparing Food', desc: 'The kitchen staff is preparing your delicious meal.' },
  { id: 'Ready', label: 'Ready for Pickup', desc: 'Your food is ready! Please collect it from the counter.' },
  { id: 'Completed', label: 'Order Picked Up', desc: 'Order completed. Enjoy your meal!' }
];

export default function OrderTracking() {
  const [allOrders, setAllOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    const loadOrders = async () => {
      let orders = [];

      try {
        const response = await fetchAllOrders();
        orders = Array.isArray(response.data) ? response.data : [];
        setLoadFailed(false);
        localStorage.setItem('canteengo_orders', JSON.stringify(orders));
      } catch (error) {
        console.error('Failed to refresh tracked orders:', error);
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }

      setAllOrders(orders);
      setSelectedOrderId((previousId) => {
        const stillActive = orders.some(
          (order) => String(order.id) === String(previousId)
            && normalizeOrderStatus(order.status) !== 'COMPLETED',
        );
        if (previousId != null && stillActive) {
          return previousId;
        }
        return orders.find((order) => normalizeOrderStatus(order.status) !== 'COMPLETED')?.id
          ?? null;
      });
    };

    loadOrders();

    window.addEventListener('storage', loadOrders);
    window.addEventListener('cartUpdated', loadOrders);

    const interval = setInterval(loadOrders, 3000);

    return () => {
      window.removeEventListener('storage', loadOrders);
      window.removeEventListener('cartUpdated', loadOrders);
      clearInterval(interval);
    };
  }, []);

  // Filter Active Orders (Jo completed nahi hue hain)
  const activeOrders = allOrders.filter((order) => normalizeOrderStatus(order.status) !== 'COMPLETED');
  
  // Current order to track based on selectedOrderId
  const currentTrackOrder = activeOrders.find((o) => String(o.id) === String(selectedOrderId)) || activeOrders[0];

  // Calculate Active Step Index
  const currentStepIndex = currentTrackOrder
    ? STATUS_STEPS.findIndex((step) => step.id.toUpperCase() === normalizeOrderStatus(currentTrackOrder.status))
    : 0;

  const activeStep = currentStepIndex >= 0 ? currentStepIndex : 0;

  if (activeOrders.length === 0) {
    return (
      <div className="w-full min-h-screen bg-slate-50 py-10 px-6 sm:px-10 lg:px-14">
        <div className="max-w-[950px] mx-auto space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Live Tracking</h1>
              <p className="text-slate-500 font-medium text-sm mt-1">Track the progress of your active orders</p>
            </div>
            <Link
              to="/my-orders"
              className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm transition"
            >
              View All History
            </Link>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200/80 p-10 sm:p-14 text-center shadow-sm">
            <h2 className="text-2xl font-black text-slate-900">
              {loading ? 'Loading active orders...' : loadFailed ? 'Could not load active orders' : 'There are no active orders'}
            </h2>
            <p className="text-slate-500 font-medium text-sm mt-2">
              {loadFailed ? 'Reconnect to the server to securely refresh your orders.' : 'Completed orders are available in your order history.'}
            </p>
            <Link
              to="/menu"
              className="inline-block mt-6 bg-slate-900 hover:bg-amber-500 text-white font-bold px-7 py-3 rounded-xl transition"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-6 sm:px-10 lg:px-14">
      <div className="max-w-[950px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Live Tracking</h1>
              <span className="bg-emerald-50 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200 animate-pulse">
                Real-Time
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm mt-1">
              Select an active token below to track your live order progress
            </p>
          </div>

          <Link
            to="/my-orders"
            className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold px-5 py-2.5 rounded-xl text-sm transition"
          >
            View All History
          </Link>
        </div>

        {/* Active Orders Switcher Bar */}
        {activeOrders.length > 0 && (
          <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block px-2">
              Your Active Orders ({activeOrders.length}):
            </span>
            <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
              {activeOrders.map((ord) => {
                const isSelected = currentTrackOrder && String(currentTrackOrder.id) === String(ord.id);
                return (
                  <button
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl border transition text-left cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-102'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span className={`font-black text-sm px-2.5 py-1 rounded-lg ${isSelected ? 'bg-amber-500 text-slate-900' : 'bg-slate-200 text-slate-800'}`}>
                      {ord.tokenNumber || ord.token || `TK-${100 + Number(ord.id || 1)}`}
                    </span>
                    <div>
                      <span className="font-bold text-xs block">Order #{ord.id}</span>
                      <span className={`text-[10px] font-extrabold ${isSelected ? 'text-amber-400' : 'text-amber-600'}`}>
                        {ord.status || 'Pending'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Order Highlight Card */}
        {currentTrackOrder && (
          <>
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8 text-slate-900 shadow-xl shadow-amber-500/10 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-black uppercase tracking-widest text-slate-900/70 block">
                  SELECTED PICKUP TOKEN
                </span>
                <h2 className="text-5xl font-black tracking-wider text-slate-900">
                  {currentTrackOrder.tokenNumber || currentTrackOrder.token || `TK-${100 + Number(currentTrackOrder.id || 1)}`}
                </h2>
                <p className="text-xs font-bold text-slate-900/80 mt-1">
                  Show this token number at the canteen counter to collect your food.
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/30 text-center min-w-[160px]">
                <span className="text-[11px] font-black uppercase text-slate-900/80 block">Current Status</span>
                <span className="text-lg font-black text-slate-900 block mt-0.5">
                  {currentTrackOrder.status || 'Pending'}
                </span>
              </div>
            </div>

            {/* Progress Tracker Bar */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-8">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h3 className="text-xl font-extrabold text-slate-900">
                  Order Status Timeline
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Order #{currentTrackOrder.id}
                </span>
              </div>

              <div className="relative space-y-8 before:absolute before:inset-0 before:left-6 sm:before:left-8 before:w-1 before:bg-slate-100 before:z-0">
                {STATUS_STEPS.map((step, idx) => {
                  const isPassed = idx <= activeStep;
                  const isCurrent = idx === activeStep;

                  return (
                    <div key={step.id} className="relative z-10 flex items-start gap-4 sm:gap-6">
                      
                      <div
                        className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl transition-all duration-300 font-black ${
                          isPassed
                            ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20 scale-105'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        <span className="text-sm sm:text-base">{String(idx + 1).padStart(2, '0')}</span>
                      </div>

                      <div className="pt-1 flex-1">
                        <div className="flex items-center gap-3">
                          <h4
                            className={`text-base sm:text-lg font-black ${
                              isPassed ? 'text-slate-900' : 'text-slate-400'
                            }`}
                          >
                            {step.label}
                          </h4>
                          {isCurrent && (
                            <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-md">
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs sm:text-sm font-medium mt-0.5 ${
                            isPassed ? 'text-slate-500' : 'text-slate-400'
                          }`}
                        >
                          {step.desc}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Items Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm space-y-6">
              <h3 className="text-xl font-extrabold text-slate-900 pb-4 border-b border-slate-100">
                Order Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Ordered Items:</span>
                  <span className="text-sm font-black text-slate-900">{currentTrackOrder.items}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-50">
                  <span className="text-sm font-bold text-slate-500">Order Placed At:</span>
                  <span className="text-sm font-black text-slate-900">{currentTrackOrder.timestamp || 'Today'}</span>
                </div>

                <div className="flex justify-between items-center pt-3">
                  <span className="text-base font-bold text-slate-700">Total Amount:</span>
                  <span className="text-2xl font-black text-amber-600">₹{currentTrackOrder.total}</span>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <Link
                  to="/menu"
                  className="flex-1 bg-slate-900 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl text-center transition shadow-md text-sm"
                >
                  Order More Food
                </Link>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}