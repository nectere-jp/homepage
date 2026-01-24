import { useTranslations } from 'next-intl';
import { ContactForm } from '@/components/forms/ContactForm';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { BaseCard } from '@/components/ui/BaseCard';
import { ScrollReveal } from '@/components/animations/ScrollReveal';

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <div className="py-16 md:py-24 bg-beige min-h-screen">
      <div className="container mx-auto px-4 md:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-bold text-blue mb-8 text-center">
              {t('title')}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <BaseCard>
              <ContactForm />
            </BaseCard>
          </ScrollReveal>

          <ScrollReveal delay={0.4}>
            <div className="mt-12 text-center">
              <BaseCard>
                <h2 className="text-xl font-bold text-blue mb-4">連絡先情報</h2>
                <p className="text-gray-700 mb-2">
                  <strong>住所:</strong> [要確認]
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>電話:</strong> [要確認]
                </p>
                <p className="text-gray-700">
                  <strong>メール:</strong> [要確認]
                </p>
              </BaseCard>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
