import { useState, useEffect } from 'react';
import { fetchAllOrders, updateOrderStatus } from '../../services/api';
import { formatOrderTimestamp, normalizeOrderStatus, sortAdminOrders } from '../../utils/orderFormat';

export default function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrdersFromBackend = async () => {
    try {
      const res = await fetchAllOrders();
      setOrders(sortAdminOrders(Array.isArray(res.data) ? res.data : []));
    } catch (error) {
      console.error('Error fetching admin orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdersFromBackend();
    const interval = setInterval(loadOrdersFromBackend, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      // 1. Backend DB me status update call
      await updateOrderStatus(orderId, newStatus);
      
      // 2. UI State Update
      setOrders((prevOrders) =>
        sortAdminOrders(prevOrders.map((ord) =>
          ord.id === orderId ? { ...ord, status: newStatus } : ord
        ))
      );
    } catch (error) {
      console.error('Failed to update order status on backend:', error);
      alert('Backend update failed! Check console.');
      loadOrdersFromBackend();
    }
  };

  const getStatusBadgeClass = (status) => {
    const uppercaseStatus = (status || '').toUpperCase();
    switch (uppercaseStatus) {
      case 'PREPARING':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'READY':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'COMPLETED':
        return 'bg-slate-200 text-slate-700 border-slate-300';
      default:
        return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-6 sm:px-10 lg:px-14">
      <div className="max-w-[1300px] mx-auto space-y-8">
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black">Manage Canteen Orders</h1>
              <span className="bg-amber-500 text-slate-900 text-xs font-black px-3 py-1 rounded-full">
                Live Admin
              </span>
            </div>
            <p className="text-slate-400 font-medium text-sm mt-1">
              View student orders, change live statuses, and manage counter pickups
            </p>
          </div>

          <button
            onClick={loadOrdersFromBackend}
            className="bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold px-5 py-2.5 rounded-2xl border border-slate-700 transition cursor-pointer text-xs"
          >
            Refresh Live Orders
          </button>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900">Loading orders...</h3>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">No active orders placed yet</h3>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => {
              const currentStatus = normalizeOrderStatus(ord.status);
              const displayToken = ord.tokenNumber || ord.token || `TK-${100 + Number(ord.id || 1)}`;

              return (
                <div
                  key={ord.id}
                  className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-amber-500 text-slate-900 text-lg font-black px-4 py-1.5 rounded-xl shadow-sm">
                        {displayToken}
                      </span>
                      <h3 className="text-xl font-black text-slate-900">Order #{ord.id}</h3>
                      <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${getStatusBadgeClass(currentStatus)}`}>
                        {currentStatus}
                      </span>
                    </div>

                    <p className="text-base font-bold text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      Items: {ord.items}
                    </p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs font-semibold text-slate-500">
                      <span>Student: <strong className="text-slate-900">{ord.studentName || 'Legacy order'}</strong></span>
                      {ord.studentContactNumber && (
                        <a className="text-amber-700 hover:underline" href={`tel:${ord.studentContactNumber}`}>
                          Contact: {ord.studentContactNumber}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <span>Placed: <strong className="text-slate-900">{formatOrderTimestamp(ord.placedAt || ord.timestamp || ord.date)}</strong></span>
                      {currentStatus === 'COMPLETED' && (
                        <span>Completed: <strong className="text-slate-900">{formatOrderTimestamp(ord.completedAt)}</strong></span>
                      )}
                      <span>•</span>
                      <span>Total Bill: <strong className="text-amber-600 text-sm">₹{ord.total}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <span className="text-xs font-bold text-slate-400 block w-full lg:w-auto mb-1 lg:mb-0">
                      Set Status:
                    </span>

                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'PENDING')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        currentStatus === 'PENDING'
                          ? 'bg-slate-900 text-white shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Pending
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'PREPARING')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        currentStatus === 'PREPARING'
                          ? 'bg-amber-500 text-slate-900 font-black shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Preparing
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'READY')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        currentStatus === 'READY'
                          ? 'bg-emerald-500 text-white font-black shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Mark Ready
                    </button>

                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'COMPLETED')}
                      className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                        currentStatus === 'COMPLETED'
                          ? 'bg-blue-600 text-white font-black shadow-md'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Completed
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}