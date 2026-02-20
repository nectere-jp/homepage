import Anthropic from '@anthropic-ai/sdk';
import type { TargetKeywordData } from './keyword-manager';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * CTA記法について
 *
 * ブログ記事内で使用できるカスタムCTAブロックの記法：
 *
 * :::cta-nobilva
 * title: CTAのタイトル
 * description: CTAの説明文
 * button: ボタンのテキスト
 * link: リンク先URL
 * :::
 *
 * 改行位置: title/description に ‖（U+2016）を入れるとその位置で改行可能（他コンポーネントの addSoftBreaks と同様）
 *
 * 利用可能なCTAタイプ：
 * - cta-nobilva: Nobilva（学習管理サービス）
 * - cta-teachit: TeachIt（AI教育アプリ）
 * - cta-translation: 翻訳サービス
 * - cta-web-design: Web制作
 * - cta-print: 印刷物制作
 */

export interface KeywordSuggestion {
  primaryKeyword: string;
  secondaryKeywords: string[];
  reason: string;
}

export interface OutlineSection {
  heading: string;
  subheadings: string[];
  keyPoints: string[];
}

export interface ContentOutline {
  title: string;
  slug?: string; // URL用。英小文字・数字・ハイフンのみ。タイトルと同時に生成
  /** メタ説明（SEO用・検索結果に表示）。本文には含めない */
  description?: string;
  /** 導入文（記事の冒頭段落・本文に表示） */
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
}

/** Structured Outputs 用 JSON Schema（ContentOutline） */
const contentOutlineJsonSchema = {
  type: 'object' as const,
  properties: {
    title: { type: 'string' as const },
    slug: { type: 'string' as const },
    description: { type: 'string' as const },
    introduction: { type: 'string' as const },
    sections: {
      type: 'array' as const,
      items: {
        type: 'object' as const,
        properties: {
          heading: { type: 'string' as const },
          subheadings: { type: 'array' as const, items: { type: 'string' as const } },
          keyPoints: { type: 'array' as const, items: { type: 'string' as const } },
        },
        required: ['heading', 'subheadings', 'keyPoints'] as const,
        additionalProperties: false as const,
      },
    },
    conclusion: { type: 'string' as const },
  },
  required: ['title', 'introduction', 'sections', 'conclusion'] as const,
  additionalProperties: false as const,
};

/** Structured Outputs 用 JSON Schema（KeywordSuggestion） */
const keywordSuggestionJsonSchema = {
  type: 'object' as const,
  properties: {
    primaryKeyword: { type: 'string' as const },
    secondaryKeywords: { type: 'array' as const, items: { type: 'string' as const } },
    reason: { type: 'string' as const },
  },
  required: ['primaryKeyword', 'secondaryKeywords', 'reason'] as const,
  additionalProperties: false as const,
};

/** Structured Outputs 用 JSON Schema（記事アイデア配列） */
const articleIdeasJsonSchema = {
  type: 'array' as const,
  items: {
    type: 'object' as const,
    properties: {
      title: { type: 'string' as const },
      keyword: { type: 'string' as const },
      outline: { type: 'string' as const },
    },
    required: ['title', 'keyword', 'outline'] as const,
    additionalProperties: false as const,
  },
};

/**
 * Claudeの返答テキストからJSONを抽出してパースする（output_config 未使用時のフォールバック用）。
 * コードブロック ```json ... ``` を優先し、末尾カンマなどの軽微な誤りを補正してからパースする。
 * オブジェクト {} と配列 [] の両方に対応。Structured Outputs 利用時は JSON.parse(content.text) を使用すること。
 */
function parseJsonFromClaudeResponse<T>(text: string): T {
  let raw = '';
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlock) {
    raw = codeBlock[1].trim();
  } else {
    const objMatch = text.match(/\{[\s\S]*\}/);
    const arrMatch = text.match(/\[[\s\S]*\]/);
    if (objMatch) raw = objMatch[0];
    else if (arrMatch) raw = arrMatch[0];
    else throw new Error('No JSON found in response');
  }

  const tryParse = (str: string): T => JSON.parse(str) as T;

  try {
    return tryParse(raw);
  } catch {
    // 補正1: 配列要素の間の欠けたカンマ（"改行" の並びを ", " に）
    let repaired = raw.replace(/"\s*\n\s*"/g, '", "');
    // 補正2: 末尾カンマ（,] ,}）を除去
    repaired = repaired.replace(/,(\s*[\]}])/g, '$1');
    try {
      return tryParse(repaired);
    } catch {
      // 補正3: 同じ行の隣接文字列 " " " にカンマを挿入（key": "value は : が含まれるので除外）
      repaired = raw.replace(/"\s+"/g, (m) => (m.includes(':') ? m : '", "'));
      repaired = repaired.replace(/,(\s*[\]}])/g, '$1');
      return tryParse(repaired);
    }
  }
}

