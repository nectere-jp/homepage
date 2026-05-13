import Link from "next/link";
import { NewsCard } from "@/components/cards/NewsCard";
import type { BlogPostMetadata } from "@/lib/blog";

interface ArticlesSectionProps {
  articles: BlogPostMetadata[];
}

export function ArticlesSection({ articles }: ArticlesSectionProps) {
  return (
    <section id="articles" className="bg-nobilva-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight inline-block mb-4">
            お役立ち情報
          </h2>
          <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            野球と勉強の両立、進路の選び方、習慣づくりのヒント。
            <br className="hidden md:inline" />
            Nobilva のメンターが、保護者の方と中高生に向けて発信しています。
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
                <Link
                  href="/ja/services/nobilva/articles"
                  className="inline-flex items-center gap-2 text-nobilva-accent font-bold hover:underline text-base md:text-lg"
                >
                  お役立ち情報をもっと見る
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
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
