import { SubpageCTA } from "./SubpageCTA";
import { wb } from "@/lib/wb";

export function FinalCTASection() {
  return (
    <SubpageCTA
      variant="final"
      heading={
        <>
          {wb("あなたに合った計画を、")}
          <br />
          {wb("一度、一緒に/作ってみませんか。")}
        </>
      }
      description={
        <>
          <p>
            月20名限定の無料学習診断では、練習スケジュール、得意・苦手、志望進路を伺ったうえで、ご家庭の状況に合わせた学習プランを具体的にお見せします。
          </p>
          <p>判断材料として、お持ち帰りください。</p>
        </>
      }
      showLineCTA
    />
  );
}
