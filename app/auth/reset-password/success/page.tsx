// パスワードリセット完了ページ
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "パスワード更新完了 | okitegami",
  robots: { index: false, follow: false },
};

export default function ResetPasswordSuccessPage() {
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
            パスワード更新完了
          </h1>
          <p className="text-okitegami-dusk/70 leading-relaxed">
            パスワードが正常に更新されました。
            <br />
            okitegami アプリを開いて新しいパスワードでログインしてください。
          </p>
        </div>

        <div className="bg-white/60 rounded-2xl p-6 border border-okitegami-haze/40">
          <p className="text-sm text-okitegami-dusk/60 leading-relaxed">
            アプリに戻ってログイン画面からサインインしてください。
          </p>
        </div>

        <p className="text-xs text-okitegami-dusk/40">
          このページは閉じても問題ありません。
        </p>
      </div>
    </div>
  );
}