/**
 * トピックからキーワードを提案
 */
export async function suggestKeywords(
  topic: string,
  context?: string
): Promise<KeywordSuggestion> {
  const prompt = `以下のトピックに対して、SEOに効果的な主要キーワード（1つ）と関連キーワード（3-5個）を日本語で提案してください。

トピック: ${topic}
${context ? `コンテキスト: ${context}` : ''}

対象読者: 中高生スポーツ選手とその保護者
サービス: 学習管理サービス「Nobilva」

JSON形式で返してください：
{
  "primaryKeyword": "主要キーワード",
  "secondaryKeywords": ["関連キーワード1", "関連キーワード2", "関連キーワード3"],
  "reason": "これらのキーワードを選んだ理由"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: keywordSuggestionJsonSchema },
    },
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text) as KeywordSuggestion;
  }

  throw new Error('Failed to parse Claude response');
}

/** 記事の想定文字数（全体・セクション） */
export const ARTICLE_LENGTH = {
  totalMin: 3000,
  totalMax: 4000,
  perH2Min: 500,
  perH2Max: 800,
} as const;

export interface GenerateDeepDiveOptions {
  /** 表記揺れ（variants）。メインキーワードの別表記 */
  mainKeywordVariants?: string[];
  /** 共起語（ラッコキーワード等で得た、読者が一緒に求めやすい語） */
  coOccurrenceWords?: string[];
}

/**
 * 5W1H × 検索意図 → マズローの段階的深掘り（アウトライン設計の前段で表示・ユーザーコメント用）
 */
export async function generateSearchIntentDeepDive(
  topic: string,
  mainKeyword: string,
  options?: GenerateDeepDiveOptions
): Promise<string> {
  const variantsBlock =
    (options?.mainKeywordVariants?.length ?? 0) > 0
      ? `\n表記揺れ（variants）: ${options!.mainKeywordVariants!.join(', ')}`
      : '';
  const coOccurBlock =
    (options?.coOccurrenceWords?.length ?? 0) > 0
      ? `\n共起語（読者が一緒に求めやすい語）: ${options!.coOccurrenceWords!.join(', ')}`
      : '';

  const prompt = `以下のキーワード・トピックについて、5W1H（Who/What/When/Where/Why/How）それぞれの観点で検索意図を分析し、マズローの欲求五段階（生理的欲求・安全欲求・所属と愛の欲求・承認欲求・自己実現欲求）のどれに当たるかまで段階的に深掘りしてください。

【トピック・キーワード】
トピック: ${topic}
主要キーワード: ${mainKeyword}${variantsBlock}${coOccurBlock}

【読者】
主な読者: 中高生の保護者（副次的に学生本人）。学習管理サービス「Nobilva」への興味喚起が目的。

【出力形式】
- 各5W1Hの観点ごとに「検索意図の分析 → マズローのどの段階に当たるか」を簡潔に書く
- 最後に「導入文や章立て（H2/H3）に活かせる発想・メモ」を2〜4行でまとめる
- Markdown形式で読みやすく出力（見出しは ## や ### を使用）

深掘り結果をMarkdown形式で出力してください。`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text.trim();
  }
  throw new Error('Failed to parse Claude response for deep dive');
}

export interface GenerateOutlineOptions {
  /** クラスター記事の場合、親ピラーページのslug */
  pillarSlug?: string;
  /** ピラー記事の場合 true（クラスター記事リンク候補コメントを挿入する指示に使う） */
  isPillar?: boolean;
  /** 表記揺れ（variants） */
  mainKeywordVariants?: string[];
  /** カニバリ回避: この記事では主題にしないキーワード一覧 */
  avoidKeywords?: string[];
  /** 共起語 */
  coOccurrenceWords?: string[];
  /** 検索意図・マズロー深掘り結果（Step2で生成したテキスト） */
  deepDiveText?: string;
  /** ユーザーが深掘りに追記した補足・修正 */
  userFeedbackOnDeepDive?: string;
}

/**
 * 記事のアウトラインを生成
 */
export async function generateOutline(
  topic: string,
  keywords: string[],
  targetLength: number = ARTICLE_LENGTH.totalMax,
  options?: GenerateOutlineOptions
): Promise<ContentOutline> {
  const pillarBlock = options?.pillarSlug
    ? `

【ピラー-クラスター構造（重要）】
この記事はクラスター記事です。ピラーページ（slug: ${options.pillarSlug}）への内部リンクを導入またはまとめ付近に含める設計にしてください。読者がより包括的な情報に辿り着けるようにする。`
    : '';

  const isPillarBlock =
    options?.isPillar && !options?.pillarSlug
      ? `

【ピラー記事】
この記事はピラー記事です。今後クラスター記事を紐づける余地を残すため、まとめ付近に \`<!-- クラスター記事リンク候補: （キーワードやテーマの例を1行で） -->\` のようなコメントを1つ入れる設計を想定してください。`
      : '';

  const variantsBlock =
    (options?.mainKeywordVariants?.length ?? 0) > 0
      ? `\n表記揺れ（variants）: ${options!.mainKeywordVariants!.join(', ')}（タイトル・見出し・本文で自然に使い分ける）`
      : '';

  const avoidBlock =
    (options?.avoidKeywords?.length ?? 0) > 0
      ? `

【カニバリ回避】
以下のキーワードは既に別記事で扱うため、この記事では主題にしないでください: ${options!.avoidKeywords!.join(', ')}`
      : '';

  const coOccurBlock =
    (options?.coOccurrenceWords?.length ?? 0) > 0
      ? `\n共起語（読者が一緒に求めやすい語）: ${options!.coOccurrenceWords!.join(', ')}（導入や見出し・本文に自然に織り込む）`
      : '';

  const deepDiveBlock =
    options?.deepDiveText || options?.userFeedbackOnDeepDive
      ? `

【検索意図・マズロー深掘り（参照）】
以下で行った5W1H×検索意図→マズロー深掘り（およびユーザーからの補足・修正）を踏まえ、導入文や章立て（H2/H3）を設計してください。

深掘り結果:
${options?.deepDiveText ?? ''}
${options?.userFeedbackOnDeepDive ? `\nユーザー補足・修正:\n${options.userFeedbackOnDeepDive}` : ''}`
      : '';

  const prompt = `以下の情報をもとに、SEOに最適化されたブログ記事のアウトラインを作成してください。
**まずタイトルと見出し（H2/H3）を決め、各セクションの keyPoints でスコープを明確にしてください。**

【トピック・キーワード】
トピック: ${topic}
主要キーワード: ${keywords[0]}${variantsBlock}${coOccurBlock}
関連キーワード: ${keywords.slice(1).join(', ')}
${avoidBlock}
${deepDiveBlock}

【読者・目的】
- 主な読者: 中高生の保護者（副次的に学生本人）。文体・トーンはこのペルソナで統一する
- 目的: 学習管理サービス「Nobilva」への興味喚起と問い合わせ促進

【EEAT】
EEAT（経験・専門性・権威性・信頼性）を重視する。嘘をつかない範囲で、具体例・データ・手順の明確さで説得力を高める。

【文字数設計】
- 記事全体: ${ARTICLE_LENGTH.totalMin}〜${ARTICLE_LENGTH.totalMax}字
- 各H2セクション: ${ARTICLE_LENGTH.perH2Min}〜${ARTICLE_LENGTH.perH2Max}字で設計（H3ごとに均等でなくてよい）

【セクション設計のルール】
- 各セクションは「このセクションだけで扱う情報」を明確にし、他セクションとの重複を避ける
- keyPointsには、他セクションと被らないスコープ（この見出しでだけ述べる内容）を書く
- 「成績基準」「時間管理」「成績アップ対策」のようにテーマが近いセクションは、役割分担をはっきりさせる（例: 成績基準＝数値・条件の説明、時間管理＝スケジュールの立て方、成績アップ＝具体的な勉強法のみ）
${pillarBlock}
${isPillarBlock}

以下のJSON形式で返してください：
{
  "title": "魅力的なタイトル（30-35文字、必ず入力。主要キーワードを自然に含む）",
  "slug": "url用スラッグ（英小文字・数字・ハイフンのみ。タイトルから変換。例: baseball-study-tips）",
  "description": "メタ説明（SEO用・検索結果に表示される短い説明。100-160文字。本文には一切出さない別枠のテキスト）",
  "introduction": "導入文（記事の冒頭1段落として本文に表示する文章。100-150文字、読者の悩みに共感）",
  "sections": [
    {
      "heading": "セクション見出し（H2）",
      "subheadings": ["小見出し1（H3）", "小見出し2（H3）"],
      "keyPoints": ["このセクションのみで扱うポイント1（他セクションと重複しない）", "ポイント2"]
    }
  ],
  "conclusion": "まとめ（記事の要点をまとめ、読者に前向きなメッセージ）"
}

※ title は必ず30-35文字で具体的内容を入れてください。slug はタイトルから変換（英小文字・数字・ハイフンのみ）
※ description と introduction は別物です。description＝メタ用（本文に書かない）。introduction＝記事冒頭の段落（本文に書く）
※ まとめの後に自動でCTAブロックが追加されるため、conclusionでは記事の内容を総括することに専念してください`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192, // アウトラインJSONはセクション数・keyPointsで長くなりやすいため
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: contentOutlineJsonSchema },
    },
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text) as ContentOutline;
  }

  throw new Error('Failed to parse Claude response');
}

