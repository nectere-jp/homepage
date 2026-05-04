"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { LuMail, LuClock, LuCircleCheck, LuCircleAlert } from "react-icons/lu";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { EmptyState } from "@/components/admin/EmptyState";
import { formatFirestoreDate } from "@/lib/date-utils";

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
  nobilva: "Nobilva（学習支援）について",
  teachit: "Teach It（教育アプリ）について",
  interview: "取材のご依頼",
  other: "その他",
};

const STATUS_LABELS: Record<string, string> = {
  new: "新規",
  in_progress: "対応中",
  resolved: "完了",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-gray-500 text-white",
  in_progress: "bg-yellow-500 text-white",
  resolved: "bg-green-500 text-white",
};

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [inquiryTypeFilter, setInquiryTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await adminFetch("/api/admin/contacts");

      if (response.ok) {
        const data = await response.json();
        setContacts(data.contacts);
      }
    } catch (error) {
      console.error("Failed to fetch contacts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContacts = useMemo(() => {
    let filtered = contacts;

    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    if (inquiryTypeFilter !== "all") {
      filtered = filtered.filter((c) => c.inquiryType === inquiryTypeFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query),
      );
    }
    return filtered;
  }, [contacts, statusFilter, inquiryTypeFilter, searchQuery]);

  const formatDate = formatFirestoreDate;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <LuCircleAlert className="w-4 h-4" />;
      case "in_progress":
        return <LuClock className="w-4 h-4" />;
      case "resolved":
        return <LuCircleCheck className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const newContactsCount = contacts.filter((c) => c.status === "new").length;

  if (loading) {
    return (
      <LoadingSpinner />
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">お問い合わせ管理</h1>
        <p className="mt-2 text-gray-600">お問い合わせの確認と対応状況の管理</p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">全お問い合わせ</p>
              <p className="text-3xl font-bold text-gray-900">
                {contacts.length}
              </p>
            </div>
            <LuMail className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">新規</p>
              <p className="text-3xl font-bold text-gray-900">
                {newContactsCount}
              </p>
            </div>
            <LuCircleAlert className="w-10 h-10 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-soft p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">完了</p>
              <p className="text-3xl font-bold text-gray-900">
                {contacts.filter((c) => c.status === "resolved").length}
              </p>
            </div>
            <LuCircleCheck className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      </div>

      {/* フィルターと検索 */}
      <div className="bg-white rounded-2xl shadow-soft p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ステータス
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">すべて</option>
              <option value="new">新規</option>
              <option value="in_progress">対応中</option>
              <option value="resolved">完了</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              お問い合わせ種別
            </label>
            <select
              value={inquiryTypeFilter}
              onChange={(e) => setInquiryTypeFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="all">すべて</option>
              <option value="translation">翻訳について</option>
              <option value="webDesign">ホームページ制作について</option>
              <option value="print">印刷物制作について</option>
              <option value="nobilva">Nobilva（学習支援）について</option>
              <option value="teachit">Teach It（教育アプリ）について</option>
              <option value="interview">取材のご依頼</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              検索
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="名前、メールアドレス、会社名"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
      </div>

      {/* お問い合わせ一覧 */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
        {filteredContacts.length === 0 ? (
          <EmptyState message="お問い合わせが見つかりません" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    受付日時
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    お名前
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    メールアドレス
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    お問い合わせ種別
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    ステータス
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    onClick={() => router.push(`/admin/contacts/${contact.id}`)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(contact.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                      {contact.company && (
                        <div className="text-xs text-gray-500">
                          {contact.company}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {contact.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {INQUIRY_TYPE_LABELS[contact.inquiryType] ||
                        contact.inquiryType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          STATUS_COLORS[contact.status]
                        }`}
                      >
                        {getStatusIcon(contact.status)}
                        {STATUS_LABELS[contact.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
