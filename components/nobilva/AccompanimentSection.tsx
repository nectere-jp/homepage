type Pillar = "plan" | "meeting" | "chat";

interface TimelineItem {
  time: string;
  content: string;
  pillar?: Pillar;
}

interface TimelineGroup {
  label: string;
  items: TimelineItem[];
}

const dayTimeline: TimelineGroup[] = [
  {
    label: "朝",
    items: [
      { time: "6:30", content: "起床、朝食" },
      { time: "7:00", content: "チャットで「今日のやることリスト」を確認", pillar: "plan" },
      { time: "7:30", content: "登校／電車内で英単語15分（リスト指定済み）", pillar: "plan" },
    ],
  },
  {
    label: "学校",
    items: [
      { time: "給食前", content: "5分のすき間で社会の一問一答1セット", pillar: "plan" },
      { time: "放課後", content: "練習へ" },
    ],
  },
  {
    label: "夜",
    items: [
      { time: "19:30", content: "練習から帰宅、夕食" },
      { time: "21:00", content: "今日の学習30分（数学の指定問題3問）", pillar: "plan" },
      { time: "21:30", content: "チャットで進捗報告（「数学3問やった、1問詰まった」）", pillar: "chat" },
      { time: "22:00", content: "就寝" },
      { time: "22:30", content: "メンターが報告を確認、詰まった問題に返信。明日の計画に類題を追加指定", pillar: "chat" },
    ],
  },
  {
    label: "深夜〜翌朝",
    items: [
      { time: "", content: "メンターが翌日の「やることリスト」をチャットで配信", pillar: "plan" },
    ],
  },
];

const weekTimeline: TimelineGroup[] = [
  {
    label: "月曜",
    items: [
      { time: "", content: "前週末に届いた日割りに沿って学習開始", pillar: "plan" },
      { time: "", content: "チャットで進捗報告", pillar: "chat" },
      { time: "", content: "メンターが報告を確認し、フィードバックを返信", pillar: "chat" },
    ],
  },
  {
    label: "火〜木",
    items: [
      { time: "", content: "1日15〜30分の積み上げ学習", pillar: "plan" },
      { time: "", content: "詰まった問題を写真でチャット送信", pillar: "chat" },
      { time: "", content: "メンターが24時間以内にヒント・解説を返信", pillar: "chat" },
    ],
  },
  {
    label: "金曜",
    items: [
      { time: "", content: "週の進捗を報告（8割達成・2割積み残しが標準）", pillar: "chat" },
      { time: "", content: "メンターが積み残しの理由を確認し、翌週に反映", pillar: "chat" },
    ],
  },
  {
    label: "土曜",
    items: [
      { time: "", content: "オンライン面談（30分）", pillar: "meeting" },
      { time: "", content: "1週間の振り返り・進路や不安事の相談", pillar: "meeting" },
      { time: "", content: "メンターが来週の計画を調整（遠征・試験予定を反映）", pillar: "plan" },
    ],
  },
  {
    label: "日曜",
    items: [
      { time: "", content: "メンターが面談を踏まえて翌週の日割りを作成、チャットで配信", pillar: "plan" },
    ],
  },
];

interface YearPhase {
  period: string;
  description: string[];
}

const yearPhases: YearPhase[] = [
  {
    period: "4〜6月：シーズン本格化",
    description: [
      "量は追わず、平日15分・土日30分で「習慣を切らさない」運用。提出物・小テストなど評定直結のものに集中。",
    ],
  },
  {
    period: "7〜8月：夏の大会・引退",
    description: [
      "大会中はさらに絞って乗り切り、引退後に学習時間を段階的に増加。夏休み後半から受験比重を上げる。",
    ],
  },
  {
    period: "9〜11月：受験モード",
    description: [
      "平日2h・土日4hを目安に、中間・期末で評定をひと押し。推薦狙いなら英検・書類準備もメンターが伴走。",
    ],
  },
  {
    period: "12〜2月：受験本番",
    description: [
      "出願・面接・受験当日まで毎日伴走。計画は「焦らずリズムを崩さない」ための装置。",
    ],
  },
  {
    period: "3月：合格後",
    description: [
      "希望があれば、高校入学後の学習計画づくりも継続サポート。",
    ],
  },
];

