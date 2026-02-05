'use client';

import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';

export function FixedCTAButton() {
  const t = useTranslations('nobilva');
  const locale = useLocale();
  const isJapanese = locale === 'ja';

  return (
    <div className="fixed right-0 bottom-0 z-50 hidden lg:flex items-center">
      {/* Arrow Icon - Left side (outside) */}
      <motion.div
        animate={{
          x: [0, -8, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-nobilva-accent"
      >
        <svg className="w-8 h-8 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
        </svg>
      </motion.div>
      {/* CTA Button */}
      <a
        href="#pricing"
        className={`flex items-center justify-center bg-gradient-to-b from-nobilva-accent to-nobilva-accent/80 text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
          isJapanese ? 'flex-col px-6 py-10' : 'px-8 py-6'
        }`}
        style={isJapanese ? { writingMode: 'vertical-rl', textOrientation: 'upright' } : {}}
      >
        <div className="text-white font-bold text-lg whitespace-nowrap">
          {t('hero.ctaButton')}
        </div>
      </a>
    </div>
  );
}
