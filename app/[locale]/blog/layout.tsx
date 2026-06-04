import { NobilvaTracker } from "@/components/analytics/NobilvaTracker";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NobilvaTracker />
      {children}
    </>
  );
}
