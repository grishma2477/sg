

// import React, { useState, useEffect } from 'react';
// import { useNavigate, useParams } from 'react-router-dom';
// import { Star, Send, AlertTriangle } from 'lucide-react';

// // ═══════════════════════════════════════════════════════════════
// // TAG DEFINITIONS - Matching your RatingTapValidator
// // ═══════════════════════════════════════════════════════════════

// const RIDER_RATING_DRIVER_TAGS = {
//   positive: {
//     5: [
//       { key: 'FELT_SAFE', label: '😊 Felt Safe', category: 'positive' },
//       { key: 'RESPECTFUL', label: '🤝 Respectful', category: 'positive' },
//       { key: 'FOLLOWED_RULES', label: '✅ Followed Traffic Rules', category: 'positive' },
//       { key: 'RESPONSIBLE', label: '🛡️ Responsible Driver', category: 'positive' }
//     ],
//     4: [
//       { key: 'FELT_SAFE', label: '😊 Felt Safe', category: 'positive' },
//       { key: 'ROUTE_OK', label: '🗺️ Good Route', category: 'positive' },
//       { key: 'COMMUNICATION', label: '💬 Good Communication', category: 'positive' }
//     ],
//     3: [
//       { key: 'ROUTE_OK', label: '🗺️ Okay Route', category: 'positive' },
//       { key: 'COMMUNICATION', label: '💬 Acceptable Communication', category: 'positive' }
//     ]
//   },
//   negative: {
//     2: [
//       { key: 'UNCOMFORTABLE', label: '😟 Felt Uncomfortable', category: 'negative' },
//       { key: 'RECKLESS', label: '⚠️ Reckless Driving', category: 'negative' },
//       { key: 'UNNECESSARY_ROUTE', label: '🗺️ Took Unnecessary Route', category: 'negative' }
//     ],
//     1: [
//       { key: 'INAPPROPRIATE', label: '🚫 Inappropriate Behavior', category: 'negative' },
//       { key: 'IGNORED_COMM', label: '📵 Ignored Communication', category: 'negative' },
//       { key: 'SAFETY_CONCERN', label: '🚨 Major Safety Concern', category: 'negative' },
//       { key: 'RECKLESS', label: '⚠️ Extremely Reckless', category: 'negative' }
//     ]
//   }
// };

// const DRIVER_RATING_RIDER_TAGS = {
//   positive: {
//     5: [
//       { key: 'POLITE', label: '😊 Polite & Friendly', category: 'positive' },
//       { key: 'PUNCTUAL', label: '⏰ On Time', category: 'positive' },
//       { key: 'RESPECTFUL', label: '🤝 Respectful', category: 'positive' },
//       { key: 'CLEAN', label: '✨ Left Car Clean', category: 'positive' }
//     ],
//     4: [
//       { key: 'POLITE', label: '😊 Polite', category: 'positive' },
//       { key: 'PUNCTUAL', label: '⏰ On Time', category: 'positive' },
//       { key: 'EASY_RIDER', label: '👍 Easy to Work With', category: 'positive' }
//     ],
//     3: [
//       { key: 'PUNCTUAL', label: '⏰ On Time', category: 'positive' },
//       { key: 'ACCEPTABLE', label: '👌 Acceptable', category: 'positive' }
//     ]
//   },
//   negative: {
//     2: [
//       { key: 'LATE', label: '⏰ Was Late', category: 'negative' },
//       { key: 'RUDE', label: '😠 Rude Behavior', category: 'negative' },
//       { key: 'MESSY', label: '🗑️ Left Mess in Car', category: 'negative' }
//     ],
//     1: [
//       { key: 'VERY_RUDE', label: '🚫 Very Rude/Aggressive', category: 'negative' },
//       { key: 'NO_SHOW', label: "❌ Didn't Show Up on Time", category: 'negative' },
//       { key: 'DAMAGED_CAR', label: '💥 Damaged Car', category: 'negative' },
//       { key: 'INTOXICATED', label: '🍺 Appeared Intoxicated', category: 'negative' }
//     ]
//   }
// };

