export const SafetyConcernModal = ({ open, onClose }) => {
  if (!open) return null;

  const concerns = [
    "Reckless Driving",
    "Harassment",
    "Wrong Route",
    "Vehicle Issue",
    "Other",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-80">
        <h3 className="text-lg font-semibold mb-4">Safety Concern</h3>

        <div className="space-y-2">
          {concerns.map((c) => (
            <button
              key={c}
              className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              {c}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-lg"
        >
          Close
        </button>
      </div>
    </div>
  );
};
