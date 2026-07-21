import { NewsCard } from "@/components/cards/NewsCard";
import type { BlogPostMetadata } from "@/lib/blog";
import { OutlineLink } from "./OutlineLink";
import { Section } from "./Section";
import { SectionHeading } from "./SectionHeading";

interface ArticlesSectionProps {
  articles: BlogPostMetadata[];
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  return (
    <Section bg="light" id="articles">
      <SectionHeading center>お役立ち情報</SectionHeading>

      {articles.length > 0 ? (
        <>
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
                href={`/ja/blog/${article.slug}`}
                delay={index * 0.05}
                theme="nobilva"
              />
            ))}
          </div>

          {articles.length > 3 && (
            <div className="text-center">
              <OutlineLink href="/ja/services/nobilva/articles">
                お役立ち情報をもっと見る
              </OutlineLink>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">記事の準備中です。</p>
        </div>
      )}
    </Section>
  );
}