// // ═══════════════════════════════════════════════════════════════
// // MAIN COMPONENT
// // ═══════════════════════════════════════════════════════════════

// export const RideRatingPage = ({ auth }) => {
//   const navigate = useNavigate();
//   const { rideId } = useParams();
  
//   const [ride, setRide] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
  
//   // Rating state
//   const [stars, setStars] = useState(0);
//   const [selectedTags, setSelectedTags] = useState([]);
//   const [reviewText, setReviewText] = useState('');

//   const isRider = auth?.userRole === 'rider';
//   const isDriver = auth?.userRole === 'driver';

//   // Get appropriate tags based on user role
//   const TAGS = isRider ? RIDER_RATING_DRIVER_TAGS : DRIVER_RATING_RIDER_TAGS;

//   // ═══════════════════════════════════════════════════════════════
//   // FETCH RIDE DETAILS
//   // ═══════════════════════════════════════════════════════════════
//   useEffect(() => {
//     fetchRideDetails();
//   }, [rideId]);

//   const fetchRideDetails = async () => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/rides/${rideId}`, {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`
//         }
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setRide(data.data);
        
//         // Check if already rated
//         const existingReview = await checkExistingReview();
//         if (existingReview) {
//           alert('You have already rated this ride!');
//           navigate(isRider ? '/rider/dashboard' : '/driver/dashboard');
//         }
//       }
//     } catch (error) {
//       console.error('Error fetching ride:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkExistingReview = async () => {
//     try {
//       // Check if review already exists
//       const response = await fetch(
//         `http://localhost:5000/api/reviews/check/${rideId}`,
//         {
//           headers: { 'Authorization': `Bearer ${auth.token}` }
//         }
//       );
//       const data = await response.json();
//       return data.exists;
//     } catch (error) {
//       console.error('Error checking review:', error);
//       return false;
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════
//   // TAG SELECTION
//   // ═══════════════════════════════════════════════════════════════
//   const toggleTag = (tag) => {
//     setSelectedTags(prev => {
//       const exists = prev.find(t => t.key === tag.key);
//       if (exists) {
//         return prev.filter(t => t.key !== tag.key);
//       } else {
//         return [...prev, tag];
//       }
//     });
//   };

//   // ═══════════════════════════════════════════════════════════════
//   // SUBMIT REVIEW - Matching ReviewSubmissionService expected format
//   // ═══════════════════════════════════════════════════════════════
//   const handleSubmit = async () => {
//     if (stars === 0) {
//       alert('Please select a star rating');
//       return;
//     }

//     // Validate: 1-2 stars require negative feedback
//     if (stars <= 2) {
//       const hasNegativeTap = selectedTags.some(t => t.category === 'negative');
//       if (!hasNegativeTap) {
//         alert('⚠️ Low ratings (1-2 stars) require at least one negative feedback tag');
//         return;
//       }
//     }

//     setSubmitting(true);

//     try {
//       // Build payload matching ReviewSubmissionService.submit() expected format
//       const payload = {
//         rideSummary: {
//           rideId: ride.id,
//           riderId: ride.rider_id,
//           driverId: ride.driver_id, // This is drivers.id (database ID)
//           status: ride.status
//         },
//         rating: {
//           stars: stars
//         },
//         taps: selectedTags.map(tag => ({
//           key: tag.key,
//           category: tag.category
//           // Note: pointValue is NOT sent - backend calculates it
//         })),
//         review: reviewText || null
//       };

//       console.log('📤 Submitting review:', payload);

//       const response = await fetch('http://localhost:5000/api/reviews', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${auth.token}`
//         },
//         body: JSON.stringify(payload)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('✅ Thank you for your rating!');
//         navigate(isRider ? '/rider/dashboard' : '/driver/dashboard');
//       } else {
//         alert('Failed to submit rating: ' + (data.message || 'Unknown error'));
//       }
//     } catch (error) {
//       console.error('Error submitting rating:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ═══════════════════════════════════════════════════════════════
//   // GET AVAILABLE TAGS
//   // ═══════════════════════════════════════════════════════════════
//   const getAvailableTags = () => {
//     if (stars === 0) return [];
    
