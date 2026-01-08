import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, Mail, Phone } from 'lucide-react';

const RegisterPage = ({ onRegister }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState('rider');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
    firstName: '',
    lastName: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        role,
        first_name: formData.firstName,
        last_name: formData.lastName
      };
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        onRegister(data.data);
        const redirectPath = role === 'rider' ? '/rider/dashboard' : '/driver/dashboard';
        navigate(redirectPath);
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="header">
        <h1 className="header-title">Join RideShare</h1>
        <p className="text-dim mt-1">Create your account</p>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <div className="flex gap-2">
            <button
              className={`btn flex-1 ${role === 'rider' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('rider')}
            >
              I'm a Rider
            </button>
            <button
              className={`btn flex-1 ${role === 'driver' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setRole('driver')}
            >
              I'm a Driver
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="flex gap-2 mb-3">
              <div className="flex-1">
                <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>First Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="flex-1">
                <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>Last Name</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>Phone</label>
              <div style={{ position: 'relative' }}>
                <Phone size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="tel"
                  className="input"
                  placeholder="+1234567890"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-dim mb-1" style={{ fontSize: '0.875rem', display: 'block' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full mt-3" disabled={loading}>
              {loading ? <span className="loading"></span> : 'Create Account'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <Link to="/login" className="btn btn-secondary">
            Already have an account? Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
