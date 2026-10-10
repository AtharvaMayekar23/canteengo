import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';

// Student Pages
import Menu from './pages/student/Menu';
import Cart from './pages/student/Cart';
import MyOrders from './pages/student/MyOrders';
import OrderTracking from './pages/student/OrderTracking';
import OrderConfirmation from './pages/student/OrderConfirmation';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import ManageFood from './pages/admin/ManageFood';
import ManageOrders from './pages/admin/ManageOrders';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
        {/* Navigation Bar */}
        <Navbar />

        {/* Dynamic Route Pages */}
        <main className="flex-1">
          <Routes>
            {/* Public homepage */}
            <Route path="/" element={<Home />} />
            
            {/* Student Routes */}
            <Route path="/menu" element={<RequireAuth role="STUDENT"><Menu /></RequireAuth>} />
            <Route path="/cart" element={<RequireAuth role="STUDENT"><Cart /></RequireAuth>} />
            <Route path="/orders" element={<RequireAuth role="STUDENT"><MyOrders /></RequireAuth>} />
            <Route path="/my-orders" element={<RequireAuth role="STUDENT"><MyOrders /></RequireAuth>} />
            <Route path="/tracking" element={<RequireAuth role="STUDENT"><OrderTracking /></RequireAuth>} />
            <Route path="/order-tracking" element={<RequireAuth role="STUDENT"><OrderTracking /></RequireAuth>} />
            <Route path="/order-confirmation" element={<RequireAuth role="STUDENT"><OrderConfirmation /></RequireAuth>} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<RequireAuth role="ADMIN"><Dashboard /></RequireAuth>} />
            <Route path="/admin/food" element={<RequireAuth role="ADMIN"><ManageFood /></RequireAuth>} />
            <Route path="/admin/orders" element={<RequireAuth role="ADMIN"><ManageOrders /></RequireAuth>} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 404 Fallback Route (White Screen Protection) */}
            <Route
              path="*"
              element={
                <div className="w-full min-h-[60vh] flex items-center justify-center p-6 text-center">
                  <div className="bg-white p-10 rounded-3xl border border-slate-200/80 shadow-sm max-w-md space-y-4">
                    <h2 className="text-2xl font-black text-slate-900">404 - Page Not Found</h2>
                    <p className="text-slate-500 text-sm font-medium">
                      Jo page aap dhund rahe hain woh nahi mila. Kripya menu page par jayein.
                    </p>
                    <a
                      href="/menu"
                      className="inline-block bg-slate-900 hover:bg-amber-500 text-white font-bold px-6 py-3 rounded-2xl text-sm transition shadow-md"
                    >
                      Return to Menu
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 