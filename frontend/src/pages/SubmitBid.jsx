

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { DollarSign, Clock, MessageSquare, ArrowLeft, Send } from 'lucide-react';

// const SubmitBid = ({ auth }) => {
//   const navigate = useNavigate();
//   const { requestId } = useParams(); // Get requestId from URL
//   const [loading, setLoading] = useState(false);
//   const [request, setRequest] = useState(null);
//   const [formData, setFormData] = useState({
//     bidAmount: '',
//     estimatedArrivalMinutes: 5,
//     driverMessage: ''
//   });

//   useEffect(() => {
//     if (requestId) {
//       fetchRequestDetails();
//     }
//   }, [requestId]);

//   const fetchRequestDetails = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/ride-requests/${requestId}`, {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setRequest(data.data);
        
//         // Set suggested bid if fare estimate exists
//         if (data.data.estimated_fare_min && data.data.estimated_fare_max) {
//           const suggested = Math.floor((data.data.estimated_fare_min + data.data.estimated_fare_max) / 2);
//           setFormData(prev => ({ ...prev, bidAmount: suggested }));
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching request:', error);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.bidAmount || formData.bidAmount <= 0) {
//       alert('Please enter a valid bid amount');
//       return;
//     }

//     setLoading(true);

//     try {
//       const response = await fetch(`http://localhost:5000/api/bidding/requests/${requestId}/submit`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${auth.token}`
//         },
//         body: JSON.stringify(formData)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Bid submitted successfully!');
//         navigate('/driver/requests');
//       } else {
//         alert(data.message || 'Failed to submit bid');
//       }
//     } catch (error) {
//       console.error('Error submitting bid:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!request) {
//     return (
//       <div className="p-4">
//         <div className="text-center p-4">
//           <span className="loading"></span>
//         </div>
//       </div>
//     );
//   }

//   const suggestedMin = request.estimated_fare_min || 200;
//   const suggestedMax = request.estimated_fare_max || 350;

//   return (
//     <div className="p-4" style={{paddingBottom: '5rem'}}>
//       <div className="header">
//         <div className="flex items-center gap-3">
//           <button 
//             onClick={() => navigate('/driver/requests')}
//             className="btn btn-secondary"
//             style={{padding: '0.5rem'}}
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <div>
//             <h1 className="header-title">Submit Your Bid</h1>
//             <p className="text-dim mt-1">Make a competitive offer</p>
//           </div>
//         </div>
//       </div>

//       <div className="p-4">
//         {/* Request Details */}
//         <div className="card mb-4" style={{
//           background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(139, 92, 246, 0.05))'
//         }}>
//           <div className="text-dim" style={{fontSize: '0.75rem', marginBottom: '0.5rem'}}>RIDE REQUEST</div>
          
//           <div className="mb-2">
//             <div className="flex items-start gap-2 mb-2">
//               <div style={{
//                 width: '8px',
//                 height: '8px',
//                 borderRadius: '50%',
//                 background: '#10B981',
//                 marginTop: '0.5rem',
//                 flexShrink: 0
//               }}></div>
//               <div>
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>PICKUP</div>
//                 <div className="font-bold">{request.pickup_address}</div>
//               </div>
//             </div>

//             <div style={{
//               width: '1px',
//               height: '20px',
//               background: 'rgba(148, 163, 184, 0.3)',
//               marginLeft: '3px',
//               marginBottom: '0.5rem'
//             }}></div>

//             <div className="flex items-start gap-2">
//               <div style={{
//                 width: '8px',
//                 height: '8px',
//                 borderRadius: '50%',
//                 background: '#EF4444',
//                 marginTop: '0.5rem',
//                 flexShrink: 0
//               }}></div>
//               <div>
//                 <div className="text-dim" style={{fontSize: '0.75rem'}}>DROPOFF</div>
//                 <div className="font-bold">{request.dropoff_address}</div>
//               </div>
//             </div>
//           </div>