//     if (stars >= 3) {
//       return TAGS.positive[stars] || TAGS.positive[3] || [];
//     } else {
//       return TAGS.negative[stars] || [];
//     }
//   };

//   const availableTags = getAvailableTags();

//   // ═══════════════════════════════════════════════════════════════
//   // RENDER
//   // ═══════════════════════════════════════════════════════════════

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <span className="loading"></span>
//       </div>
//     );
//   }

//   if (!ride) {
//     return (
//       <div className="flex items-center justify-center min-h-screen p-4">
//         <div className="card text-center p-4">
//           <p className="font-bold mb-2">Ride not found</p>
//           <button 
//             onClick={() => navigate(isRider ? '/rider/dashboard' : '/driver/dashboard')} 
//             className="btn btn-primary mt-2"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen p-4" style={{ paddingBottom: '2rem' }}>
//       <div className="max-w-md mx-auto">
//         {/* Header */}
//         <div className="text-center mb-6">
//           <h1 className="text-2xl font-bold mb-2">
//             {isRider ? 'Rate Your Driver' : 'Rate Your Rider'}
//           </h1>
//           <p className="text-dim">
//             {isRider 
//               ? `How was your ride with ${ride.driver_name || 'your driver'}?`
//               : `How was ${ride.rider_name || 'your rider'}?`
//             }
//           </p>
//         </div>

//         {/* Star Rating */}
//         <div className="card mb-4">
//           <div className="text-center">
//             <p className="text-dim mb-3" style={{ fontSize: '0.875rem' }}>
//               TAP TO RATE
//             </p>
//             <div className="flex justify-center gap-2 mb-4">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <button
//                   key={star}
//                   onClick={() => {
//                     setStars(star);
//                     setSelectedTags([]); // Reset tags when stars change
//                   }}
//                   className="transition-transform hover:scale-110"
//                   style={{ background: 'none', border: 'none', padding: 0 }}
//                 >
//                   <Star
//                     size={48}
//                     color={star <= stars ? '#F59E0B' : '#94A3B8'}
//                     fill={star <= stars ? '#F59E0B' : 'none'}
//                     strokeWidth={2}
//                   />
//                 </button>
//               ))}
//             </div>
//             {stars > 0 && (
//               <p style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>
//                 {stars === 5 && '⭐ Excellent!'}
//                 {stars === 4 && '👍 Good'}
//                 {stars === 3 && '😐 Okay'}
//                 {stars === 2 && '😕 Could be better'}
//                 {stars === 1 && '😞 Poor'}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Validation Message for Low Ratings */}
//         {stars > 0 && stars <= 2 && (
//           <div className="card mb-4" style={{
//             background: 'rgba(239, 68, 68, 0.1)',
//             border: '2px solid #EF4444'
//           }}>
//             <div className="flex items-start gap-2">
//               <AlertTriangle size={20} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
//               <div>
//                 <p className="font-bold" style={{ color: '#EF4444', marginBottom: '0.25rem' }}>
//                   Feedback Required
//                 </p>
//                 <p className="text-dim" style={{ fontSize: '0.875rem' }}>
//                   Please select at least one issue to help us understand what went wrong.
//                 </p>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Tags */}
//         {stars > 0 && availableTags.length > 0 && (
//           <div className="card mb-4">
//             <p className="text-dim mb-3" style={{ fontSize: '0.875rem' }}>
//               {stars >= 3 ? 'WHAT DID YOU LIKE? (OPTIONAL)' : 'WHAT WENT WRONG? (SELECT AT LEAST ONE)'}
//             </p>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
//               {availableTags.map((tag) => {
//                 const isSelected = selectedTags.find(t => t.key === tag.key);
//                 const isPositive = tag.category === 'positive';
                
