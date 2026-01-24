import { motion } from 'framer-motion';

interface SectionHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionHeader({ children, className }: SectionHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      className={`inline-block mb-6 md:mb-8 ${className || ''}`}
    >
      <h2 className="text-pink text-xl md:text-2xl font-bold tracking-wide relative inline-block">
        {children}
        <motion.span
          className="absolute bottom-0 left-0 h-0.5 bg-pink w-full"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          style={{ originX: 0 }}
        />
      </h2>
    </motion.div>
  );
}