/**
 * アウトラインを修正点に基づいて更新
 */
export async function updateOutline(
  currentOutline: ContentOutline,
  revisionRequest: string,
  keywords: string[]
): Promise<ContentOutline> {
  const prompt = `以下のアウトラインを、指定された修正点に基づいて更新してください。

【現在のアウトライン】
タイトル: ${currentOutline.title}
スラッグ: ${currentOutline.slug ?? ''}
メタ説明: ${currentOutline.description ?? ''}
導入文: ${currentOutline.introduction}

セクション構成:
${currentOutline.sections.map((s, i) => `${i + 1}. ${s.heading}\n   - ${s.subheadings.join('\n   - ')}`).join('\n\n')}

まとめ: ${currentOutline.conclusion}

【修正リクエスト】
${revisionRequest}

【キーワード情報】
主要キーワード: ${keywords[0]}
関連キーワード: ${keywords.slice(1).join(', ')}

【読者】
主な読者: 中高生の保護者（副次的に学生本人）。文体はこのペルソナで統一する。

【要件】
- 修正リクエストに従って、必要な部分を変更してください
- 変更が不要な部分は元の内容を保持してください
- 各セクションのスコープを明確に保ち、他セクションとの重複を避けてください
- 記事全体${ARTICLE_LENGTH.totalMin}〜${ARTICLE_LENGTH.totalMax}字、各H2は${ARTICLE_LENGTH.perH2Min}〜${ARTICLE_LENGTH.perH2Max}字で設計できる構成にしてください
- 主要キーワード「${keywords[0]}」をタイトルに含めてください
- アウトラインの構造（セクション数、バランス）を適切に保ってください

以下のJSON形式で返してください：
{
  "title": "更新されたタイトル（30-35文字、必ず入力。主要キーワード含む）",
  "slug": "更新されたurl用スラッグ（英小文字・数字・ハイフンのみ。タイトルから変換）",
  "description": "更新されたメタ説明（SEO用・100-160文字。本文には出さない）",
  "introduction": "更新された導入文（記事冒頭用・100-150文字）",
  "sections": [
    {
      "heading": "セクション見出し（H2）",
      "subheadings": ["小見出し1（H3）", "小見出し2（H3）"],
      "keyPoints": ["このセクションで伝えるポイント1", "ポイント2"]
    }
  ],
  "conclusion": "更新されたまとめ（記事の要点をまとめ、読者に前向きなメッセージ）"
}

※ title を変更した場合は slug もタイトルに合わせて更新してください。description と introduction は別のまま維持してください
※ まとめの後に自動でCTAブロックが追加されるため、conclusionでは記事の内容を総括することに専念してください`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: contentOutlineJsonSchema },
    },
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text) as ContentOutline;
  }

  throw new Error('Failed to parse Claude response for outline update');
}

