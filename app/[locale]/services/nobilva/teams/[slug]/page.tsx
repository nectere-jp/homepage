import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTeamBySlug, getAllTeams } from "@/lib/teams";
import { TeamPageClient } from "./TeamPageClient";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
}

export async function generateStaticParams() {
  const teams = await getAllTeams();
  return teams
    .filter((t) => t.active)
    .map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);
  if (!team) return {};

  return {
    title: `${team.teamName}様 専用 | Nobilva 野球と勉強の両立サポート`,
    description: `${team.teamName}様の選手・保護者のための特別プラン。${team.discountLabel}`,
    robots: { index: false, follow: false },
  };
}

export default async function TeamPage({ params }: Props) {
  const { slug } = await params;
  const team = await getTeamBySlug(slug);

  if (!team || !team.active) {
    notFound();
  }

  return <TeamPageClient team={team} />;
}
