import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function SplashPage() {
  const navigate = useNavigate();
  const { token, role } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (token) {
        navigate(role === 'driver' ? '/driver' : role === 'admin' ? '/admin' : '/rider', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }, 1800);
    return () => clearTimeout(timer);
  }, [token, role, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-indigo-600 gap-6">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg">
          <span className="text-indigo-600 font-black text-4xl tracking-tight">SG</span>
        </div>
        <h1 className="text-white text-3xl font-black tracking-tight">Sawa Gaadi</h1>
        <p className="text-indigo-200 text-sm">Your safe ride, every time</p>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-8">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-white"
            style={{
              opacity: 0.4 + i * 0.3,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }`}</style>
    </div>
  );
}
