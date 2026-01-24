import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <motion.h2
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={`text-pink text-lg md:text-xl font-semibold mb-4 ${className || ''}`}
    >
      {children}
    </motion.h2>
  );
}
