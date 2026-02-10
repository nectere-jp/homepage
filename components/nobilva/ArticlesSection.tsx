/**
 * ArticlesSection - 関連記事セクション
 * 
 * Nobilva関連のブログ記事を最大3件表示
 * 記事が3件以上ある場合は「もっと見る」ボタンを表示
 */

import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { NewsCard } from "@/components/cards/NewsCard";
import type { BlogPostMetadata } from "@/lib/blog";

interface ArticlesSectionProps {
  articles: BlogPostMetadata[];
  title: string;
  mainTitle: string;
  viewAllLabel: string;
  noArticlesLabel: string;
  locale: string;
}

export function ArticlesSection({
  articles,
  title,
  mainTitle,
  viewAllLabel,
  noArticlesLabel,
  locale,
}: ArticlesSectionProps) {
  return (
    <Section
      id="articles"
      backgroundColor="transparent"
      className="bg-nobilva-light"
      padding="md"
    >
      <Container>
        <SectionHeader mainTitle={mainTitle} theme="nobilva" />

        {articles.length > 0 ? (
          <>
            {/* 記事カード */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {articles.slice(0, 3).map((article, index) => (
                <NewsCard
                  key={article.slug}
                  title={article.title}
                  date={article.date}
                  excerpt={article.description}
                  thumbnailUrl={article.image}
                  category={article.category}
                  categoryType={article.categoryType}
                  relatedBusiness={article.relatedBusiness}
                  tags={article.tags}
                  href={`/${locale}/blog/${article.slug}`}
                  delay={index * 0.05}
                  theme="nobilva"
                />
              ))}
            </div>

            {/* もっと見るボタン */}
            {articles.length > 3 && (
              <div className="text-center">
                <Link
                  href={`/${locale}/services/nobilva/articles`}
                  className="inline-block px-8 py-4 bg-nobilva-accent text-white font-bold text-lg rounded-none hover:bg-nobilva-main transition-colors shadow-md hover:shadow-lg"
                >
                  {viewAllLabel}
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">{noArticlesLabel}</p>
          </div>
        )}
      </Container>
    </Section>
  );
}
