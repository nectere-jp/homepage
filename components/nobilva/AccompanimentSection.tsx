"use client";

import { useState } from "react";

type TabKey = "day" | "week" | "year";

const tabs: { key: TabKey; label: string; summary: string }[] = [
  {
    key: "day",
    label: "1日",
    summary: "1日は短くていい。決まっていれば、続けられる。",
  },
  {
    key: "week",
    label: "1週間",
    summary: "計画は「立てる」ものではなく、「毎週調整する」もの。",
  },
  {
    key: "year",
    label: "1年",
    summary:
      "部活と勉強の比重は、季節で変わる。計画はその波に合わせて、メンターと作り直す。",
  },
];

interface TimelineItem {
  time: string;
  content: string;
  highlight?: boolean;
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
      {
        time: "7:00",
        content:
          "チャットで「今日のやることリスト」確認（メンターが前日夜に送信済み）",
        highlight: true,
      },
      {
        time: "7:30",
        content: "登校／電車内で英単語15分（リスト指定済み）",
      },
    ],
  },
  {
    label: "学校",
    items: [
      { time: "給食前", content: "5分のすき間で社会の一問一答1セット" },
      { time: "放課後", content: "練習へ" },
    ],
  },
  {
    label: "夜",
    items: [
      { time: "19:30", content: "練習から帰宅、夕食" },
      {
        time: "21:00",
        content: "今日の学習30分（数学の指定問題3問）",
        highlight: true,
      },
      {
        time: "21:30",
        content:
          "チャットでメンターに進捗報告（「数学3問やった、1問詰まった」）",
        highlight: true,
      },
      { time: "22:00", content: "就寝" },
    ],
  },
  {
    label: "メンター側",
    items: [
      {
        time: "22:30",
        content:
          "報告を見て、明日の計画に類題（参考書のページ番号・問題番号）を追加で指定",
        highlight: true,
      },
    ],
  },
];

const weekTimeline: TimelineGroup[] = [
  {
    label: "月曜",
    items: [
      {
        time: "",
        content: "メンターから前週末に届いた日割りに沿って学習",
        highlight: true,
      },
      { time: "", content: "毎日チャットで進捗報告" },
    ],
  },
  {
    label: "火・水・木",
    items: [
      { time: "", content: "平日は1日15〜30分の積み上げ" },
      {
        time: "",
        content:
          "詰まったら写真でチャット送信、メンターから24時間以内に返信",
      },
    ],
  },
  {
    label: "金曜",
    items: [
      { time: "", content: "進捗の8割達成・2割積み残しが標準的" },
      {
        time: "",
        content: "メンターが積み残しの理由をチャットで質問",
        highlight: true,
      },
    ],
  },
  {
    label: "土曜",
    items: [
      {
        time: "面談",
        content: "オンライン面談（30分・Zoom）",
        highlight: true,
      },
      { time: "", content: "1週間の振り返り" },
      {
        time: "",
        content: "来週の計画調整（遠征・試験予定があれば反映）",
      },
      { time: "", content: "進路や不安事の相談" },
    ],
  },
  {
    label: "日曜",
    items: [
      {
        time: "",
        content:
          "メンターが土曜の面談を踏まえて翌週の日割りを作成、チャットで配信",
        highlight: true,
      },
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
      "練習・大会で時間を取りにくい時期",
      "平日15分、土日30分の最低限ラインで「習慣を切らさない」運用",
      "評定の積み上げ（提出物・小テスト）に注力",
    ],
  },
  {
    period: "7〜8月：夏の大会・引退",
    description: [
      "大会期はさらに時間が削られる",
      "大会後に「引退切替モード」へ。学習時間を段階的に増やす",
      "夏休み後半から本格的に受験勉強の比重を上げる",
    ],
  },
  {
    period: "9〜11月：受験モード",
    description: [
      "平日2時間、土日4時間程度（個人差あり）",
      "中間・期末で評定平均を最後に積み上げる",
      "推薦希望の場合、英検・学校とのやり取りもメンターが伴走",
    ],
  },
  {
    period: "12〜2月：受験本番",
    description: [
      "出願・面接・受験当日まで毎日伴走",
      "計画は「焦らないため」のリズム維持装置",
    ],
  },
  {
    period: "3月：合格後",
    description: [
      "高校入学後の学習計画づくりも引き続き対応可能（継続契約）",
    ],
  },
];

function TimelineGroupView({ group }: { group: TimelineGroup }) {
  return (
    <div className="mb-6 last:mb-0">
      <div className="text-sm font-bold text-nobilva-accent mb-2 uppercase tracking-wide">
        {group.label}
      </div>
      <div className="space-y-2 pl-4 border-l-2 border-nobilva-main/30">
        {group.items.map((item, i) => (
          <div
            key={i}
            className={`flex gap-3 py-1 ${item.highlight ? "bg-nobilva-light/50 -ml-4 pl-4 border-l-2 border-nobilva-accent rounded-r-lg pr-3" : ""}`}
          >
            {item.time && (
              <span className="text-sm text-gray-500 font-medium min-w-[60px] flex-shrink-0">
                {item.time}
              </span>
            )}
            <span className="text-sm md:text-base text-gray-700">
              {item.content}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AccompanimentSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("day");
  const activeTabData = tabs.find((t) => t.key === activeTab)!;

  return (
    <section className="bg-nobilva-light py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight inline-block mb-4">
            伴走のリアル
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            三本柱が、毎日・毎週・1年をどう支えるか。
          </p>
        </div>

        {/* タブ切替 */}
        <div className="flex justify-center gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 rounded-lg font-bold text-sm md:text-base transition-all ${
                activeTab === tab.key
                  ? "bg-nobilva-accent text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* コンテンツ */}
        <div className="bg-white rounded-2xl p-6 md:p-8 lg:p-10 shadow-sm">
          {/* サブタイトル */}
          {activeTab === "day" && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                ある選手の1日（中学硬式・中3夏の月曜日）
              </p>
              {dayTimeline.map((group, i) => (
                <TimelineGroupView key={i} group={group} />
              ))}
            </div>
          )}

          {activeTab === "week" && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                ある1週間の流れ
              </p>
              {weekTimeline.map((group, i) => (
                <TimelineGroupView key={i} group={group} />
              ))}
            </div>
          )}

          {activeTab === "year" && (
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-4">
                ある1年のロードマップ（中3野球部の例）
              </p>
              <div className="space-y-6">
                {yearPhases.map((phase, i) => (
                  <div key={i}>
                    <h4 className="text-base md:text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-nobilva-accent flex-shrink-0" />
                      {phase.period}
                    </h4>
                    <ul className="space-y-1 pl-6">
                      {phase.description.map((line, j) => (
                        <li
                          key={j}
                          className="text-sm md:text-base text-gray-700 leading-relaxed"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* まとめ */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-base md:text-lg text-gray-800 font-medium text-center">
              {activeTabData.summary}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
