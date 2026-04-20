import { useEffect, useRef, useState } from 'react';

export default function Marquee({ 
  children, 
  speed = 'normal',
  pauseOnHover = true,
  className = ''
}) {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef(null);
  const scrollAmountRef = useRef(1);

  const speeds = {
    slow: 0.5,
    normal: 1,
    fast: 1.5,
    faster: 2
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const animate = () => {
      if (isPaused) return;
      
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollLeft = 0;
      } else {
        container.scrollLeft += speeds[speed] || 1;
      }
    };

    animationRef.current = setInterval(animate, 30);

    return () => {
      if (animationRef.current) {
        clearInterval(animationRef.current);
      }
    };
  }, [speed, isPaused]);

  const handleMouseEnter = () => {
    if (pauseOnHover) setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) setIsPaused(false);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-x-auto scrollbar-hide ${className}`}
      style={{ 
        overflowX: 'auto',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="inline-flex gap-6 py-4">
        {children}
      </div>
    </div>
  );
}

// LogoItem component for marquee
export function MarqueeLogoItem({ name, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group border border-gray-100"
    >
      <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
        <span className="text-indigo-600 font-bold text-sm">{name.charAt(0)}</span>
      </div>
      <span className="text-gray-700 font-medium group-hover:text-indigo-600 transition">
        {name}
      </span>
    </a>
  );
}