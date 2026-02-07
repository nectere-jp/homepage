"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface MobileMenuProps {
  navItems: readonly { key: string; href: string }[];
  isNobilva?: boolean;
  isTeachIt?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
  showLanguageSwitcher?: boolean;
}

export function MobileMenu({
  navItems,
  isNobilva = false,
  isTeachIt = false,
  isOpen,
  onClose,
  onNavClick,
  showLanguageSwitcher = true,
}: MobileMenuProps) {
  const t = useTranslations("header");
  const locale = useLocale();

  const handleLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    onClose();
    onNavClick(e, href);
  };

  const buttonColor = isNobilva
    ? "text-nobilva-accent"
    : isTeachIt
      ? "text-teachit-main"
      : "text-pink";

  const menuBgColor = isNobilva
    ? "bg-white"
    : isTeachIt
      ? "bg-white"
      : "bg-white";

  return (
    <>
      {/* メニューオーバーレイ */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景オーバーレイ */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={onClose}
            />

            {/* メニュー本体 */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-4 right-4 bottom-4 w-80 max-w-[calc(100vw-2rem)] ${menuBgColor} shadow-2xl rounded-3xl z-50 overflow-y-auto`}
            >
              <div className="p-6">
                {/* 閉じるボタン */}
                <div className="flex justify-end mb-8">
                  <button
                    onClick={onClose}
                    className={`p-2 ${buttonColor} hover:opacity-80 transition-opacity`}
                    aria-label="閉じる"
                  >
                    <X size={28} />
                  </button>
                </div>

                {/* 言語切り替え */}
                {showLanguageSwitcher && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <LanguageSwitcher />
                  </div>
                )}

                {/* ナビゲーションアイテム */}
                <nav className="space-y-4">
                  {navItems.map((item, index) => {
                    return (
                      <motion.div
                        key={item.key}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={`/${locale}${item.href}`}
                          onClick={(e) => handleLinkClick(e, item.href)}
                          className={`block px-4 py-3 text-lg font-medium rounded-lg transition-all ${
                            isNobilva
                              ? "text-blue hover:bg-nobilva-accent/10 hover:text-nobilva-accent"
                              : isTeachIt
                                ? "text-blue hover:bg-teachit-accent/10 hover:text-teachit-accent"
                                : "text-text hover:bg-pink/10 hover:text-pink"
                          }`}
                        >
                          {t(item.key as any)}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
