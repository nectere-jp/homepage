export interface ResultCardData {
  name: string;
  grade: string;
  metrics: { label: string; value: string }[];
  content: string;
  comment: string;
}

export const results: ResultCardData[] = [
  {
    name: "ユウキくん",
    grade: "中学3年生 / バスケットボール部",
    metrics: [
      { label: "学校提出物の提出率", value: "54% 向上（学期通算 92% 達成）" },
      { label: "定期テスト各科目平均点", value: "23点 向上" },
    ],
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
    content:
      "週1回のオンライン面談（学習計画）／毎日チャットで進捗管理／オンライン個別指導",
    comment:
      "最初は問題集の答えを見ても何もわからずフリーズする状態でしたが、だんだん勉強する習慣ができて楽しくなりました。",
  },
];

function HighlightNumbers({ text }: { text: string }) {
  const parts = text.split(/(\d[\d,.]*\s*%?(?:\s*[h位点])?)/);
  return (
    <>
      {parts.map((part, i) =>
        /^\d/.test(part) ? (
          <span key={i} className="text-2xl md:text-3xl text-nobilva-accent">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function ResultCard({
  result,
  href,
}: {
  result: ResultCardData;
  href?: string;
}) {
  const inner = (
    <>
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
            <p className="text-xs text-gray-500 mb-1">{metric.label}</p>
            <p className="text-lg md:text-xl font-bold text-gray-900">
              <HighlightNumbers text={metric.value} />
            </p>
          </div>
        ))}
      </div>

      {/* 指導内容（タグ） */}
      <div className="flex flex-wrap gap-2 mb-4">
        {result.content.split("／").map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center text-xs font-medium text-gray-700 bg-white rounded px-3 py-1"
          >
            {item}
          </span>
        ))}
      </div>

      {/* コメント（吹き出し風） */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nobilva-main flex items-center justify-center">
          <svg
            className="w-4 h-4 text-gray-800"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <div className="bg-white rounded-xl p-3 text-sm text-gray-700 leading-relaxed">
          「{result.comment}」
        </div>
      </div>
    </>
  );

  const className =
    "bg-nobilva-light rounded-2xl p-6 md:p-8 flex flex-col justify-center";

  if (href) {
    return (
      <a href={href} className={`${className} hover:shadow-md transition-shadow block`}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export function ResultCardGrid({ linkPrefix }: { linkPrefix?: string }) {
  const anchors = ["#yuki", "#ayaka"];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {results.map((result, index) => (
        <ResultCard
          key={index}
          result={result}
          href={linkPrefix ? anchors[index] : undefined}
        />
      ))}
    </div>
  );
}