/**
 * セクションの本文を生成（単体利用または既出参照付き）
 * previousSectionsMarkdown を渡すと、既出の内容を参照して重複を避ける
 */
export async function generateSectionContent(
  outline: OutlineSection,
  context: string,
  keywords: string[],
  options?: { previousSectionsMarkdown?: string }
): Promise<string> {
  const prevBlock = options?.previousSectionsMarkdown
    ? `\n【既に書いた内容（参照して重複・言い換えを避ける）】\n${options.previousSectionsMarkdown}\n`
    : '';

  const prompt = `以下のアウトラインをもとに、SEOに最適化された本文を作成してください。${prevBlock}

【このセクション】
見出し: ${outline.heading}
小見出し: ${outline.subheadings.join(', ')}
キーポイント（このセクションだけで扱う内容。他セクションと重複しない）: ${outline.keyPoints.join(', ')}

【コンテキスト】
トピック: ${context}
キーワード: ${keywords.join(', ')}

【読者】
主な読者: 中高生の保護者（副次的に学生本人）。文体はこのペルソナで統一する。

【要件】
- このセクションのスコープだけを扱い、既出内容や他セクションと重複しないようにする
- 具体例は「このセクションでだけ」使う競技・状況を1つ選び、他セクションと異なる事例にする（例: 野球だけにしない、サッカー・水泳・吹奏楽など別の競技・状況をローテーション）
- キーワードは見出し・導入に自然に含める。本文中でSEOキーワードを太字（**）で囲んだり強調しない
- 文字数: このセクションで${ARTICLE_LENGTH.perH2Min}〜${ARTICLE_LENGTH.perH2Max}字を目安に、情報密度を保つ
- タイトル・description（メタ説明）は別枠のため本文に書かない
- 見出しは ## または ### のみ使用（# はページタイトル用のため使わない）

【画像プレースホルダー】
- 内容に合う画像が適切な場合、このセクションに0〜1箇所、次の形式で挿入: \`![画像の説明](IMAGE_PLACEHOLDER:Unsplash検索キーワード)\`
- 視覚で伝えやすい箇所（手順・事例・イメージなど）のみ。不要なセクションでは入れない。

マークダウン形式で返してください。`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text.trim();
  }

  throw new Error('Failed to generate content');
}

