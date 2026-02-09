"use client";

import { useState } from "react";
import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FlowList } from "./FlowList";
import { addSoftBreaks } from "@/utils/softBreak";

interface FlowItem {
  step: number;
  title: string;
  description: string;
  optional?: boolean;
}

interface FlowSectionProps {
  individualItems: FlowItem[];
  teamItems: FlowItem[];
  title: string;
  individualTitle: string;
  teamTitle: string;
  lineButtonLabel: string;
}

export function FlowSection({
  individualItems,
  teamItems,
  title,
  individualTitle,
  teamTitle,
  lineButtonLabel,
}: FlowSectionProps) {
  const [activeTab, setActiveTab] = useState<"individual" | "team">(
    "individual"
  );

  return (
    <Section
      id="flow"
      backgroundColor="transparent"
      className="bg-yellow-50"
      padding="md"
    >
      <Container>
        <SectionHeader
          englishTitle="Flow"
          japaneseTitle={title}
          theme="nobilva"
        />
        <div className="max-w-7xl mx-auto">
          {/* タブUI（sm/mdのみ表示） */}
          <div className="flex justify-center mb-8 lg:hidden">
            <div className="inline-flex bg-white rounded-lg p-1 shadow-md">
              <button
                onClick={() => setActiveTab("individual")}
                className={`px-6 py-3 rounded-md font-semibold text-base md:text-lg transition-all ${
                  activeTab === "individual"
                    ? "bg-nobilva-accent text-white shadow-sm"
                    : "text-gray-700 hover:text-nobilva-accent"
                }`}
                style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
              >
                {addSoftBreaks(individualTitle)}
              </button>
              <button
                onClick={() => setActiveTab("team")}
                className={`px-6 py-3 rounded-md font-semibold text-base md:text-lg transition-all ${
                  activeTab === "team"
                    ? "bg-nobilva-accent text-white shadow-sm"
                    : "text-gray-700 hover:text-nobilva-accent"
                }`}
                style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
              >
                {addSoftBreaks(teamTitle)}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* 個人利用 */}
            <div
              className={`relative ${
                activeTab !== "individual" ? "hidden lg:block" : ""
              }`}
            >
              <div className="sticky top-8">
                <h3 
                  className="text-2xl md:text-3xl font-bold text-nobilva-accent mb-6 md:mb-8 text-center lg:block hidden"
                  style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                >
                  {addSoftBreaks(individualTitle)}
                </h3>
                <div className="rounded-lg p-6 md:p-8">
                  <FlowList
                    items={individualItems}
                    lineButtonLabel={lineButtonLabel}
                    isTeam={false}
                  />
                </div>
              </div>
            </div>

            {/* チーム利用 */}
            <div
              className={`relative ${
                activeTab !== "team" ? "hidden lg:block" : ""
              }`}
            >
              <div className="sticky top-8">
                <h3 
                  className="text-2xl md:text-3xl font-bold text-nobilva-accent mb-6 md:mb-8 text-center lg:block hidden"
                  style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
                >
                  {addSoftBreaks(teamTitle)}
                </h3>
                <div className="rounded-lg p-6 md:p-8">
                  <FlowList
                    items={teamItems}
                    lineButtonLabel={lineButtonLabel}
                    isTeam={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
