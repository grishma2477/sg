import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getRideDetails, submitReview } from '../../api/rides.api';
import { useRideStore } from '../../store/rideStore';
import { Star, Shield, ChevronRight } from 'lucide-react';

const POSITIVE_CHIPS = [
  { key: 'GREAT_DRIVING', label: '👍 Great driving' },
  { key: 'FRIENDLY',      label: '😊 Friendly' },
  { key: 'CLEAN_VEHICLE', label: '✨ Clean vehicle' },
  { key: 'ON_TIME',       label: '⏱ On time' },
];

const NEGATIVE_CHIPS = [
  { key: 'RECKLESS_DRIVING', label: '⚠️ Reckless' },
  { key: 'UNFRIENDLY',       label: '😞 Unfriendly' },
  { key: 'DIRTY_VEHICLE',    label: '🚫 Dirty vehicle' },
  { key: 'LATE',             label: '⏰ Late' },
];

export default function RideReview() {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const { clearRide } = useRideStore();
  const [ride, setRide]             = useState(null);
  const [stars, setStars]           = useState(5);
  const [taps, setTaps]             = useState([]);
  const [safetyConcern, setSafety]  = useState(false);
  const [comment, setComment]       = useState('');
  const [loading, setLoading]       = useState(false);

  useEffect(() => {
    getRideDetails(rideId).then(r => setRide(r?.data)).catch(() => {});
  }, [rideId]);

  const chips = stars >= 4 ? POSITIVE_CHIPS : NEGATIVE_CHIPS;

  const toggleTap = (key) =>
    setTaps(t => t.includes(key) ? t.filter(k => k !== key) : [...t, key]);

  const handleSkip = () => {
    clearRide();
    navigate('/rider', { replace: true });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await submitReview(rideId, {
        rating: stars,
        taps: taps.map(key => ({ key })),
        felt_safe: !safetyConcern,
        safety_concern: safetyConcern,
        comment,
      });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.message || 'Failed to submit');
    } finally {
      setLoading(false);
      clearRide();
      navigate('/rider', { replace: true });
    }
  };

  const fare = ride?.fare_amount ?? ride?.estimated_total ?? '–';

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Fare card */}
      <div className="bg-indigo-600 px-5 pt-8 pb-10 text-center">
        <p className="text-indigo-200 text-sm">Fare charged</p>
        <p className="text-white text-4xl font-black mt-1">NPR {fare}</p>
        <p className="text-indigo-200 text-xs mt-2">
          from wallet • {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5 -mt-4 flex flex-col gap-5">
        {/* Driver info */}
        {ride?.driver && (
          <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
              {ride.driver.photo
                ? <img src={ride.driver.photo} alt="" className="w-full h-full rounded-full object-cover" />
                : '🧑'}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="font-bold">{ride.driver.name}</p>
                {ride.driver.has_badge && <Shield size={13} className="text-indigo-500" />}
              </div>
              <p className="text-xs text-gray-500">{ride.pickup_address} → {ride.dropoff_address}</p>
            </div>
          </div>
        )}

        {/* Star rating */}
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700 mb-3">How was your ride?</p>
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map(s => (
              <button key={s} onClick={() => { setStars(s); setTaps([]); setSafety(false); }}>
                <Star
                  size={36}
                  className={s <= stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Tap chips */}
        <div>
          <p className="text-xs text-gray-400 font-medium mb-2">
            {stars >= 4 ? 'What went well?' : 'What could be better?'}
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map(c => (
              <button
                key={c.key}
                onClick={() => toggleTap(c.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  taps.includes(c.key)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Safety concern */}
        {stars <= 3 && taps.length > 0 && (
          <label className="flex items-center gap-3 bg-red-50 rounded-xl p-3 cursor-pointer">
            <input
              type="checkbox"
              checked={safetyConcern}
              onChange={e => setSafety(e.target.checked)}
              className="w-4 h-4 accent-red-500"
            />
            <span className="text-sm text-red-600 font-medium">Report a safety concern</span>
          </label>
        )}

        {/* Comment */}
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add a comment (optional)"
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none outline-none focus:border-indigo-500"
        />
      </div>

      {/* CTAs */}
      <div className="px-4 py-4 flex flex-col gap-2">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? 'Submitting…' : <>Submit Review <ChevronRight size={16} /></>}
        </button>
        <button onClick={handleSkip} className="text-sm text-gray-400 text-center">
          Skip
        </button>
      </div>
    </div>
  );
}
