import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { getAlternatesLanguages, getCanonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "キミセン - 現在準備中 | Nectere",
    description:
      "キミセン は Nectere の新サービスです。現在準備中。公開まで今しばらくお待ちください。",
    alternates: {
      canonical: getCanonicalUrl("/services/kimisen"),
      languages: getAlternatesLanguages("/services/kimisen"),
    },
  };
}

export default function KimisenPage() {
  return (
    <Section backgroundColor="white" padding="lg">
      <Container>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 py-16">
          <p className="text-sm font-semibold text-caption tracking-wider uppercase">
            Nectere
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-text tracking-tight">
            キミセン
          </h1>
          <p className="text-xl md:text-2xl text-text/80">現在準備中</p>
          <p className="text-sm text-caption max-w-md leading-relaxed pt-4">
            公開まで今しばらくお待ちください。
          </p>
        </div>
      </Container>
    </Section>
  );
}
