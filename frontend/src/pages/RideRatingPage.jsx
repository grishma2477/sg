import { useState } from "react";
import { StarRating } from "../components/StarRating";
import { TagSelector } from "../components/TagSelector";
import { SafetyConcernModal } from "../components/SafetyConcernModal";

const STAR_IMPACT = {
  5: 2,
  4: 1,
  3: 0,
  2: -10,
  1: -20,
};

export const RideRatingPage = () => {
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const impact = STAR_IMPACT[rating] ?? 0;

  const handleSubmit = () => {
    const payload = {
      rating,
      tags: selectedTags,
      impactScore: impact,
    };

    console.log("Rating Submitted:", payload);

    // POST /ride/rate
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-center">Rate Your Ride</h2>

        <StarRating rating={rating} setRating={setRating} />

        {rating > 0 && (
          <p className="text-center text-sm text-gray-500">
            Impact Score: {impact}
          </p>
        )}

        <TagSelector
          rating={rating}
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
        />

        {/* Safety Button */}
        <button
          onClick={() => setShowSafetyModal(true)}
          className="w-full mt-4 border border-red-500 text-red-600 py-2 rounded-lg"
        >
          Report Safety Concern
        </button>

        {/* Submit */}
        <button
          disabled={rating === 0}
          onClick={handleSubmit}
          className="w-full mt-4 bg-green-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300"
        >
          Submit Rating
        </button>
      </div>

      <SafetyConcernModal
        open={showSafetyModal}
        onClose={() => setShowSafetyModal(false)}
      />
    </div>
  );
};
