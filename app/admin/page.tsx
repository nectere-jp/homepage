"use client";

import { useEffect, useState } from "react";
import {
  LuFileText,
  LuCircleCheck,
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
    </div>
  );
}
