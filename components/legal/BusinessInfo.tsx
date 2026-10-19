import { business } from "@/lib/business";

/**
 * 事業者情報の表。法務文書に `:::business-info` と書いた箇所で描画される。
 * 値は lib/business.ts からのみ取得する。
 */
export function BusinessInfo() {
  const rows: Array<[string, string]> = [
    ["屋号", `${business.tradeName}（${business.tradeNameReading}）`],
    ["事業主", business.ownerName],
    ["所在地", `〒${business.postalCode}\n${business.address}`],
    ["電話番号", `${business.phone}（受付時間 ${business.phoneHours}）`],
    ["メールアドレス", business.email],
    ["個人情報保護管理責任者", business.privacyManager],
  ];

  return (
    <dl className="my-6 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-y border-gray-200 py-6 text-base">
      {rows.map(([label, value]) => (
        <div key={label} className="contents">
          <dt className="font-semibold text-text/80 whitespace-nowrap">{label}</dt>
          <dd className="text-text whitespace-pre-line">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
