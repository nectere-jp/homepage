// Supabase のメール認証トークンを検証し、成功・エラーページへリダイレクトする API ルート
import { type NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (!token_hash || !type) {
    return NextResponse.redirect(new URL("/auth/error?reason=invalid_link", request.url));
  }

  const { error } = await supabase.auth.verifyOtp({ token_hash, type });

  if (error) {
    const reason = encodeURIComponent(error.message);
    return NextResponse.redirect(new URL(`/auth/error?reason=${reason}`, request.url));
  }

  return NextResponse.redirect(new URL("/auth/success", request.url));
}
