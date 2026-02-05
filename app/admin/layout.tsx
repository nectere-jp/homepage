'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from '@/lib/firebase/auth';
import { AuthGuard } from '@/components/admin/AuthGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // ログインページは認証不要
  if (pathname === '/admin/login') {
    return children;
  }

  const navigation = [
    { name: 'ダッシュボード', href: '/admin', icon: '📊' },
    { name: '記事一覧', href: '/admin/posts', icon: '📝' },
    { name: '新規作成', href: '/admin/posts/new', icon: '✏️' },
    { name: 'キーワード管理', href: '/admin/keywords', icon: '🔍' },
    { name: 'Claude支援', href: '/admin/claude', icon: '🤖' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* サイドバー */}
        <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
          <div className="flex flex-col h-full">
            {/* ロゴ */}
            <div className="flex items-center justify-between p-6 border-b">
              <h1 className="text-xl font-bold text-gray-900">
                Nectere Blog
              </h1>
            </div>

            {/* ナビゲーション */}
            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || 
                  (item.href !== '/admin' && pathname?.startsWith(item.href));
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* ユーザー情報 */}
            <div className="p-4 border-t">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="mr-3 text-lg">🚪</span>
                ログアウト
              </button>
            </div>
          </div>
        </div>

        {/* メインコンテンツ */}
        <div className="ml-64">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
