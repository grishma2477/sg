import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiRequest } from '../../api/apiClient';
import { useAuthStore } from '../../store/authStore';

const COUNTRY_CODE = '+977';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const [phase, setPhase]   = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone]   = useState('');
  const [otp, setOtp]       = useState(Array(OTP_LENGTH).fill(''));
  const [devOtp, setDevOtp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [role, setRole]     = useState('rider');
  const otpRefs             = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  const handleSendOtp = async () => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) return toast.error('Enter a valid phone number');
    setLoading(true);
    try {
      const fullPhone = `${COUNTRY_CODE}${cleaned}`;
      const res = await apiRequest('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: fullPhone }),
      });
      setPhase('phone_sent');
      setCountdown(RESEND_SECONDS);
      setPhase('otp');
      if (res?.data?.otp) {
        setDevOtp(res.data.otp);
        toast.success(`Dev OTP: ${res.data.otp}`, { duration: 10000 });
      } else {
        toast.success('OTP sent to your number');
      }
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val.slice(-1);
    setOtp(next);
    if (val && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1]?.focus();
    if (next.every(d => d)) verifyOtp(next.join(''));
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (text.length === OTP_LENGTH) {
      setOtp(text.split(''));
      verifyOtp(text);
    }
  };

  const verifyOtp = async (code) => {
    setLoading(true);
    try {
      const fullPhone = `${COUNTRY_CODE}${phone.replace(/\D/g, '')}`;
      const res = await apiRequest('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: fullPhone, otp: code, role }),
      });
      const { userId, role: userRole, isNewUser, accessToken, refreshToken } = res.data;
      login({ userId, role: userRole, accessToken, refreshToken });
      if (isNewUser) {
        navigate('/name', { replace: true });
      } else {
        navigate(userRole === 'driver' ? '/driver' : '/rider', { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    await handleSendOtp();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="bg-indigo-600 px-6 pt-8 pb-10">
        <h2 className="text-white text-2xl font-bold">Welcome to SG</h2>
        <p className="text-indigo-200 text-sm mt-1">
          {phase === 'phone' ? 'Enter your phone number to continue' : 'Enter the OTP sent to your number'}
        </p>
      </div>

      <div className="flex-1 px-6 pt-8 flex flex-col gap-6">
        {phase === 'phone' ? (
          <>
            {/* Role selector */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">I want to</p>
              <div className="flex gap-2">
                {['rider', 'driver'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      role === r
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                    }`}
                  >
                    {r === 'rider' ? '🧍 Ride' : '🏍️ Drive'}
                  </button>
                ))}
              </div>
            </div>

            {/* Phone input */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Phone number</label>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden focus-within:border-indigo-500 transition-colors">
                <span className="px-3 py-3 bg-gray-50 text-gray-600 text-sm font-medium border-r border-gray-200">
                  {COUNTRY_CODE}
                </span>
                <input
                  type="tel"
                  placeholder="98XXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  className="flex-1 px-3 py-3 text-base outline-none"
                  maxLength={10}
                  autoFocus
                />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={loading || phone.replace(/\D/, '').length < 10}
              className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-base disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? 'Sending…' : 'Send OTP'}
            </button>

            <p className="text-center text-xs text-gray-400">
              By continuing you agree to our Terms of Service
            </p>
          </>
        ) : (
          <>
            {/* OTP boxes */}
            <div>
              <p className="text-sm text-gray-600 mb-4">
                OTP sent to {COUNTRY_CODE} {phone}
                <button onClick={() => setPhase('phone')} className="text-indigo-600 font-medium ml-2">Change</button>
              </p>
              {devOtp && (
                <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
                  Dev mode — OTP: <strong>{devOtp}</strong>
                </p>
              )}
              <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-xl outline-none transition-colors ${
                      d ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
                    } focus:border-indigo-500`}
                  />
                ))}
              </div>
            </div>

            {loading && (
              <div className="text-center text-sm text-gray-500">Verifying…</div>
            )}

            {/* Resend */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-gray-500">Resend OTP in <strong>{countdown}s</strong></p>
              ) : (
                <button onClick={handleResend} className="text-sm text-indigo-600 font-semibold">
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {/* Admin login link */}
        <div className="mt-auto pb-4 text-center">
          <button
            onClick={() => navigate('/admin/login')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Admin login →
          </button>
        </div>
      </div>
    </div>
  );
}
