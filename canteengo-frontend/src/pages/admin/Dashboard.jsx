import { useEffect, useState } from 'react';
import { Activity, ChevronDown, Clock3, IndianRupee, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllOrders } from '../../services/api';
import { formatOrderTimestamp, normalizeOrderStatus, sortAdminOrders } from '../../utils/orderFormat';

const METRIC_ICONS = [ShoppingBag, IndianRupee, Clock3, Activity];

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    let mounted = true;
    const refreshOrders = async () => {
      try {
        const response = await fetchAllOrders();
        if (mounted) {
          setOrders(sortAdminOrders(Array.isArray(response.data) ? response.data : []));
          setLoadFailed(false);
        }
      } catch (error) {
        console.error('Failed to load dashboard orders:', error);
        if (mounted) setLoadFailed(true);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    refreshOrders();
    const interval = setInterval(refreshOrders, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const pendingOrders = orders.filter((order) => normalizeOrderStatus(order.status) === 'PENDING');
  const activeOrders = orders.filter((order) => normalizeOrderStatus(order.status) !== 'COMPLETED');
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
  const stats = [
    { title: 'Total Orders', value: orders.length.toLocaleString() },
    { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}` },
    { title: 'Pending Orders', value: pendingOrders.length.toLocaleString() },
    { title: 'Active Orders', value: activeOrders.length.toLocaleString() },
  ];

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-6 sm:px-10 lg:px-14">
      <div className="max-w-[1200px] mx-auto space-y-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Canteen Overview</h1>
            <p className="text-sm text-slate-500 mt-1">Live orders and revenue</p>
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">Live</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = METRIC_ICONS[index];
            return (
            <div key={stat.title} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{stat.title}</span>
                <Icon size={19} className="text-amber-600" aria-hidden="true" />
              </div>
              <div className="text-3xl font-black text-slate-900">
                {loading ? <span className="text-slate-300">--</span> : stat.value}
              </div>
            </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Recent Orders</h2>
              {loadFailed && <p className="text-sm text-rose-600 mt-1">Could not refresh orders. Showing the last loaded data.</p>}
            </div>
            <Link to="/admin/orders" className="text-sm font-bold text-amber-700 hover:text-amber-800">Manage Orders</Link>
          </div>
          {orders.length === 0 ? (
            <p className="p-8 text-center text-sm text-slate-500">{loading ? 'Loading orders...' : 'No orders yet.'}</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 6).map((order) => {
                const status = normalizeOrderStatus(order.status);
                const isExpanded = String(expandedOrderId) === String(order.id);
                const placedAt = formatOrderTimestamp(order.placedAt || order.timestamp || order.date);
                return (
                  <section key={order.id} className="bg-white">
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left transition hover:bg-slate-50"
                    >
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-black text-slate-900">ORD-{order.id}</span>
                          <span className="text-xs font-semibold text-slate-500">{order.studentName || 'Legacy order'}</span>
                        </span>
                        <span className="mt-1 block truncate text-sm font-medium text-slate-600">{order.items || 'No item details'}</span>
                        <span className="mt-1 block text-xs text-slate-400">{placedAt}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3">
                        <span className="hidden text-sm font-black text-slate-800 sm:inline">₹{order.total ?? 0}</span>
                        <span className={`rounded-full px-3 py-1.5 text-[10px] font-black ${status === 'COMPLETED' ? 'bg-blue-50 text-blue-700' : status === 'READY' ? 'bg-emerald-50 text-emerald-700' : status === 'PREPARING' ? 'bg-sky-50 text-sky-700' : 'bg-amber-50 text-amber-800'}`}>
                          {status}
                        </span>
                        <ChevronDown size={18} aria-hidden="true" className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </span>
                    </button>
                    {isExpanded && (
                      <div className="grid grid-cols-1 gap-x-8 gap-y-4 border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:grid-cols-2">
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Pickup token</span>
                          <span className="mt-1 block text-sm font-black text-amber-700">{order.tokenNumber || order.token || 'Not assigned'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Order total</span>
                          <span className="mt-1 block text-sm font-black text-slate-900">₹{order.total ?? 0}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Items</span>
                          <span className="mt-1 block text-sm font-semibold text-slate-700">{order.items || 'No item details'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Student</span>
                          <span className="mt-1 block text-sm font-semibold text-slate-700">{order.studentName || 'Legacy order'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Contact</span>
                          {order.studentContactNumber ? (
                            <a href={`tel:${order.studentContactNumber}`} className="mt-1 inline-block text-sm font-semibold text-amber-700 hover:underline">
                              {order.studentContactNumber}
                            </a>
                          ) : <span className="mt-1 block text-sm text-slate-500">Not available</span>}
                        </div>
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Order placed</span>
                          <span className="mt-1 block text-sm font-semibold text-slate-700">{placedAt}</span>
                        </div>
                        {status === 'COMPLETED' && (
                          <div>
                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Marked completed</span>
                            <span className="mt-1 block text-sm font-semibold text-slate-700">{formatOrderTimestamp(order.completedAt)}</span>
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

        <div className="flex flex-wrap gap-3">
          <Link to="/admin/food" className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold transition">Manage Menu</Link>
          <Link to="/admin/orders" className="bg-amber-500 hover:bg-amber-600 text-slate-950 px-5 py-3 rounded-xl text-sm font-bold transition">Open Order Queue</Link>
        </div>
      </div>
    </div>
  );
}