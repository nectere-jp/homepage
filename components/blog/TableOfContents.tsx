"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TocSection {
  h2: TocItem;
  h3Items: TocItem[];
}

interface TableOfContentsProps {
  content: string;
  theme?: "default" | "nobilva";
}

export function TableOfContents({
  content,
  theme = "default",
}: TableOfContentsProps) {
  const [tocSections, setTocSections] = useState<TocSection[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [activeH2Id, setActiveH2Id] = useState<string>("");

  // Markdown から見出しを抽出してセクション分け
  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;
    let headingIndex = 0;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2].trim();

      // 日本語対応のID生成
      let id = text
        .toLowerCase()
        .replace(/[^\w\s\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF-]/g, "") // 日本語を保持
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, ""); // 先頭と末尾のハイフンを削除

      // IDが空の場合はインデックスを使用
      if (!id) {
        id = `heading-${headingIndex}`;
      }

      items.push({ id, text, level });
      headingIndex++;
    }

    // h2とh3をセクション分け
    const sections: TocSection[] = [];
    let currentSection: TocSection | null = null;

    items.forEach((item) => {
      if (item.level === 2) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { h2: item, h3Items: [] };
      } else if (item.level === 3 && currentSection) {
        currentSection.h3Items.push(item);
      }
    });

    if (currentSection) {
      sections.push(currentSection);
    }

    setTocSections(sections);
  }, [content]);

  // スクロール時にアクティブな見出しを更新
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            setActiveId(id);

            // アクティブなh2を見つける
            const section = tocSections.find(
              (s) => s.h2.id === id || s.h3Items.some((h3) => h3.id === id),
            );
            if (section) {
              setActiveH2Id(section.h2.id);
            }
          }
        });
      },
      {
        rootMargin: "-80px 0px -80% 0px",
      },
    );

    // 全ての見出し要素を監視
    const headings = document.querySelectorAll("h2, h3");
    headings.forEach((heading) => observer.observe(heading));

    return () => {
      headings.forEach((heading) => observer.unobserve(heading));
    };
  }, [tocSections]);

  if (tocSections.length === 0) return null;

  const isNobilva = theme === "nobilva";
  const accentColor = isNobilva ? "text-nobilva-accent" : "text-primary";
  const hoverColor = isNobilva
    ? "hover:text-nobilva-accent"
    : "hover:text-primary";

  const scrollToElement = (id: string, offset: number) => {
    const element = document.getElementById(id);
    if (element) {
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="bg-white shadow-lg lg:max-h-[calc(100vh-120px)] rounded-2xl overflow-hidden">
      <nav className="p-6 lg:overflow-y-auto lg:max-h-[calc(100vh-120px)]">
        <div className="space-y-3">
          {tocSections.map((section) => (
            <div key={section.h2.id}>
              {/* h2 */}
              <button
                onClick={() => scrollToElement(section.h2.id, 100)}
                className={`w-full text-left font-medium text-sm transition-colors flex items-center gap-2 ${
                  activeH2Id === section.h2.id
                    ? accentColor
                    : `text-gray-700 ${hoverColor}`
                }`}
              >
                {activeH2Id === section.h2.id ? (
                  <ChevronDown className="w-4 h-4 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 shrink-0" />
                )}
                {section.h2.text}
              </button>

              {/* h3（アクティブなh2の時のみ表示） */}
              {activeH2Id === section.h2.id &&
                section.h3Items.length > 0 && (
                  <ul className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
                    {section.h3Items.map((h3) => (
                      <li key={h3.id}>
                        <button
                          onClick={() => scrollToElement(h3.id, 100)}
                          className={`text-sm transition-colors text-left w-full ${
                            activeId === h3.id
                              ? accentColor
                              : `text-gray-600 ${hoverColor}`
                          }`}
                        >
                          {h3.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
}
