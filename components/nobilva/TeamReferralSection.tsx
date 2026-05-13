import Link from "next/link";
import { HiOutlineUserGroup } from "react-icons/hi";

export function TeamReferralSection() {
  return (
    <section className="bg-white py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        <div className="bg-gray-50 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-4 md:gap-8">
          {/* アイコン */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-nobilva-main/30 flex items-center justify-center">
              <HiOutlineUserGroup className="w-6 h-6 text-nobilva-accent" />
            </div>
          </div>

          {/* テキスト */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-1">
              チーム・父母会の関係者の方へ
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              リトルシニア・ボーイズ・ポニー・ヤング、強豪校野球部の父母会向けに、チーム特別価格をご用意しています。
            </p>
          </div>

          {/* CTA */}
          <Link
            href="/ja/services/nobilva/for-teams"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-nobilva-accent text-white font-bold text-sm md:text-base px-5 py-3 rounded-lg hover:scale-105 transition-all"
          >
            チーム導入のご案内
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
