import Link from "next/link";

interface ResultCard {
  name: string;
  grade: string;
  metrics: { label: string; value: string }[];
  period: string;
  content: string;
  comment: string;
}

const results: ResultCard[] = [
  {
    name: "ユウキくん",
    grade: "中学3年生 / バスケットボール部",
    metrics: [
      { label: "学校提出物の提出率", value: "54% 向上（学期通算 92% 達成）" },
      { label: "定期テスト各科目平均点", value: "23点 向上" },
    ],
    period: "13ヶ月",
    content:
      "週1回のオンライン面談（学習計画）／毎日チャットで進捗管理",
    comment:
      "大会前の忙しい時期も、メンターと一緒に立てた計画のおかげで勉強を続けられました。",
  },
  {
    name: "アヤカさん",
    grade: "高校3年生",
    metrics: [
      { label: "勉強時間", value: "470% 向上（週 3h → 14.5h）" },
      { label: "学内テスト順位", value: "約 500位 向上" },
    ],
    period: "3ヶ月",
    content:
      "週1回のオンライン面談（学習計画）／毎日チャットで進捗管理／オンライン個別指導",
    comment:
      "最初は問題集の答えを見ても何もわからずフリーズする状態でしたが、だんだん勉強する習慣ができて楽しくなりました。",
  },
];

function HighlightNumbers({ text }: { text: string }) {
  const parts = text.split(/(\d[\d,.]*\s*%?(?:\s*[h位点])?)/)
  return (
    <>
      {parts.map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} className="text-2xl md:text-3xl text-nobilva-accent">{part}</span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function ResultsSnippetSection() {
  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        {/* リード文 */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight inline-block mb-6">
            指導実績
          </h2>
          <div className="max-w-3xl mx-auto space-y-2 text-base md:text-lg text-gray-600 leading-relaxed">
            <p>Nobilva は始まったばかりのサービスです。</p>
            <p>
              以下は、ヘッドコーチ・代表メンターが個別に指導してきた選手たちの実績です。
            </p>
            <p>同じ仕組みで、Nobilva の選手にも伴走しています。</p>
          </div>
        </div>

        {/* 実績カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-nobilva-light rounded-2xl p-6 md:p-8"
            >
              {/* 名前・学年 */}
              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                  {result.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{result.grade}</p>
              </div>

              {/* 数字メトリクス */}
              <div className="space-y-4 mb-6">
                {result.metrics.map((metric, i) => (
                  <div key={i}>
                    <p className="text-xs text-gray-500 mb-1">
                      {metric.label}
                    </p>
                    <p className="text-lg md:text-xl font-bold text-gray-900">
                      <HighlightNumbers text={metric.value} />
                    </p>
                  </div>
                ))}
              </div>

              {/* 指導期間・内容（タグ） */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center text-xs font-bold text-gray-900 bg-nobilva-main rounded-full px-3 py-1">
                  {result.period}
                </span>
                {result.content.split("／").map((item, i) => (
                  <span key={i} className="inline-flex items-center text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-full px-3 py-1">
                    {item}
                  </span>
                ))}
              </div>

              {/* コメント（吹き出し風） */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nobilva-main flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="bg-white rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
                  「{result.comment}」
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 全実績リンク */}
        <div className="text-center">
          <Link
            href="/ja/services/nobilva/results"
            className="inline-flex items-center gap-2 text-nobilva-accent font-bold hover:underline text-base md:text-lg"
          >
            全ての実績を見る
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
