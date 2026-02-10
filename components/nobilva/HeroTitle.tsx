/**
 * HeroTitle - Heroセクションのタイトル表示コンポーネント
 * 
 * スポーツ名を動的に表示するタイトル部分
 * 日本語と英語で異なるレイアウトをサポート
 */

interface HeroTitleProps {
  isJapanese: boolean;
  heroTitle: {
    prefix: string;
    suffix: string;
    service: string;
  };
  currentSport: string;
}

export function HeroTitle({
  isJapanese,
  heroTitle,
  currentSport,
}: HeroTitleProps) {
  return (
    <h1 className="text-3xl md:text-5xl lg:text-4xl 2xl:text-5xl font-black text-black leading-normal">
      {isJapanese ? (
        <>
          <span>{heroTitle.prefix}</span>
          <span className="inline-block min-w-[140px] md:min-w-[200px] lg:min-w-[220px] mx-2 text-center border-2 border-black pb-1 md:pb-1.5">
            <span
              key={currentSport}
              className="inline-block text-nobilva-accent text-3xl md:text-5xl lg:text-5xl sport-text-enter"
            >
              {currentSport}
            </span>
          </span>
          {(() => {
            // 「選手のための」を「選手」と「のための」に分割
            // 「選手」は通常サイズ、「のための」は小さめサイズで表示
            const suffixMatch = heroTitle.suffix.match(/^(.+?)(のための)$/);
            if (suffixMatch) {
              const [, mainPart, smallPart] = suffixMatch;
              return (
                <>
                  <span>{mainPart}</span>
                  <br className="md:hidden" />
                  <span className="text-lg md:text-3xl lg:text-2xl 2xl:text-3xl">
                    {smallPart}
                  </span>
                </>
              );
            }
            // マッチしない場合はそのまま表示
            return <span>{heroTitle.suffix}</span>;
          })()}
          <br className="hidden md:block" />
          <span className="inline md:block mt-1 md:mt-2 leading-tight md:leading-normal">
            {heroTitle.service}
          </span>
        </>
      ) : (
        <>
          <span>{heroTitle.prefix} </span>
          <span className="inline-block min-w-[140px] md:min-w-[200px] lg:min-w-[220px] 2xl:min-w-[300px] mx-2 2xl:mx-3 text-center border-2 2xl:border-[3px] border-black pb-1 md:pb-1.5 2xl:pb-2">
            <span
              key={currentSport}
              className="inline-block text-nobilva-accent text-3xl md:text-5xl lg:text-5xl 2xl:text-6xl sport-text-enter"
            >
              {currentSport}
            </span>
          </span>
          <span> {heroTitle.suffix}</span>
          <br />
          <span className="block mt-2 md:mt-4 2xl:mt-6 leading-tight md:leading-normal">
            {heroTitle.service}
          </span>
        </>
      )}
    </h1>
  );
}
