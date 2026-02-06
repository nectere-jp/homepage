"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { AuthGuard } from "@/components/admin/AuthGuard";
import {
  LuLayoutDashboard,
  LuFileText,
  LuSearch,
  LuSparkles,
  LuLogOut,
} from "react-icons/lu";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ログインページは認証不要
  if (pathname === "/admin/login") {
    return children;
  }

  const navigation = [
    { name: "ダッシュボード", href: "/admin", icon: LuLayoutDashboard },
    { name: "記事一覧", href: "/admin/posts", icon: LuFileText },
    { name: "キーワード管理", href: "/admin/keywords", icon: LuSearch },
    { name: "記事作成", href: "/admin/claude", icon: LuSparkles },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* サイドバー */}
        <div className="fixed inset-y-0 left-0 w-64 p-4">
          <div className="flex flex-col h-full bg-white rounded-3xl shadow-soft-lg">
            {/* ロゴ */}
            <div className="flex items-center justify-between p-6 border-b">
              <h1 className="text-xl font-bold text-gray-900">Nectere Blog</h1>
            </div>

            {/* ナビゲーション */}
            <nav className="flex-1 p-4 space-y-2">
              {navigation.map((item) => {
                // より具体的なパス（長いパス）を優先してマッチング
                let isActive = false;
                if (item.href === "/admin") {
                  // ダッシュボードは完全一致のみ
                  isActive = pathname === item.href;
                } else if (item.href === "/admin/posts") {
                  // 記事一覧は /admin/posts または /admin/posts/[slug] または /admin/posts/new
                  isActive =
                    pathname === item.href ||
                    pathname?.startsWith("/admin/posts/");
                } else {
                  // その他のページ
                  isActive =
                    pathname === item.href ||
                    pathname?.startsWith(item.href + "/");
                }

                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive
                        ? "bg-primary text-white shadow-soft"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="mr-3 w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* ユーザー情報 */}
            <div className="p-4 border-t">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                <LuLogOut className="mr-3 w-5 h-5" />
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="ml-64 pl-4">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