export interface GenerateFullArticleOptions {
  /** クラスター記事の場合、親ピラーページのslug。内部リンクを追加する */
  pillarSlug?: string;
  /** ピラー記事の場合 true（まとめ直前にクラスター記事リンク候補コメントを挿入する指示） */
  isPillar?: boolean;
  /** 表記揺れ（variants） */
  mainKeywordVariants?: string[];
  /** カニバリ回避: この記事では主題にしないキーワード一覧 */
  avoidKeywords?: string[];
  /** 共起語 */
  coOccurrenceWords?: string[];
}

/**
 * 完全な記事を1つのプロンプトで生成（文脈共有により重複を防ぐ）
 * 注: タイトル・descriptionは別枠で表示するため本文には含めない。見出しは ## のみ（# はページタイトル用）
 */
export async function generateFullArticle(
  topic: string,
  keywords: string[],
  outline: ContentOutline,
  options?: GenerateFullArticleOptions
): Promise<string> {
  const outlineBlock = `
【記事全体のアウトライン】
タイトル: ${outline.title}
導入: ${outline.introduction}

セクション構成:
${outline.sections.map((s, i) => `${i + 1}. ## ${s.heading}\n   keyPoints（このセクションのみで扱う）: ${s.keyPoints.join(' / ')}\n   H3: ${s.subheadings.join(' / ')}`).join('\n\n')}

まとめ: ${outline.conclusion}
`;

  const pillarBlock = options?.pillarSlug
    ? `

【クラスター記事・内部リンク（必須）】
この記事はクラスター記事です。導入またはまとめ付近に、ピラーページ（/blog/${options.pillarSlug}）への内部リンクを自然な形で1箇所以上含めてください。例: 「スポーツ推薦と成績対策についてもっと詳しく知りたい方は、[こちらの記事](/blog/${options.pillarSlug})をご覧ください。」`
    : '';

  const isPillarBlock =
    options?.isPillar && !options?.pillarSlug
      ? `

【ピラー記事・クラスターリンク候補】
この記事はピラー記事です。**まとめ（## まとめ）の直前に**、\`<!-- クラスター記事リンク候補: （今後紐づけたいキーワードやテーマの例を1行で） -->\` の形式で1行コメントを1つ挿入してください。`
      : '';

  const variantsBlock =
    (options?.mainKeywordVariants?.length ?? 0) > 0
      ? `\n表記揺れ（variants）: ${options!.mainKeywordVariants!.join(', ')}（タイトル・見出し・本文で自然に使い分ける）`
      : '';

  const avoidBlock =
    (options?.avoidKeywords?.length ?? 0) > 0
      ? `\n【カニバリ回避】以下のキーワードは別記事で扱うため主題にしない: ${options!.avoidKeywords!.join(', ')}`
      : '';

  const coOccurBlock =
    (options?.coOccurrenceWords?.length ?? 0) > 0
      ? `\n共起語: ${options!.coOccurrenceWords!.join(', ')}（導入・見出し・本文に自然に織り込む）`
      : '';

  const prompt = `上記のアウトラインに従い、記事本文を**一括で**作成してください。決まったアウトライン（タイトル・見出し・keyPoints）に従って一貫した本文を書いてください。見出しごとに別々に書いて結合するのではなく、全体の文脈を共有した1本の記事にしてください。

【トピック・キーワード】
トピック: ${topic}
主要キーワード: ${keywords[0]}${variantsBlock}${coOccurBlock}
関連キーワード: ${keywords.slice(1).join(', ')}
${avoidBlock}

【読者】
主な読者: 中高生の保護者（副次的に学生本人）。文体・トーンはこのペルソナで統一する。
${pillarBlock}
${isPillarBlock}

【EEAT・一貫性と適切な長さ】
- EEAT（経験・専門性・権威性・信頼性）を重視する。嘘をつかない範囲で、具体例・データ・手順の明確さで説得力を高める。
- 記事内のトーン・用語・主張の一貫性を保つ。同じ話を薄く伸ばさず、情報密度を保ちつつ指定文字数内に収める。

【文字数】
- 記事全体（導入＋本文＋まとめ）: ${ARTICLE_LENGTH.totalMin}〜${ARTICLE_LENGTH.totalMax}字
- 各H2セクション: ${ARTICLE_LENGTH.perH2Min}〜${ARTICLE_LENGTH.perH2Max}字程度。同じ話を薄く伸ばさず、情報密度を保つ

【セクションの役割】
- 各セクションはアウトラインの keyPoints のスコープだけを扱い、他セクションとの重複を避ける
- 「成績基準」「時間管理」「成績アップ」など似たテーマが複数ある場合は、役割分担をはっきりさせる（数値・条件／スケジュールの立て方／具体的な勉強法など）

【具体例・エピソード】
- 各セクションで**異なる競技・状況**の例を使うこと（例: 1つ目は野球、2つ目はサッカー、3つ目は吹奏楽など）。同じ「評定2.8の野球部員」「朝練前30分」のようなパターンを繰り返さない
- 具体例は簡潔に、説得力を出す程度に留める

【SEOキーワード】
- 主要キーワードは**見出し（H2・H3）や導入部に自然に含める**
- **本文中でキーワードを太字（**）で囲んだり強調しない**。普通の文章として織り込む

【出力】
- **冒頭にはアウトラインの「導入」(introduction)のみを1段落で書く。メタ説明(description)の文言は本文に絶対に含めない**
- 導入の次から ## 見出しと ### 小見出しを使い、**まとめ（## まとめ）は出力しない**。まとめは別途追加する
- タイトル・メタ説明(description)は別枠のため本文に含めない。# は使わず ## から始める
- 画像プレースホルダー: 記事として読みやすい位置に2〜4箇所（導入付近・要点の直後など）、\`![説明](IMAGE_PLACEHOLDER:検索キーワード)\` の形式で挿入。詰め込みすぎず、要点を補う程度にする。

マークダウン形式で記事本文（まとめ以外）のみを出力してください。`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: outlineBlock + '\n' + prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') {
    throw new Error('Failed to generate full article');
  }

  let markdown = content.text.trim();

  markdown += `\n\n## まとめ\n\n${outline.conclusion}\n\n`;
  markdown += `---\n\n`;
  markdown += `:::cta-nobilva\n`;
  markdown += `title: 少年野球選手のための‖学習管理サービス「Nobilva」\n`;
  markdown += `description: Nobilvaでは、野球に打ち込む中高生のための学習管理サービスを提供しています。専属メンター制度、LINE相談、個別学習計画など、部活と勉強の両立を全力でサポート。\n`;
  markdown += `button: 詳しく見る\n`;
  markdown += `link: /services/nobilva\n`;
  markdown += `:::\n`;

  return markdown;
}

