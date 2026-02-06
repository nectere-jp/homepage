import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/forms/ContactForm";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "metadata.contact" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: "contact" });

  return (
    <div className="pt-32 md:pt-48 pb-16 md:pb-24 bg-white min-h-screen">
      <Container>
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <h1 className="text-4xl md:text-5xl font-bold text-blue mb-12 text-center">
              {t("title")}
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <ContactForm />
          </ScrollReveal>
        </div>
      </Container>
    </div>
  );
}
