import { Hero } from '@/components/Hero';
import { ServiceSection } from '@/components/sections/ServiceSection';
import { ContactCTASection } from '@/components/sections/ContactCTASection';
import { HistorySection } from '@/components/sections/HistorySection';
import { getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'metadata.home' });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceSection />
      <HistorySection />
      <ContactCTASection />
    </>
  );
}
