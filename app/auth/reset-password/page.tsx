// パスワードリセットフォームページ
// Supabase のパスワードリセットメールのリンク先として使用する
"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Supabase がリセットリンクを踏んだ後、セッションを確立する
  useEffect(() => {
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    if (token_hash && type === "recovery") {
      supabase.auth.verifyOtp({ token_hash, type: "recovery" }).then(({ error }) => {
        if (error) {
          router.replace("/auth/error?reason=expired");
        }
      });
    }
  }, [searchParams, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください");
      return;
    }
    if (password !== confirm) {
      setError("パスワードが一致しません");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("パスワードの更新に失敗しました。もう一度お試しください。");
      return;
    }

    router.push("/auth/reset-password/success");
  }

  return (
    <div className="min-h-screen bg-okitegami-paper flex items-center justify-center px-6">
      {/* 背景グロー */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-okitegami-sun/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-sm w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black text-okitegami-dusk tracking-tight">
            新しいパスワード
          </h1>
          <p className="text-okitegami-dusk/60 text-sm">
            8文字以上で入力してください
          </p>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-okitegami-dusk/80 mb-1">
                新しいパスワード
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-okitegami-haze bg-white/70 text-okitegami-dusk placeholder:text-okitegami-haze focus:outline-none focus:ring-2 focus:ring-okitegami-sun/50 transition"
                placeholder="8文字以上"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-okitegami-dusk/80 mb-1">
                確認用パスワード
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-okitegami-haze bg-white/70 text-okitegami-dusk placeholder:text-okitegami-haze focus:outline-none focus:ring-2 focus:ring-okitegami-sun/50 transition"
                placeholder="もう一度入力"
              />
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <p className="text-okitegami-red text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-okitegami-dusk text-okitegami-paper rounded-full py-3 font-semibold hover:bg-okitegami-dusk/90 transition-all hover:scale-[1.02] shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "更新中..." : "パスワードを更新"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    // useSearchParams は Suspense が必要
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
