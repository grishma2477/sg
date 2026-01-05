import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, Send } from 'lucide-react';

const RideRatingPage = ({ auth }) => {
  const navigate = useNavigate();
  const { rideId } = useParams();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedPositives, setSelectedPositives] = useState([]);
  const [selectedNegatives, setSelectedNegatives] = useState([]);
  const [hasSafetyConcern, setHasSafetyConcern] = useState(false);
  const [safetyConcernDetails, setSafetyConcernDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const positiveTaps = [
    'Great conversation',
    'Clean vehicle',
    'Safe driver',
    'On time',
    'Smooth ride',
    'Friendly'
  ];

  const negativeTaps = [
    'Unsafe driving',
    'Rude behavior',
    'Dirty vehicle',
    'Late pickup',
    'Wrong route',
    'Poor communication'
  ];

  const togglePositive = (tap) => {
    setSelectedPositives(prev =>
      prev.includes(tap) ? prev.filter(t => t !== tap) : [...prev, tap]
    );
  };

  const toggleNegative = (tap) => {
    setSelectedNegatives(prev =>
      prev.includes(tap) ? prev.filter(t => t !== tap) : [...prev, tap]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          rideId,
          starRating: rating,
          positiveTaps: selectedPositives,
          negativeTaps: selectedNegatives,
          hasSafetyConcern,
          safetyConcernDetails: hasSafetyConcern ? safetyConcernDetails : null
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('Review submitted successfully!');
        navigate(auth.userRole === 'rider' ? '/rider/dashboard' : '/driver/dashboard');
      } else {
        alert(data.message || 'Failed to submit review');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      <div className="header">
        <h1 className="header-title">Rate Your Ride</h1>
        <p className="text-dim mt-1">Help us improve the experience</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        {/* Star Rating */}
        <div className="card mb-4 text-center">
          <h3 className="font-bold mb-4">How was your ride?</h3>
          <div className="flex justify-center gap-3 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}
              >
                <Star
                  size={48}
                  color={star <= (hoveredRating || rating) ? '#F59E0B' : '#94A3B8'}
                  fill={star <= (hoveredRating || rating) ? '#F59E0B' : 'none'}
                  style={{transition: 'all 0.2s'}}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <div className="text-dim mt-2">
              {rating === 5 && '🌟 Excellent!'}
              {rating === 4 && '😊 Great!'}
              {rating === 3 && '👍 Good'}
              {rating === 2 && '😐 Fair'}
              {rating === 1 && '😞 Poor'}
            </div>
          )}
        </div>

        {/* Positive Taps */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsUp size={20} color="#10B981" />
            <h3 className="font-bold">What went well?</h3>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {positiveTaps.map((tap) => (
              <button
                key={tap}
                type="button"
                onClick={() => togglePositive(tap)}
                className={selectedPositives.includes(tap) ? 'badge-success' : 'badge'}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  border: selectedPositives.includes(tap) ? '2px solid #10B981' : '1px solid rgba(148, 163, 184, 0.3)',
                  background: selectedPositives.includes(tap) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.4)'
                }}
              >
                {tap}
              </button>
            ))}
          </div>
        </div>

        {/* Negative Taps */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <ThumbsDown size={20} color="#EF4444" />
            <h3 className="font-bold">What could be better?</h3>
          </div>
          <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
            {negativeTaps.map((tap) => (
              <button
                key={tap}
                type="button"
                onClick={() => toggleNegative(tap)}
                className={selectedNegatives.includes(tap) ? 'badge-danger' : 'badge'}
                style={{
                  padding: '0.5rem 1rem',
                  cursor: 'pointer',
                  border: selectedNegatives.includes(tap) ? '2px solid #EF4444' : '1px solid rgba(148, 163, 184, 0.3)',
                  background: selectedNegatives.includes(tap) ? 'rgba(239, 68, 68, 0.2)' : 'rgba(30, 41, 59, 0.4)',
                  color: selectedNegatives.includes(tap) ? '#EF4444' : 'inherit'
                }}
              >
                {tap}
              </button>
            ))}
          </div>
        </div>

        {/* Safety Concern */}
        <div className="card mb-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={20} color="#F59E0B" />
            <h3 className="font-bold">Safety Concern?</h3>
          </div>
          <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '1rem', background: hasSafetyConcern ? 'rgba(239, 68, 68, 0.1)' : 'transparent', borderRadius: '8px'}}>
            <input
              type="checkbox"
              checked={hasSafetyConcern}
              onChange={(e) => setHasSafetyConcern(e.target.checked)}
              style={{width: '20px', height: '20px'}}
            />
            <span>I have a safety concern about this ride</span>
          </label>
          {hasSafetyConcern && (
            <div className="mt-3">
              <textarea
                className="input"
                rows="4"
                placeholder="Please describe your safety concern..."
                value={safetyConcernDetails}
                onChange={(e) => setSafetyConcernDetails(e.target.value)}
                required
              ></textarea>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="btn btn-primary w-full mb-2"
          disabled={loading}
          style={{padding: '1.25rem', fontSize: '1.125rem'}}
        >
          {loading ? (
            <span className="loading"></span>
          ) : (
            <>
              <Send size={24} />
              Submit Review
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default RideRatingPage;
