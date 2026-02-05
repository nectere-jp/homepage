'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CTAButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'solid';
  type?: 'button' | 'submit';
  disabled?: boolean;
  theme?: 'default' | 'nobilva';
}

export function CTAButton({
  children,
  href,
  onClick,
  className,
  variant = 'primary',
  type = 'button',
  disabled = false,
  theme = 'default',
}: CTAButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300';
  
  const colors = {
    default: {
      pink: 'text-pink',
      pinkDark: 'hover:text-pink-dark',
      bg: 'bg-pink',
      bgDark: 'hover:bg-pink-dark',
      rounded: 'rounded-full',
    },
    nobilva: {
      pink: 'text-nobilva-accent',
      pinkDark: 'hover:text-nobilva-accent',
      bg: 'bg-nobilva-main',
      bgDark: 'hover:bg-nobilva-accent',
      rounded: 'rounded-xl',
    }
  };

  const currentTheme = colors[theme];

  const variantClasses = {
    primary: cn(currentTheme.pink, currentTheme.pinkDark),
    secondary: 'text-blue hover:text-blue/80',
    solid: cn(currentTheme.bg, 'text-white px-8 py-3 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0', currentTheme.bgDark, currentTheme.rounded),
  };

  const content = variant === 'solid' ? (
    children
  ) : (
    <motion.span
      whileHover={{ x: 6 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-3"
    >
      <span className={cn("flex items-center justify-center w-5 h-5 text-white text-xs", currentTheme.bg, currentTheme.rounded)}>
        →
      </span>
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(baseClasses, variantClasses[variant], className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {content}
    </button>
  );
}
