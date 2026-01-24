import { Hero } from '@/components/Hero';
import { ServiceSection } from '@/components/sections/ServiceSection';
import { ContactCTASection } from '@/components/sections/ContactCTASection';

export default function HomePage() {
  return (
    <>
      <Hero />
      <ServiceSection />
      <ContactCTASection />
    </>
  );
}
