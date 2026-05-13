import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "無料学習診断 - Nobilva | Nectere",
  description:
    "30分のオンライン面談で、ご家庭に合った学習プランを具体的にお持ち帰りいただけます。月20名限定・完全無料・LINE登録不要。",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DiagnosisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
