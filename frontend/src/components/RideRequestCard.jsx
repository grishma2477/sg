import { useState } from "react";

const BID_STEP = 5;

export const RideRequestCard = ({ ride, onAccept }) => {
  const [bid, setBid] = useState(ride.baseFare);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5 mb-5 border-l-4 border-green-500">
      {/* Pickup & Destination */}
      <div className="space-y-2">
        <div>
          <p className="text-xs text-gray-400">PICKUP</p>
          <p className="font-medium">{ride.pickup}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">DESTINATION</p>
          <p className="font-medium">{ride.destination}</p>
        </div>
      </div>

      {/* Rider */}
      <div className="flex justify-between items-center mt-4">
        <div>
          <p className="font-semibold">{ride.riderName}</p>
          <p className="text-sm text-green-600">⭐ {ride.rating}%</p>
        </div>

        <div className="text-right">
          <p className="text-xs text-gray-400">DISTANCE</p>
          <p className="font-semibold">{ride.distance} KM</p>
        </div>
      </div>

      {/* Fare */}
      <div className="flex justify-between items-center mt-4 bg-gray-50 p-3 rounded-lg">
        <div>
          <p className="text-xs text-gray-400">BASE FARE</p>
          <p className="font-semibold">₹{ride.baseFare}</p>
        </div>

        <div>
          <p className="text-xs text-gray-400">BONUS</p>
          <p className="font-semibold text-green-600">+₹{ride.bonus}</p>
        </div>
      </div>

      {/* Bid */}
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => bid > ride.baseFare && setBid(bid - BID_STEP)}
            className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold"
          >
            −
          </button>

          <p className="text-xl font-bold">₹{bid}</p>

          <button
            onClick={() => setBid(bid + BID_STEP)}
            className="w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold"
          >
            +
          </button>
        </div>

        <button
          onClick={() => onAccept(ride.id, bid)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold"
        >
          Accept
        </button>
      </div>

      <p className="text-xs text-gray-400 mt-2">Bid adjusts by ₹5</p>
    </div>
  );
};
