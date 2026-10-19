import { business, type ServiceKey } from "@/lib/business";

interface ContactInfoProps {
  /** サービス別の見出しを出したい場合に指定。省略時は共通窓口として表示する。 */
  service?: ServiceKey;
}

const SERVICE_LABEL: Record<ServiceKey, string> = {
  nobilva: "Nobilva に関するお問い合わせ",
  teachIt: "Teach It に関するお問い合わせ",
  okitegami: "おきてがみに関するお問い合わせ",
};

/**
 * 問い合わせ窓口の表。法務文書に `:::contact-info` または
 * `:::contact-info service=nobilva` と書いた箇所で描画される。
 *
 * 問い合わせ先は business.email / business.phone に一本化されている（指示書 §8-1）。
 * service を指定しても窓口情報は同じ（見出しだけ変わる）。
 */
export function ContactInfo({ service }: ContactInfoProps) {
  const heading = service ? SERVICE_LABEL[service] : "お問い合わせ窓口";

  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
      <p className="mb-3 font-semibold text-text">{heading}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-base">
        <dt className="font-medium text-text/80 whitespace-nowrap">窓口</dt>
        <dd className="text-text">{business.tradeName}（{business.ownerName}）</dd>
        <dt className="font-medium text-text/80 whitespace-nowrap">メール</dt>
        <dd className="text-text">
          <a href={`mailto:${business.email}`} className="underline underline-offset-2">
            {business.email}
          </a>
        </dd>
        <dt className="font-medium text-text/80 whitespace-nowrap">電話</dt>
        <dd className="text-text">
          {business.phone}（受付時間 {business.phoneHours}）
        </dd>
        <dt className="font-medium text-text/80 whitespace-nowrap">フォーム</dt>
        <dd className="text-text">
          <a href={business.contactFormUrl} className="underline underline-offset-2">
            {business.contactFormUrl}
          </a>
        </dd>
      </dl>
    </div>
  );
}