//           {request.estimated_distance_km && (
//             <div style={{
//               marginTop: '1rem',
//               paddingTop: '1rem',
//               borderTop: '1px solid rgba(148, 163, 184, 0.1)'
//             }}>
//               <div className="flex gap-4 text-dim" style={{fontSize: '0.875rem'}}>
//                 <span>{request.estimated_distance_km} km</span>
//                 {request.estimated_duration_minutes && (
//                   <>
//                     <span>•</span>
//                     <span>{request.estimated_duration_minutes} min</span>
//                   </>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Suggested Fare Range */}
//         <div className="card mb-4" style={{
//           background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(6, 182, 212, 0.05))'
//         }}>
//           <div className="text-dim mb-2" style={{fontSize: '0.875rem'}}>SUGGESTED FARE RANGE</div>
//           <div className="flex justify-between items-center">
//             <div>
//               <div className="text-dim" style={{fontSize: '0.75rem'}}>Minimum</div>
//               <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>₹{suggestedMin}</div>
//             </div>
//             <div style={{fontSize: '1.5rem', color: '#94A3B8'}}>→</div>
//             <div className="text-right">
//               <div className="text-dim" style={{fontSize: '0.75rem'}}>Maximum</div>
//               <div className="font-bold" style={{fontSize: '1.5rem', color: '#06B6D4'}}>₹{suggestedMax}</div>
//             </div>
//           </div>
//           <div className="mt-2 text-dim" style={{fontSize: '0.75rem'}}>
//             💡 Competitive bids are 10-20% below the maximum
//           </div>
//         </div>

//         {/* Bid Form */}
//         <form onSubmit={handleSubmit}>
//           <div className="card mb-4">
//             <h3 className="font-bold mb-3">Your Bid</h3>

//             <div className="mb-3">
//               <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//                 Bid Amount (₹)
//               </label>
//               <div style={{position: 'relative'}}>
//                 <DollarSign 
//                   size={20} 
//                   style={{
//                     position: 'absolute', 
//                     left: '1rem', 
//                     top: '50%', 
//                     transform: 'translateY(-50%)', 
//                     color: '#94A3B8'
//                   }} 
//                 />
//                 <input
//                   type="number"
//                   className="input"
//                   placeholder="240"
//                   style={{paddingLeft: '3rem', fontSize: '1.25rem', fontWeight: 'bold'}}
//                   value={formData.bidAmount}
//                   onChange={(e) => setFormData({...formData, bidAmount: e.target.value})}
//                   required
//                   min="1"
//                   step="1"
//                 />
//               </div>
//               {formData.bidAmount && (
//                 <div className="mt-1">
//                   {formData.bidAmount < suggestedMin * 0.8 ? (
//                     <div style={{fontSize: '0.75rem', color: '#EF4444'}}>
//                       ⚠️ Your bid is very low - rider may not accept
//                     </div>
//                   ) : formData.bidAmount <= suggestedMax * 0.9 ? (
//                     <div style={{fontSize: '0.75rem', color: '#10B981'}}>
//                       ✓ Within suggested range
//                     </div>
//                   ) : (
//                     <div style={{fontSize: '0.75rem', color: '#F59E0B'}}>
//                       ⚠️ Your bid is high - may not be competitive
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             <div className="mb-3">
//               <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//                 Estimated Arrival (minutes)
//               </label>
//               <div style={{position: 'relative'}}>
//                 <Clock 
//                   size={20} 
//                   style={{
//                     position: 'absolute', 
//                     left: '1rem', 
//                     top: '50%', 
//                     transform: 'translateY(-50%)', 
//                     color: '#94A3B8'
//                   }} 
//                 />
//                 <input
//                   type="number"
//                   className="input"
//                   placeholder="5"
//                   style={{paddingLeft: '3rem'}}
//                   value={formData.estimatedArrivalMinutes}
//                   onChange={(e) => setFormData({...formData, estimatedArrivalMinutes: e.target.value})}
//                   required
//                   min="1"
//                   max="60"
//                 />
//               </div>
//             </div>

//             <div className="mb-3">
//               <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//                 Message to Rider (optional)
//               </label>
//               <div style={{position: 'relative'}}>
//                 <MessageSquare 
//                   size={20} 
//                   style={{
//                     position: 'absolute', 
//                     left: '1rem', 
//                     top: '1rem', 
//                     color: '#94A3B8'
//                   }} 
//                 />
//                 <textarea
//                   className="input"
//                   rows="3"
//                   placeholder="I'm nearby and can pick you up quickly!"
//                   style={{paddingLeft: '3rem'}}
//                   value={formData.driverMessage}
//                   onChange={(e) => setFormData({...formData, driverMessage: e.target.value})}
//                   maxLength="200"
//                 ></textarea>
//               </div>
//               <div className="text-dim mt-1" style={{fontSize: '0.75rem'}}>
//                 {formData.driverMessage.length}/200 characters
//               </div>
//             </div>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="btn btn-primary w-full"
//             disabled={loading}
//             style={{padding: '1.25rem', fontSize: '1.125rem'}}
//           >
//             {loading ? (
//               <span className="loading"></span>
//             ) : (
//               <>
//                 <Send size={24} />
//                 Submit Bid - ₹{formData.bidAmount || '0'}
//               </>
//             )}
//           </button>

