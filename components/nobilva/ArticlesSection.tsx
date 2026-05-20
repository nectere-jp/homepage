import { NewsCard } from "@/components/cards/NewsCard";
import { wb } from "@/lib/wb";
import type { BlogPostMetadata } from "@/lib/blog";
import { OutlineLink } from "./OutlineLink";
import { SectionHeading } from "./SectionHeading";

interface ArticlesSectionProps {
  articles: BlogPostMetadata[];
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  return (
    <section id="articles" className="bg-nobilva-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-12 md:mb-16">
          <SectionHeading className="mb-4">お役立ち情報</SectionHeading>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            {wb("野球と勉強の両立、/進路の選び方、/習慣づくりのヒント。")}
            <br className="hidden md:inline" />
            {wb("Nobilva のメンターが、/保護者の方と中高生に向けて/発信しています。")}
          </p>
        </div>

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
      </div>
    </section>
  );
}
