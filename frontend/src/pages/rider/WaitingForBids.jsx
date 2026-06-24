import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../hooks/useSocket';
import { useRideStore } from '../../store/rideStore';
import { getBidsForRequest, acceptBid, cancelRideRequest } from '../../api/rides.api';
import { X, Star, Shield, Clock } from 'lucide-react';

function BidCard({ bid, onAccept }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-xl">
          {bid.driver?.photo ? (
            <img src={bid.driver.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : '🧑'}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1">
            <p className="font-bold text-gray-900">{bid.driver?.name ?? `Driver #${bid.driver_id}`}</p>
            {bid.driver?.has_badge && (
              <span title="Verified Safe Driver">
                <Shield size={14} className="text-indigo-500" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-0.5">
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              {bid.driver?.rating?.toFixed(1) ?? 'New'}
            </span>
            <span>•</span>
            <span>{bid.driver?.vehicle ?? 'Vehicle'}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-gray-900">NPR {bid.amount}</p>
          <p className="text-xs text-gray-400 flex items-center gap-1 justify-end">
            <Clock size={10} /> {bid.estimated_arrival_minutes ?? '?'} min
          </p>
        </div>
      </div>

      {bid.message && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
          "{bid.message}"
        </p>
      )}

      <button
        onClick={() => onAccept(bid.id)}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-semibold text-sm active:scale-95 transition-transform"
      >
        Accept — NPR {bid.amount}
      </button>
    </div>
  );
}

export default function WaitingForBids() {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const { bids, addBid, setActiveRide, clearRide } = useRideStore();
  const [cancelling, setCancelling] = useState(false);
  const holdTimer = useRef(null);
  const [holdProgress, setHoldProgress] = useState(0);

  // Load existing bids
  useEffect(() => {
    getBidsForRequest(requestId)
      .then(r => (r?.data ?? []).forEach(b => addBid(b)))
      .catch(() => {});
  }, [requestId]);

  // Socket: new bids
  useSocket({
    bid_placed: (data) => {
      if (String(data.requestId) === String(requestId)) {
        addBid(data.bid);
        toast.success('New bid received!', { icon: '🏍️' });
      }
    },
  });

  const handleAccept = async (bidId) => {
    try {
      const res = await acceptBid(bidId);
      const rideId = res?.data?.rideId ?? res?.data?.ride?.id;
      if (!rideId) throw new Error('No ride ID');
      setActiveRide(rideId, 'driver_en_route', res?.data);
      navigate(`/rider/ride/${rideId}`, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Failed to accept bid');
    }
  };

  const startCancelHold = () => {
    setHoldProgress(0);
    const start = Date.now();
    holdTimer.current = setInterval(() => {
      const pct = Math.min(100, ((Date.now() - start) / 3000) * 100);
      setHoldProgress(pct);
      if (pct >= 100) {
        clearInterval(holdTimer.current);
        doCancel();
      }
    }, 50);
  };

  const releaseCancelHold = () => {
    clearInterval(holdTimer.current);
    setHoldProgress(0);
  };

  const doCancel = async () => {
    setCancelling(true);
    try {
      await cancelRideRequest(requestId);
      clearRide();
      navigate('/rider', { replace: true });
      toast.success('Request cancelled');
    } catch (err) {
      toast.error(err.message || 'Cancel failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Animated header */}
      <div className="bg-indigo-600 px-5 pt-6 pb-8 relative">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full"
                style={{ animation: `bounce 1s ease-in-out ${i * 0.2}s infinite` }}
              />
            ))}
          </div>
        </div>
        <h2 className="text-white text-center text-lg font-bold">Looking for drivers…</h2>
        <p className="text-indigo-200 text-center text-xs mt-1">
          {bids.length === 0 ? 'Nearby drivers are being notified' : `${bids.length} bid${bids.length > 1 ? 's' : ''} received`}
        </p>
        <style>{`@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }`}</style>
      </div>

      {/* Bids list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 -mt-4">
        {bids.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3">🛵</div>
            <p className="text-sm">Drivers are reviewing your request</p>
            <p className="text-xs mt-1">This usually takes 30–60 seconds</p>
          </div>
        ) : (
          bids.map(bid => (
            <BidCard key={bid.id} bid={bid} onAccept={handleAccept} />
          ))
        )}
      </div>

      {/* Cancel (hold 3s) */}
      <div className="px-4 py-4">
        <div className="relative overflow-hidden rounded-xl">
          {holdProgress > 0 && (
            <div
              className="absolute inset-0 bg-red-500 transition-all duration-50"
              style={{ width: `${holdProgress}%` }}
            />
          )}
          <button
            onMouseDown={startCancelHold}
            onMouseUp={releaseCancelHold}
            onMouseLeave={releaseCancelHold}
            onTouchStart={startCancelHold}
            onTouchEnd={releaseCancelHold}
            disabled={cancelling}
            className="relative w-full flex items-center justify-center gap-2 border-2 border-red-200 text-red-500 py-3 rounded-xl font-medium text-sm"
          >
            <X size={14} />
            {cancelling ? 'Cancelling…' : 'Hold to cancel request'}
          </button>
        </div>
      </div>
    </div>
  );
}
