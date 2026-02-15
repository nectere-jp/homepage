"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./ui/LanguageSwitcher";
import { MobileMenu } from "./ui/MobileMenu";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import {
  NAV_ITEMS,
  NOBILVA_NAV_ITEMS,
  TEACHIT_NAV_ITEMS,
} from "@/lib/navigation";
import { Container } from "./layout/Container";
import { useMemo, useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { useBusiness } from "@/contexts/BusinessContext";

export function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const { business } = useBusiness();

  // NobilvaのLPかどうかを判定（メモ化）
  // blogページの場合はBusinessContextも確認
  const isNobilva = useMemo(
    () => pathname?.includes("/services/nobilva") || business === "nobilva",
    [pathname, business],
  );

  // Teach ITのLPかどうかを判定（メモ化）
  const isTeachIt = useMemo(
    () => pathname?.includes("/services/teachit") || business === "teachit",
    [pathname, business],
  );

  // ブログページかどうかを判定（メモ化）
  const isBlogPage = useMemo(
    () => pathname?.includes("/blog"),
    [pathname],
  );

  const navItems = useMemo(() => {
    if (isNobilva) return NOBILVA_NAV_ITEMS;
    if (isTeachIt) return TEACHIT_NAV_ITEMS;
    return NAV_ITEMS;
  }, [isNobilva, isTeachIt]);

  const logoSrc = useMemo(() => {
    if (isNobilva) return "/images/logo_nobilva.png";
    return "/images/logo.png";
  }, [isNobilva]);

  // スクロール時の状態更新
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
    // Nobilvaページでは、スクロール量が200px以上になったらHeaderを表示
    if (isNobilva) {
      setShowHeader(latest > 200);
    }
  });

  // Nobilvaページの初期状態設定
  useEffect(() => {
    if (isNobilva) {
      setShowHeader(false);
    } else {
      setShowHeader(true);
    }
  }, [isNobilva]);

  // アクティブなセクションの検出（Nobilva/Teach IT LPの場合）
  // IntersectionObserverを使用してリフローを回避
  useEffect(() => {
    if (!isNobilva && !isTeachIt) return;

    const sections = navItems
      .filter((item) => item.href.includes("#"))
      .map((item) => {
        const hash = item.href.split("#")[1];
        const element = document.getElementById(hash);
        return { hash, element };
      })
      .filter((s) => s.element !== null);

    if (sections.length === 0) return;

    // IntersectionObserverを使用してリフローを回避
    const observer = new IntersectionObserver(
      (entries) => {
        // 表示されているセクションの中で最も表示割合が高いものを選択
        let maxRatio = 0;
        let activeHash = "";

        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            const hash = sections.find((s) => s.element === entry.target)?.hash;
            if (hash) activeHash = hash;
          }
        });

        if (activeHash) {
          setActiveSection(activeHash);
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "-20% 0px -50% 0px", // 画面の中央付近をアクティブ判定
      }
    );

    sections.forEach(({ element }) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isNobilva, isTeachIt, navItems]);

  // スムーズスクロールハンドラー
  // 同一ページ内のハッシュのときだけ preventDefault してスクロール。他ページへのリンクは通常遷移させる
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (!href.includes("#")) return;

    const [pathPart] = href.split("#");
    const currentPathWithLocale = pathname ? `/${locale}${pathPart}` : pathPart;
    const isSamePage = pathname === currentPathWithLocale;

    if (!isSamePage) {
      // 他ページへのリンク（例: /ja から /ja/services/nobilva#faq）は preventDefault せず、通常の遷移に任せる
      return;
    }

    e.preventDefault();
    const hash = href.split("#")[1];
    const element = document.getElementById(hash);
    if (element) {
      requestAnimationFrame(() => {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      });
    }
  };

  const headerClassName = `fixed top-4 left-4 right-4 z-50 transition-all duration-300`;

  return (
    <>
      <motion.header
        className={headerClassName}
        initial={isNobilva ? { opacity: 0, y: -100 } : { opacity: 1, y: 0 }}
        animate={
          isNobilva
            ? {
                opacity: showHeader ? 1 : 0,
                y: showHeader ? 0 : -100,
              }
            : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={isNobilva && !showHeader ? { pointerEvents: "none" } : {}}
      >
        <Container size="full" className="py-4">
          <div className="flex items-center justify-between">
            <Link
              href={`/${locale}${isNobilva ? "/services/nobilva" : isTeachIt ? "/services/teachit" : ""}`}
              className={`flex items-center transition-all hover:scale-105 px-4 py-2 lg:px-6 lg:py-3 bg-white rounded-2xl shadow-lg backdrop-blur-sm ${
                isScrolled ? "shadow-xl" : ""
              }`}
            >
              {isTeachIt ? (
                <span className="text-2xl md:text-3xl font-black text-teachit-main">
                  Teach It
                </span>
              ) : (
                <div
                  className={`relative h-8 md:h-10 shrink-0 ${
                    isNobilva ? "w-[120px] md:w-[150px]" : "w-24 md:w-[120px]"
                  }`}
                >
                  <Image
                    src={logoSrc}
                    alt={isNobilva ? "Nobilva" : "Nectere"}
                    fill
                    sizes="(min-width: 768px) 150px, 120px"
                    className="object-contain object-left"
                    priority
                  />
                </div>
              )}
            </Link>

            <div className="hidden lg:flex items-center gap-6 lg:gap-8 bg-white px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
              {navItems.map((item) => {
                const hash = item.href.includes("#")
                  ? item.href.split("#")[1]
                  : "";
                const isActive =
                  (isNobilva || isTeachIt) && activeSection === hash;

                return (
                  <Link
                    key={item.key}
                    href={`/${locale}${item.href}`}
                    onClick={(e) => handleNavClick(e, item.href)}
                    className={`relative transition-all duration-200 font-medium ${
                      isNobilva
                        ? `text-blue hover:text-nobilva-accent ${
                            isActive ? "text-nobilva-accent" : ""
                          }`
                        : isTeachIt
                          ? `text-blue hover:text-teachit-accent ${
                              isActive ? "text-teachit-accent" : ""
                            }`
                          : "text-text hover:text-pink"
                    }`}
                  >
                    {t(item.key as any)}
                    {isActive && (
                      <motion.span
                        className={`absolute -bottom-1 left-0 right-0 h-0.5 ${
                          isTeachIt ? "bg-teachit-accent" : "bg-nobilva-accent"
                        }`}
                        layoutId="activeSection"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                      />
                    )}
                  </Link>
                );
              })}
              {!isBlogPage && <LanguageSwitcher />}
            </div>

            <div className="lg:hidden flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`p-3 rounded-2xl bg-white shadow-lg backdrop-blur-sm ${
                  isNobilva
                    ? "text-nobilva-accent hover:shadow-xl"
                    : isTeachIt
                      ? "text-teachit-main hover:shadow-xl"
                      : "text-pink hover:shadow-xl"
                } transition-all duration-200`}
                aria-label="メニュー"
              >
                <Menu size={28} />
              </button>
            </div>
          </div>
        </Container>
      </motion.header>

      {/* モバイルメニュー（ヘッダーの外に配置） */}
      <div className="lg:hidden">
        <MobileMenu
          navItems={navItems}
          isNobilva={isNobilva}
          isTeachIt={isTeachIt}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onNavClick={handleNavClick}
          showLanguageSwitcher={!isBlogPage}
        />
      </div>
    </>
  );
}
