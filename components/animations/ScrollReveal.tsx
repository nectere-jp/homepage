'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

const animationStyles = `
  @keyframes scrollRevealUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes scrollRevealDown {
    from {
      opacity: 0;
      transform: translateY(-30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes scrollRevealLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes scrollRevealRight {
    from {
      opacity: 0;
      transform: translateX(30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .scroll-reveal-up {
    animation: scrollRevealUp 0.6s ease-out forwards;
  }
  .scroll-reveal-down {
    animation: scrollRevealDown 0.6s ease-out forwards;
  }
  .scroll-reveal-left {
    animation: scrollRevealLeft 0.6s ease-out forwards;
  }
  .scroll-reveal-right {
    animation: scrollRevealRight 0.6s ease-out forwards;
  }
  .scroll-reveal-hidden {
    opacity: 0;
  }
`;

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = 'up',
}: ScrollRevealProps) {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
    rootMargin: '0px 0px -10% 0px',
  });
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (inView) {
      timeoutRef.current = setTimeout(() => {
        setShouldAnimate(true);
      }, delay * 1000);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inView, delay]);

  const animationClass = shouldAnimate
    ? `scroll-reveal-${direction}`
    : 'scroll-reveal-hidden';

  return (
    <>
      <style jsx global>{animationStyles}</style>
      <div
        ref={ref}
        className={`${animationClass} ${className || ''}`}
        style={{
          willChange: shouldAnimate ? 'auto' : 'transform, opacity',
        }}
      >
        {children}
      </div>
    </>
  );
}
