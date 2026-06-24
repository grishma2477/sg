import { apiGet, apiPost, apiPut } from './client';

export const estimateRide         = (body)            => apiPost('/api/ride-requests/estimate', body);
export const createRideRequest    = (body)            => apiPost('/api/ride-requests', body);
export const cancelRideRequest    = (id)              => apiPost(`/api/ride-requests/${id}/cancel`);
export const getNearbyDrivers     = (lat, lng, type)  => apiGet('/api/ride-requests/drivers/nearby', { lat, lng, vehicle_type: type });

export const getBidsForRequest    = (requestId)       => apiGet(`/api/bidding/requests/${requestId}/bids`);
export const submitBid            = (requestId, body) => apiPost(`/api/bidding/requests/${requestId}/submit`, body);
export const acceptBid            = (bidId)           => apiPost(`/api/bidding/bids/${bidId}/accept`);

export const getRideDetails       = (rideId)          => apiGet(`/api/rides/${rideId}`);
export const startRide            = (rideId)          => apiPost(`/api/rides/${rideId}/start`);
export const completeRide         = (rideId)          => apiPost(`/api/rides/${rideId}/complete`);
export const cancelRide           = (rideId, reason)  => apiPost(`/api/rides/${rideId}/cancel`, { reason });
export const arriveAtPickup       = (rideId)          => apiPost(`/api/rides/${rideId}/arrive`);
export const arriveAtStop         = (rideId, idx)     => apiPost(`/api/rides/${rideId}/stops/${idx}/arrive`);
export const departStop           = (rideId, idx)     => apiPost(`/api/rides/${rideId}/stops/${idx}/depart`);

export const submitReview         = (rideId, body)    => apiPost(`/api/reviews/${rideId}`, body);
export const updateDriverLocation = (lat, lng)        => apiPost('/api/ride-requests/drivers/location', { lat, lng });
export const setDriverOnlineStatus= (isOnline)        => apiPut('/api/drivers/status', { status: isOnline ? 'online' : 'offline' });
