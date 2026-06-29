import type { ReactNode } from "react";

const O = ({ children }: { children: ReactNode }) => (
  <span className="text-nobilva-accent">{children}</span>
);

const concerns: ReactNode[] = [
  <><O>練習で疲れて</O><br />家で勉強できない...</>,
  <><O>野球は本気で</O><br />続けさせてあげたい...</>,
  <>自分で計画を立てても<br /><O>続かない</O>...</>,
  <><O>内申点</O>が<br />思うように上がらない...</>,
  <>推薦も一般も<br /><O>選択肢を残したい</O>...</>,
  <>勉強させようとすると<br /><O>親子喧嘩</O>に...</>,
];

function ConcernText({
  text,
  className = "",
}: {
  text: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl px-8 md:px-10 py-4 shadow-sm text-center ${className}`}>
      <p className="text-sm md:text-base lg:text-lg font-bold text-gray-800 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

function Card({ text }: { text: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl px-6 py-5 shadow-sm text-center">
      <p className="text-sm font-bold text-gray-800 leading-relaxed">
        {text}
      </p>
    </div>
  );
}

export function ConcernsSection() {
  return (
    <section className="overflow-hidden">
      {/* nobilva-light 背景エリア */}
      <div className="bg-nobilva-light pt-16 md:pt-24 pb-8 md:pb-12">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        {/* タイトル */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="inline-block text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
            こんな
            <span className="text-nobilva-accent">お悩み</span>
            ありませんか？
          </h2>
          <div className="mt-3 mx-auto w-40 md:w-56 h-1 bg-gray-900 rounded-full" />
        </div>

        {/* モバイル: カード縦積み + 画像 */}
        <div className="md:hidden space-y-5">
          {concerns.map((text, i) => (
            <Card key={i} text={text} />
          ))}
          <div className="aspect-[16/9] bg-gray-200 rounded-2xl mt-6" />
        </div>

        {/* PC: 扇形配置 — 画像が下中央、お悩みが上から囲む */}
        <div className="hidden md:block">
          {/* 上段: 中央寄り2枚 */}
          <div className="flex justify-center gap-24 lg:gap-36 mb-6 lg:mb-8">
            <ConcernText text={concerns[2]} className="text-center" />
            <ConcernText text={concerns[3]} className="text-center" />
          </div>

          {/* 中段: 左右に広がる2枚 */}
          <div className="flex justify-between items-start px-4 lg:px-8 -mb-6 lg:-mb-8">
            <ConcernText text={concerns[1]} />
            <ConcernText text={concerns[4]} />
          </div>

          {/* 下段: 最も外側の2枚 + 中央画像 */}
          <div className="flex justify-between items-end relative z-10">
            <ConcernText text={concerns[0]} className="mb-24" />
            <div className="w-2/5 max-w-sm mx-auto">
              <div className="aspect-[4/3] bg-gray-200 rounded-2xl" />
            </div>
            <ConcernText text={concerns[5]} className="mb-24" />
          </div>
        </div>
      </div>
      </div>

      {/* V字カーブで背景を切り替え */}
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="w-full h-16 md:h-24 block -mt-px"
      >
        <path
          d="M0,0 L720,120 L1440,0 Z"
          className="fill-nobilva-light"
        />
      </svg>

      {/* つなぎのドット + ライン */}
      <div className="flex flex-col items-center py-4 md:py-6">
        <div className="w-3 h-3 rounded-full bg-nobilva-accent" />
        <div className="w-0.5 h-10 md:h-16 bg-nobilva-accent" />
      </div>
    </section>
  );
}
