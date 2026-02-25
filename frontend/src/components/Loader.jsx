const Loader = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <div className="relative w-full max-w-xs h-16 overflow-hidden mb-4">
        {/* Road */}
        <div className="absolute bottom-2 left-0 right-0 h-1 bg-gray-300 rounded-full"></div>
        {/* Auto Rickshaw */}
        <div className="auto-loader text-5xl absolute bottom-3">🛺</div>
      </div>
      {/* Tyre tracks */}
      <div className="flex gap-1 mb-3">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 bg-gray-300 rounded-full wheel-spin"
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
      <p className="text-gray-500 font-medium font-[var(--font-heading)]">
        {text}
      </p>
    </div>
  );
};

export default Loader;
