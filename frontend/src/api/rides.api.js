import { apiRequest } from './apiClient';

// ── Ride Requests ──────────────────────────────────────────────────────────────
export const estimateRide = (body) =>
  apiRequest('/api/ride-requests/estimate', { method: 'POST', body: JSON.stringify(body) });

export const createRideRequest = (body, idempotencyKey) =>
  apiRequest('/api/ride-requests', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Idempotency-Key': idempotencyKey },
  });

export const cancelRideRequest = (requestId) =>
  apiRequest(`/api/ride-requests/${requestId}/cancel`, { method: 'POST' });

export const getNearbyDrivers = (lat, lng, vehicleType = 'bike') =>
  apiRequest(`/api/ride-requests/drivers/nearby?lat=${lat}&lng=${lng}&vehicle_type=${vehicleType}`);

// ── Bidding ────────────────────────────────────────────────────────────────────
export const getBidsForRequest = (requestId) =>
  apiRequest(`/api/bidding/requests/${requestId}/bids`);

export const submitBid = (requestId, body) =>
  apiRequest(`/api/bidding/requests/${requestId}/submit`, { method: 'POST', body: JSON.stringify(body) });

export const acceptBid = (bidId) =>
  apiRequest(`/api/bidding/bids/${bidId}/accept`, { method: 'POST' });

// ── Active Rides ───────────────────────────────────────────────────────────────
export const getRideDetails = (rideId) =>
  apiRequest(`/api/rides/${rideId}`);

export const startRide = (rideId) =>
  apiRequest(`/api/rides/${rideId}/start`, { method: 'POST' });

export const completeRide = (rideId) =>
  apiRequest(`/api/rides/${rideId}/complete`, { method: 'POST' });

export const cancelRide = (rideId, reason) =>
  apiRequest(`/api/rides/${rideId}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) });

export const arriveAtPickup = (rideId) =>
  apiRequest(`/api/rides/${rideId}/arrive`, { method: 'POST' });

export const arriveAtStop = (rideId, stopIndex) =>
  apiRequest(`/api/rides/${rideId}/stops/${stopIndex}/arrive`, { method: 'POST' });

export const departStop = (rideId, stopIndex) =>
  apiRequest(`/api/rides/${rideId}/stops/${stopIndex}/depart`, { method: 'POST' });

// ── Driver: accept fixed-price request ────────────────────────────────────────
export const acceptRideRequest = (requestId) =>
  apiRequest(`/api/rides/requests/${requestId}/accept`, { method: 'POST' });

// ── Review ─────────────────────────────────────────────────────────────────────
export const submitReview = (rideId, body) =>
  apiRequest(`/api/reviews/${rideId}`, { method: 'POST', body: JSON.stringify(body) });

// ── Driver Location ────────────────────────────────────────────────────────────
export const updateDriverLocation = (lat, lng) =>
  apiRequest('/api/ride-requests/drivers/location', {
    method: 'POST',
    body: JSON.stringify({ lat, lng }),
  });

export const setDriverOnlineStatus = (isOnline) =>
  apiRequest('/api/drivers/status', {
    method: 'PUT',
    body: JSON.stringify({ status: isOnline ? 'online' : 'offline' }),
  });
