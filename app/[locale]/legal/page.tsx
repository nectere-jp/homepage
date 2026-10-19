import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getLegalDocument } from "@/lib/legal";
import { getAlternatesLanguages, getCanonicalUrl } from "@/lib/seo";
import type { Metadata } from "next";

const LEGAL_INDEX: Array<{ slug: string[]; category: string }> = [
  { slug: ["privacy-policy"], category: "全サービス共通" },
  { slug: ["nobilva", "terms-of-service"], category: "Nobilva" },
  { slug: ["nobilva", "commercial-disclosure"], category: "Nobilva" },
  { slug: ["teach-it", "terms-of-service"], category: "Teach It" },
  { slug: ["okitegami", "terms-of-service"], category: "おきてがみ" },
];

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  await props.params;
  return {
    title: "法務情報 | Nectere",
    description:
      "Nectere が提供する各サービスのプライバシーポリシー、利用規約、特定商取引法に基づく表記の一覧です。",
    alternates: {
      canonical: getCanonicalUrl("/legal"),
      languages: getAlternatesLanguages("/legal"),
    },
  };
}

export default async function LegalIndexPage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  const entries = await Promise.all(
    LEGAL_INDEX.map(async ({ slug, category }) => {
      const doc = await getLegalDocument(slug, locale);
      return doc ? { slug, category, doc } : null;
    }),
  );
  const valid = entries.filter((e): e is NonNullable<typeof e> => e !== null);

  const grouped = valid.reduce<Record<string, typeof valid>>((acc, entry) => {
    (acc[entry.category] ||= []).push(entry);
    return acc;
  }, {});

  return (
    <div className="bg-white min-h-screen">
      <Container>
        <div className="pt-32 md:pt-48 pb-16 md:pb-24 max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12 md:mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue mb-5 md:mb-6 tracking-tight">
              法務情報
            </h1>
            <p className="text-base md:text-lg text-text/70">
              Nectere が提供する各サービスのプライバシーポリシー、利用規約、特定商取引法に基づく表記の一覧です。
            </p>
          </div>

          <div className="space-y-10">
              {Object.entries(grouped).map(([category, items]) => (
                <section key={category}>
                  <h2 className="text-xl font-bold text-text/80 mb-4 pb-2 border-b border-gray-200">
                    {category}
                  </h2>
                  <ul className="space-y-3">
                    {items.map(({ slug, doc }) => (
                      <li key={slug.join("/")}>
                        <Link
                          href={`/${locale}/legal/${slug.join("/")}`}
                          className="block border border-gray-200 rounded-lg p-4 hover:border-pink hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-semibold text-blue">{doc.title}</p>
                          {doc.description && (
                            <p className="text-sm text-text/70 mt-1 leading-relaxed">
                              {doc.description}
                            </p>
                          )}
                          {doc.lastUpdated && (
                            <p className="text-xs text-text/50 mt-2">
                              最終更新：
                              {new Date(doc.lastUpdated).toLocaleDateString("ja-JP", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
        </div>
      </Container>
    </div>
  );
}
