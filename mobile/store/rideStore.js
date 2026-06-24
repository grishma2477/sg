import { create } from 'zustand';

export const useRideStore = create((set) => ({
  pickup:          null,
  dropoff:         null,
  stops:           [],
  estimate:        null,
  selectedVehicle: null,

  activeRequestId: null,
  bids:            [],
  selectedBid:     null,

  activeRideId:    null,
  rideStatus:      null,
  driverLocation:  null,
  rideDetails:     null,

  incomingRequests: [],

  setPickup:          (v) => set({ pickup: v }),
  setDropoff:         (v) => set({ dropoff: v }),
  setStops:           (v) => set({ stops: v }),
  setEstimate:        (v) => set({ estimate: v }),
  setSelectedVehicle: (v) => set({ selectedVehicle: v }),

  setActiveRequest: (id) => set({ activeRequestId: id, bids: [], selectedBid: null }),
  addBid: (bid) => set((s) => ({
    bids: s.bids.some(b => b.id === bid.id) ? s.bids : [...s.bids, bid],
  })),

  setActiveRide:    (id, status, details) => set({ activeRideId: id, rideStatus: status, rideDetails: details ?? null }),
  setRideStatus:    (status) => set({ rideStatus: status }),
  setDriverLocation:(loc)    => set({ driverLocation: loc }),
  setRideDetails:   (d)      => set({ rideDetails: d }),

  addIncomingRequest:    (req) => set((s) => ({
    incomingRequests: s.incomingRequests.some(r => r.id === req.id)
      ? s.incomingRequests : [...s.incomingRequests, req],
  })),
  removeIncomingRequest: (id) => set((s) => ({
    incomingRequests: s.incomingRequests.filter(r => r.id !== id),
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
