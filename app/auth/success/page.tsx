// メール認証完了後のサクセスページ
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "メール認証完了 | okitegami",
  robots: { index: false, follow: false },
};

export default function AuthSuccessPage() {
  return (
    <div className="min-h-screen bg-okitegami-paper flex items-center justify-center px-6">
      {/* 背景グロー */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-okitegami-sun/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* アイコン */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-okitegami-sun/20 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-okitegami-sun"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* テキスト */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-okitegami-dusk tracking-tight">
            メール認証完了
          </h1>
          <p className="text-okitegami-dusk/70 leading-relaxed">
            メールアドレスの確認が完了しました。
            <br />
            okitegami アプリを開いてログインしてください。
          </p>
        </div>

        {/* アプリへの誘導 */}
        <div className="bg-white/60 rounded-2xl p-6 space-y-4 border border-okitegami-haze/40">
          <p className="text-sm font-medium text-okitegami-dusk/60">
            アプリをまだインストールしていない方はこちら
          </p>
          <a
            href="https://apps.apple.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-okitegami-dusk text-okitegami-paper rounded-full px-6 py-3 text-sm font-semibold hover:bg-okitegami-dusk/90 transition-all hover:scale-105 shadow-md"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.278.8-3.157.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            App Store でダウンロード
          </a>
        </div>

        <p className="text-xs text-okitegami-dusk/40">
          このページは閉じても問題ありません。
        </p>
      </div>
    </div>
  );
}
