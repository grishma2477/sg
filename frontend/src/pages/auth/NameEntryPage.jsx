import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

export default function NameEntryPage() {
  const navigate = useNavigate();
  const { setName, role } = useAuthStore();
  const [name, setNameInput] = useState('');

  const handleContinue = () => {
    const trimmed = name.trim();
    if (trimmed.length < 2) return toast.error('Please enter your name');
    setName(trimmed);
    navigate(role === 'driver' ? '/driver' : '/rider', { replace: true });
  };

  return (
    <div className="flex flex-col h-full bg-white px-6">
      <div className="flex-1 flex flex-col justify-center gap-8">
        <div className="text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">👋</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">What's your name?</h2>
          <p className="text-gray-500 text-sm mt-2">We'll use this to greet you</p>
        </div>

        <div>
          <input
            type="text"
            placeholder="Your first name"
            value={name}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleContinue()}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-base text-center font-medium focus:border-indigo-500 outline-none transition-colors"
            autoFocus
          />
        </div>

        <button
          onClick={handleContinue}
          disabled={name.trim().length < 2}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-base disabled:opacity-40 active:scale-95 transition-transform"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
