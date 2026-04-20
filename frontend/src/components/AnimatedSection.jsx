import { useEffect, useRef, useState } from 'react';

export default function AnimatedSection({ 
  children, 
  animation = 'fadeIn', 
  delay = 0,
  className = '' 
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const getAnimationClass = () => {
    if (!isVisible) return 'opacity-0';
    
    switch (animation) {
      case 'fadeIn':
        return 'animate-fadeIn';
      case 'fadeInLeft':
        return 'animate-fadeInLeft';
      case 'fadeInRight':
        return 'animate-fadeInRight';
      case 'scaleUp':
        return 'animate-scaleUp';
      default:
        return 'animate-fadeIn';
    }
  };

  const getDelayClass = () => {
    if (delay === 100) return 'delay-100';
    if (delay === 200) return 'delay-200';
    if (delay === 300) return 'delay-300';
    if (delay === 500) return 'delay-500';
    if (delay === 700) return 'delay-700';
    if (delay === 1000) return 'delay-1000';
    return '';
  };

  return (
    <div
      ref={sectionRef}
      className={`${getAnimationClass()} ${getDelayClass()} ${className}`}
    >
      {children}
    </div>
  );
}