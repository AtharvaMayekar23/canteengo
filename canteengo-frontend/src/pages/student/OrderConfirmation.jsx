import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function OrderConfirmation() {
  const [latestOrder, setLatestOrder] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // 1. Pehle React Router se pass hua direct state data check karo
    if (location.state?.order) {
      setLatestOrder(location.state.order);
    } else {
      // 2. Agar page direct refresh kiya toh localStorage se fetch karo
      const savedOrders = JSON.parse(localStorage.getItem('canteengo_orders') || '[]');
      if (savedOrders.length > 0) {
        setLatestOrder(savedOrders[0]);
      }
    }
  }, [location]);

  if (!latestOrder) {
    return (
      <div className="w-full min-h-screen bg-slate-50 py-16 px-6 flex items-center justify-center">
        <div className="max-w-[500px] w-full bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 shadow-sm">
          <span className="text-5xl block">❓</span>
          <h2 className="text-2xl font-bold text-slate-900">No Recent Order</h2>
          <p className="text-slate-500 text-sm">You haven't placed an order in this session.</p>
          <Link
            to="/menu"
            className="inline-block bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-sm"
          >
            Go to Menu
          </Link>
        </div>
      </div>
    );
  }

  // Backend se aaya tokenNumber check karega, agar nahi mila toh fallback TK-generate karega
  const displayToken = latestOrder.tokenNumber || latestOrder.token || `TK-${100 + Number(latestOrder.id || 1)}`;

  return (
    <div className="w-full min-h-screen bg-slate-50 py-12 px-6 sm:px-10 flex items-center justify-center">
      <div className="max-w-[650px] w-full bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl space-y-8 text-center">
        
        {/* Animated Checkmark */}
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mx-auto shadow-sm animate-bounce">
          ✓
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900">Order Placed Successfully!</h1>
          <p className="text-slate-500 font-medium text-sm sm:text-base">
            Your order has been received by the canteen counter.
          </p>
        </div>

        {/* Token Card */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 max-w-sm mx-auto space-y-1">
          <span className="text-xs text-amber-800 font-extrabold uppercase tracking-widest block">
            Your Pickup Token
          </span>
          {/* Token Display Fixed Here */}
          <span className="text-5xl font-black text-amber-600 block">{displayToken}</span>
          <p className="text-xs text-amber-700 font-semibold pt-1">
            Show this token number at the counter when called
          </p>
        </div>

        {/* Quick Receipt Summary */}
        <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-3 border border-slate-100 text-sm">
          <div className="flex justify-between text-slate-500">
            <span>Order Reference:</span>
            <span className="font-bold text-slate-900">
              ORD-{latestOrder.id ? latestOrder.id : 'NEW'}
            </span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Items Ordered:</span>
            <span className="font-bold text-slate-900 text-right">{latestOrder.items}</span>
          </div>
          <div className="flex justify-between text-slate-500 pt-2 border-t border-slate-200">
            <span className="font-bold text-slate-900 text-base">Total Amount:</span>
            <span className="font-black text-amber-600 text-lg">₹{latestOrder.total}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link
            to="/tracking"
            className="flex-1 bg-slate-900 hover:bg-amber-500 text-white font-bold py-3.5 px-6 rounded-2xl transition shadow-md text-center"
          >
            Track Live Status
          </Link>
          <Link
            to="/my-orders"
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-6 rounded-2xl transition text-center"
          >
            View All Orders
          </Link>
        </div>

      </div>
    </div>
  );
}