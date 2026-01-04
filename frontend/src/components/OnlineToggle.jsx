export const OnlineToggle = ({ isOnline, setIsOnline }) => {
  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow mb-4">
      <div>
        <p className="text-sm text-gray-500">Driver Status</p>
        <p
          className={`font-semibold ${
            isOnline ? "text-green-600" : "text-red-500"
          }`}
        >
          {isOnline ? "ONLINE" : "OFFLINE"}
        </p>
      </div>

      {/* Toggle */}
      <button
        onClick={() => setIsOnline(!isOnline)}
        className={`w-14 h-8 flex items-center rounded-full p-1 transition ${
          isOnline ? "bg-green-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`bg-white w-6 h-6 rounded-full shadow transform transition ${
            isOnline ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
};
