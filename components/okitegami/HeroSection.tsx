import { PhoneMockup, MapScreenPlaceholder } from "./PhoneMockup";

export function HeroSection() {
  return (
    <section className="relative bg-okitegami-paper overflow-hidden">
      {/* 背景グロー */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-okitegami-sun/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-24 md:py-32 flex flex-col md:flex-row items-center gap-12 md:gap-16">
        {/* テキスト */}
        <div className="flex-1 text-center md:text-left space-y-6">
          <h1 className="text-6xl md:text-8xl font-black tracking-tight text-okitegami-dusk">
            okitegami
          </h1>
          <p className="text-xl md:text-2xl font-medium text-okitegami-dusk/75 leading-relaxed">
            あなたの言葉を、<br />街に置いていこう
          </p>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-okitegami-dusk text-okitegami-paper rounded-full px-8 py-4 text-lg font-semibold hover:bg-okitegami-dusk/90 transition-all hover:scale-105 shadow-lg"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.278.8-3.157.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            App Storeでダウンロード
          </a>
          <p className="text-sm text-okitegami-dusk/40">無料 · iPhone対応</p>
        </div>

        {/* 仮スクショ（差し替え可） */}
        <div className="flex-shrink-0">
          <PhoneMockup alt="okitegami マップ画面">
            <MapScreenPlaceholder />
          </PhoneMockup>
        </div>
      </div>

      {/* 下部の波形 */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 30C360 60 720 0 1080 30C1260 45 1380 20 1440 30V60H0V30Z" fill="white" />
        </svg>
      </div>
    </section>
  );
}
