import { useState, useEffect } from 'react';

export default function CanteenAdmin() {
  const [orders, setOrders] = useState([]);

  // Load orders from LocalStorage
  const loadOrders = () => {
    const savedOrders = JSON.parse(localStorage.getItem('canteengo_orders') || '[]');
    setOrders(savedOrders);
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('storage', loadOrders);
    window.addEventListener('cartUpdated', loadOrders);

    return () => {
      window.removeEventListener('storage', loadOrders);
      window.removeEventListener('cartUpdated', loadOrders);
    };
  }, []);

  // Status Change Handler
  const handleUpdateStatus = (orderId, newStatus) => {
    const updatedOrders = orders.map((ord) => {
      if (ord.id === orderId) {
        return { ...ord, status: newStatus };
      }
      return ord;
    });

    setOrders(updatedOrders);
    localStorage.setItem('canteengo_orders', JSON.stringify(updatedOrders));
    
    // Broadcast change to tracking pages
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 py-10 px-6 sm:px-10 lg:px-14">
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl sm:text-4xl font-black">Canteen Kitchen Panel</h1>
              <span className="bg-amber-500 text-slate-900 text-xs font-black px-3 py-1 rounded-full">
                Live Kitchen
              </span>
            </div>
            <p className="text-slate-400 font-medium text-sm mt-1">Manage live orders and update student order progress</p>
          </div>

          <div className="bg-slate-800 px-5 py-3 rounded-2xl border border-slate-700">
            <span className="text-xs text-slate-400 block font-bold">TOTAL LIVE ORDERS</span>
            <span className="text-2xl font-black text-amber-400">{orders.length}</span>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3 shadow-sm">
            <h3 className="text-xl font-bold text-slate-900">No active kitchen orders</h3>
            <p className="text-slate-500 text-sm font-medium">New student orders will automatically appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6"
              >
                
                {/* Order Details */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="bg-amber-500 text-slate-900 text-lg font-black px-4 py-1.5 rounded-xl">
                      {ord.token}
                    </span>
                    <h3 className="text-xl font-black text-slate-900">Order #{ord.id}</h3>
                    <span className="text-xs font-extrabold text-slate-400">({ord.timestamp || 'Today'})</span>
                  </div>

                  <p className="text-base font-bold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    Items: {ord.items}
                  </p>

                  <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                    <span>Total Bill: <strong className="text-slate-900 text-sm">₹{ord.total}</strong></span>
                    <span>•</span>
                    <span>Current Status: <strong className="text-amber-600 text-sm">{ord.status || 'Pending'}</strong></span>
                  </div>
                </div>

                {/* Quick Action Status Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'Pending')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      ord.status === 'Pending'
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'Preparing')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      ord.status === 'Preparing'
                        ? 'bg-amber-500 text-slate-900 font-black shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Preparing
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'Ready')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      ord.status === 'Ready'
                        ? 'bg-emerald-500 text-white font-black shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Ready
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(ord.id, 'Completed')}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                      ord.status === 'Completed'
                        ? 'bg-blue-600 text-white font-black shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Completed
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}