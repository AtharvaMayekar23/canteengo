import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerStudent } from '../../services/api';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await registerStudent(formData);
      navigate('/login', { state: { registered: true } });
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Could not create student account. Check the details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-black text-slate-900 mb-2 text-center">Create Account</h2>
        <p className="text-slate-500 text-sm mb-6 text-center">Create a student account to preorder meals</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="text-xs font-bold text-slate-600 block mb-1">Full Name</label>

            <input
              id="register-name"
              type="text"
              required
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label htmlFor="register-contact-number" className="text-xs font-bold text-slate-600 block mb-1">Contact Number</label>
            <input
              id="register-contact-number"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              minLength={8}
              maxLength={24}
              placeholder="+91 9876543210"
              value={formData.contactNumber}
              onChange={(event) => setFormData({ ...formData, contactNumber: event.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label htmlFor="register-email" className="text-xs font-bold text-slate-600 block mb-1">Email Address</label>

            <input
              id="register-email"
              type="email"
              required
              placeholder="student@college.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label htmlFor="register-password" className="text-xs font-bold text-slate-600 block mb-1">Password</label>

            <input
              id="register-password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
            />
          </div>

          {error && <p role="alert" className="text-sm font-semibold text-rose-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-3.5 rounded-xl transition cursor-pointer text-sm shadow-md"
          >
            {submitting ? 'Creating account...' : 'Create Student Account'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-6">
          Already registered?{' '}
          <Link to="/login" className="text-amber-600 font-bold hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}