//                 return (
//                   <button
//                     key={tag.key}
//                     onClick={() => toggleTag(tag)}
//                     className="btn"
//                     style={{
//                       padding: '0.5rem 1rem',
//                       fontSize: '0.875rem',
//                       background: isSelected
//                         ? (isPositive ? '#10B981' : '#EF4444')
//                         : 'rgba(30, 41, 59, 0.4)',
//                       border: isSelected
//                         ? `2px solid ${isPositive ? '#10B981' : '#EF4444'}`
//                         : '1px solid rgba(148, 163, 184, 0.2)',
//                       color: isSelected ? 'white' : 'inherit',
//                       transition: 'all 0.2s'
//                     }}
//                   >
//                     {tag.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Review Text */}
//         {stars > 0 && (
//           <div className="card mb-4">
//             <p className="text-dim mb-2" style={{ fontSize: '0.875rem' }}>
//               ADDITIONAL COMMENTS (OPTIONAL)
//             </p>
//             <textarea
//               value={reviewText}
//               onChange={(e) => setReviewText(e.target.value)}
//               placeholder="Share more details about your experience..."
//               rows={4}
//               style={{
//                 width: '100%',
//                 padding: '0.75rem',
//                 background: 'rgba(30, 41, 59, 0.4)',
//                 border: '1px solid rgba(148, 163, 184, 0.2)',
//                 borderRadius: '8px',
//                 fontSize: '0.875rem',
//                 resize: 'vertical'
//               }}
//               maxLength={500}
//             />
//             <p className="text-dim mt-1" style={{ fontSize: '0.75rem', textAlign: 'right' }}>
//               {reviewText.length}/500
//             </p>
//           </div>
//         )}

//         {/* Submit Button */}
//         <button
//           onClick={handleSubmit}
//           disabled={stars === 0 || submitting || (stars <= 2 && !selectedTags.some(t => t.category === 'negative'))}
//           className="btn btn-success w-full"
//           style={{
//             padding: '1rem',
//             fontSize: '1.125rem',
//             fontWeight: 'bold',
//             opacity: (stars === 0 || (stars <= 2 && !selectedTags.some(t => t.category === 'negative'))) ? 0.5 : 1
//           }}
//         >
//           {submitting ? (
//             <span className="loading"></span>
//           ) : (
//             <>
//               <Send size={20} />
//               Submit Rating
//             </>
//           )}
//         </button>

//         {/* Validation Helper Text */}
//         {stars > 0 && stars <= 2 && !selectedTags.some(t => t.category === 'negative') && (
//           <p className="text-center mt-2 text-dim" style={{ fontSize: '0.75rem' }}>
//             Select at least one issue above to continue
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };



import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Star, Send, AlertTriangle, ArrowLeft } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TAG DEFINITIONS - Matching your RatingTapValidator
// ═══════════════════════════════════════════════════════════════

const RIDER_RATING_DRIVER_TAGS = {
  positive: {
    5: [
      { key: 'FELT_SAFE', label: '😊 Felt Safe', category: 'positive' },
      { key: 'RESPECTFUL', label: '🤝 Respectful', category: 'positive' },
      { key: 'FOLLOWED_RULES', label: '✅ Followed Traffic Rules', category: 'positive' },
      { key: 'RESPONSIBLE', label: '🛡️ Responsible Driver', category: 'positive' }
    ],
    4: [
      { key: 'FELT_SAFE', label: '😊 Felt Safe', category: 'positive' },
      { key: 'ROUTE_OK', label: '🗺️ Good Route', category: 'positive' },
      { key: 'COMMUNICATION', label: '💬 Good Communication', category: 'positive' }
    ],
    3: [
      { key: 'ROUTE_OK', label: '🗺️ Okay Route', category: 'positive' },
      { key: 'COMMUNICATION', label: '💬 Acceptable Communication', category: 'positive' }
    ]
  },
  negative: {
    2: [
      { key: 'UNCOMFORTABLE', label: '😟 Felt Uncomfortable', category: 'negative' },
      { key: 'RECKLESS', label: '⚠️ Reckless Driving', category: 'negative' },
      { key: 'UNNECESSARY_ROUTE', label: '🗺️ Took Unnecessary Route', category: 'negative' }
    ],
    1: [
      { key: 'INAPPROPRIATE', label: '🚫 Inappropriate Behavior', category: 'negative' },
      { key: 'IGNORED_COMM', label: '📵 Ignored Communication', category: 'negative' },
      { key: 'SAFETY_CONCERN', label: '🚨 Major Safety Concern', category: 'negative' },
      { key: 'RECKLESS', label: '⚠️ Extremely Reckless', category: 'negative' }
    ]
  }
};

