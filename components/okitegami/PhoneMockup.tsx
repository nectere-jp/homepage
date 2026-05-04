interface PhoneMockupProps {
  /** スクショ画像のパス。未指定のときはプレースホルダーを表示 */
  src?: string;
  alt?: string;
  /** プレースホルダー時の内側コンテンツ */
  children?: React.ReactNode;
  className?: string;
}

/**
 * スマホ枠のモックアップ。
 * src が指定されたら画像、なければ children をスクリーン内に表示する。
 * 画像差し替え時は src だけ更新すればよい。
 */
export function PhoneMockup({ src, alt = "", children, className = "" }: PhoneMockupProps) {
  return (
    <div className={`relative mx-auto w-[200px] md:w-[240px] flex-shrink-0 ${className}`}>
      {/* 外枠 */}
      <div className="relative rounded-[2.5rem] bg-okitegami-dusk p-2 shadow-2xl">
        {/* ノッチ */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-okitegami-dusk rounded-full z-10" />
        {/* スクリーン */}
        <div className="rounded-[2rem] overflow-hidden aspect-[9/19.5] bg-okitegami-paper">
          {src ? (
            <img src={src} alt={alt} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col">
              {/* ステータスバー */}
              <div className="h-6 bg-okitegami-paper/80 flex items-center justify-between px-4 flex-shrink-0">
                <span className="text-[8px] font-semibold text-okitegami-dusk/60">9:41</span>
                <div className="flex gap-1 items-center">
                  <div className="w-3 h-1.5 rounded-sm bg-okitegami-dusk/40" />
                  <div className="w-1.5 h-1.5 rounded-full bg-okitegami-dusk/40" />
                </div>
              </div>
              {/* コンテンツエリア */}
              <div className="flex-1 overflow-hidden">
                {children}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** 仮スクショ①：マップビュー（投稿が点として浮かぶ地図） */
export function MapScreenPlaceholder() {
  return (
    <div className="w-full h-full bg-[#e8f0e4] relative overflow-hidden">
      {/* 地図グリッド */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 400">
        {[0,40,80,120,160,200,240,280,320,360,400].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke="#7a9e6a" strokeWidth="0.5" />
        ))}
        {[0,40,80,120,160,200].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="400" stroke="#7a9e6a" strokeWidth="0.5" />
        ))}
        {/* 道路 */}
        <path d="M 0 160 Q 60 140 100 180 T 200 160" stroke="#c8d8b8" strokeWidth="6" fill="none"/>
        <path d="M 80 0 L 80 400" stroke="#c8d8b8" strokeWidth="4" fill="none"/>
      </svg>
      {/* 投稿マーカー（にじんで光る点） */}
      {[
        { x: "45%", y: "35%", size: 14, opacity: 1 },
        { x: "70%", y: "55%", size: 10, opacity: 0.6 },
        { x: "30%", y: "65%", size: 8, opacity: 0.4 },
        { x: "60%", y: "22%", size: 7, opacity: 0.3 },
      ].map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: dot.x, top: dot.y,
            width: dot.size, height: dot.size,
            background: `rgba(239, 159, 39, ${dot.opacity})`,
            boxShadow: `0 0 ${dot.size * 2}px rgba(239, 159, 39, ${dot.opacity * 0.6})`,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {/* 現在地 */}
      <div
        className="absolute rounded-full bg-blue-500 border-2 border-white"
        style={{ left: "50%", top: "50%", width: 12, height: 12, transform: "translate(-50%,-50%)", boxShadow: "0 0 0 4px rgba(59,130,246,0.3)" }}
      />
      {/* 上部バー */}
      <div className="absolute top-0 left-0 right-0 bg-okitegami-paper/90 px-3 py-2 text-[9px] font-semibold text-okitegami-dusk">
        okitegami
      </div>
    </div>
  );
}

/** 仮スクショ②：投稿作成画面 */
export function ComposeScreenPlaceholder() {
  return (
    <div className="w-full h-full bg-okitegami-paper flex flex-col">
      {/* ヘッダー */}
      <div className="px-3 py-2 flex items-center justify-between border-b border-okitegami-haze">
        <span className="text-[9px] text-okitegami-dusk/60">キャンセル</span>
        <span className="text-[9px] font-bold text-okitegami-dusk">置く</span>
        <div className="bg-okitegami-sun rounded-full px-2 py-0.5">
          <span className="text-[8px] text-white font-bold">完了</span>
        </div>
      </div>
      {/* 場所表示 */}
      <div className="px-3 py-2 flex items-center gap-1.5">
        <svg className="w-3 h-3 text-okitegami-red flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        <span className="text-[8px] text-okitegami-dusk/70 truncate">渋谷駅 付近</span>
      </div>
      {/* テキストエリア */}
      <div className="flex-1 px-3 py-2">
        <div className="text-[9px] text-okitegami-dusk leading-relaxed">
          今日のランチ、最高だった。
          <span className="inline-block w-0.5 h-3 bg-okitegami-sun animate-pulse ml-0.5 align-middle" />
        </div>
      </div>
      {/* 文字数 */}
      <div className="px-3 py-2 text-right">
        <span className="text-[8px] text-okitegami-dusk/40">12 / 140</span>
      </div>
    </div>
  );
}

/** 仮スクショ③：通知 + 地図 */
export function NotificationScreenPlaceholder() {
  return (
    <div className="w-full h-full bg-[#e8f0e4] relative overflow-hidden">
      {/* 地図背景 */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 200 400">
        {[0,50,100,150,200,250,300,350,400].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="200" y2={y} stroke="#7a9e6a" strokeWidth="0.5"/>
        ))}
        {[0,50,100,150,200].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="400" stroke="#7a9e6a" strokeWidth="0.5"/>
        ))}
        <path d="M 0 200 Q 100 180 200 200" stroke="#c8d8b8" strokeWidth="5" fill="none"/>
      </svg>
      {/* 通知カード */}
      <div className="absolute top-6 left-2 right-2 bg-white/95 rounded-xl p-2.5 shadow-lg">
        <div className="flex items-start gap-2">
          <div className="w-6 h-6 rounded-md bg-okitegami-sun flex-shrink-0 flex items-center justify-center">
            <span className="text-[7px] text-white font-black">ok</span>
          </div>
          <div>
            <p className="text-[8px] font-bold text-gray-800">okitegami</p>
            <p className="text-[8px] text-gray-600 leading-relaxed">近くに友達の置き手紙があります</p>
          </div>
        </div>
      </div>
      {/* マーカーと現在地 */}
      <div className="absolute" style={{ left: "55%", top: "48%", transform: "translate(-50%,-50%)" }}>
        <div className="w-4 h-4 rounded-full bg-okitegami-sun/80" style={{ boxShadow: "0 0 12px rgba(239,159,39,0.6)" }} />
      </div>
      <div className="absolute" style={{ left: "50%", top: "60%", transform: "translate(-50%,-50%)" }}>
        <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white" style={{ boxShadow: "0 0 0 4px rgba(59,130,246,0.3)" }} />
      </div>
      {/* 距離表示 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-okitegami-dusk rounded-full px-3 py-1">
        <span className="text-[8px] text-okitegami-paper font-semibold">あと 320m</span>
      </div>
    </div>
  );
}

/** 仮スクショ④：投稿閲覧画面 */
export function ReadScreenPlaceholder() {
  return (
    <div className="w-full h-full bg-okitegami-paper flex flex-col">
      {/* ヘッダー */}
      <div className="px-3 py-2 flex items-center gap-2 border-b border-okitegami-haze">
        <div className="w-5 h-5 rounded-full bg-okitegami-haze flex-shrink-0" />
        <div>
          <p className="text-[8px] font-bold text-okitegami-dusk">田中さん</p>
          <p className="text-[7px] text-okitegami-dusk/50">渋谷駅 · 2日前</p>
        </div>
      </div>
      {/* 投稿本文 */}
      <div className="flex-1 px-4 py-6 flex flex-col justify-center items-center text-center gap-4">
        <p className="text-[11px] text-okitegami-dusk leading-relaxed font-medium">
          「ここ通るたびに<br/>思い出すな。<br/>あの夏のこと。」
        </p>
        <div className="w-8 h-px bg-okitegami-haze" />
        <p className="text-[8px] text-okitegami-dusk/50">この場所で読まれました</p>
      </div>
      {/* 返信ボタン */}
      <div className="px-4 pb-4">
        <div className="border border-okitegami-haze rounded-full py-1.5 text-center">
          <span className="text-[8px] text-okitegami-dusk/60">返信する</span>
        </div>
      </div>
    </div>
  );
}
