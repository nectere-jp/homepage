import { NobilvaTracker } from "@/components/analytics/NobilvaTracker";

export default function NobilvaLayout({
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
