import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Container } from "@/components/layout/Container";
import { CTAButton } from "@/components/ui/CTAButton";
import { getAlternatesLanguages, getCanonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { HiCheckCircle } from "react-icons/hi";

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({
    locale,
    namespace: "metadata.contactComplete",
  });

  return {
    title: t("title"),
    description: t("description"),
    alternates: { canonical: getCanonicalUrl("/contact/complete"), languages: getAlternatesLanguages("/contact/complete") },
  };
}

export default async function ContactCompletePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations({ locale, namespace: "contact.complete" });
  const tContact = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="pt-32 md:pt-48 pb-16 md:pb-24 bg-white min-h-screen flex flex-col">
      <Container className="flex-1 flex flex-col">
        <div className="max-w-2xl mx-auto flex-1 flex flex-col w-full">
          <ScrollReveal>
            <div className="text-center mb-10">
              <div className="flex justify-center mb-8">
                <HiCheckCircle className="w-20 h-20 text-green-500" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-blue mb-6">
                {t("title")}
              </h1>
              <p className="text-lg text-gray-600 mb-12">{t("message")}</p>
            </div>

            {/* 営業時間のご案内のみ */}
            <div className="mb-12 p-6 md:p-8 rounded-2xl bg-gray-50 border border-gray-100 text-left">
              <section>
                <h2 className="text-lg font-bold text-blue mb-2">
                  {tContact("businessHoursGuide")}
                </h2>
                <p className="text-text">{tContact("businessHours")}</p>
                <p className="mt-1 text-text text-sm">
                  {tContact("responseTime")}
                </p>
              </section>
            </div>

            {/* ボタン: 上下左右中央揃え */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href={`/${locale}`}>
                  <CTAButton variant="solid" className="w-full sm:w-auto min-w-[200px]">
                    {t("backToHome")}
                  </CTAButton>
                </Link>
                <Link href={`/${locale}/contact`}>
                  <CTAButton variant="outline" className="w-full sm:w-auto min-w-[200px]">
                    {t("backToContact")}
                  </CTAButton>
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </Container>
    </div>
  );
}
