import { HeroSection } from "@/components/okitegami/HeroSection";
import { WhatSection } from "@/components/okitegami/WhatSection";
import { HowSection } from "@/components/okitegami/HowSection";
import { VideoSection } from "@/components/okitegami/VideoSection";
import { DownloadCTASection } from "@/components/okitegami/DownloadCTASection";
import { getCanonicalUrl, getAlternatesLanguages } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "okitegami — あなたの言葉を、街に置いていこう",
  description:
    "友達が、街のどこかに言葉を残している。その言葉は、その場所に行かないと読めない。okitegamiは、場所に言葉を置くSNSです。",
  alternates: {
    canonical: getCanonicalUrl("/services/okitegami"),
    languages: getAlternatesLanguages("/services/okitegami"),
  },
};

export default function OkitegamiPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <WhatSection />
      <HowSection />
      <VideoSection />
      <DownloadCTASection />
    </div>
  );
}
