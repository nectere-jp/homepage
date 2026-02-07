"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/firebase/client";
import {
  LuArrowLeft,
  LuMail,
  LuPhone,
  LuBuilding,
  LuClock,
  LuCircleCheck,
  LuCircleAlert,
} from "react-icons/lu";

interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  inquiryType: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  createdAt: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt: {
    _seconds: number;
    _nanoseconds: number;
  };
}

const INQUIRY_TYPE_LABELS: Record<string, string> = {
  translation: "翻訳について",
  webDesign: "ホームページ制作について",
  print: "印刷物制作について",
  combo: "事業内容の組み合わせについて",
  other: "その他",
};

const STATUS_LABELS: Record<string, string> = {
  new: "新規",
  in_progress: "対応中",
  resolved: "完了",
};

export default function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [contact, setContact] = useState<ContactInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  useEffect(() => {
    fetchContact();
  }, [params.id]);

  const fetchContact = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/contacts/${params.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
        setSelectedStatus(data.contact.status);
      } else {
        router.push("/admin/contacts");
      }
    } catch (error) {
      console.error("Failed to fetch contact:", error);
      router.push("/admin/contacts");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (!contact || selectedStatus === contact.status) return;

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/contacts/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setContact(data.contact);
        alert("ステータスを更新しました");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("ステータスの更新に失敗しました");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (timestamp: { _seconds: number }) => {
    return new Date(timestamp._seconds * 1000).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
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

  if (!contact) {
    return null;
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-8">
        <Link
          href="/admin/contacts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <LuArrowLeft className="w-4 h-4" />
          一覧に戻る
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">お問い合わせ詳細</h1>
        <p className="mt-2 text-gray-600">ID: {contact.id}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* メインコンテンツ */}
        <div className="lg:col-span-2 space-y-6">
          {/* 基本情報 */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">基本情報</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    お名前
                  </label>
                  <p className="text-gray-900 font-medium">{contact.name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    メールアドレス
                  </label>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-primary hover:underline inline-flex items-center gap-2"
                  >
                    <LuMail className="w-4 h-4" />
                    {contact.email}
                  </a>
                </div>
              </div>

              {(contact.company || contact.phone) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contact.company && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        会社名
                      </label>
                      <p className="text-gray-900 inline-flex items-center gap-2">
                        <LuBuilding className="w-4 h-4" />
                        {contact.company}
                      </p>
                    </div>
                  )}

                  {contact.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        電話番号
                      </label>
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-primary hover:underline inline-flex items-center gap-2"
                      >
                        <LuPhone className="w-4 h-4" />
                        {contact.phone}
                      </a>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  お問い合わせ種別
                </label>
                <p className="text-gray-900 font-medium">
                  {INQUIRY_TYPE_LABELS[contact.inquiryType] ||
                    contact.inquiryType}
                </p>
              </div>
            </div>
          </div>

          {/* お問い合わせ内容 */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              お問い合わせ内容
            </h2>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                {contact.message}
              </p>
            </div>
          </div>
        </div>

        {/* サイドバー */}
        <div className="space-y-6">
          {/* ステータス管理 */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              ステータス管理
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  現在のステータス
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="new">新規</option>
                  <option value="in_progress">対応中</option>
                  <option value="resolved">完了</option>
                </select>
              </div>

              <button
                onClick={handleStatusChange}
                disabled={saving || selectedStatus === contact.status}
                className="w-full px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {saving ? "保存中..." : "ステータスを更新"}
              </button>
            </div>
          </div>

          {/* 日時情報 */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">日時情報</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  受付日時
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <LuClock className="w-4 h-4" />
                  {formatDate(contact.createdAt)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  最終更新
                </label>
                <p className="text-sm text-gray-900 flex items-center gap-2">
                  <LuClock className="w-4 h-4" />
                  {formatDate(contact.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-2xl shadow-soft p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              クイックアクション
            </h2>

            <div className="space-y-2">
              <a
                href={`mailto:${contact.email}`}
                className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                メールで返信
              </a>

              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className="block w-full px-4 py-2 text-center bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  電話をかける
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