/**
 * 記事をリライト（改善）
 */
export async function improveArticle(
  content: string,
  improvements: string[]
): Promise<string> {
  const prompt = `以下の記事を、指定された改善点に基づいてリライトしてください。

現在の記事:
${content}

改善点:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

【読者】
主な読者: 中高生の保護者（副次的に学生本人）。文体はこのペルソナで統一する。

要件：
- 元の情報を保持しながら改善
- 自然な文章フロー
- SEOキーワードは見出し・導入に自然に含め、本文中で太字強調しない
- SEO最適化

マークダウン形式で返してください。`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const messageContent = message.content[0];
  if (messageContent.type === 'text') {
    return messageContent.text.trim();
  }

  throw new Error('Failed to improve article');
}

export interface KeywordIdeaContext {
  keyword: string;
  tier?: 'big' | 'middle' | 'longtail';
  workflowFlag?: string;
  businessImpact?: number;
}

/**
 * キーワードギャップから記事アイデアを生成
 * keywordContext がある場合、事業インパクトや階層を考慮して優先順位付けする
 */
export async function generateArticleIdeas(
  unusedKeywords: string[],
  existingTopics: string[],
  keywordContext?: KeywordIdeaContext[]
): Promise<Array<{ title: string; keyword: string; outline: string }>> {
  const contextBlock =
    keywordContext && keywordContext.length > 0
      ? `

キーワードの優先度情報（事業インパクトが高い順、要作成フラグを優先）:
${keywordContext
  .map(
    (k) =>
      `- ${k.keyword}: 階層=${k.tier ?? '不明'}, フラグ=${k.workflowFlag ?? '不明'}, 事業インパクト=${k.businessImpact ?? '不明'}`
  )
  .join('\n')}
※ 事業インパクトが高いキーワード、要作成(to_create)フラグのキーワードを優先して提案してください。`
      : '';

  const prompt = `以下の未使用キーワードから、ブログ記事のアイデアを3つ提案してください。

未使用キーワード:
${unusedKeywords.join('\n')}

既存の記事トピック（重複を避ける）:
${existingTopics.join('\n')}

対象読者: 中高生スポーツ選手とその保護者
サービス: 学習管理サービス「Nobilva」

【ピラー-クラスター構造】
- ミドルワード（同じ趣旨）は1つのピラーページで複数カバーする
- ロングテールワードは種目・時間帯・状況を絞ったクラスター記事。ピラーページへの内部リンクを入れる
- 同じ意図グループのキーワードは1記事にまとめることを検討する
${contextBlock}

JSON形式で返してください：
[
  {
    "title": "記事タイトル",
    "keyword": "主要キーワード",
    "outline": "記事の概要（2-3文）"
  }
]`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: articleIdeasJsonSchema },
    },
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text) as Array<{ title: string; keyword: string; outline: string }>;
  }

  throw new Error('Failed to generate article ideas');
}

/**
 * キーワードマスターのデータから記事アウトラインを生成
 */
