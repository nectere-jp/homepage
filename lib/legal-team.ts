/**
 * チーム別の特定商取引法に基づく表記（Nobilva）
 *
 * URL: /legal/nobilva/commercial-disclosure/<team.slug>
 *
 * 共通の表記（content/legal/nobilva/commercial-disclosure.ja.md）をそのまま使い、
 * 本文中の `:::team-offer` の行に、そのチームの価格と特典（offerVariant）の節を差し込む。
 * 共通ページでは同じ行を空にする（fillTeamSlot(content, "")）。
 *
 * 価格は teams.json、特典の条件は lib/nobilva-team-offers.ts から引くので、
 * チームページの表示とここがずれない。
 */

import { fillTeamSlot, getLegalDocument, type LegalDocument } from "./legal";
import { nobilvaPricing } from "./nobilva-pricing";
import {
  GUARANTEE_TERMS_NOTE,
  GUARANTEE_TERMS_SECTIONS,
  monitorDiscount,
  monitorFirstMonthFree,
  withTax,
} from "./nobilva-team-offers";
import { getTeamBySlug, getTeamPlanPrices, type Team } from "./teams";

export const TEAM_COMMERCIAL_DISCLOSURE_BASE = ["nobilva", "commercial-disclosure"] as const;

/** チーム別の特商法表記のパス（ロケール抜き） */
export function teamCommercialDisclosurePath(teamSlug: string): string {
  return `/legal/${TEAM_COMMERCIAL_DISCLOSURE_BASE.join("/")}/${teamSlug}`;
}

const yen = (n: number) => `${n.toLocaleString("ja-JP")}円`;

function buildPriceTable(team: Team): string {
  const prices = getTeamPlanPrices(team);
  const rows = (["essential", "basic"] as const).map((key) => {
    const { normal, special } = prices[key];
    return `| ${nobilvaPricing.plans[key].name} | ${yen(withTax(special))} | ${yen(special)} | ${yen(normal)} |`;
  });
  return [
    "| プラン | チーム限定価格・月額（税込） | チーム限定価格・月額（税抜） | 通常価格・月額（税抜） |",
    "|---|---|---|---|",
    ...rows,
  ].join("\n");
}

function buildMonitorDiscount(team: Team): string {
  const prices = getTeamPlanPrices(team);
  const off = monitorDiscount.monthlyAmountYen;
  const rows = monitorDiscount.planKeys.map((key) => {
    const discounted = prices[key].special - off;
    return `| ${nobilvaPricing.plans[key].name} | ${yen(withTax(discounted))} | ${yen(discounted)} |`;
  });
  return [
    `- **月額割引**：${monitorDiscount.periodDescription}、エッセンシャルプラン・ベーシックプランとも、チーム限定価格からさらに月額 ${yen(off)}（税抜。税込 ${yen(withTax(off))}）を割り引きます。`,
    "",
    `割引期間中（${monitorDiscount.periodDescription}）の月額は次のとおりです。`,
    "",
    "| プラン | 月額（税込） | 月額（税抜） |",
    "|---|---|---|",
    ...rows,
  ].join("\n");
}

const MONITOR_TEAM_NOTE =
  "モニターチームは、Nobilva を初期にご導入いただき、サービス改善にご協力いただくチームです。取り組みの様子をモデルケースとしてホームページ等でご紹介する場合がありますが、選手個人の情報を同意なく掲載することはありません。";

function buildGuarantee(): string {
  const sections = GUARANTEE_TERMS_SECTIONS.map((section) =>
    [`#### ${section.title}`, "", ...section.items.map((item) => `- ${item}`)].join("\n"),
  );
  return [
    "### オール3保証",
    "",
    "ベーシックプランで、オール3が取れなかった学期にお支払いいただいた月額を全額返金します。適用条件は次のとおりです。",
    "",
    ...sections.flatMap((s) => [s, ""]),
    "#### 30 日間の全額返金保証との関係",
    "",
    `- 「解約・返金・返品」に定める全額返金保証（入会から ${nobilvaPricing.refundGuarantee.daysFromEnrollment} 日以内）も、通常どおりご利用いただけます。`,
    `- ただし、全額返金保証を利用して退会された場合、その学期は学期の初めから終わりまで在籍していないため、オール3保証の対象外となります。`,
    "",
    GUARANTEE_TERMS_NOTE,
  ].join("\n");
}

function buildOffer(team: Team): string | null {
  switch (team.offerVariant ?? "C") {
    case "A":
      return [
        "### モニターチーム特典",
        "",
        `- **初月無料**：${monitorFirstMonthFree.description}。`,
        buildMonitorDiscount(team),
        "",
        MONITOR_TEAM_NOTE,
      ].join("\n");
    case "A2":
      return ["### モニターチーム特典", "", buildMonitorDiscount(team), "", MONITOR_TEAM_NOTE].join(
        "\n",
      );
    case "B":
      return buildGuarantee();
    default:
      return null;
  }
}

/** `:::team-offer` に差し込むチーム向けの節（Markdown） */
export function buildTeamOfferMarkdown(team: Team): string {
  const offer = buildOffer(team);
  return [
    `## ${team.teamName}様向けの販売条件`,
    "",
    `${team.teamName}様の選手・保護者の方が、お申し込み時又は面談時に「${team.teamName}」経由である旨をお伝えいただいた場合は、上記の販売価格に代えて、次のチーム限定価格を適用します。`,
    "",
    "### チーム限定価格",
    "",
    buildPriceTable(team),
    "",
    ...(offer ? [offer, ""] : []),
    "上記以外の条件（入会金、システム管理費、支払時期・方法、解約等）は、本表記の各項目のとおりです。",
  ].join("\n");
}

export interface TeamCommercialDisclosure extends LegalDocument {
  team: Team;
}

/** チーム別の特商法表記を組み立てる。チームがない・非公開なら null */
export async function getTeamCommercialDisclosure(
  teamSlug: string,
  locale: string,
): Promise<TeamCommercialDisclosure | null> {
  const team = await getTeamBySlug(teamSlug);
  if (!team || !team.active) return null;

  const base = await getLegalDocument([...TEAM_COMMERCIAL_DISCLOSURE_BASE], locale);
  if (!base) return null;

  return {
    ...base,
    title: `特定商取引法に基づく表記（Nobilva・${team.teamName}様向け）`,
    description: `特定商取引法に基づき、${team.teamName}様向けの Nobilva の事業者情報・販売価格・特典・支払方法・解約条件等を表示します。`,
    content: fillTeamSlot(base.content, buildTeamOfferMarkdown(team)),
    team,
  };
}

/**
 * [...slug] ルートから法務文書を引く。
 * `nobilva/commercial-disclosure/<team>` はチーム別表記、それ以外は通常の文書（差し込み口は空にする）。
 */
export async function resolveLegalDocument(
  slug: string[],
  locale: string,
): Promise<(LegalDocument & { team?: Team }) | null> {
  const [a, b, teamSlug, ...rest] = slug;
  if (
    a === TEAM_COMMERCIAL_DISCLOSURE_BASE[0] &&
    b === TEAM_COMMERCIAL_DISCLOSURE_BASE[1] &&
    teamSlug &&
    rest.length === 0
  ) {
    return getTeamCommercialDisclosure(teamSlug, locale);
  }

  const doc = await getLegalDocument(slug, locale);
  return doc ? { ...doc, content: fillTeamSlot(doc.content, "") } : null;
}
