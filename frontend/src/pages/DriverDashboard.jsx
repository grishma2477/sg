import { useState } from "react";
import { RideRequestCard } from "../components/RideRequestCard";
import { OnlineToggle } from "../components/OnlineToggle";

export const rideRequests = [
  {
    id: 1,
    pickup: "Gulshan Club, Road 49, Kemal Ataturk Avenue",
    destination: "Banani DCC Market, Road 17 E, Banani",
    riderName: "Md Shahadat Hossain",
    rating: 98,
    baseFare: 225,
    distance: 0.5,
    bonus: 25,
  },
  {
    id: 2,
    pickup: "Dhanmondi 27",
    destination: "New Market",
    riderName: "Rahim Uddin",
    rating: 95,
    baseFare: 180,
    distance: 1.2,
    bonus: 20,
  },
];


export const DriverDashboard = () => {
  const [isOnline, setIsOnline] = useState(true);

  const handleAcceptRide = (rideId, bidAmount) => {
    console.log("Ride Accepted:", rideId, bidAmount);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 rounded-2xl mb-4">
        <h1 className="text-xl font-bold">Sajilo Gaadi</h1>
        <p className="text-sm">Driver Dashboard</p>
      </div>

      {/* Online Toggle */}
      <OnlineToggle isOnline={isOnline} setIsOnline={setIsOnline} />

      {/* Earnings */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          ["Total Earnings", "₹1,821.55"],
          ["Trips", "18"],
          ["Rating", "94%"],
          ["Completion", "94%"],
        ].map(([label, value]) => (
          <div key={label} className="bg-white p-3 rounded-xl shadow">
            <p className="text-xs text-gray-400">{label}</p>
            <p className="font-bold text-lg">{value}</p>
          </div>
        ))}
      </div>

      {/* Ride Requests */}
      <h2 className="text-lg font-semibold mb-3">Ride Requests</h2>

      {!isOnline ? (
        <div className="bg-white p-6 rounded-xl text-center text-gray-500 shadow">
          You are offline. Go online to receive ride requests.
        </div>
      ) : (
        rideRequests.map((ride) => (
          <RideRequestCard
            key={ride.id}
            ride={ride}
            onAccept={handleAcceptRide}
          />
        ))
      )}
    </div>
  );
};
