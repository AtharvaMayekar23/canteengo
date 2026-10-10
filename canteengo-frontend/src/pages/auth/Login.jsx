import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const user = await login({ email, password, role });
      navigate(user.role === 'ADMIN' ? '/admin/dashboard' : '/menu', { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Invalid email, password, or account type.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">Welcome Back</h2>
        <p className="text-slate-500 text-sm mb-6 text-center">Sign in to continue to CanteenGo</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Sign in as</label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  role === 'STUDENT'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                  role === 'ADMIN'
                    ? 'bg-amber-500 text-slate-950 border-amber-500'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                Admin
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="login-email" className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>

            <input
              id="login-email"
              type="email"
              required
              placeholder="student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="text-xs font-bold text-slate-600 block mb-1">Password</label>

            <input
              id="login-password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && <p role="alert" className="text-sm font-semibold text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-slate-900 hover:bg-amber-500 text-white hover:text-slate-950 font-bold py-3.5 rounded-xl transition cursor-pointer text-sm shadow-md"
          >
            {submitting ? 'Signing in...' : `Sign in as ${role === 'ADMIN' ? 'Admin' : 'Student'}`}
          </button>
        </form>

        {role === 'STUDENT' && (
          <p className="text-center text-xs text-slate-500 mt-6">
            New student?{' '}
            <Link to="/register" className="text-amber-600 font-bold hover:underline">Create an account</Link>
          </p>
        )}
      </div>
    </div>
  );
}