import fs from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import matter from "gray-matter";
import { business } from "@/lib/business";

/**
 * admin 法務文書ページ（閲覧専用）
 *
 * 指示書 §6 の仕様：
 * - 一覧に文書名・対象サービス・制定日・最終改定日・残 TODO 件数・参照元を出す
 * - 文書名クリックで公開ページを新しいタブで開く
 * - 編集・更新機能は作らない
 * - ページ上部に business.ts の中身を表示
 */

const LEGAL_ROOT = path.join(process.cwd(), "content", "legal");

interface LegalEntry {
  slug: string[];
  category: "全サービス共通" | "Nobilva" | "Teach It" | "おきてがみ";
  referrers: string[];
}

/**
 * この文書にリンクしている外部 URL のメモ。公開前に手で保守する。
 * （指示書 §6「参照元: frontmatter に手で書く」の代替として、ここに集約）
 */
const LEGAL_INDEX: LegalEntry[] = [
  {
    slug: ["privacy-policy"],
    category: "全サービス共通",
    referrers: [
      "nectere.jp/ja/contact（お問い合わせフォーム）",
      "nectere.jp サイトフッター",
      "nobilva.jp（Nobilva LP）",
      "okitegami.app（LP フッター、iOS アプリ Settings）",
      "App Store Connect（おきてがみ、Teach It）",
      "Teach It サービスページ（準備中）",
    ],
  },
  {
    slug: ["nobilva", "terms-of-service"],
    category: "Nobilva",
    referrers: [
      "nobilva.jp（Nobilva LP）",
      "Nobilva 内部生専用アプリ（同意フロー）",
      "nectere.jp サイトフッター（/legal 一覧経由）",
    ],
  },
  {
    slug: ["nobilva", "commercial-disclosure"],
    category: "Nobilva",
    referrers: [
      "nobilva.jp（Nobilva LP フッター）",
      "nectere.jp 旧 /services/nobilva/tokushoho（301 で現 URL）",
    ],
  },
  {
    slug: ["teach-it", "terms-of-service"],
    category: "Teach It",
    referrers: [
      "App Store Connect（Teach It）: 要差し替え TODO",
      "Teach It アプリ内 Settings 画面（リンク未実装: TODO）",
    ],
  },
  {
    slug: ["okitegami", "terms-of-service"],
    category: "おきてがみ",
    referrers: [
      "okitegami.app（LP フッター）",
      "iOS アプリ Settings（SettingsView）",
      "iOS アプリ 利用規約同意トグル（TermsAcceptanceToggle）",
      "App Store Connect（おきてがみ）: 要差し替え TODO",
    ],
  },
];

interface DocMeta {
  slug: string[];
  category: LegalEntry["category"];
  referrers: string[];
  title: string;
  description?: string;
  lastUpdated?: string;
  publishedPath: string;
  todoCount: number;
  found: boolean;
}

async function loadDoc(entry: LegalEntry): Promise<DocMeta> {
  const slugPath = entry.slug.join("/");
  const filePath = path.join(LEGAL_ROOT, `${slugPath}.ja.md`);
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(raw);
    const todoMatches = content.match(/TODO\(要確認\)/g);
    return {
      slug: entry.slug,
      category: entry.category,
      referrers: entry.referrers,
      title: data.title ?? slugPath,
      description: data.description,
      lastUpdated: data.lastUpdated,
      publishedPath: `/ja/legal/${slugPath}`,
      todoCount: todoMatches?.length ?? 0,
      found: true,
    };
  } catch {
    return {
      slug: entry.slug,
      category: entry.category,
      referrers: entry.referrers,
      title: slugPath,
      publishedPath: `/ja/legal/${slugPath}`,
      todoCount: 0,
      found: false,
    };
  }
}

