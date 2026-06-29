import Image from "next/image";

export function HeroSection() {
  return (
    <section className="bg-white pt-5 pb-10">
      <div className="px-5">
        <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-2xl overflow-hidden">
          <Image
            src="/images/nobilva/hero.jpg"
            alt="ベンチで単語帳を読む野球部員"
            fill
            priority
            className="object-cover object-center"
          />
          {/* テキストオーバーレイ */}
          <div className="absolute inset-0 flex items-center pt-8 md:pt-12">
            <div className="px-8 md:px-12 lg:px-16 flex flex-col gap-4 md:gap-6">
              <p className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-gray-900 tracking-tight mb-4 md:mb-6">
                <span className="text-nobilva-accent">野球</span>に<span className="bg-nobilva-main px-1">本気</span>のあなたへ
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 tracking-tight">
                <span className="underline decoration-nobilva-accent decoration-4 underline-offset-4">野球と勉強の両立</span>を
              </p>
              <p className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 tracking-tight">
                サポートします
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
