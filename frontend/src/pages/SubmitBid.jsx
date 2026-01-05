// import React, { useState } from 'react';
// import { DollarSign, Clock, MessageSquare, Send } from 'lucide-react';

// const SubmitBid = ({ auth, setView }) => {
//   const [loading, setLoading] = useState(false);
//   const [requestId, setRequestId] = useState('REQUEST_ID'); // Get from context/props
//   const [formData, setFormData] = useState({
//     bidAmount: '',
//     estimatedArrivalMinutes: 5,
//     message: ''
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const response = await fetch(`http://localhost:5000/api/bidding/requests/${requestId}/bids`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${auth.token}`
//         },
//         body: JSON.stringify({
//           bidAmount: parseFloat(formData.bidAmount),
//           estimatedArrivalMinutes: parseInt(formData.estimatedArrivalMinutes),
//           message: formData.message
//         })
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Bid submitted successfully!');
//         setView('driver-dashboard');
//       } else {
//         alert(data.message || 'Failed to submit bid');
//       }
//     } catch (error) {
//       alert('Error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4" style={{paddingBottom: '5rem'}}>
//       <div className="header">
//         <h1 className="header-title">Submit Your Bid</h1>
//         <p className="text-dim mt-1">Make a competitive offer</p>
//       </div>

//       <form onSubmit={handleSubmit} className="p-4">
//         {/* Suggested Fare Range */}
//         <div className="card mb-4" style={{
//           background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.1))',
//           border: '1px solid rgba(16, 185, 129, 0.3)'
//         }}>
//           <div className="mb-2">
//             <div className="text-dim" style={{fontSize: '0.75rem'}}>SUGGESTED FARE RANGE</div>
//           </div>
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="text-dim" style={{fontSize: '0.875rem'}}>Minimum</div>
//               <div className="font-bold" style={{fontSize: '1.5rem', color: '#10B981'}}>₹225</div>
//             </div>
//             <div style={{fontSize: '1.5rem', opacity: 0.3}}>→</div>
//             <div className="text-right">
//               <div className="text-dim" style={{fontSize: '0.875rem'}}>Maximum</div>
//               <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>₹350</div>
//             </div>
//           </div>
//           <p className="text-dim mt-2" style={{fontSize: '0.75rem'}}>
//             💡 Competitive bids are 10-20% below the maximum
//           </p>
//         </div>

//         {/* Bid Amount Input */}
//         <div className="card mb-4">
//           <h3 className="font-bold mb-3">Your Bid</h3>

//           <div className="mb-3">
//             <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//               Bid Amount (₹)
//             </label>
//             <div style={{position: 'relative'}}>
//               <DollarSign 
//                 size={24} 
//                 style={{
//                   position: 'absolute',
//                   left: '1rem',
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   color: '#10B981'
//                 }} 
//               />
//               <input
//                 type="number"
//                 step="0.01"
//                 className="input"
//                 placeholder="280.00"
//                 style={{
//                   paddingLeft: '3.5rem',
//                   fontSize: '1.5rem',
//                   fontWeight: 'bold'
//                 }}
//                 value={formData.bidAmount}
//                 onChange={(e) => setFormData({...formData, bidAmount: e.target.value})}
//                 required
//               />
//             </div>
//             {formData.bidAmount && (
//               <div className="mt-2">
//                 {parseFloat(formData.bidAmount) < 225 ? (
//                   <div className="text-dim" style={{fontSize: '0.875rem', color: '#EF4444'}}>
//                     ⚠️ Below minimum suggested fare
//                   </div>
//                 ) : parseFloat(formData.bidAmount) > 350 ? (
//                   <div className="text-dim" style={{fontSize: '0.875rem', color: '#F59E0B'}}>
//                     ⚠️ Above maximum suggested fare
//                   </div>
//                 ) : (
//                   <div className="text-dim" style={{fontSize: '0.875rem', color: '#10B981'}}>
//                     ✓ Within suggested range
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="mb-3">
//             <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//               Estimated Arrival (minutes)
//             </label>
//             <div style={{position: 'relative'}}>
//               <Clock 
//                 size={20} 
//                 style={{
//                   position: 'absolute',
//                   left: '1rem',
//                   top: '50%',
//                   transform: 'translateY(-50%)',
//                   color: '#94A3B8'
//                 }} 
//               />
//               <input
//                 type="number"
//                 min="1"
//                 max="30"
//                 className="input"
//                 style={{paddingLeft: '3rem'}}
//                 value={formData.estimatedArrivalMinutes}
//                 onChange={(e) => setFormData({...formData, estimatedArrivalMinutes: e.target.value})}
//                 required
//               />
//             </div>
//           </div>

//           <div>
//             <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//               Message to Rider (optional)
//             </label>
//             <div style={{position: 'relative'}}>
//               <MessageSquare 
//                 size={20} 
//                 style={{
//                   position: 'absolute',
//                   left: '1rem',
//                   top: '1rem',
//                   color: '#94A3B8'
//                 }} 
//               />
//               <textarea
//                 className="input"
//                 rows="3"
//                 placeholder="I'm nearby and can pick you up quickly!"
//                 style={{paddingLeft: '3rem'}}
//                 value={formData.message}
//                 onChange={(e) => setFormData({...formData, message: e.target.value})}
//               ></textarea>
//             </div>
//           </div>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           className="btn btn-primary w-full mb-2"
//           disabled={loading}
//           style={{padding: '1.25rem', fontSize: '1.125rem'}}
//         >
//           {loading ? (
//             <span className="loading"></span>
//           ) : (
//             <>
//               <Send size={24} />
//               Submit Bid
//             </>
//           )}
//         </button>

//         <button
//           type="button"
//           className="btn btn-secondary w-full"
//           onClick={() => setView('driver-requests')}
//         >
//           Cancel
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SubmitBid;


import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DollarSign, Clock, MessageSquare, ArrowLeft, Send } from 'lucide-react';

const SubmitBid = ({ auth }) => {
  const navigate = useNavigate();
  const { requestId } = useParams(); // Get requestId from URL
  const [loading, setLoading] = useState(false);
  const [request, setRequest] = useState(null);
  const [formData, setFormData] = useState({
    bidAmount: '',
    estimatedArrivalMinutes: 5,
    driverMessage: ''
  });

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/ride-requests/${requestId}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setRequest(data.data);
        
        // Set suggested bid if fare estimate exists
        if (data.data.estimated_fare_min && data.data.estimated_fare_max) {
          const suggested = Math.floor((data.data.estimated_fare_min + data.data.estimated_fare_max) / 2);
          setFormData(prev => ({ ...prev, bidAmount: suggested }));
        }
      }
    } catch (error) {
      console.error('Error fetching request:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.bidAmount || formData.bidAmount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/bidding/requests/${requestId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Bid submitted successfully!');
        navigate('/driver/requests');
      } else {
        alert(data.message || 'Failed to submit bid');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!request) {
    return (
      <div className="p-4">
        <div className="text-center p-4">
          <span className="loading"></span>
        </div>
      </div>
    );
  }

  const suggestedMin = request.estimated_fare_min || 200;
  const suggestedMax = request.estimated_fare_max || 350;

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      <div className="header">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/driver/requests')}
            className="btn btn-secondary"
            style={{padding: '0.5rem'}}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="header-title">Submit Your Bid</h1>
            <p className="text-dim mt-1">Make a competitive offer</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Request Details */}
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))'
        }}>
          <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}>RIDE REQUEST</div>
          
          <div className="mb-2">
            <div className="flex items-start gap-2 mb-2">
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                marginTop: '0.5rem',
                flexShrink: 0
              }}></div>
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
                <div className="font-bold">{request.pickup_address}</div>
              </div>
            </div>

            <div style={{
              width: '1px',
              height: '20px',
              background: 'rgba(148, 163, 184, 0.3)',
              marginLeft: '3px',
              marginBottom: '0.5rem'
            }}></div>

            <div className="flex items-start gap-2">
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#EF4444',
                marginTop: '0.5rem',
                flexShrink: 0
              }}></div>
              <div>
                <div className="text-dim" style={{fontSize: '0.75rem'}}>DROPOFF</div>
                <div className="font-bold">{request.dropoff_address}</div>
              </div>
            </div>
          </div>

          {request.estimated_distance_km && (
            <div style={{
              marginTop: '1rem',
              paddingTop: '1rem',
              borderTop: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
              <div className="flex gap-4 text-dim" style={{fontSize: '0.875rem'}}>
                <span>{request.estimated_distance_km} km</span>
                {request.estimated_duration_minutes && (
                  <>
                    <span>•</span>
                    <span>{request.estimated_duration_minutes} min</span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Suggested Fare Range */}
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))'
        }}>
          <div className="text-dim mb-2" style={{fontSize: '0.875rem'}}>SUGGESTED FARE RANGE</div>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-dim" style={{fontSize: '0.75rem'}}>Minimum</div>
              <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>₹{suggestedMin}</div>
            </div>
            <div style={{fontSize: '1.5rem', color: '#94A3B8'}}>→</div>
            <div className="text-right">
              <div className="text-dim" style={{fontSize: '0.75rem'}}>Maximum</div>
              <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>₹{suggestedMax}</div>
            </div>
          </div>
          <div className="mt-2 text-dim" style={{fontSize: '0.75rem'}}>
            💡 Competitive bids are 10-20% below the maximum
          </div>
        </div>

        {/* Bid Form */}
        <form onSubmit={handleSubmit}>
          <div className="card mb-4">
            <h3 className="font-bold mb-3">Your Bid</h3>

            <div className="mb-3">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Bid Amount (₹)
              </label>
              <div style={{position: 'relative'}}>
                <DollarSign 
                  size={20} 
                  style={{
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#94A3B8'
                  }} 
                />
                <input
                  type="number"
                  className="input"
                  placeholder="240"
                  style={{paddingLeft: '3rem', fontSize: '1.25rem', fontWeight: 'bold'}}
                  value={formData.bidAmount}
                  onChange={(e) => setFormData({...formData, bidAmount: e.target.value})}
                  required
                  min="1"
                  step="1"
                />
              </div>
              {formData.bidAmount && (
                <div className="mt-1">
                  {formData.bidAmount < suggestedMin * 0.8 ? (
                    <div style={{fontSize: '0.75rem', color: '#EF4444'}}>
                      ⚠️ Your bid is very low - rider may not accept
                    </div>
                  ) : formData.bidAmount <= suggestedMax * 0.9 ? (
                    <div style={{fontSize: '0.75rem', color: '#10B981'}}>
                      ✓ Within suggested range
                    </div>
                  ) : (
                    <div style={{fontSize: '0.75rem', color: '#F59E0B'}}>
                      ⚠️ Your bid is high - may not be competitive
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Estimated Arrival (minutes)
              </label>
              <div style={{position: 'relative'}}>
                <Clock 
                  size={20} 
                  style={{
                    position: 'absolute', 
                    left: '1rem', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#94A3B8'
                  }} 
                />
                <input
                  type="number"
                  className="input"
                  placeholder="5"
                  style={{paddingLeft: '3rem'}}
                  value={formData.estimatedArrivalMinutes}
                  onChange={(e) => setFormData({...formData, estimatedArrivalMinutes: e.target.value})}
                  required
                  min="1"
                  max="60"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Message to Rider (optional)
              </label>
              <div style={{position: 'relative'}}>
                <MessageSquare 
                  size={20} 
                  style={{
                    position: 'absolute', 
                    left: '1rem', 
                    top: '1rem', 
                    color: '#94A3B8'
                  }} 
                />
                <textarea
                  className="input"
                  rows="3"
                  placeholder="I'm nearby and can pick you up quickly!"
                  style={{paddingLeft: '3rem'}}
                  value={formData.driverMessage}
                  onChange={(e) => setFormData({...formData, driverMessage: e.target.value})}
                  maxLength="200"
                ></textarea>
              </div>
              <div className="text-dim mt-1" style={{fontSize: '0.75rem'}}>
                {formData.driverMessage.length}/200 characters
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{padding: '1.25rem', fontSize: '1.125rem'}}
          >
            {loading ? (
              <span className="loading"></span>
            ) : (
              <>
                <Send size={24} />
                Submit Bid - ₹{formData.bidAmount || '0'}
              </>
            )}
          </button>

          <button
            type="button"
            className="btn btn-secondary w-full mt-2"
            onClick={() => navigate('/driver/requests')}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubmitBid;