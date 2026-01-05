// import React, { useState, useEffect, useRef } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapPin, Plus, X, Navigation, DollarSign, Users, Package, CreditCard } from 'lucide-react';

// const CreateRideRequest = ({ auth }) => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(false);
//   const [pricingMode, setPricingMode] = useState('bidding');
//   const [showStops, setShowStops] = useState(false);
  
//   const [formData, setFormData] = useState({
//     pickup: { lat: '', lng: '', address: '' },
//     dropoff: { lat: '', lng: '', address: '' },
//     stops: [],
//     vehiclePreference: 'bike',
//     passengerCount: 1,
//     luggageCount: 0,
//     paymentMethod: 'cash',
//     requiresWheelchairAccessible: false,
//     requiresPetFriendly: false,
//     requiresChildSeat: false,
//     specialInstructions: ''
//   });

//   const [newStop, setNewStop] = useState({
//     lat: '',
//     lng: '',
//     address: '',
//     contactName: '',
//     contactPhone: '',
//     notes: '',
//     maxWaitSeconds: 120
//   });

//   // Location autocomplete states
//   const [pickupSuggestions, setPickupSuggestions] = useState([]);
//   const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
//   const [stopSuggestions, setStopSuggestions] = useState([]);
//   const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
//   const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
//   const [showStopSuggestions, setShowStopSuggestions] = useState(false);

//   // Vehicle type limits
//   const vehicleLimits = {
//     bike: { maxPassengers: 1, maxLuggage: 1 },
//     sedan: { maxPassengers: 4, maxLuggage: 3 },
//     suv: { maxPassengers: 6, maxLuggage: 5 },
//     luxury: { maxPassengers: 4, maxLuggage: 3 },
//     van: { maxPassengers: 8, maxLuggage: 6 }
//   };

//   // Mock location search (Replace with real geocoding API like Google Maps or Mapbox)
//   const searchLocation = async (query) => {
//     if (!query || query.length < 3) return [];
    
//     // Mock data - replace with actual API call
//     const mockPlaces = [
//       { address: 'Kalanki, Kathmandu', lat: 27.6942, lng: 85.2803 },
//       { address: 'Thamel, Kathmandu', lat: 27.7172, lng: 85.3106 },
//       { address: 'Patan Durbar Square', lat: 27.6733, lng: 85.3256 },
//       { address: 'Boudhanath Stupa', lat: 27.7215, lng: 85.3618 },
//       { address: 'Swayambhunath Temple', lat: 27.7149, lng: 85.2906 },
//       { address: 'Tribhuvan Airport', lat: 27.6966, lng: 85.3591 },
//       { address: 'Bhaktapur Durbar Square', lat: 27.6722, lng: 85.4276 },
//       { address: 'Pashupatinath Temple', lat: 27.7106, lng: 85.3486 }
//     ];

//     return mockPlaces.filter(place => 
//       place.address.toLowerCase().includes(query.toLowerCase())
//     );
//   };

//   const handlePickupSearch = async (value) => {
//     setFormData({...formData, pickup: {...formData.pickup, address: value}});
//     if (value.length >= 3) {
//       const results = await searchLocation(value);
//       setPickupSuggestions(results);
//       setShowPickupSuggestions(true);
//     } else {
//       setShowPickupSuggestions(false);
//     }
//   };

//   const handleDropoffSearch = async (value) => {
//     setFormData({...formData, dropoff: {...formData.dropoff, address: value}});
//     if (value.length >= 3) {
//       const results = await searchLocation(value);
//       setDropoffSuggestions(results);
//       setShowDropoffSuggestions(true);
//     } else {
//       setShowDropoffSuggestions(false);
//     }
//   };

//   const handleStopSearch = async (value) => {
//     setNewStop({...newStop, address: value});
//     if (value.length >= 3) {
//       const results = await searchLocation(value);
//       setStopSuggestions(results);
//       setShowStopSuggestions(true);
//     } else {
//       setShowStopSuggestions(false);
//     }
//   };

//   const selectPickupLocation = (place) => {
//     setFormData({
//       ...formData,
//       pickup: { lat: place.lat, lng: place.lng, address: place.address }
//     });
//     setShowPickupSuggestions(false);
//   };

//   const selectDropoffLocation = (place) => {
//     setFormData({
//       ...formData,
//       dropoff: { lat: place.lat, lng: place.lng, address: place.address }
//     });
//     setShowDropoffSuggestions(false);
//   };

//   const selectStopLocation = (place) => {
//     setNewStop({
//       ...newStop,
//       lat: place.lat,
//       lng: place.lng,
//       address: place.address
//     });
//     setShowStopSuggestions(false);
//   };

