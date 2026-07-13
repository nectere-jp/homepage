import Image from "next/image";

export function EmpathySection() {
  const paths = [
    { label: "スポーツ推薦", image: "/images/nobilva/career-sports.png" },
    { label: "指定校推薦", image: "/images/nobilva/career-designated.png" },
    { label: "一般入試", image: "/images/nobilva/career-exam.png" },
  ];

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        {/* タイトル */}
        <h2 className="flex items-center justify-center gap-3 text-3xl md:text-4xl lg:text-5xl font-black text-center text-gray-900 mb-6 md:mb-10">
          <Image
            src="/images/logo_nobilva.png"
            alt="Nobilva"
            width={300}
            height={72}
            className="h-10 md:h-14 lg:h-16 w-auto"
          />
          では
        </h2>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center">
          {/* 左: 3つの進路カード */}
          <div className="w-full md:w-1/2 grid grid-cols-3 gap-3 md:gap-4">
            {paths.map((p) => (
              <div key={p.label} className="flex flex-col">
                <div className="aspect-[3/4] relative rounded overflow-hidden">
                  <Image
                    src={p.image}
                    alt={p.label}
                    fill
                    className="object-contain"
                  />
                </div>
                <p className="text-xs md:text-sm font-bold text-gray-900 mt-2">
                  {p.label}
                </p>
              </div>
            ))}
          </div>

          {/* 右: オール3死守 */}
          <div className="w-full md:w-1/2 text-center md:text-left">
            <p className="text-base md:text-lg lg:text-xl font-bold text-gray-600 mb-3 md:mb-4">
              どんな進路にも必要な最低ライン
            </p>
            <p className="flex flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
              {"オール3".split("").map((char, i) => (
                <span
                  key={i}
                  className="bg-nobilva-main text-gray-900 w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center text-4xl md:text-5xl lg:text-6xl font-black"
                >
                  {char}
                </span>
              ))}
              {"死守".split("").map((char, i) => (
                <span
                  key={i}
                  className="bg-nobilva-accent text-white w-14 h-14 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center text-4xl md:text-5xl lg:text-6xl font-black"
                >
                  {char}
                </span>
              ))}
            </p>
            <p className="text-2xl md:text-3xl font-black text-gray-900 mt-2">
              を目指します
            </p>
            <p className="text-xs md:text-sm text-gray-500 mt-2 md:mt-3">
              ＊成績を保証するものではありません
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