export async function generateOutlineFromKeyword(
  keyword: string,
  keywordData: TargetKeywordData,
  additionalContext?: string
): Promise<ContentOutline> {
  const businessLabels = {
    translation: '翻訳サービス',
    'web-design': 'Web制作',
    print: '印刷物制作',
    nobilva: '学習管理サービス「Nobilva」',
    teachit: 'AI教育アプリ「Teachit」',
  };

  const relatedServices = keywordData.relatedBusiness
    .map((b) => businessLabels[b])
    .join('、');

  const prompt = `以下の情報をもとに、SEOに最適化されたブログ記事のアウトラインを作成してください。

【キーワード情報】
主要キーワード: ${keyword}
重要度: ${keywordData.priority}/5
想定月間PV: ${keywordData.estimatedPv.toLocaleString()}
関連サービス: ${relatedServices}
関連タグ: ${keywordData.relatedTags.join(', ')}
${additionalContext ? `追加情報: ${additionalContext}` : ''}

【記事の方向性】
- このキーワードは重要度${keywordData.priority}/5の戦略的キーワードです
- 月間${keywordData.estimatedPv.toLocaleString()}PVを目標としています
- ${relatedServices}への興味喚起と問い合わせを促進することが目的です

【読者・文字数】
- 主な読者: 中高生の保護者（副次的に学生本人）。文体・トーンはこのペルソナで統一する
- 記事全体: ${ARTICLE_LENGTH.totalMin}〜${ARTICLE_LENGTH.totalMax}字、各H2セクション: ${ARTICLE_LENGTH.perH2Min}〜${ARTICLE_LENGTH.perH2Max}字で設計する

【セクション設計のルール】
- 各セクションは「このセクションだけで扱う情報」に限定し、他セクションとの重複を避ける
- keyPointsには他セクションと被らないスコープを書く（例: 成績基準＝数値・条件、時間管理＝スケジュールの立て方、成績アップ＝勉強法のみ）

【要件】
- タイトルには必ず主要キーワード「${keyword}」を含めてください
- 関連タグ（${keywordData.relatedTags.join(', ')}）を自然に本文に織り込んでください
- 読者の検索意図に応える実用的な内容にしてください
- 想定PVから逆算して、多くの人に刺さる内容にしてください
- 記事の最後にはCTA（Call to Action）ブロックが自動で追加されるため、まとめは自然な締めくくりにしてください

以下のJSON形式で返してください：
{
  "title": "魅力的なタイトル（30-35文字、必ず入力。主要キーワード「${keyword}」を含む）",
  "slug": "url用スラッグ（英小文字・数字・ハイフンのみ。タイトルから変換。例: athletic-recruitment-guide）",
  "description": "メタ説明（SEO用・検索結果に表示。100-160文字。本文には出さない別枠のテキスト）",
  "introduction": "導入文（記事の冒頭1段落として本文に表示。100-150文字、読者の悩みに共感）",
  "sections": [
    {
      "heading": "セクション見出し（H2）",
      "subheadings": ["小見出し1（H3）", "小見出し2（H3）"],
      "keyPoints": ["このセクションで伝えるポイント1", "ポイント2"]
    }
  ],
  "conclusion": "まとめ（記事の要点をまとめ、読者に前向きなメッセージ。強引な営業は避ける）"
}

※ title と slug は同時に生成してください。description＝メタ用（本文に書かない）。introduction＝記事冒頭（本文に書く）
※ 6-8個のセクションを作成してください
※ まとめの後に自動でCTAブロックが追加されるため、conclusionでは記事の内容を総括することに専念してください`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    output_config: {
      format: { type: 'json_schema', schema: contentOutlineJsonSchema },
    },
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return JSON.parse(content.text) as ContentOutline;
  }

  throw new Error('Failed to generate outline from keyword');
}

/**
 * キーワードマスターのデータから記事本文を生成
 */