const sections = [
  { title: "1日", subtitle: "ある選手の1日（中3夏の月曜日）" },
  { title: "1週間", subtitle: "ある1週間の流れ" },
  { title: "1年", subtitle: "ある1年のロードマップ（中3の例）" },
];

const pillarConfig = {
  plan: { label: "計画", className: "bg-nobilva-main text-gray-900", border: "border-nobilva-main" },
  meeting: { label: "面談", className: "bg-nobilva-accent text-white", border: "border-nobilva-accent" },
  chat: { label: "チャット", className: "bg-gray-800 text-white", border: "border-gray-800" },
};

function PillarBadge({ pillar }: { pillar: Pillar }) {
  const config = pillarConfig[pillar];
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${config.className}`}>
      {config.label}
    </span>
  );
}

function TimelineGroupView({ group }: { group: TimelineGroup }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="text-sm font-bold text-gray-900 mb-2">
        {group.label}
      </div>
      <div className="space-y-1.5 pl-3 border-l-2 border-gray-200">
        {group.items.map((item, i) => (
          <div
            key={i}
            className={`flex items-start gap-2 py-1 pr-2 ${
              item.pillar
                ? `bg-white -ml-3 pl-3 border-l-2 ${pillarConfig[item.pillar].border} rounded-r-lg`
                : ""
            }`}
          >
            {item.pillar && <PillarBadge pillar={item.pillar} />}
            {item.time && (
              <span className="text-xs text-gray-400 font-medium min-w-[40px] flex-shrink-0 pt-0.5">
                {item.time}
              </span>
            )}
            <span className="text-sm leading-relaxed text-gray-700">
              {item.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccompanimentSection() {
  return (
    <section className="bg-nobilva-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight inline-block mb-4">
            伴走のリアル
          </h2>
        </div>

        {/* 凡例 */}
        <div className="flex justify-center gap-4 mb-8">
          {(["plan", "meeting", "chat"] as Pillar[]).map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <PillarBadge pillar={p} />
              <span className="text-xs text-gray-500">
                {p === "plan" ? "日割り学習計画" : p === "meeting" ? "週1オンライン面談" : "毎日の進捗確認"}
              </span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 1日 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-6 shadow-sm">
            <div className="mb-4">
              <span className="bg-nobilva-accent text-white font-bold text-sm md:text-base px-4 py-1.5 rounded-full inline-block mb-2">
                {sections[0].title}
              </span>
              <br /><span className="text-sm text-gray-500">{sections[0].subtitle}</span>
            </div>
            {dayTimeline.map((group, i) => (
              <TimelineGroupView key={i} group={group} />
            ))}
          </div>

          {/* 1週間 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-6 shadow-sm">
            <div className="mb-4">
              <span className="bg-nobilva-accent text-white font-bold text-sm md:text-base px-4 py-1.5 rounded-full inline-block mb-2">
                {sections[1].title}
              </span>
              <br /><span className="text-sm text-gray-500">{sections[1].subtitle}</span>
            </div>
            {weekTimeline.map((group, i) => (
              <TimelineGroupView key={i} group={group} />
            ))}
          </div>

          {/* 1年 */}
          <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-6 shadow-sm">
            <div className="mb-4">
              <span className="bg-nobilva-accent text-white font-bold text-sm md:text-base px-4 py-1.5 rounded-full inline-block mb-2">
                {sections[2].title}
              </span>
              <br /><span className="text-sm text-gray-500">{sections[2].subtitle}</span>
            </div>
            {yearPhases.map((phase, i) => (
              <div key={i} className="mb-5 last:mb-0">
                <div className="text-sm font-bold text-gray-900 mb-2">
                  {phase.period}
                </div>
                <div className="space-y-1.5 pl-3 border-l-2 border-gray-200">
                  {phase.description.map((line, j) => (
                    <div key={j} className="flex items-start gap-2 py-1 pr-2">
                      <span className="text-sm leading-relaxed text-gray-700">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
