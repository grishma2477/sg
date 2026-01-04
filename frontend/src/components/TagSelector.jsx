const positiveTags = [
  "Polite",
  "Smooth Ride",
  "On Time",
  "Clean Vehicle",
  "Friendly",
];

const negativeTags = [
  "Rude",
  "Late Arrival",
  "Unsafe Driving",
  "Dirty Vehicle",
  "Ignored Route",
];

export const TagSelector = ({ rating, selectedTags, setSelectedTags }) => {
  const tags = rating >= 4 ? positiveTags : negativeTags;

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center my-4">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggleTag(tag)}
          className={`px-4 py-2 rounded-full border text-sm transition
            ${
              selectedTags.includes(tag)
                ? "bg-green-600 text-white border-green-600"
                : "bg-white border-gray-300 text-gray-700"
            }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};
