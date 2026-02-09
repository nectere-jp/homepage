import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NewsCard } from "@/components/cards/NewsCard";
import { getAllPosts } from "@/lib/blog";

interface NewsSectionProps {
  locale: string;
}

export async function NewsSection({ locale }: NewsSectionProps) {
  const posts = await getAllPosts(locale);
  const latestPosts = posts.slice(0, 3);
  const t = await getTranslations({ locale, namespace: "news" });

  if (latestPosts.length === 0) {
    return null;
  }

  return (
    <Section backgroundColor="pink-light" padding="md">
      <Container>
        <SectionHeader
          mainTitle={locale === "ja" ? t("subtitle") : t("title")}
          accentTitle={t("title")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {latestPosts.map((post, index) => (
            <NewsCard
              key={post.slug}
              title={post.title}
              date={post.date}
              excerpt={post.description}
              thumbnailUrl={post.image}
              category={post.category}
              href={`/${locale}/blog/${post.slug}`}
              delay={index * 100}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/blog`}
            className="inline-block px-8 py-3 bg-pink text-white font-semibold rounded-full hover:bg-pink/90 transition-colors"
          >
            {t("viewAll")}
          </Link>
        </div>
      </Container>
    </Section>
  );
}
