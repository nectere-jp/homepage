"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LuFileText,
  LuCircleCheck,
  LuPencil,
  LuSearch,
  LuFilePlus,
  LuSparkles,
  LuMail,
  LuCircleAlert,
} from "react-icons/lu";

interface DashboardStats {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  totalKeywords: number;
  totalContacts: number;
  newContacts: number;
  inProgressContacts: number;
  resolvedContacts: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalKeywords: 0,
    totalContacts: 0,
    newContacts: 0,
    inProgressContacts: 0,
    resolvedContacts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="mt-2 text-gray-600">ブログ管理システムの概要</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">総記事数</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalPosts}
              </p>
            </div>
            <LuFileText className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">公開済み</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.publishedPosts}
              </p>
            </div>
            <LuCircleCheck className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">お問い合わせ</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalContacts}
              </p>
            </div>
            <LuMail className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6 hover:shadow-soft-lg hover:scale-[1.02] transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">新規お問い合わせ</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.newContacts}
              </p>
            </div>
            <LuCircleAlert className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-2xl shadow-soft">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            クイックアクション
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/posts/new"
            className="flex items-center p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-gray-50 hover:shadow-soft transition-all duration-200"
          >
            <LuFilePlus className="w-8 h-8 text-gray-400 mr-4" />
            <div>
              <h3 className="font-bold text-gray-900">新しい記事を作成</h3>
              <p className="text-sm text-gray-600">
                マークダウンエディターで執筆
              </p>
            </div>
          </Link>

          <Link
            href="/admin/claude"
            className="flex items-center p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-gray-50 hover:shadow-soft transition-all duration-200"
          >
            <LuSparkles className="w-8 h-8 text-gray-400 mr-4" />
            <div>
              <h3 className="font-bold text-gray-900">Claude AIで記事作成</h3>
              <p className="text-sm text-gray-600">
                AIがアウトラインと下書きを生成
              </p>
            </div>
          </Link>

          <Link
            href="/admin/contacts"
            className="flex items-center p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-gray-50 hover:shadow-soft transition-all duration-200"
          >
            <LuMail className="w-8 h-8 text-gray-400 mr-4" />
            <div>
              <h3 className="font-bold text-gray-900">お問い合わせ管理</h3>
              <p className="text-sm text-gray-600">お問い合わせの確認と対応</p>
            </div>
          </Link>

          <Link
            href="/admin/keywords"
            className="flex items-center p-4 border border-gray-200 rounded-2xl hover:border-primary hover:bg-gray-50 hover:shadow-soft transition-all duration-200"
          >
            <LuSearch className="w-8 h-8 text-gray-400 mr-4" />
            <div>
              <h3 className="font-bold text-gray-900">キーワード分析</h3>
              <p className="text-sm text-gray-600">SEO最適化とキーワード管理</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
