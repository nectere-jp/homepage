import Image from "next/image";
import { LINE_ADD_URL } from "@/lib/constants";
import { wb } from "@/lib/wb";

export function LineConsultSection() {
  return (
    <section id="line-consult" className="bg-gray-50 py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-6 md:px-12 lg:px-16 text-center">
        <h2 className="bg-nobilva-main px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black text-black tracking-tight inline-block mb-8">
          すぐの面談はまだ迷う方へ
        </h2>
        <p className="text-base md:text-lg text-gray-600 leading-relaxed mb-8">
          {wb("「興味はあるけど、/いきなり面談は/ちょっと…」/という方も大丈夫です。")}
          <br className="hidden md:inline" />
          {wb("LINEで気軽に/ご質問ください。/練習スケジュールや/学習のお悩みなど、/何でもお気軽にどうぞ。")}
        </p>
        <div className="flex flex-col items-center gap-6">
          <a
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track-cta="line-consult"
            className="inline-flex items-center gap-2 border-2 border-[#06C755] text-[#06C755] font-bold text-base md:text-lg px-6 py-3 md:px-8 md:py-4 rounded-lg hover:bg-[#06C755]/5 transition-colors"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
            まずはLINEで気軽に相談する
          </a>
          <a
            href={LINE_ADD_URL}
            target="_blank"
            rel="noopener noreferrer"
            data-track-cta="line-consult-qr"
            className="block"
          >
            <Image
              src="/images/nobilva/line-qr.png"
              alt="Nobilva公式LINE QRコード"
              width={140}
              height={140}
              className="mx-auto"
            />
            <p className="text-xs text-gray-400 mt-2">スマホでQRを読み取り</p>
          </a>
        </div>
      </div>
    </section>
  );
}
