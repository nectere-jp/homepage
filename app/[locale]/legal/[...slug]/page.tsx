import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Container } from "@/components/layout/Container";
import { BusinessInfo } from "@/components/legal/BusinessInfo";
import { ContactInfo } from "@/components/legal/ContactInfo";
import { getLegalDocument } from "@/lib/legal";
import { remarkBusinessPlugin } from "@/lib/remark-business-plugin";
import { getAlternatesLanguages, getCanonicalUrl } from "@/lib/seo";
import type { ServiceKey } from "@/lib/business";
import type { Metadata } from "next";

export async function generateMetadata(props: {
  params: Promise<{ locale: string; slug: string[] }>;
}): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const doc = await getLegalDocument(slug, locale);
  if (!doc) return {};

  const path = `/legal/${slug.join("/")}`;
  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: getCanonicalUrl(path),
      languages: getAlternatesLanguages(path),
    },
  };
}

export default async function LegalPage(props: {
  params: Promise<{ locale: string; slug: string[] }>;
}) {
  const { locale, slug } = await props.params;
  const doc = await getLegalDocument(slug, locale);

  if (!doc) notFound();

  const lastUpdatedText = doc.lastUpdated
    ? `最終更新日: ${new Date(doc.lastUpdated).toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`
    : null;

  return (
    <div className="bg-white min-h-screen">
      <Container>
        <div className="pt-32 md:pt-48 pb-16 md:pb-24 max-w-4xl mx-auto px-4 md:px-8">
          <div className="mb-12 md:mb-16">
            {doc.app && (
              <p className="text-sm md:text-base text-text/50 mb-2">{doc.app}</p>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue mb-5 md:mb-6 tracking-tight">
              {doc.title}
            </h1>
            {doc.description && (
              <p className="text-base md:text-lg text-text/70 mb-4">{doc.description}</p>
            )}
            {lastUpdatedText && (
              <p className="text-sm md:text-base text-text/60">{lastUpdatedText}</p>
            )}
          </div>

          <div className="prose prose-lg max-w-none text-text leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBusinessPlugin]}
                components={{
                  div: ({ className, children, ...props }) => {
                    if (className?.includes("legal-block-business-info")) {
                      return <BusinessInfo />;
                    }
                    if (className?.includes("legal-block-contact-info")) {
                      const serviceMatch = className.match(/legal-contact-service-([a-zA-Z]+)/);
                      const service = serviceMatch?.[1] as ServiceKey | undefined;
                      return <ContactInfo service={service} />;
                    }
                    return (
                      <div className={className} {...props}>
                        {children}
                      </div>
                    );
                  },
                }}
              >
                {doc.content}
              </ReactMarkdown>
            </div>
        </div>
      </Container>
    </div>
  );
}
