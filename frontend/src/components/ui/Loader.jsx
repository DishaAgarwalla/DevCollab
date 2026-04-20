export default function Loader({ size = 'md', fullScreen = false }) {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const LoaderSpinner = () => (
    <div className="relative">
      <div className={`${sizes[size]} border-4 border-gray-200 rounded-full animate-spin border-t-primary-600`}></div>
      <div className={`absolute inset-0 ${sizes[size]} border-4 border-transparent rounded-full animate-pulse`}></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        <LoaderSpinner />
      </div>
    );
  }

  return <LoaderSpinner />;
}