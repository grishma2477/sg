import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiRequest } from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return toast.error('Fill in all fields');
    setLoading(true);
    try {
      const res = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      if (res.role !== 'admin') return toast.error('Not an admin account');
      login({ userId: res.userId, role: res.role, accessToken: res.token, refreshToken: res.refreshToken ?? '' });
      navigate('/admin', { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-xl">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-black text-xl">SG</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
        </div>

        <div className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-indigo-600 text-white py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <button
          onClick={() => navigate('/login')}
          className="mt-4 text-xs text-gray-400 hover:text-gray-600 w-full text-center block"
        >
          ← Back to phone login
        </button>
      </div>
    </div>
  );
}