export default async function AdminLegalPage() {
  const docs = await Promise.all(LEGAL_INDEX.map(loadDoc));
  const totalTodoCount = docs.reduce((sum, d) => sum + d.todoCount, 0);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-gray-900">法務文書</h1>
        <p className="text-sm text-gray-600">
          閲覧専用。公開ページを新しいタブで開けます。編集は <code className="bg-gray-100 px-1 rounded">content/legal/</code> 以下の .md を直接編集してください。
          TODO 残件: <strong className={totalTodoCount > 0 ? "text-red-600" : "text-green-600"}>{totalTodoCount}</strong>
        </p>
      </header>

      {/* 事業者情報と窓口（business.ts の値） */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          事業者情報・問い合わせ窓口
          <span className="ml-2 text-xs font-normal text-gray-500">
            全文書で参照されている単一ソース（lib/business.ts）
          </span>
        </h2>
        <dl className="grid grid-cols-[180px_1fr] gap-y-2 text-sm">
          <dt className="text-gray-600">屋号</dt>
          <dd className="text-gray-900">{business.tradeName}（{business.tradeNameReading}）</dd>
          <dt className="text-gray-600">事業主</dt>
          <dd className="text-gray-900">{business.ownerName}</dd>
          <dt className="text-gray-600">所在地</dt>
          <dd className="text-gray-900">〒{business.postalCode} {business.address}</dd>
          <dt className="text-gray-600">電話番号</dt>
          <dd className="text-gray-900">{business.phone}（受付 {business.phoneHours}）</dd>
          <dt className="text-gray-600">メールアドレス</dt>
          <dd className="text-gray-900">{business.email}</dd>
          <dt className="text-gray-600">お問い合わせフォーム</dt>
          <dd className="text-gray-900">{business.contactFormUrl}</dd>
          <dt className="text-gray-600">個人情報保護管理責任者</dt>
          <dd className="text-gray-900">{business.privacyManager}</dd>
          <dt className="text-gray-600">準拠法・合意管轄</dt>
          <dd className="text-gray-900">{business.jurisdiction}</dd>
        </dl>
        <h3 className="text-base font-semibold text-gray-900 mt-6 mb-2">サービス一覧</h3>
        <dl className="grid grid-cols-[180px_1fr] gap-y-1 text-sm">
          {Object.entries(business.services).map(([key, svc]) => (
            <div key={key} className="contents">
              <dt className="text-gray-600">{svc.name}</dt>
              <dd className="text-gray-900">{svc.url}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 文書一覧 */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">文書一覧</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                <th className="px-4 py-3">文書名</th>
                <th className="px-4 py-3">対象</th>
                <th className="px-4 py-3">最終改定日</th>
                <th className="px-4 py-3">TODO 件数</th>
                <th className="px-4 py-3">参照元</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {docs.map((doc) => (
                <tr key={doc.slug.join("/")} className="align-top">
                  <td className="px-4 py-3">
                    {doc.found ? (
                      <>
                        <Link
                          href={doc.publishedPath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          {doc.title}
                        </Link>
                        {doc.description && (
                          <p className="text-xs text-gray-600 mt-1">{doc.description}</p>
                        )}
                        <p className="text-xs text-gray-400 font-mono mt-1">
                          content/legal/{doc.slug.join("/")}.ja.md
                        </p>
                      </>
                    ) : (
                      <span className="text-red-600 font-semibold">
                        {doc.slug.join("/")}（.md ファイル未検出）
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{doc.category}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {doc.lastUpdated
                      ? new Date(doc.lastUpdated).toLocaleDateString("ja-JP", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {doc.todoCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                        {doc.todoCount} 件
                      </span>
                    ) : (
                      <span className="text-green-600 text-xs">0 件</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {doc.referrers.length > 0 ? (
                      <ul className="text-xs text-gray-700 space-y-0.5">
                        {doc.referrers.map((ref, i) => (
                          <li key={i}>・{ref}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold mb-2">運用メモ</p>
        <ul className="space-y-1 list-disc list-inside">
          <li>
            事業者情報を変更する場合は <code className="bg-amber-100 px-1 rounded">lib/business.ts</code> だけを直してください。全文書に自動反映されます。
          </li>
          <li>
            Nobilva の料金・支払・解約条件を変更する場合は <code className="bg-amber-100 px-1 rounded">lib/nobilva-pricing.ts</code> を直すと、利用規約と特商法表記の両方に反映されます。
          </li>
          <li>
            本文に <code className="bg-amber-100 px-1 rounded">TODO(要確認)</code> と書けば、
            <code className="bg-amber-100 px-1 rounded">npm run check:legal</code> とこのページで件数が可視化されます。
          </li>
          <li>
            参照元の一覧は本ページのソース（<code className="bg-amber-100 px-1 rounded">app/admin/legal/page.tsx</code>）に直接書いています。新たな掲載先が増えたら追記してください。
          </li>
        </ul>
      </section>
    </div>
  );
}