const DRIVER_RATING_RIDER_TAGS = {
  positive: {
    5: [
      { key: 'POLITE', label: '😊 Polite & Friendly', category: 'positive' },
      { key: 'PUNCTUAL', label: '⏰ On Time', category: 'positive' },
      { key: 'RESPECTFUL', label: '🤝 Respectful', category: 'positive' },
      { key: 'CLEAN', label: '✨ Left Car Clean', category: 'positive' }
    ],
    4: [
      { key: 'POLITE', label: '😊 Polite', category: 'positive' },
      { key: 'PUNCTUAL', label: '⏰ On Time', category: 'positive' },
      { key: 'EASY_RIDER', label: '👍 Easy to Work With', category: 'positive' }
    ],
    3: [
      { key: 'PUNCTUAL', label: '⏰ On Time', category: 'positive' },
      { key: 'ACCEPTABLE', label: '👌 Acceptable', category: 'positive' }
    ]
  },
  negative: {
    2: [
      { key: 'LATE', label: '⏰ Was Late', category: 'negative' },
      { key: 'RUDE', label: '😠 Rude Behavior', category: 'negative' },
      { key: 'MESSY', label: '🗑️ Left Mess in Car', category: 'negative' }
    ],
    1: [
      { key: 'VERY_RUDE', label: '🚫 Very Rude/Aggressive', category: 'negative' },
      { key: 'NO_SHOW', label: '❌ Didn`t Show Up on Time', category: 'negative' },
      { key: 'DAMAGED_CAR', label: '💥 Damaged Car', category: 'negative' },
      { key: 'INTOXICATED', label: '🍺 Appeared Intoxicated', category: 'negative' }
    ]
  }
};

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export const RideRatingPage = ({ auth }) => {
  const navigate = useNavigate();
  const { rideId } = useParams();
  
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Rating state
  const [stars, setStars] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [safetyConcernDetails, setSafetyConcernDetails] = useState('');

  const isRider = auth?.userRole === 'rider';
  const isDriver = auth?.userRole === 'driver';

  // Get appropriate tags based on user role
  const TAGS = isRider ? RIDER_RATING_DRIVER_TAGS : DRIVER_RATING_RIDER_TAGS;

  // ═══════════════════════════════════════════════════════════════
  // FETCH RIDE DETAILS
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    fetchRideDetails();
  }, [rideId]);

  const fetchRideDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rides/${rideId}`, {
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setRide(data.data);
      }
    } catch (error) {
      console.error('Error fetching ride:', error);
    } finally {
      setLoading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // TAG SELECTION
  // ═══════════════════════════════════════════════════════════════
  const toggleTag = (tag) => {
    setSelectedTags(prev => {
      const exists = prev.find(t => t.key === tag.key);
      if (exists) {
        return prev.filter(t => t.key !== tag.key);
      } else {
        return [...prev, tag];
      }
    });
  };

  // ═══════════════════════════════════════════════════════════════
  // SUBMIT REVIEW - Matching ReviewSubmissionService expected format
  // ═══════════════════════════════════════════════════════════════
  const handleSubmit = async () => {
    if (stars === 0) {
      alert('Please select a star rating');
      return;
    }

    // Validate: 1-2 stars require negative feedback OR safety concern details
    if (stars <= 2) {
      const hasNegativeTap = selectedTags.some(t => t.category === 'negative');
      if (!hasNegativeTap && !safetyConcernDetails.trim()) {
        alert('⚠️ Please select at least one issue or describe what went wrong');
        return;
      }
    }

    setSubmitting(true);

    try {
      // Combine review text with safety concern details if provided
      let fullReview = reviewText;
      if (safetyConcernDetails.trim()) {
        fullReview = safetyConcernDetails.trim();
        if (reviewText.trim()) {
          fullReview += '\n\n' + reviewText.trim();
        }
      }

      // Build payload matching ReviewSubmissionService.submit() expected format
      const payload = {
        rideSummary: {
          rideId: ride.id,
          riderId: ride.rider_id,
          driverId: ride.driver_id, // This is drivers.id (database ID)
          status: ride.status
        },
        rating: {
          stars: stars
        },
        taps: selectedTags.map(tag => ({
          key: tag.key,
          category: tag.category
          // Note: pointValue is NOT sent - backend calculates it
        })),
        review: fullReview || null
      };

      console.log('📤 Submitting review:', payload);

      const response = await fetch('http://localhost:5000/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        alert('✅ Thank you for your rating!');
        navigate(isRider ? '/rider/dashboard' : '/driver/dashboard');
      } else {
        // Handle specific error messages from backend
        const errorMsg = data.message || data.error || 'Unknown error';
        
        if (errorMsg.includes('REVIEW_ALREADY_SUBMITTED')) {
          alert('You have already rated this ride!');
          navigate(isRider ? '/rider/dashboard' : '/driver/dashboard');
        } else {
          alert('Failed to submit rating: ' + errorMsg);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GET AVAILABLE TAGS
  // ═══════════════════════════════════════════════════════════════
  const getAvailableTags = () => {
    if (stars === 0) return [];
    
    if (stars >= 3) {
      return TAGS.positive[stars] || TAGS.positive[3] || [];
    } else {
      return TAGS.negative[stars] || [];
    }
  };

  const availableTags = getAvailableTags();

  // Check if form is valid
  const isFormValid = () => {
    if (stars === 0) return false;
    
    if (stars <= 2) {
      const hasNegativeTap = selectedTags.some(t => t.category === 'negative');
      const hasSafetyConcern = safetyConcernDetails.trim().length > 0;
      return hasNegativeTap || hasSafetyConcern;
    }
    
    return true;
  };

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading"></span>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="card text-center p-4">
          <p className="font-bold mb-2">Ride not found</p>
          <button 
            onClick={() => navigate(isRider ? '/rider/dashboard' : '/driver/dashboard')} 
            className="btn btn-primary mt-2"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      overflowY: 'auto',
      paddingBottom: '2rem'
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: '#0F172A',
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
        padding: '1rem'
      }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(isRider ? '/rider/dashboard' : '/driver/dashboard')}
              className="btn btn-secondary"
              style={{ padding: '0.5rem' }}
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {isRider ? 'Rate Your Driver' : 'Rate Your Rider'}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ padding: '1rem' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          {/* Subtitle */}
          <p className="text-center text-dim mb-6">
            {isRider 
              ? `How was your ride with ${ride.driver_name || 'your driver'}?`
              : `How was ${ride.rider_name || 'your rider'}?`
            }
          </p>

          {/* Star Rating */}
          <div className="card mb-4">
            <div className="text-center">
              <p className="text-dim mb-3" style={{ fontSize: '0.875rem' }}>
                TAP TO RATE
              </p>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => {
                      setStars(star);
                      setSelectedTags([]); // Reset tags when stars change
                      setSafetyConcernDetails(''); // Reset safety concern
                    }}
                    className="transition-transform hover:scale-110"
                    style={{ background: 'none', border: 'none', padding: 0 }}
                  >
                    <Star
                      size={40}
                      color={star <= stars ? '#F59E0B' : '#94A3B8'}
                      fill={star <= stars ? '#F59E0B' : 'none'}
                      strokeWidth={2}
                    />
                  </button>
                ))}
              </div>
              {stars > 0 && (
                <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  {stars === 5 && '⭐ Excellent!'}
                  {stars === 4 && '👍 Good'}
                  {stars === 3 && '😐 Okay'}
                  {stars === 2 && '😕 Could be better'}
                  {stars === 1 && '😞 Poor'}
                </p>
              )}
            </div>
          </div>

          {/* Validation Message for Low Ratings */}
          {stars > 0 && stars <= 2 && (
            <div className="card mb-4" style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '2px solid #EF4444'
            }}>
              <div className="flex items-start gap-2">
                <AlertTriangle size={18} color="#EF4444" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <p className="font-bold" style={{ color: '#EF4444', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    Feedback Required
                  </p>
                  <p className="text-dim" style={{ fontSize: '0.75rem' }}>
                    Please select issues below OR describe what went wrong
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {stars > 0 && availableTags.length > 0 && (
            <div className="card mb-4">
              <p className="text-dim mb-3" style={{ fontSize: '0.875rem' }}>
                {stars >= 3 ? 'WHAT DID YOU LIKE? (OPTIONAL)' : 'SELECT ISSUES (OPTIONAL IF YOU DESCRIBE BELOW)'}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {availableTags.map((tag) => {
                  const isSelected = selectedTags.find(t => t.key === tag.key);
                  const isPositive = tag.category === 'positive';
                  
                  return (
                    <button
                      key={tag.key}
                      onClick={() => toggleTag(tag)}
                      className="btn"
                      style={{
                        padding: '0.4rem 0.8rem',
                        fontSize: '0.8rem',
                        background: isSelected
                          ? (isPositive ? '#10B981' : '#EF4444')
                          : 'rgba(30, 41, 59, 0.4)',
                        border: isSelected
                          ? `2px solid ${isPositive ? '#10B981' : '#EF4444'}`
                          : '1px solid rgba(148, 163, 184, 0.2)',
                        color: isSelected ? 'white' : 'inherit',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Safety Concern Details (For Low Ratings) */}
          {stars > 0 && stars <= 2 && (
            <div className="card mb-4">
              <p className="text-dim mb-2" style={{ fontSize: '0.875rem' }}>
                DESCRIBE WHAT WENT WRONG {stars === 1 && '(RECOMMENDED)'}
              </p>
              <textarea
                value={safetyConcernDetails}
                onChange={(e) => setSafetyConcernDetails(e.target.value)}
                placeholder="Please describe what happened and why you're giving a low rating..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
                maxLength={1000}
              />
              <p className="text-dim mt-1" style={{ fontSize: '0.7rem', textAlign: 'right' }}>
                {safetyConcernDetails.length}/1000
              </p>
            </div>
          )}

          {/* Additional Review Text (For All Ratings) */}
          {stars > 0 && stars >= 3 && (
            <div className="card mb-4">
              <p className="text-dim mb-2" style={{ fontSize: '0.875rem' }}>
                ADDITIONAL COMMENTS (OPTIONAL)
              </p>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share more details about your experience..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(30, 41, 59, 0.4)',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
                maxLength={500}
              />
              <p className="text-dim mt-1" style={{ fontSize: '0.7rem', textAlign: 'right' }}>
                {reviewText.length}/500
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || submitting}
            className="btn btn-success w-full"
            style={{
              padding: '1rem',
              fontSize: '1rem',
              fontWeight: 'bold',
              opacity: (!isFormValid() || submitting) ? 0.5 : 1,
              marginBottom: '1rem'
            }}
          >
            {submitting ? (
              <span className="loading"></span>
            ) : (
              <>
                <Send size={20} />
                Submit Rating
              </>
            )}
          </button>

          {/* Validation Helper Text */}
          {stars > 0 && !isFormValid() && (
            <p className="text-center text-dim" style={{ fontSize: '0.75rem' }}>
              {stars <= 2 ? 'Select at least one issue or describe what went wrong' : 'Please provide feedback'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};