export async function generateArticleFromKeyword(
  keyword: string,
  keywordData: TargetKeywordData,
  outline: ContentOutline
): Promise<string> {
  const businessLabels = {
    translation: '翻訳サービス',
    'web-design': 'Web制作',
    print: '印刷物制作',
    nobilva: '学習管理サービス「Nobilva」',
    teachit: 'AI教育アプリ「Teachit」',
  };

  const relatedServices = keywordData.relatedBusiness
    .map((b) => businessLabels[b])
    .join('、');

  const prompt = `以下のアウトラインをもとに、SEOに最適化された記事本文を**一括で**作成してください。見出しごとに別々に書いて結合するのではなく、全体の文脈を共有した1本の記事にしてください。

【キーワード情報】
主要キーワード: ${keyword}
重要度: ${keywordData.priority}/5
想定月間PV: ${keywordData.estimatedPv.toLocaleString()}
関連サービス: ${relatedServices}

【アウトライン】
タイトル: ${outline.title}
導入: ${outline.introduction}

セクション（keyPoints＝このセクションのみで扱うスコープ）:
${outline.sections.map((s, i) => `${i + 1}. ${s.heading}\n   keyPoints: ${s.keyPoints.join(' / ')}\n   H3: ${s.subheadings.map((sh) => sh).join(' / ')}`).join('\n\n')}

まとめ: ${outline.conclusion}

【読者】
主な読者: 中高生の保護者（副次的に学生本人）。文体・トーンはこのペルソナで統一する。

【文字数】
- 記事全体: ${ARTICLE_LENGTH.totalMin}〜${ARTICLE_LENGTH.totalMax}字
- 各H2セクション: ${ARTICLE_LENGTH.perH2Min}〜${ARTICLE_LENGTH.perH2Max}字程度。同じ話を薄く伸ばさず情報密度を保つ

【セクションの役割】
- 各セクションはアウトラインの keyPoints のスコープだけを扱い、他セクションとの重複を避ける
- 似たテーマのセクションは役割分担をはっきりさせる（数値・条件／スケジュール／具体的な勉強法など）

【具体例・エピソード】
- 各セクションで**異なる競技・状況**の例を使うこと（野球だけにしない。サッカー・水泳・吹奏楽などローテーション）。「評定2.8の野球部員」「朝練前30分」のような同じパターンを繰り返さない

【要件】
1. 主要キーワード「${keyword}」は**見出し（H2・H3）や導入部に自然に含める**。本文中で太字（**）で囲んだり強調しない
2. 具体例、データ、ストーリーを含める（上記のとおりセクションごとに異なる競技・状況で）
3. 読みやすい文章（短い段落、箇条書き活用）。読み物としての品質を最優先する
4. まとめに${relatedServices}への自然な誘導を含める
5. Markdown形式で出力（見出しは ## から開始。# は使用しない）

【重要】
- **冒頭にはアウトラインの「導入」(introduction)のみを1段落で書く。メタ説明(description)の文言は本文に絶対に含めない**
- タイトル・description（メタ説明文）は別枠で表示するため、本文には絶対に書かないでください
- 見出しは ## のみ使用（# はページタイトル用のため本文では使わない）。導入の次から ## でセクションを書く

【画像プレースホルダー】
- 記事の流れに応じて、適切な位置（導入付近・要点の直後など）に画像を2〜4箇所入れてください。
- 必ず次の形式でプレースホルダーを書いてください：\`![画像の説明やキャプション](IMAGE_PLACEHOLDER:Unsplashで検索するキーワード)\`
- 例：\`![野球の練習風景](IMAGE_PLACEHOLDER:baseball practice)\`、\`![勉強と部活の両立イメージ](IMAGE_PLACEHOLDER:student studying)\`
- \`![]\` 内は、その画像のalt／キャプションとして使える具体的な説明を日本語で書く。
- \`IMAGE_PLACEHOLDER:\` の後は、編集者がUnsplashをブラウザで検索するときに入力する英単語（または短いフレーズ）を書く。日本語キーワードでも可。
- 記事として適切な量に留める（1記事あたり2〜4枚程度。要点を補う程度にし、詰め込みすぎない）。

【CTAブロックの追加】
記事の最後（まとめの後）に、以下の形式でCTAブロックを必ず追加してください：

---

:::cta-${keywordData.relatedBusiness[0] || 'nobilva'}
title: 記事のテーマに合わせた魅力的なタイトル
description: ${relatedServices}に関連した説明文（100-150文字）。読者の悩みを解決できることを具体的に伝える。
button: 詳しく見る または 無料相談に申し込む など、行動を促すテキスト
link: /${keywordData.relatedBusiness[0] === 'teachit' ? 'teachit' : keywordData.relatedBusiness[0] === 'translation' ? 'services/translation' : keywordData.relatedBusiness[0] === 'web-design' ? 'services/web-design' : keywordData.relatedBusiness[0] === 'print' ? 'services/print' : 'services/nobilva'}
:::

【CTA作成の例】
Nobilvaの場合：
:::cta-nobilva
title: 少年野球選手のための‖学習管理サービス「Nobilva」
description: Nobilvaでは、野球に打ち込む中高生のための学習管理サービスを提供しています。専属メンター制度、LINE相談、個別学習計画など、部活と勉強の両立を全力でサポート。
button: 詳しく見る
link: /services/nobilva
:::

※ CTAの内容は記事のテーマとサービス（${relatedServices}）に合わせて適切にカスタマイズしてください
※ title/description内で改行したい位置に‖（U+2016）を入れるとその位置で改行されます
※ 利用可能なCTAタイプ：:::cta-nobilva、:::cta-teachit、:::cta-translation、:::cta-web-design、:::cta-print

記事本文のみを出力してください：`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 16000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text;
  }

  throw new Error('Failed to generate article from keyword');
}
