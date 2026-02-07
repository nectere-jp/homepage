"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./ui/LanguageSwitcher";
import { MobileMenu } from "./ui/MobileMenu";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { NAV_ITEMS, NOBILVA_NAV_ITEMS, TEACHIT_NAV_ITEMS } from "@/lib/navigation";
import { Container } from "./layout/Container";
import { useMemo, useState, useEffect } from "react";
import { Menu } from "lucide-react";

export function Header() {
  const t = useTranslations("header");
  const locale = useLocale();
  const pathname = usePathname();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // NobilvaのLPかどうかを判定（メモ化）
  const isNobilva = useMemo(
    () => pathname?.includes("/services/nobilva"),
    [pathname],
  );
  
  // Teach ITのLPかどうかを判定（メモ化）
  const isTeachIt = useMemo(
    () => pathname?.includes("/services/teachit"),
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
  });

  // アクティブなセクションの検出（Nobilva/Teach IT LPの場合）
  useEffect(() => {
    if (!isNobilva && !isTeachIt) return;

    const handleScroll = () => {
      const sections = navItems
        .filter((item) => item.href.includes("#"))
        .map((item) => {
          const hash = item.href.split("#")[1];
          const element = document.getElementById(hash);
          return { hash, element, item };
        });

      // 画面の上から50%の位置を判定基準にする
      const scrollPosition = window.scrollY + window.innerHeight * 0.5;

      for (const { hash, element } of sections) {
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            setActiveSection(hash);
            return;
          }
        }
      }

      // 最後のセクションより下にスクロールした場合
      const lastSection = sections[sections.length - 1];
      if (lastSection?.element) {
        const { offsetTop, offsetHeight } = lastSection.element;
        if (scrollPosition >= offsetTop + offsetHeight) {
          setActiveSection(lastSection.hash);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // 初期状態を設定

    return () => window.removeEventListener("scroll", handleScroll);
  }, [isNobilva, isTeachIt, navItems]); // navItemsはuseMemoでメモ化されているため安全

  // スムーズスクロールハンドラー
  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    if (href.includes("#")) {
      e.preventDefault();
      const hash = href.split("#")[1];
      const element = document.getElementById(hash);
      if (element) {
        const headerOffset = 100;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    }
  };

  const headerClassName = `fixed top-4 left-4 right-4 z-50 transition-all duration-300`;

  return (
    <>
      <header className={headerClassName}>
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
                <Image
                  src={logoSrc}
                  alt={isNobilva ? "Nobilva" : "Nectere"}
                  width={isNobilva ? 150 : 120}
                  height={40}
                  className="h-8 md:h-10 w-auto"
                  priority
                />
              )}
            </Link>

            <div className="hidden lg:flex items-center gap-6 lg:gap-8 bg-white px-6 py-3 rounded-2xl shadow-lg backdrop-blur-sm">
              {navItems.map((item) => {
                const hash = item.href.includes("#")
                  ? item.href.split("#")[1]
                  : "";
                const isActive = (isNobilva || isTeachIt) && activeSection === hash;
                const isContactItem = item.key === 'contact';

                if (isContactItem) {
                  return (
                    <Link
                      key={item.key}
                      href={`/${locale}${item.href}`}
                      onClick={(e) => handleNavClick(e, item.href)}
                      className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                        isNobilva
                          ? "bg-nobilva-main text-white hover:bg-nobilva-accent"
                          : isTeachIt
                          ? "bg-teachit-main text-white hover:bg-teachit-accent"
                          : "bg-pink text-white hover:bg-pink-dark"
                      }`}
                    >
                      {t(item.key as any)}
                    </Link>
                  );
                }

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
              <LanguageSwitcher />
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
      </header>

      {/* モバイルメニュー（ヘッダーの外に配置） */}
      <div className="lg:hidden">
        <MobileMenu
          navItems={navItems}
          isNobilva={isNobilva}
          isTeachIt={isTeachIt}
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onNavClick={handleNavClick}
        />
      </div>
    </>
  );
}
