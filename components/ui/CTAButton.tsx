'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CTAButtonProps {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary';
  type?: 'button' | 'submit';
  disabled?: boolean;
}

export function CTAButton({
  children,
  href,
  onClick,
  className,
  variant = 'primary',
  type = 'button',
  disabled = false,
}: CTAButtonProps) {
  const baseClasses = 'inline-flex items-center gap-2 font-semibold transition-all duration-300';
  const variantClasses = {
    primary: 'text-pink hover:text-pink-dark',
    secondary: 'text-blue hover:text-blue/80',
  };

  const content = (
    <motion.span
      whileHover={{ x: 6 }}
      transition={{ duration: 0.3 }}
      className="flex items-center gap-2"
    >
      {children}
      <span className="text-lg">→</span>
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
