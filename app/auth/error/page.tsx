// メール認証エラー時のページ
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "認証エラー | okitegami",
  robots: { index: false, follow: false },
};

export default async function AuthErrorPage(props: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await props.searchParams;

  // リンク期限切れかどうかを判定
  const isExpired =
    reason?.includes("expired") || reason?.includes("invalid_link");

  return (
    <div className="min-h-screen bg-okitegami-paper flex items-center justify-center px-6">
      {/* 背景グロー */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-okitegami-red/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-md w-full text-center space-y-8">
        {/* アイコン */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-okitegami-red/15 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-okitegami-red"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {/* テキスト */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-okitegami-dusk tracking-tight">
            {isExpired ? "リンクの有効期限切れ" : "認証エラー"}
          </h1>
          <p className="text-okitegami-dusk/70 leading-relaxed">
            {isExpired ? (
              <>
                確認リンクの有効期限が切れています。
                <br />
                アプリから再度メールを送信してください。
              </>
            ) : (
              <>
                メール認証に失敗しました。
                <br />
                アプリから再度お試しください。
              </>
            )}
          </p>
        </div>

        {/* アプリへの誘導 */}
        <div className="bg-white/60 rounded-2xl p-6 border border-okitegami-haze/40">
          <p className="text-sm text-okitegami-dusk/60 leading-relaxed">
            問題が解決しない場合は、アプリ内の
            <br />
            「お問い合わせ」からご連絡ください。
          </p>
        </div>

        <a
          href="/"
          className="inline-block text-sm text-okitegami-dusk/50 hover:text-okitegami-dusk underline transition-colors"
        >
          トップページへ戻る
        </a>
      </div>
    </div>
  );
}
