import { create } from 'zustand';

export const useRideStore = create((set) => ({
  // Destination planning
  pickup:          null,   // { address, lat, lng }
  dropoff:         null,   // { address, lat, lng }
  stops:           [],     // [{ address, lat, lng }]
  estimate:        null,   // { bike: {min, max, eta}, car: {...}, suv: {...} }
  selectedVehicle: null,   // 'bike' | 'car' | 'suv'

  // Active request (bidding mode)
  activeRequestId: null,
  bids:            [],
  selectedBid:     null,

  // Active ride
  activeRideId:    null,
  rideStatus:      null,   // 'driver_en_route' | 'arrived' | 'in_progress' | 'completed'
  driverLocation:  null,   // { lat, lng }
  rideDetails:     null,   // full ride object

  // Driver's incoming requests
  incomingRequests: [],

  setPickup:          (pickup)  => set({ pickup }),
  setDropoff:         (dropoff) => set({ dropoff }),
  setStops:           (stops)   => set({ stops }),
  setEstimate:        (estimate) => set({ estimate }),
  setSelectedVehicle: (v)       => set({ selectedVehicle: v }),

  setActiveRequest: (id)  => set({ activeRequestId: id, bids: [], selectedBid: null }),
  addBid:           (bid) => set((s) => ({
    bids: s.bids.some(b => b.id === bid.id) ? s.bids : [...s.bids, bid]
  })),
  setSelectedBid:   (bid)    => set({ selectedBid: bid }),

  setActiveRide:    (id, status, details) => set({ activeRideId: id, rideStatus: status, rideDetails: details ?? null }),
  setRideStatus:    (status)  => set({ rideStatus: status }),
  setDriverLocation:(loc)     => set({ driverLocation: loc }),
  setRideDetails:   (details) => set({ rideDetails: details }),

  addIncomingRequest:    (req) => set((s) => ({
    incomingRequests: s.incomingRequests.some(r => r.id === req.id)
      ? s.incomingRequests
      : [...s.incomingRequests, req]
  })),
  removeIncomingRequest: (id) => set((s) => ({
    incomingRequests: s.incomingRequests.filter(r => r.id !== id)
  })),

  clearRide: () => set({
    activeRequestId: null, activeRideId: null,
    bids: [], selectedBid: null,
    rideStatus: null, driverLocation: null, rideDetails: null,
  }),

  clearDestination: () => set({
    pickup: null, dropoff: null, stops: [],
    estimate: null, selectedVehicle: null,
  }),
}));
