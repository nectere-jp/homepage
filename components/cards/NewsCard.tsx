"use client";

import Image from "next/image";
import Link from "next/link";
import { BaseCard } from "../ui/BaseCard";
import { ScrollReveal } from "../animations/ScrollReveal";
import { Badge } from "../ui/Badge";
import { formatDate, cn } from "@/lib/utils";

interface NewsCardProps {
  title: string;
  date: Date | string;
  excerpt?: string;
  thumbnailUrl?: string;
  category?: string;
  categoryType?: "article" | "press-release" | "other";
  relatedBusiness?: string[];
  tags?: string[];
  href: string;
  delay?: number;
  className?: string;
  layout?: "horizontal" | "vertical";
  theme?: "default" | "nobilva";
}

export function NewsCard({
  title,
  date,
  excerpt,
  thumbnailUrl,
  category,
  categoryType,
  relatedBusiness,
  tags,
  href,
  delay = 0,
  className,
  layout = "vertical",
  theme = "default",
}: NewsCardProps) {
  const formattedDate = formatDate(date);
  const isNobilva = theme === "nobilva";

  const getBusinessLabel = (business: string) => {
    switch (business) {
      case "translation":
        return "翻訳";
      case "web-design":
        return "Web制作";
      case "print":
        return "印刷物";
      case "nobilva":
        return "Nobilva";
      case "teachit":
        return "Teachit";
      default:
        return business;
    }
  };

  return (
    <ScrollReveal delay={delay} direction="up">
      <Link href={href} className="block group">
        <BaseCard
          className={cn("h-full transition-shadow hover:shadow-xl", className)}
          rounded={isNobilva ? "none" : "3xl"}
        >
          <div
            className={cn(
              "space-y-4",
              layout === "horizontal" && "md:flex md:items-start md:gap-4",
            )}
          >
            <div
              className={cn(
                "relative w-full overflow-hidden bg-gray-100",
                isNobilva ? "rounded-none" : "rounded-2xl",
                layout === "horizontal"
                  ? "md:w-48 md:flex-shrink-0 aspect-video md:aspect-[4/3]"
                  : "aspect-video",
              )}
            >
              {thumbnailUrl ? (
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes={
                    layout === "horizontal"
                      ? "(max-width: 768px) 100vw, 192px"
                      : "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              {/* バッジセクション */}
              {((!isNobilva && categoryType) ||
                (!isNobilva &&
                  relatedBusiness &&
                  relatedBusiness.length > 0)) && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* 記事タイプバッジ (Nobilvaテーマでは非表示) */}
                  {!isNobilva && categoryType && (
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${
                        categoryType === "article"
                          ? "bg-blue-100 text-blue-700"
                          : categoryType === "press-release"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {categoryType === "article"
                        ? "お役立ち"
                        : categoryType === "press-release"
                          ? "プレス"
                          : "その他"}
                    </span>
                  )}

                  {/* 関連事業バッジ (Nobilvaテーマでは非表示) */}
                  {!isNobilva &&
                    relatedBusiness &&
                    relatedBusiness.length > 0 && (
                      <>
                        {relatedBusiness.map((business) => (
                          <span
                            key={business}
                            className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-700"
                          >
                            {getBusinessLabel(business)}
                          </span>
                        ))}
                      </>
                    )}
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs md:text-sm text-caption mb-2">
                    <time
                      dateTime={
                        typeof date === "string" ? date : date.toISOString()
                      }
                    >
                      {formattedDate}
                    </time>
                    {category && (
                      <>
                        <span>•</span>
                        <Badge variant="secondary">{category}</Badge>
                      </>
                    )}
                  </div>
                  <h3
                    className={`text-lg md:text-xl font-semibold line-clamp-2 transition-colors ${
                      isNobilva
                        ? "text-gray-900 group-hover:text-nobilva-accent"
                        : "text-blue group-hover:text-primary"
                    }`}
                  >
                    {title}
                  </h3>
                </div>
              </div>

              {excerpt && (
                <p className="text-caption text-sm leading-relaxed line-clamp-3">
                  {excerpt}
                </p>
              )}

              {/* タグ */}
              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className={`px-2 py-1 text-xs ${
                        isNobilva
                          ? "rounded-none bg-nobilva-light text-nobilva-accent"
                          : "rounded bg-gray-100 text-gray-600"
                      }`}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </BaseCard>
      </Link>
    </ScrollReveal>
  );
}
