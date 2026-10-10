import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { fetchAllOrders } from '../../services/api';
import { formatOrderTimestamp, normalizeOrderStatus } from '../../utils/orderFormat';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetchAllOrders();
        const latestOrders = Array.isArray(response.data) ? [...response.data].reverse() : [];
        setOrders(latestOrders);
        setLoadFailed(false);
        localStorage.setItem('canteengo_orders', JSON.stringify(latestOrders));
      } catch (error) {
        console.error('Failed to refresh order history:', error);
        setOrders([]);
        setLoadFailed(true);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 5000);
    window.addEventListener('storage', loadOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', loadOrders);
    };
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-6 sm:px-10 lg:px-14">
      <div className="max-w-[1100px] mx-auto space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900">My Orders</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">
            Active and completed orders, refreshed automatically
          </p>
        </div>

        {loading ? (
          <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500">
            Loading order history...
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-4">
            <h3 className="text-xl font-bold text-slate-900">{loadFailed ? 'Order history unavailable' : 'No orders found'}</h3>
            <p className="text-slate-500 font-medium text-sm">
              {loadFailed ? 'Reconnect to the server to securely reload your orders.' : 'Orders you place will appear here.'}
            </p>
            {!loadFailed && (
              <Link
                to="/menu"
                className="inline-block bg-slate-900 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
              >
                Browse Menu
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const status = normalizeOrderStatus(order.status);
              const isExpanded = String(expandedOrderId) === String(order.id);
              const isCompleted = status === 'COMPLETED';
              const placedAt = formatOrderTimestamp(order.placedAt || order.timestamp || order.date);

              return (
                <section key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-slate-50 transition"
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-3">
                        <span className="font-black text-lg text-slate-900">ORD-{order.id}</span>
                        <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border ${isCompleted ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-800 border-amber-200'}`}>
                          {status}
                        </span>
                      </span>
                      <span className="block text-sm font-bold text-slate-600 mt-2 truncate">{order.items || 'No item details'}</span>
                      <span className="block text-xs text-slate-400 mt-1">Ordered: {placedAt}</span>
                    </span>
                    <ChevronDown size={20} aria-hidden="true" className={`shrink-0 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {isExpanded && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 p-5 sm:p-6 pt-0 border-t border-slate-100">
                      <div>
                        <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Pickup token</span>
                        <span className="block mt-1 text-lg font-black text-amber-600">{order.tokenNumber || order.token || 'Not assigned'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Current status</span>
                        <span className="block mt-1 text-sm font-bold text-slate-900">{status}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Items</span>
                        <span className="block mt-1 text-sm font-semibold text-slate-700">{order.items || 'No item details'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Bill total</span>
                        <span className="block mt-1 text-lg font-black text-slate-900">₹{order.total ?? '0.00'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Order placed</span>
                        <span className="block mt-1 text-sm font-semibold text-slate-700">{placedAt}</span>
                      </div>
                      {isCompleted ? (
                        <div>
                          <span className="block text-[10px] uppercase font-black tracking-wider text-slate-400">Marked completed</span>
                          <span className="block mt-1 text-sm font-semibold text-slate-700">{formatOrderTimestamp(order.completedAt)}</span>
                        </div>
                      ) : (
                        <div className="sm:col-span-2">
                          <Link to="/tracking" className="inline-block bg-slate-900 hover:bg-amber-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition">
                            Open Live Tracking
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}