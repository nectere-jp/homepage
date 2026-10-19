import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { getAlternatesLanguages, getCanonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Teach It - 現在準備中 | Nectere",
    description:
      "Teach It は Nectere が提供する学習アプリです。サービス紹介ページは現在準備中。",
    alternates: {
      canonical: getCanonicalUrl("/services/teachit"),
      languages: getAlternatesLanguages("/services/teachit"),
    },
  };
}

export default function TeachitPage() {
  return (
    <Section backgroundColor="white" padding="lg">
      <Container>
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 py-16">
          <p className="text-sm font-semibold text-caption tracking-wider uppercase">
            Nectere
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-text tracking-tight">
            Teach It
          </h1>
          <p className="text-xl md:text-2xl text-text/80">現在準備中</p>
          <p className="text-sm text-caption max-w-md leading-relaxed pt-4">
            Teach It は App Store で配信中の学習アプリです。サービス紹介ページは現在準備中。
          </p>
        </div>
      </Container>
    </Section>
  );
}
