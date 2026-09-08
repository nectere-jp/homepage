import Link from "next/link";
import type { Metadata } from "next";
import { ChevronRightIcon } from "@/components/nobilva/Icons";

export const metadata: Metadata = {
  title: "お申込みありがとうございます - Nobilva | Nectere",
  robots: { index: false, follow: false },
};

export default function DiagnosisCompletePage() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-white">
      <div className="flex-1 flex flex-col justify-center px-6 py-8 max-w-lg mx-auto w-full">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            お申込みを受け付けました。
          </h1>
          <p className="text-lg text-gray-900 mb-8">ありがとうございます。</p>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-8">
            ご入力いただいた内容を確認し、
            <strong>24時間以内に面談日時の確定と面談リンクをメール</strong>
            でお送りします。
          </p>
        </div>

        <div className="space-y-4 mb-12">
          {[
            {
              icon: "1",
              title: "確認メールが届きます（数分以内）",
              detail:
                "ご入力内容の控えをお送りします。届かない場合は迷惑メールフォルダもご確認ください。",
            },
            {
              icon: "2",
              title: "日時確定メールが届きます（24時間以内）",
              detail:
                "ご希望候補から1つを確定し、面談リンクとともにお送りします。",
            },
            {
              icon: "3",
              title: "当日の面談（30分・オンライン）",
              detail:
                "リラックスしてご参加ください。事前準備は不要です。保護者の方・生徒ご本人、どちらでもご参加いただけます。",
            },
          ].map((s) => (
            <div key={s.icon} className="flex gap-4 items-start">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-nobilva-main text-gray-900 font-bold text-sm flex items-center justify-center">
                {s.icon}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{s.title}</p>
                <p className="text-xs text-gray-600 mt-0.5">{s.detail}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/ja/services/nobilva"
            className="inline-flex items-center gap-1 text-nobilva-accent font-medium hover:underline text-sm"
          >
            Nobilva トップに戻る
            <ChevronRightIcon size="xs" />
          </Link>
        </div>
      </div>
    </div>
  );
}