//   const addStop = () => {
//     if (newStop.address && newStop.lat && newStop.lng) {
//       setFormData({
//         ...formData,
//         stops: [...formData.stops, {...newStop}]
//       });
//       setNewStop({
//         lat: '',
//         lng: '',
//         address: '',
//         contactName: '',
//         contactPhone: '',
//         notes: '',
//         maxWaitSeconds: 120
//       });
//     } else {
//       alert('Please select a location from suggestions');
//     }
//   };

//   const removeStop = (index) => {
//     setFormData({
//       ...formData,
//       stops: formData.stops.filter((_, i) => i !== index)
//     });
//   };

//   // Update passenger count when vehicle changes
//   const handleVehicleChange = (vehicle) => {
//     const limits = vehicleLimits[vehicle];
//     setFormData({
//       ...formData,
//       vehiclePreference: vehicle,
//       passengerCount: Math.min(formData.passengerCount, limits.maxPassengers),
//       luggageCount: Math.min(formData.luggageCount, limits.maxLuggage)
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.pickup.lat || !formData.dropoff.lat) {
//       alert('Please select pickup and dropoff locations from suggestions');
//       return;
//     }

//     setLoading(true);

//     try {
//       const requestBody = {
//         pickupLocation: {
//           type: 'Point',
//           coordinates: [formData.pickup.lng, formData.pickup.lat]
//         },
//         pickupAddress: formData.pickup.address,
//         dropoffLocation: {
//           type: 'Point',
//           coordinates: [formData.dropoff.lng, formData.dropoff.lat]
//         },
//         dropoffAddress: formData.dropoff.address,
//         stops: formData.stops.map(stop => ({
//           location: {
//             type: 'Point',
//             coordinates: [stop.lng, stop.lat]
//           },
//           address: stop.address,
//           contactName: stop.contactName || null,
//           contactPhone: stop.contactPhone || null,
//           notes: stop.notes || null,
//           maxWaitSeconds: stop.maxWaitSeconds || 120
//         })),
//         pricingMode,
//         vehiclePreference: formData.vehiclePreference,
//         passengerCount: formData.passengerCount,
//         luggageCount: formData.luggageCount,
//         paymentMethod: formData.paymentMethod,
//         requiresWheelchairAccessible: formData.requiresWheelchairAccessible,
//         requiresPetFriendly: formData.requiresPetFriendly,
//         requiresChildSeat: formData.requiresChildSeat,
//         specialInstructions: formData.specialInstructions || null
//       };

//       console.log('📤 Sending request:', requestBody);

//       const response = await fetch('http://localhost:5000/api/ride-requests', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${auth.token}`
//         },
//         body: JSON.stringify(requestBody)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert('Ride request created successfully!');
//         if (pricingMode === 'bidding') {
//           navigate(`/rider/view-bids/${data.data.id}`);
//         } else {
//           navigate('/rider/dashboard');
//         }
//       } else {
//         alert(data.message || 'Failed to create ride request');
//       }
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Error: ' + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4" style={{paddingBottom: '5rem'}}>
//       <div className="header">
//         <h1 className="header-title">New Ride</h1>
//         <p className="text-dim mt-1">Plan your journey</p>
//       </div>

//       <form onSubmit={handleSubmit} className="p-4">
//         {/* Pricing Mode */}
//         <div className="card mb-4">
//           <h3 className="font-bold mb-3">Pricing Mode</h3>
//           <div className="flex gap-2">
//             <button
//               type="button"
//               className={`btn flex-1 ${pricingMode === 'fixed' ? 'btn-primary' : 'btn-secondary'}`}
//               onClick={() => setPricingMode('fixed')}
//             >
//               <DollarSign size={20} />
//               Fixed Price
//             </button>
//             <button
//               type="button"
//               className={`btn flex-1 ${pricingMode === 'bidding' ? 'btn-primary' : 'btn-secondary'}`}
//               onClick={() => setPricingMode('bidding')}
//             >
//               <Navigation size={20} />
//               Let Drivers Bid
//             </button>
//           </div>
//         </div>

//         {/* Locations */}
//         <div className="card mb-4">
//           <h3 className="font-bold mb-3">Route</h3>

//           {/* Pickup */}
//           <div className="mb-3" style={{position: 'relative'}}>
//             <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//               Pickup Location
//             </label>
//             <div style={{position: 'relative'}}>
//               <div style={{
//                 position: 'absolute',
//                 left: '1rem',
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 width: '8px',
//                 height: '8px',
//                 borderRadius: '50%',
//                 background: '#10B981'
//               }}></div>
//               <input
//                 type="text"
//                 className="input"
//                 placeholder="Search pickup location..."
//                 style={{paddingLeft: '3rem'}}
//                 value={formData.pickup.address}
//                 onChange={(e) => handlePickupSearch(e.target.value)}
//                 onFocus={() => formData.pickup.address.length >= 3 && setShowPickupSuggestions(true)}
//                 required
//               />
//             </div>
//             {showPickupSuggestions && pickupSuggestions.length > 0 && (
//               <div style={{
//                 position: 'absolute',
//                 top: '100%',
//                 left: 0,
//                 right: 0,
//                 background: '#1E293B',
//                 border: '1px solid rgba(148, 163, 184, 0.2)',
//                 borderRadius: '8px',
//                 marginTop: '0.5rem',
//                 maxHeight: '200px',
//                 overflowY: 'auto',
//                 zIndex: 10
//               }}>
//                 {pickupSuggestions.map((place, idx) => (
//                   <div
//                     key={idx}
//                     onClick={() => selectPickupLocation(place)}
//                     style={{
//                       padding: '0.75rem 1rem',
//                       cursor: 'pointer',
//                       borderBottom: idx < pickupSuggestions.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
//                     }}
//                     onMouseEnter={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.1)'}
//                     onMouseLeave={(e) => e.target.style.background = 'transparent'}
//                   >
//                     <div className="flex items-center gap-2">
//                       <MapPin size={16} color="#10B981" />
//                       <span>{place.address}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Add Stops Button */}
//           {!showStops && (
//             <button
//               type="button"
//               className="btn btn-secondary w-full mb-3"
//               onClick={() => setShowStops(true)}
//             >
//               <Plus size={20} />
//               Add Stops
//             </button>
//           )}

//           {/* Stops Section */}
//           {showStops && (
//             <>
//               {formData.stops.map((stop, index) => (
//                 <div key={index} className="mb-3" style={{position: 'relative'}}>
//                   <div style={{
//                     position: 'absolute',
//                     left: '1rem',
//                     top: '1rem',
//                     width: '8px',
//                     height: '8px',
//                     borderRadius: '50%',
//                     background: '#F59E0B',
//                     zIndex: 2
//                   }}></div>
//                   <div style={{
//                     background: 'rgba(245, 158, 11, 0.1)',
//                     border: '1px solid rgba(245, 158, 11, 0.3)',
//                     borderRadius: '12px',
//                     padding: '1rem',
//                     paddingLeft: '3rem'
//                   }}>
//                     <div className="flex justify-between items-start">
//                       <div className="flex-1">
//                         <div className="font-bold">{stop.address}</div>
//                         {stop.notes && (
//                           <div className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
//                             {stop.notes}
//                           </div>
//                         )}
//                       </div>
//                       <button
//                         type="button"
//                         onClick={() => removeStop(index)}
//                         style={{background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444'}}
//                       >
//                         <X size={20} />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {/* Add Stop Form */}
//               <div className="mb-3" style={{background: 'rgba(148, 163, 184, 0.05)', padding: '1rem', borderRadius: '12px', position: 'relative'}}>
//                 <div className="flex items-center gap-2 mb-2">
//                   <Plus size={20} color="#F59E0B" />
//                   <span className="font-bold" style={{color: '#F59E0B'}}>Add Stop</span>
//                 </div>
//                 <div style={{position: 'relative'}}>
//                   <input
//                     type="text"
//                     className="input mb-2"
//                     placeholder="Search stop location..."
//                     value={newStop.address}
//                     onChange={(e) => handleStopSearch(e.target.value)}
//                     onFocus={() => newStop.address.length >= 3 && setShowStopSuggestions(true)}
//                     style={{fontSize: '0.875rem'}}
//                   />
//                   {showStopSuggestions && stopSuggestions.length > 0 && (
//                     <div style={{
//                       position: 'absolute',
//                       top: '100%',
//                       left: 0,
//                       right: 0,
//                       background: '#1E293B',
//                       border: '1px solid rgba(148, 163, 184, 0.2)',
//                       borderRadius: '8px',
//                       marginTop: '-0.5rem',
//                       marginBottom: '0.5rem',
//                       maxHeight: '150px',
//                       overflowY: 'auto',
//                       zIndex: 10
//                     }}>
//                       {stopSuggestions.map((place, idx) => (
//                         <div
//                           key={idx}
//                           onClick={() => selectStopLocation(place)}
//                           style={{
//                             padding: '0.75rem 1rem',
//                             cursor: 'pointer',
//                             borderBottom: idx < stopSuggestions.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
//                           }}
//                           onMouseEnter={(e) => e.target.style.background = 'rgba(245, 158, 11, 0.1)'}
//                           onMouseLeave={(e) => e.target.style.background = 'transparent'}
//                         >
//                           <div className="flex items-center gap-2">
//                             <MapPin size={16} color="#F59E0B" />
//                             <span style={{fontSize: '0.875rem'}}>{place.address}</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//                 <input
//                   type="text"
//                   className="input mb-2"
//                   placeholder="Notes (optional)"
//                   value={newStop.notes}
//                   onChange={(e) => setNewStop({...newStop, notes: e.target.value})}
//                   style={{fontSize: '0.875rem'}}
//                 />
//                 <button
//                   type="button"
//                   className="btn btn-primary w-full"
//                   onClick={addStop}
//                   style={{padding: '0.75rem', fontSize: '0.875rem'}}
//                 >
//                   <Plus size={16} />
//                   Add This Stop
//                 </button>
//               </div>
//             </>
//           )}

//           {/* Dropoff */}
//           <div style={{position: 'relative'}}>
//             <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//               Dropoff Location
//             </label>
//             <div style={{position: 'relative'}}>
//               <div style={{
//                 position: 'absolute',
//                 left: '1rem',
//                 top: '50%',
//                 transform: 'translateY(-50%)',
//                 width: '8px',
//                 height: '8px',
//                 borderRadius: '50%',
//                 background: '#EF4444'
//               }}></div>
//               <input
//                 type="text"
//                 className="input"
//                 placeholder="Search dropoff location..."
//                 style={{paddingLeft: '3rem'}}
//                 value={formData.dropoff.address}
//                 onChange={(e) => handleDropoffSearch(e.target.value)}
//                 onFocus={() => formData.dropoff.address.length >= 3 && setShowDropoffSuggestions(true)}
//                 required
//               />
//             </div>
//             {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
//               <div style={{
//                 position: 'absolute',
//                 top: '100%',
//                 left: 0,
//                 right: 0,
//                 background: '#1E293B',
//                 border: '1px solid rgba(148, 163, 184, 0.2)',
//                 borderRadius: '8px',
//                 marginTop: '0.5rem',
//                 maxHeight: '200px',
//                 overflowY: 'auto',
//                 zIndex: 10
//               }}>
//                 {dropoffSuggestions.map((place, idx) => (
//                   <div
//                     key={idx}
//                     onClick={() => selectDropoffLocation(place)}
//                     style={{
//                       padding: '0.75rem 1rem',
//                       cursor: 'pointer',
//                       borderBottom: idx < dropoffSuggestions.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
//                     }}
//                     onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
//                     onMouseLeave={(e) => e.target.style.background = 'transparent'}
//                   >
//                     <div className="flex items-center gap-2">
//                       <MapPin size={16} color="#EF4444" />
//                       <span>{place.address}</span>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Ride Details */}
//         <div className="card mb-4">
//           <h3 className="font-bold mb-3">Ride Details</h3>

//           <div className="mb-3">
//             <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//               Vehicle Type
//             </label>
//             <select
//               className="input"
//               value={formData.vehiclePreference}
//               onChange={(e) => handleVehicleChange(e.target.value)}
//             >
//               <option value="bike">Bike (1 passenger, 1 luggage)</option>
//               <option value="sedan">Sedan (4 passengers, 3 luggage)</option>
//               <option value="suv">SUV (6 passengers, 5 luggage)</option>
//               <option value="luxury">Luxury (4 passengers, 3 luggage)</option>
//               <option value="van">Van (8 passengers, 6 luggage)</option>
//             </select>
//           </div>

//           <div className="flex gap-2 mb-3">
//             <div className="flex-1">
//               <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//                 Passengers
//               </label>
//               <div style={{position: 'relative'}}>
//                 <Users size={20} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} />
//                 <input
//                   type="number"
//                   className="input"
//                   min="1"
//                   max={vehicleLimits[formData.vehiclePreference].maxPassengers}
//                   style={{paddingLeft: '3rem'}}
//                   value={formData.passengerCount}
//                   onChange={(e) => setFormData({...formData, passengerCount: parseInt(e.target.value)})}
//                 />
//               </div>
//             </div>

//             <div className="flex-1">
//               <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//                 Luggage
//               </label>
//               <div style={{position: 'relative'}}>
//                 <Package size={20} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} />
//                 <input
//                   type="number"
//                   className="input"
//                   min="0"
//                   max={vehicleLimits[formData.vehiclePreference].maxLuggage}
//                   style={{paddingLeft: '3rem'}}
//                   value={formData.luggageCount}
//                   onChange={(e) => setFormData({...formData, luggageCount: parseInt(e.target.value)})}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Payment Method */}
//           <div className="mb-3">
//             <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//               Payment Method
//             </label>
//             <div style={{position: 'relative'}}>
//               <CreditCard size={20} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} />
//               <select
//                 className="input"
//                 style={{paddingLeft: '3rem'}}
//                 value={formData.paymentMethod}
//                 onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
//               >
//                 <option value="cash">Cash</option>
//                 <option value="card">Credit/Debit Card</option>
//                 <option value="wallet">Digital Wallet</option>
//               </select>
//             </div>
//           </div>

//           {/* Special Requirements */}
//           {formData.vehiclePreference !== 'bike' && (
//             <>
//               <div className="mb-2">
//                 <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
//                   <input
//                     type="checkbox"
//                     checked={formData.requiresWheelchairAccessible}
//                     onChange={(e) => setFormData({...formData, requiresWheelchairAccessible: e.target.checked})}
//                     style={{width: '20px', height: '20px'}}
//                   />
//                   <span>Wheelchair Accessible</span>
//                 </label>
//               </div>

//               <div className="mb-2">
//                 <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
//                   <input
//                     type="checkbox"
//                     checked={formData.requiresPetFriendly}
//                     onChange={(e) => setFormData({...formData, requiresPetFriendly: e.target.checked})}
//                     style={{width: '20px', height: '20px'}}
//                   />
//                   <span>Pet Friendly</span>
//                 </label>
//               </div>

//               <div className="mb-3">
//                 <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
//                   <input
//                     type="checkbox"
//                     checked={formData.requiresChildSeat}
//                     onChange={(e) => setFormData({...formData, requiresChildSeat: e.target.checked})}
//                     style={{width: '20px', height: '20px'}}
//                   />
//                   <span>Child Seat Required</span>
//                 </label>
//               </div>
//             </>
//           )}

//           <div>
//             <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
//               Special Instructions
//             </label>
//             <textarea
//               className="input"
//               rows="3"
//               placeholder="Any special requests or notes for the driver..."
//               value={formData.specialInstructions}
//               onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
//             ></textarea>
//           </div>
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           className="btn btn-primary w-full"
//           disabled={loading}
//           style={{padding: '1.25rem', fontSize: '1.125rem'}}
//         >
//           {loading ? (
//             <span className="loading"></span>
//           ) : (
//             <>
//               <Navigation size={24} />
//               {pricingMode === 'bidding' ? 'Request Bids' : 'Confirm Ride'}
//             </>
//           )}
//         </button>

//         <button
//           type="button"
//           className="btn btn-secondary w-full mt-2"
//           onClick={() => navigate('/rider/dashboard')}
//         >
//           Cancel
//         </button>
//       </form>
//     </div>
//   );
// };

// export default CreateRideRequest;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, X, Navigation, DollarSign, Users, Package, CreditCard } from 'lucide-react';

// Add this to your index.html in the <head> section:
// <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places"></script>

const CreateRideRequest = ({ auth }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pricingMode, setPricingMode] = useState('bidding');
  const [showStops, setShowStops] = useState(false);
  
  const [formData, setFormData] = useState({
    pickup: { lat: '', lng: '', address: '' },
    dropoff: { lat: '', lng: '', address: '' },
    stops: [],
    vehiclePreference: 'bike',
    passengerCount: 1,
    luggageCount: 0,
    paymentMethod: 'cash',
    requiresWheelchairAccessible: false,
    requiresPetFriendly: false,
    requiresChildSeat: false,
    specialInstructions: ''
  });

  const [newStop, setNewStop] = useState({
    lat: '',
    lng: '',
    address: '',
    contactName: '',
    contactPhone: '',
    notes: '',
    maxWaitSeconds: 120
  });

  // Location autocomplete states
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState([]);
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false);
  const [showStopSuggestions, setShowStopSuggestions] = useState(false);

  // Google Maps Autocomplete Service
  const [autocompleteService, setAutocompleteService] = useState(null);
  const [geocoder, setGeocoder] = useState(null);

  useEffect(() => {
    // Initialize Google Maps services
    if (window.google && window.google.maps) {
      setAutocompleteService(new window.google.maps.places.AutocompleteService());
      setGeocoder(new window.google.maps.Geocoder());
    }
  }, []);

  // Vehicle type limits
  const vehicleLimits = {
    bike: { maxPassengers: 1, maxLuggage: 1 },
    sedan: { maxPassengers: 4, maxLuggage: 3 },
    suv: { maxPassengers: 6, maxLuggage: 5 },
    luxury: { maxPassengers: 4, maxLuggage: 3 },
    van: { maxPassengers: 8, maxLuggage: 6 }
  };

  // Search location using Google Places API
  const searchLocation = (query, callback) => {
    if (!query || query.length < 3 || !autocompleteService) {
      callback([]);
      return;
    }

    autocompleteService.getPlacePredictions(
      {
        input: query,
        componentRestrictions: { country: 'np' }, // Restrict to Nepal, change as needed
      },
      (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          callback(predictions);
        } else {
          callback([]);
        }
      }
    );
  };

  // Get coordinates from place_id
  const getPlaceDetails = (placeId, callback) => {
    if (!geocoder) return;

    geocoder.geocode({ placeId: placeId }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const location = results[0].geometry.location;
        callback({
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address
        });
      }
    });
  };

  const handlePickupSearch = (value) => {
    setFormData({...formData, pickup: {...formData.pickup, address: value}});
    if (value.length >= 3) {
      searchLocation(value, (predictions) => {
        setPickupSuggestions(predictions);
        setShowPickupSuggestions(predictions.length > 0);
      });
    } else {
      setShowPickupSuggestions(false);
    }
  };

  const handleDropoffSearch = (value) => {
    setFormData({...formData, dropoff: {...formData.dropoff, address: value}});
    if (value.length >= 3) {
      searchLocation(value, (predictions) => {
        setDropoffSuggestions(predictions);
        setShowDropoffSuggestions(predictions.length > 0);
      });
    } else {
      setShowDropoffSuggestions(false);
    }
  };

  const handleStopSearch = (value) => {
    setNewStop({...newStop, address: value});
    if (value.length >= 3) {
      searchLocation(value, (predictions) => {
        setStopSuggestions(predictions);
        setShowStopSuggestions(predictions.length > 0);
      });
    } else {
      setShowStopSuggestions(false);
    }
  };

  const selectPickupLocation = (prediction) => {
    getPlaceDetails(prediction.place_id, (place) => {
      setFormData({
        ...formData,
        pickup: place
      });
      setShowPickupSuggestions(false);
    });
  };

  const selectDropoffLocation = (prediction) => {
    getPlaceDetails(prediction.place_id, (place) => {
      setFormData({
        ...formData,
        dropoff: place
      });
      setShowDropoffSuggestions(false);
    });
  };

  const selectStopLocation = (prediction) => {
    getPlaceDetails(prediction.place_id, (place) => {
      setNewStop({
        ...newStop,
        lat: place.lat,
        lng: place.lng,
        address: place.address
      });
      setShowStopSuggestions(false);
    });
  };

  const addStop = () => {
    if (newStop.address && newStop.lat && newStop.lng) {
      setFormData({
        ...formData,
        stops: [...formData.stops, {...newStop}]
      });
      setNewStop({
        lat: '',
        lng: '',
        address: '',
        contactName: '',
        contactPhone: '',
        notes: '',
        maxWaitSeconds: 120
      });
    } else {
      alert('Please select a location from suggestions');
    }
  };

  const removeStop = (index) => {
    setFormData({
      ...formData,
      stops: formData.stops.filter((_, i) => i !== index)
    });
  };

  const handleVehicleChange = (vehicle) => {
    const limits = vehicleLimits[vehicle];
    setFormData({
      ...formData,
      vehiclePreference: vehicle,
      passengerCount: Math.min(formData.passengerCount, limits.maxPassengers),
      luggageCount: Math.min(formData.luggageCount, limits.maxLuggage)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickup.lat || !formData.dropoff.lat) {
      alert('Please select pickup and dropoff locations from suggestions');
      return;
    }

    setLoading(true);

    try {
      const requestBody = {
        pickupLocation: {
          type: 'Point',
          coordinates: [formData.pickup.lng, formData.pickup.lat]
        },
        pickupAddress: formData.pickup.address,
        dropoffLocation: {
          type: 'Point',
          coordinates: [formData.dropoff.lng, formData.dropoff.lat]
        },
        dropoffAddress: formData.dropoff.address,
        stops: formData.stops.map(stop => ({
          location: {
            type: 'Point',
            coordinates: [stop.lng, stop.lat]
          },
          address: stop.address,
          contactName: stop.contactName || null,
          contactPhone: stop.contactPhone || null,
          notes: stop.notes || null,
          maxWaitSeconds: stop.maxWaitSeconds || 120
        })),
        pricingMode,
        vehiclePreference: formData.vehiclePreference,
        passengerCount: formData.passengerCount,
        luggageCount: formData.luggageCount,
        paymentMethod: formData.paymentMethod,
        requiresWheelchairAccessible: formData.requiresWheelchairAccessible,
        requiresPetFriendly: formData.requiresPetFriendly,
        requiresChildSeat: formData.requiresChildSeat,
        specialInstructions: formData.specialInstructions || null
      };

      console.log('📤 Sending request:', requestBody);

      const response = await fetch('http://localhost:5000/api/ride-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Ride request created successfully!');
        if (pricingMode === 'bidding') {
          navigate(`/rider/view-bids/${data.data.id}`);
        } else {
          navigate('/rider/dashboard');
        }
      } else {
        alert(data.message || 'Failed to create ride request');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4" style={{paddingBottom: '5rem'}}>
      <div className="header">
        <h1 className="header-title">New Ride</h1>
        <p className="text-dim mt-1">Plan your journey</p>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        {/* Pricing Mode */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Pricing Mode</h3>
          <div className="flex gap-2">
            <button
              type="button"
              className={`btn flex-1 ${pricingMode === 'fixed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPricingMode('fixed')}
            >
              <DollarSign size={20} />
              Fixed Price
            </button>
            <button
              type="button"
              className={`btn flex-1 ${pricingMode === 'bidding' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setPricingMode('bidding')}
            >
              <Navigation size={20} />
              Let Drivers Bid
            </button>
          </div>
        </div>

        {/* Locations */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Route</h3>

          {/* Pickup */}
          <div className="mb-3" style={{position: 'relative'}}>
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Pickup Location
            </label>
            <div style={{position: 'relative'}}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#10B981'
              }}></div>
              <input
                type="text"
                className="input"
                placeholder="Search pickup location..."
                style={{paddingLeft: '3rem'}}
                value={formData.pickup.address}
                onChange={(e) => handlePickupSearch(e.target.value)}
                onFocus={() => formData.pickup.address.length >= 3 && setShowPickupSuggestions(true)}
                required
              />
            </div>
            {showPickupSuggestions && pickupSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#1E293B',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                marginTop: '0.5rem',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}>
                {pickupSuggestions.map((prediction, idx) => (
                  <div
                    key={prediction.place_id}
                    onClick={() => selectPickupLocation(prediction)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: idx < pickupSuggestions.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} color="#10B981" />
                      <div>
                        <div style={{fontSize: '0.875rem'}}>{prediction.structured_formatting.main_text}</div>
                        <div style={{fontSize: '0.75rem', color: '#94A3B8'}}>{prediction.structured_formatting.secondary_text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Stops Button */}
          {!showStops && (
            <button
              type="button"
              className="btn btn-secondary w-full mb-3"
              onClick={() => setShowStops(true)}
            >
              <Plus size={20} />
              Add Stops
            </button>
          )}

          {/* Stops Section */}
          {showStops && (
            <>
              {formData.stops.map((stop, index) => (
                <div key={index} className="mb-3" style={{position: 'relative'}}>
                  <div style={{
                    position: 'absolute',
                    left: '1rem',
                    top: '1rem',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#F59E0B',
                    zIndex: 2
                  }}></div>
                  <div style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '12px',
                    padding: '1rem',
                    paddingLeft: '3rem'
                  }}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-bold">{stop.address}</div>
                        {stop.notes && (
                          <div className="text-dim" style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
                            {stop.notes}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStop(index)}
                        style={{background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444'}}
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add Stop Form */}
              <div className="mb-3" style={{background: 'rgba(148, 163, 184, 0.05)', padding: '1rem', borderRadius: '12px', position: 'relative'}}>
                <div className="flex items-center gap-2 mb-2">
                  <Plus size={20} color="#F59E0B" />
                  <span className="font-bold" style={{color: '#F59E0B'}}>Add Stop</span>
                </div>
                <div style={{position: 'relative'}}>
                  <input
                    type="text"
                    className="input mb-2"
                    placeholder="Search stop location..."
                    value={newStop.address}
                    onChange={(e) => handleStopSearch(e.target.value)}
                    onFocus={() => newStop.address.length >= 3 && setShowStopSuggestions(true)}
                    style={{fontSize: '0.875rem'}}
                  />
                  {showStopSuggestions && stopSuggestions.length > 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#1E293B',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      marginTop: '-0.5rem',
                      marginBottom: '0.5rem',
                      maxHeight: '150px',
                      overflowY: 'auto',
                      zIndex: 10,
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
                    }}>
                      {stopSuggestions.map((prediction, idx) => (
                        <div
                          key={prediction.place_id}
                          onClick={() => selectStopLocation(prediction)}
                          style={{
                            padding: '0.75rem 1rem',
                            cursor: 'pointer',
                            borderBottom: idx < stopSuggestions.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
                          }}
                          onMouseEnter={(e) => e.target.style.background = 'rgba(245, 158, 11, 0.1)'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin size={16} color="#F59E0B" />
                            <div>
                              <div style={{fontSize: '0.875rem'}}>{prediction.structured_formatting.main_text}</div>
                              <div style={{fontSize: '0.75rem', color: '#94A3B8'}}>{prediction.structured_formatting.secondary_text}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  className="input mb-2"
                  placeholder="Notes (optional)"
                  value={newStop.notes}
                  onChange={(e) => setNewStop({...newStop, notes: e.target.value})}
                  style={{fontSize: '0.875rem'}}
                />
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={addStop}
                  style={{padding: '0.75rem', fontSize: '0.875rem'}}
                >
                  <Plus size={16} />
                  Add This Stop
                </button>
              </div>
            </>
          )}

          {/* Dropoff */}
          <div style={{position: 'relative'}}>
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Dropoff Location
            </label>
            <div style={{position: 'relative'}}>
              <div style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#EF4444'
              }}></div>
              <input
                type="text"
                className="input"
                placeholder="Search dropoff location..."
                style={{paddingLeft: '3rem'}}
                value={formData.dropoff.address}
                onChange={(e) => handleDropoffSearch(e.target.value)}
                onFocus={() => formData.dropoff.address.length >= 3 && setShowDropoffSuggestions(true)}
                required
              />
            </div>
            {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                background: '#1E293B',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                marginTop: '0.5rem',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}>
                {dropoffSuggestions.map((prediction, idx) => (
                  <div
                    key={prediction.place_id}
                    onClick={() => selectDropoffLocation(prediction)}
                    style={{
                      padding: '0.75rem 1rem',
                      cursor: 'pointer',
                      borderBottom: idx < dropoffSuggestions.length - 1 ? '1px solid rgba(148, 163, 184, 0.1)' : 'none'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin size={16} color="#EF4444" />
                      <div>
                        <div style={{fontSize: '0.875rem'}}>{prediction.structured_formatting.main_text}</div>
                        <div style={{fontSize: '0.75rem', color: '#94A3B8'}}>{prediction.structured_formatting.secondary_text}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ride Details */}
        <div className="card mb-4">
          <h3 className="font-bold mb-3">Ride Details</h3>

          <div className="mb-3">
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Vehicle Type
            </label>
            <select
              className="input"
              value={formData.vehiclePreference}
              onChange={(e) => handleVehicleChange(e.target.value)}
            >
              <option value="bike">Bike (1 passenger, 1 luggage)</option>
              <option value="sedan">Sedan (4 passengers, 3 luggage)</option>
              <option value="suv">SUV (6 passengers, 5 luggage)</option>
              <option value="luxury">Luxury (4 passengers, 3 luggage)</option>
              <option value="van">Van (8 passengers, 6 luggage)</option>
            </select>
          </div>

          <div className="flex gap-2 mb-3">
            <div className="flex-1">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Passengers
              </label>
              <div style={{position: 'relative'}}>
                <Users size={20} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} />
                <input
                  type="number"
                  className="input"
                  min="1"
                  max={vehicleLimits[formData.vehiclePreference].maxPassengers}
                  style={{paddingLeft: '3rem'}}
                  value={formData.passengerCount}
                  onChange={(e) => setFormData({...formData, passengerCount: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
                Luggage
              </label>
              <div style={{position: 'relative'}}>
                <Package size={20} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} />
                <input
                  type="number"
                  className="input"
                  min="0"
                  max={vehicleLimits[formData.vehiclePreference].maxLuggage}
                  style={{paddingLeft: '3rem'}}
                  value={formData.luggageCount}
                  onChange={(e) => setFormData({...formData, luggageCount: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-3">
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Payment Method
            </label>
            <div style={{position: 'relative'}}>
              <CreditCard size={20} style={{position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8'}} />
              <select
                className="input"
                style={{paddingLeft: '3rem'}}
                value={formData.paymentMethod}
                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="wallet">Digital Wallet</option>
              </select>
            </div>
          </div>

          {/* Special Requirements */}
          {formData.vehiclePreference !== 'bike' && (
            <>
              <div className="mb-2">
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
                  <input
                    type="checkbox"
                    checked={formData.requiresWheelchairAccessible}
                    onChange={(e) => setFormData({...formData, requiresWheelchairAccessible: e.target.checked})}
                    style={{width: '20px', height: '20px'}}
                  />
                  <span>Wheelchair Accessible</span>
                </label>
              </div>

              <div className="mb-2">
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
                  <input
                    type="checkbox"
                    checked={formData.requiresPetFriendly}
                    onChange={(e) => setFormData({...formData, requiresPetFriendly: e.target.checked})}
                    style={{width: '20px', height: '20px'}}
                  />
                  <span>Pet Friendly</span>
                </label>
              </div>

              <div className="mb-3">
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem'}}>
                  <input
                    type="checkbox"
                    checked={formData.requiresChildSeat}
                    onChange={(e) => setFormData({...formData, requiresChildSeat: e.target.checked})}
                    style={{width: '20px', height: '20px'}}
                  />
                  <span>Child Seat Required</span>
                </label>
              </div>
            </>
          )}

          <div>
            <label className="text-dim mb-1" style={{fontSize: '0.875rem', display: 'block'}}>
              Special Instructions
            </label>
            <textarea
              className="input"
              rows="3"
              placeholder="Any special requests or notes for the driver..."
              value={formData.specialInstructions}
              onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
            ></textarea>
          </div>
        </div>

        {/* Submit */}
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
              <Navigation size={24} />
              {pricingMode === 'bidding' ? 'Request Bids' : 'Confirm Ride'}
            </>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary w-full mt-2"
          onClick={() => navigate('/rider/dashboard')}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CreateRideRequest;