//           <button
//             type="button"
//             className="btn btn-secondary w-full mt-2"
//             onClick={() => navigate('/driver/requests')}
//           >
//             Cancel
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SubmitBid;



import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  DollarSign,
  Clock,
  MapPin,
  Send,
  MessageSquare
} from 'lucide-react';

const SubmitBid = ({ auth }) => {
  const navigate = useNavigate();
  const { requestId } = useParams();
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    bidAmount: '',
    estimatedArrivalMinutes: '10',
    driverMessage: ''
  });

  useEffect(() => {
    fetchRequestDetails();
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
        setRequestDetails(data.data);
        // Set default bid amount to middle of estimated range
        const defaultBid = Math.round((data.data.estimated_fare_min + data.data.estimated_fare_max) / 2);
        setFormData(prev => ({ ...prev, bidAmount: defaultBid.toString() }));
      } else {
        alert('Failed to load ride request details');
        navigate('/driver/dashboard');
      }
    } catch (error) {
      console.error('Error fetching request details:', error);
      alert('Error loading request');
      navigate('/driver/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const bidAmount = parseFloat(formData.bidAmount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      alert('Please enter a valid bid amount');
      return;
    }

    const arrivalMinutes = parseInt(formData.estimatedArrivalMinutes);
    if (isNaN(arrivalMinutes) || arrivalMinutes < 1) {
      alert('Please enter a valid arrival time');
      return;
    }

    if (!confirm(`Submit bid of ₹${bidAmount}?`)) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/bidding/requests/${requestId}/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bidAmount: bidAmount,
          estimatedArrivalMinutes: arrivalMinutes,
          driverMessage: formData.driverMessage.trim() || null
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Bid submitted successfully! You will be notified if the rider accepts.');
        navigate('/driver/dashboard');
      } else {
        alert(data.message || 'Failed to submit bid');
      }
    } catch (error) {
      console.error('Error submitting bid:', error);
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center p-4">
          <span className="loading"></span>
          <p className="text-dim mt-2">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (!requestDetails) {
    return (
      <div className="p-4">
        <div className="card text-center p-4">
          <p className="font-bold mb-2">Request not found</p>
          <button onClick={() => navigate('/driver/dashboard')} className="btn btn-primary mt-2">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const suggestedBids = [
    requestDetails.estimated_fare_min,
    Math.round((requestDetails.estimated_fare_min + requestDetails.estimated_fare_max) / 2),
    requestDetails.estimated_fare_max
  ];

  return (
    <div className="p-4" style={{ paddingBottom: '5rem' }}>
      {/* Header */}
      <div className="header">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/driver/dashboard')}
            className="btn btn-secondary"
            style={{ padding: '0.5rem' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="header-title">Submit Your Bid</h1>
            <p className="text-dim mt-1">Offer your best price</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Ride Request Summary */}
        <div className="card mb-4" style={{
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.05))',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <div className="text-dim mb-3" style={{ fontSize: '0.75rem' }}>
            RIDE REQUEST DETAILS
          </div>

          {/* Route */}
          <div className="mb-3">
            <div className="flex items-start gap-2 mb-2">
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981',
                marginTop: '6px'
              }} />
              <div style={{ flex: 1 }}>
                <div className="text-dim" style={{ fontSize: '0.75rem' }}>PICKUP</div>
                <div className="font-bold" style={{ fontSize: '0.875rem' }}>
                  {requestDetails.pickup_address}
                </div>
              </div>
            </div>

            <div style={{
              width: '2px',
              height: '15px',
              background: '#475569',
              marginLeft: '3px',
              marginBottom: '0.5rem'
            }} />

            <div className="flex items-start gap-2">
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#EF4444',
                marginTop: '6px'
              }} />
              <div style={{ flex: 1 }}>
                <div className="text-dim" style={{ fontSize: '0.75rem' }}>DROPOFF</div>
                <div className="font-bold" style={{ fontSize: '0.875rem' }}>
                  {requestDetails.dropoff_address}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            padding: '1rem',
            background: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '8px'
          }}>
            <div>
              <div className="text-dim" style={{ fontSize: '0.75rem' }}>DISTANCE</div>
              <div className="font-bold">{requestDetails.estimated_distance_km} km</div>
            </div>
            <div>
              <div className="text-dim" style={{ fontSize: '0.75rem' }}>EST. TIME</div>
              <div className="font-bold">{requestDetails.estimated_duration_minutes} min</div>
            </div>
          </div>
        </div>

        {/* Bid Form */}
        <form onSubmit={handleSubmit}>
          {/* Bid Amount */}
          <div className="card mb-3">
            <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
              YOUR BID AMOUNT *
            </div>

            <div className="flex items-center gap-2 mb-3">
              <DollarSign size={24} color="#10B981" />
              <input
                type="number"
                value={formData.bidAmount}
                onChange={(e) => handleInputChange('bidAmount', e.target.value)}
                placeholder="Enter your bid"
                required
                min="1"
                step="1"
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '2px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '12px',
                  color: '#10B981'
                }}
              />
            </div>

            {/* Suggested Bids */}
            <div>
              <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
                SUGGESTED BIDS
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem'
              }}>
                {suggestedBids.map((amount, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleInputChange('bidAmount', amount.toString())}
                    style={{
                      padding: '0.75rem',
                      background: formData.bidAmount === amount.toString()
                        ? 'linear-gradient(135deg, #10B981, #059669)'
                        : 'rgba(30, 41, 59, 0.4)',
                      border: formData.bidAmount === amount.toString()
                        ? '2px solid #10B981'
                        : '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    ₹{amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3" style={{
              padding: '0.75rem',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              fontSize: '0.75rem'
            }}>
              <div className="text-dim mb-1">Estimated range:</div>
              <div className="font-bold" style={{ color: '#3B82F6' }}>
                ₹{requestDetails.estimated_fare_min} - ₹{requestDetails.estimated_fare_max}
              </div>
            </div>
          </div>

          {/* Estimated Arrival */}
          <div className="card mb-3">
            <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
              ESTIMATED ARRIVAL TIME *
            </div>

            <div className="flex items-center gap-2">
              <Clock size={24} color="#06B6D4" />
              <input
                type="number"
                value={formData.estimatedArrivalMinutes}
                onChange={(e) => handleInputChange('estimatedArrivalMinutes', e.target.value)}
                required
                min="1"
                max="60"
                step="1"
                style={{
                  flex: 1,
                  padding: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '2px solid rgba(6, 182, 212, 0.3)',
                  borderRadius: '12px',
                  color: '#06B6D4'
                }}
              />
              <span className="font-bold" style={{ color: '#06B6D4' }}>minutes</span>
            </div>

            <div className="mt-2 text-dim" style={{ fontSize: '0.75rem' }}>
              How long will it take you to reach the pickup location?
            </div>
          </div>

          {/* Message to Rider */}
          <div className="card mb-3">
            <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
              MESSAGE TO RIDER (OPTIONAL)
            </div>

            <div className="flex items-start gap-2">
              <MessageSquare size={20} color="#8B5CF6" style={{ marginTop: '0.75rem' }} />
              <textarea
                value={formData.driverMessage}
                onChange={(e) => handleInputChange('driverMessage', e.target.value)}
                placeholder="e.g., I have a spacious car with AC. Looking forward to serving you!"
                maxLength="200"
                rows="3"
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                  resize: 'none'
                }}
              />
            </div>

            <div className="mt-2 text-dim" style={{ fontSize: '0.75rem' }}>
              {formData.driverMessage.length}/200 characters
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={submitting}
            style={{
              padding: '1.25rem',
              fontSize: '1.125rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #10B981, #059669)'
            }}
          >
            {submitting ? (
              <span className="loading"></span>
            ) : (
              <>
                <Send size={24} />
                Submit Bid - ₹{formData.bidAmount || '0'}
              </>
            )}
          </button>

          {/* Info */}
          <div className="card mt-3" style={{
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}>
            <div className="text-dim mb-2" style={{ fontSize: '0.75rem' }}>
              💡 BIDDING TIPS
            </div>
            <ul style={{ fontSize: '0.875rem', lineHeight: '1.6', paddingLeft: '1.25rem' }}>
              <li>Lower bids have higher chances of being accepted</li>
              <li>Quick arrival times make your bid more attractive</li>
              <li>A friendly message can help you stand out</li>
              <li>You'll be notified instantly if the rider accepts your bid</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SubmitBid;
