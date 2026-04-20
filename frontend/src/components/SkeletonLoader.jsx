export default function SkeletonLoader({ type = 'card', count = 1 }) {
  const skeletons = {
    card: (
      <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
        <div className="flex items-start justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded-lg w-3/4"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="flex gap-2 mt-4">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    ),
    project: (
      <div className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 rounded-lg w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    ),
    task: (
      <div className="bg-white rounded-lg p-4 shadow-sm animate-pulse">
        <div className="flex items-start justify-between">
          <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
        <div className="flex gap-2 mt-3">
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
          <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
        </div>
      </div>
    )
  };

  const skeletonElement = skeletons[type] || skeletons.card;

  return (
    <div className="space-y-4">
      {Array(count).fill().map((_, i) => (
        <div key={i}>{skeletonElement}</div>
      ))}
    </div>
  );
}