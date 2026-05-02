import Anthropic from '@anthropic-ai/sdk';
import type { TargetKeywordData } from './keyword-manager';
import type { ClusterAxis, ArticleRole, TargetReader } from './blog';

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

対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
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

/** 記事の想定文字数（全体・セクション）。volume に応じて選択する */
export const ARTICLE_LENGTH = {
  /** 軽量: 子記事・ロングテール向け 2000-3000字 */
  light:    { totalMin: 2000, totalMax: 3000, perH2Min: 400, perH2Max:  600 },
  /** 標準: 一般的な子記事 3000-5000字 */
  standard: { totalMin: 3000, totalMax: 5000, perH2Min: 500, perH2Max:  900 },
  /** 重量: ハブ記事・軸エントリーポイント 6000-8000字 */
  heavy:    { totalMin: 6000, totalMax: 8000, perH2Min: 700, perH2Max: 1200 },
} as const;

/** volume 名から文字数設定を取得（デフォルト: standard） */
function getArticleLength(volume?: 'light' | 'standard' | 'heavy') {
  return ARTICLE_LENGTH[volume ?? 'standard'];
}

export interface GenerateDeepDiveOptions {
  /** 表記揺れ（variants）。メインキーワードの別表記 */
  mainKeywordVariants?: string[];
  /** 共起語（ラッコキーワード等で得た、読者が一緒に求めやすい語） */
  coOccurrenceWords?: string[];
  /** 対象読者（A3トーン設定） */
  targetReader?: TargetReader;
  /** 4軸クラスター */
  clusterAxis?: ClusterAxis;
}

const AXIS_LABEL: Record<ClusterAxis, string> = {
  time:         '時間軸（テスト前・オフシーズン・引退後など時期に応じた勉強戦略）',
  career:       '進路軸（スポーツ推薦・一般受験・就職など進路選択に関わる情報）',
  self:         '自己認識軸（モチベーション・メンタル・自己分析など内面の成長）',
  relationship: '関係性軸（保護者・コーチ・チームメイトとの関係や環境づくり）',
  other:        'その他（一般的な学習・勉強に関するトピック）',
};

const TARGET_READER_LABEL: Record<TargetReader, string> = {
  parent:  '保護者向け（「お子さん」「ご家庭」などの敬語表現。情報・安心感重視）',
  student: '生徒向け（「あなた」「自分」などの親しみやすい表現。行動促進重視）',
  both:    '両方向け（保護者への説明＋生徒への励ましを両立。中立的な文体）',
};

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
  const axisBlock = options?.clusterAxis
    ? `\nクラスター軸: ${AXIS_LABEL[options.clusterAxis]}`
    : '';
  const readerContext = options?.targetReader
    ? TARGET_READER_LABEL[options.targetReader]
    : '両方向け（保護者への説明＋生徒への励ましを両立。中立的な文体）';

  const prompt = `以下のキーワード・トピックについて、5W1H（Who/What/When/Where/Why/How）それぞれの観点で検索意図を分析し、マズローの欲求五段階（生理的欲求・安全欲求・所属と愛の欲求・承認欲求・自己実現欲求）のどれに当たるかまで段階的に深掘りしてください。

【トピック・キーワード】
トピック: ${topic}
主要キーワード: ${mainKeyword}${variantsBlock}${coOccurBlock}${axisBlock}

【読者・サービス】
対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
文体・トーン: ${readerContext}
サービス: 学習管理サービス「Nobilva」（月18,000円〜、30日全額返金保証、月20名限定の無料学習診断）

【出力形式】
- 各5W1Hの観点ごとに「検索意図の分析 → マズローのどの段階に当たるか」を簡潔に書く
- 最後に「導入文や章立て（H2/H3）に活かせる発想・メモ」を2〜4行でまとめる
- Markdown形式で読みやすく出力（見出しは ## や ### を使用）

深掘り結果をMarkdown形式で出力してください。`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    return content.text.trim();
  }
  throw new Error('Failed to parse Claude response for deep dive');
}

export interface GenerateOutlineOptions {
  /** 4軸クラスター */
  clusterAxis?: ClusterAxis;
  /** 記事種別: ハブ記事 or 子記事 */
  articleRole?: ArticleRole;
  /** 対象読者（A3トーン設定） */
  targetReader?: TargetReader;
  /** 文字数ボリューム（デフォルト: standard） */
  volume?: 'light' | 'standard' | 'heavy';
  /** 子記事の場合、親ハブ記事の slug（内部リンク設計に使用） */
  hubSlug?: string;
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
  targetLength: number = ARTICLE_LENGTH.standard.totalMax,
  options?: GenerateOutlineOptions
): Promise<ContentOutline> {
  const len = getArticleLength(options?.volume);

  const articleRoleBlock = options?.articleRole === 'hub'
    ? `

【ハブ記事（軸エントリーポイント）】
この記事は軸のハブ記事です。${options?.clusterAxis ? `「${AXIS_LABEL[options.clusterAxis]}」` : ''}の全体像を網羅し、今後紐づける子記事への内部リンク候補コメントをまとめ直前に1つ挿入してください: \`<!-- 子記事リンク候補: （今後追加するキーワードの例を1行で） -->\``
    : options?.hubSlug
      ? `

【子記事・内部リンク（必須）】
この記事は子記事です。導入またはまとめ付近に、ハブ記事（/blog/${options.hubSlug}）への内部リンクを自然な形で1箇所以上含めてください。`
      : '';

  const axisBlock = options?.clusterAxis
    ? `\nクラスター軸: ${AXIS_LABEL[options.clusterAxis]}`
    : '';

  const readerToneBlock = options?.targetReader
    ? `\n文体・トーン: ${TARGET_READER_LABEL[options.targetReader]}`
    : '\n文体・トーン: 両方向け（保護者への説明＋生徒への励ましを両立。中立的な文体）';

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
- 対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者${readerToneBlock}${axisBlock}
- 目的: 学習管理サービス「Nobilva」への興味喚起と問い合わせ促進

【EEAT・LLM最適化】
- EEAT（経験・専門性・権威性・信頼性）を重視する。嘘をつかない範囲で、具体例・データ・手順の明確さで説得力を高める
- 見出し（H2/H3）は「〜するには？」「〜の理由は？」など疑問形を適宜使い、AI/検索エンジンへの回答性を高める
- 各セクションの冒頭に結論・要点を先出しする設計にする

【文字数設計】
- 記事全体: ${len.totalMin}〜${len.totalMax}字
- 各H2セクション: ${len.perH2Min}〜${len.perH2Max}字で設計（H3ごとに均等でなくてよい）

【セクション設計のルール】
- 各セクションは「このセクションだけで扱う情報」を明確にし、他セクションとの重複を避ける
- keyPointsには、他セクションと被らないスコープ（この見出しでだけ述べる内容）を書く
- 「成績基準」「時間管理」「成績アップ対策」のようにテーマが近いセクションは、役割分担をはっきりさせる（例: 成績基準＝数値・条件の説明、時間管理＝スケジュールの立て方、成績アップ＝具体的な勉強法のみ）
${articleRoleBlock}

以下のJSON形式で返してください：
{
  "title": "魅力的なタイトル（30-38文字、必ず入力。主要キーワードを自然に含む。疑問形・具体的な数字を積極使用）",
  "slug": "url用スラッグ（英小文字・数字・ハイフンのみ。タイトルから変換。例: baseball-study-tips）",
  "description": "メタ説明（SEO用・検索結果に表示される短い説明。100-160文字。本文には一切出さない別枠のテキスト）",
  "introduction": "導入文（記事の冒頭1段落として本文に表示する文章。100-150文字、読者の悩みに共感・結論を先出し）",
  "sections": [
    {
      "heading": "セクション見出し（H2・疑問形推奨）",
      "subheadings": ["小見出し1（H3）", "小見出し2（H3）"],
      "keyPoints": ["このセクションのみで扱うポイント1（他セクションと重複しない）", "ポイント2"]
    }
  ],
  "conclusion": "まとめ（記事の要点をまとめ、読者に前向きなメッセージ）"
}

※ title は必ず30-38文字で具体的内容を入れてください。slug はタイトルから変換（英小文字・数字・ハイフンのみ）
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

export interface UpdateOutlineOptions {
  clusterAxis?: ClusterAxis;
  articleRole?: ArticleRole;
  targetReader?: TargetReader;
  volume?: 'light' | 'standard' | 'heavy';
  hubSlug?: string;
  /** 検索意図・マズロー深掘り結果（Step2で生成したテキスト） */
  deepDiveText?: string;
  /** ユーザーが深掘りに追記した補足・修正 */
  userFeedbackOnDeepDive?: string;
}

/**
 * アウトラインを修正点に基づいて更新
 */
export async function updateOutline(
  currentOutline: ContentOutline,
  revisionRequest: string,
  keywords: string[],
  options?: UpdateOutlineOptions
): Promise<ContentOutline> {
  const len = getArticleLength(options?.volume);
  const readerToneBlock = options?.targetReader
    ? `\n文体・トーン: ${TARGET_READER_LABEL[options.targetReader]}`
    : '\n文体・トーン: 両方向け（保護者への説明＋生徒への励ましを両立。中立的な文体）';
  const axisBlock = options?.clusterAxis
    ? `\nクラスター軸: ${AXIS_LABEL[options.clusterAxis]}`
    : '';
  const articleRoleNote = options?.articleRole === 'hub'
    ? '\n記事タイプ: ハブ記事（軸全体を網羅する6000-8000字構成を維持）'
    : options?.hubSlug
      ? `\n記事タイプ: 子記事（ハブ記事 /blog/${options.hubSlug} への内部リンクを保持）`
      : '';
  const deepDiveBlock =
    options?.deepDiveText || options?.userFeedbackOnDeepDive
      ? `

【検索意図・マズロー深掘り（参照）】
以下の深掘り結果を踏まえ、修正後もアウトラインの章立て・導入文に活かしてください。

深掘り結果:
${options?.deepDiveText ?? ''}
${options?.userFeedbackOnDeepDive ? `\nユーザー補足・修正:\n${options.userFeedbackOnDeepDive}` : ''}`
      : '';

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

【読者・設定】
対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者${readerToneBlock}${axisBlock}${articleRoleNote}${deepDiveBlock}

【要件】
- 修正リクエストに従って、必要な部分を変更してください
- 変更が不要な部分は元の内容を保持してください
- 各セクションのスコープを明確に保ち、他セクションとの重複を避けてください
- 記事全体${len.totalMin}〜${len.totalMax}字、各H2は${len.perH2Min}〜${len.perH2Max}字で設計できる構成にしてください
- 主要キーワード「${keywords[0]}」をタイトルに含めてください
- アウトラインの構造（セクション数、バランス）を適切に保ってください

以下のJSON形式で返してください：
{
  "title": "更新されたタイトル（30-38文字、必ず入力。主要キーワード含む）",
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
- 具体例は「このセクションでだけ」使う状況を1つ選び、他セクションと異なる場面にする（例: 朝練前の隙間時間・テスト週間・秋季大会後のオフシーズンなど野球の場面をローテーション）
- キーワードは見出し・導入に自然に含める。本文中でSEOキーワードを太字（**）で囲んだり強調しない
- 文字数: このセクションで${ARTICLE_LENGTH.standard.perH2Min}〜${ARTICLE_LENGTH.standard.perH2Max}字を目安に、情報密度を保つ
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
  /** 4軸クラスター */
  clusterAxis?: ClusterAxis;
  /** 記事種別: ハブ記事 or 子記事 */
  articleRole?: ArticleRole;
  /** 対象読者（A3トーン・CTA設定） */
  targetReader?: TargetReader;
  /** 文字数ボリューム（デフォルト: standard） */
  volume?: 'light' | 'standard' | 'heavy';
  /** 子記事の場合、親ハブ記事の slug（内部リンクに使用） */
  hubSlug?: string;
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
  const len = getArticleLength(options?.volume);

  const outlineBlock = `
【記事全体のアウトライン】
タイトル: ${outline.title}
導入: ${outline.introduction}

セクション構成:
${outline.sections.map((s, i) => `${i + 1}. ## ${s.heading}\n   keyPoints（このセクションのみで扱う）: ${s.keyPoints.join(' / ')}\n   H3: ${s.subheadings.join(' / ')}`).join('\n\n')}

まとめ: ${outline.conclusion}
`;

  const articleRoleBlock = options?.articleRole === 'hub'
    ? `

【ハブ記事・子記事リンク候補（必須）】
この記事はハブ記事です。**まとめ（## まとめ）の直前に**、\`<!-- 子記事リンク候補: （今後紐づけたいキーワードやテーマの例を1行で） -->\` の形式で1行コメントを1つ挿入してください。`
    : options?.hubSlug
      ? `

【子記事・内部リンク（必須）】
この記事は子記事です。導入またはまとめ付近に、ハブ記事（/blog/${options.hubSlug}）への内部リンクを自然な形で1箇所以上含めてください。`
      : '';

  const axisBlock = options?.clusterAxis
    ? `\nクラスター軸: ${AXIS_LABEL[options.clusterAxis]}`
    : '';

  const readerToneBlock = options?.targetReader
    ? `\n文体・トーン: ${TARGET_READER_LABEL[options.targetReader]}`
    : '\n文体・トーン: 両方向け（保護者への説明＋生徒への励ましを両立。中立的な文体）';

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

【読者・サービス】
対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者${readerToneBlock}${axisBlock}
サービス: 学習管理サービス「Nobilva」（月18,000円〜、30日全額返金保証、月20名限定の無料学習診断）
${articleRoleBlock}

【EEAT・LLM最適化・一貫性】
- EEAT（経験・専門性・権威性・信頼性）を重視する。嘘をつかない範囲で、具体例・データ・手順の明確さで説得力を高める
- 各セクションの冒頭に結論・要点を先出しする（AI/検索エンジンが回答を抜き出しやすい構造）
- 記事内のトーン・用語・主張の一貫性を保つ。同じ話を薄く伸ばさず、情報密度を保ちつつ指定文字数内に収める

【文字数】
- 記事全体（導入＋本文＋まとめ）: ${len.totalMin}〜${len.totalMax}字
- 各H2セクション: ${len.perH2Min}〜${len.perH2Max}字程度。同じ話を薄く伸ばさず、情報密度を保つ

【セクションの役割】
- 各セクションはアウトラインの keyPoints のスコープだけを扱い、他セクションとの重複を避ける
- 似たテーマが複数ある場合は役割分担をはっきりさせる（数値・条件／スケジュールの立て方／具体的な勉強法など）

【具体例・エピソード（野球特化）】
- 野球部の練習スケジュール・試合・オフシーズンなど野球特有の状況を活かした例を使う
- 各セクションで**異なる場面・状況**の例を使うこと（朝練前／テスト週間／引退後などをローテーション）
- 具体例は簡潔に、説得力を出す程度に留める

【SEOキーワード】
- 主要キーワードは**見出し（H2・H3）や導入部に自然に含める**
- **本文中でキーワードを太字（**）で囲んだり強調しない**。普通の文章として織り込む

【出力】
- **冒頭にはアウトラインの「導入」(introduction)のみを1段落で書く。メタ説明(description)の文言は本文に絶対に含めない**
- 導入の次から ## 見出しと ### 小見出しを使い、**まとめ（## まとめ）は出力しない**。まとめは別途追加する
- タイトル・メタ説明(description)は別枠のため本文に含めない。# は使わず ## から始める
- 画像プレースホルダー: 記事として読みやすい位置に2〜4箇所（導入付近・要点の直後など）、\`![説明](IMAGE_PLACEHOLDER:検索キーワード)\` の形式で挿入。野球に関連する場面の英語キーワードを推奨（例: baseball practice, student studying, baseball player）

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

  // A3 CTAテンプレート: targetReader に応じて切り替え
  const targetReader = options?.targetReader ?? 'both';
  if (targetReader === 'parent') {
    markdown += `:::cta-nobilva\n`;
    markdown += `title: 野球をがんばるお子さんの‖学習をサポートします\n`;
    markdown += `description: Nobilvaは野球に打ち込む中高生のための‖学習管理サービス。‖専属メンター制度（日割り学習計画・‖週1回オンライン面談・毎日の進捗確認）で‖お子さんの学習を全力サポート。‖月18,000円〜、30日全額返金保証付き。\n`;
    markdown += `button: 無料学習診断に申し込む\n`;
    markdown += `link: /services/nobilva\n`;
    markdown += `:::\n`;
  } else if (targetReader === 'student') {
    markdown += `:::cta-nobilva\n`;
    markdown += `title: 野球しながら成績アップを目指す‖あなたをサポートします\n`;
    markdown += `description: Nobilvaは、部活に全力で取り組む君のための‖学習管理サービス。‖専属メンター制度（日割り学習計画・‖週1回オンライン面談・毎日の進捗確認）で‖野球しながら成績アップを目指せる。‖月18,000円〜、30日全額返金保証付き。\n`;
    markdown += `button: 詳しく見る\n`;
    markdown += `link: /services/nobilva\n`;
    markdown += `:::\n`;
  } else {
    markdown += `:::cta-nobilva\n`;
    markdown += `title: 野球をがんばる中高生のための‖学習管理サービス「Nobilva」\n`;
    markdown += `description: 月18,000円〜、30日全額返金保証付き。‖月20名限定の無料学習診断受付中。‖専属メンター制度（日割り学習計画・‖週1回オンライン面談・毎日の進捗確認）で‖学習を全力サポート。\n`;
    markdown += `button: 無料学習診断に申し込む\n`;
    markdown += `link: /services/nobilva\n`;
    markdown += `:::\n`;
  }

  return markdown;
}

export interface ImproveArticleOptions {
  clusterAxis?: ClusterAxis;
  articleRole?: ArticleRole;
  targetReader?: TargetReader;
}

/**
 * 記事をリライト（改善）
 */
export async function improveArticle(
  content: string,
  improvements: string[],
  options?: ImproveArticleOptions
): Promise<string> {
  const readerToneBlock = options?.targetReader
    ? TARGET_READER_LABEL[options.targetReader]
    : '両方向け（保護者への説明＋生徒への励ましを両立。中立的な文体）';
  const axisBlock = options?.clusterAxis
    ? `\nクラスター軸: ${AXIS_LABEL[options.clusterAxis]}`
    : '';

  const prompt = `以下の記事を、指定された改善点に基づいてリライトしてください。

現在の記事:
${content}

改善点:
${improvements.map((imp, i) => `${i + 1}. ${imp}`).join('\n')}

【読者・サービス】
対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
文体・トーン: ${readerToneBlock}${axisBlock}
サービス: 学習管理サービス「Nobilva」（月18,000円〜、30日全額返金保証、月20名限定の無料学習診断）

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
  clusterAxis?: ClusterAxis;
  articleRole?: ArticleRole;
  articleStatus?: string;
  businessImpact?: number;
}

/**
 * キーワードギャップから記事アイデアを生成
 * keywordContext がある場合、軸・記事種別・ステータスを考慮して優先順位付けする
 */
export async function generateArticleIdeas(
  unusedKeywords: string[],
  existingTopics: string[],
  keywordContext?: KeywordIdeaContext[]
): Promise<Array<{ title: string; keyword: string; outline: string }>> {
  const contextBlock =
    keywordContext && keywordContext.length > 0
      ? `

キーワードの優先度情報（pending/planning を優先、ハブ記事を先行提案）:
${keywordContext
  .map(
    (k) =>
      `- ${k.keyword}: 軸=${k.clusterAxis ? AXIS_LABEL[k.clusterAxis].split('（')[0] : '不明'}, 種別=${k.articleRole ?? '不明'}, ステータス=${k.articleStatus ?? '不明'}, 事業インパクト=${k.businessImpact ?? '不明'}`
  )
  .join('\n')}
※ pending/planning のキーワードを優先して提案。ハブ記事（articleRole=hub）は軸全体をカバーする包括的な記事として提案してください。`
      : '';

  const prompt = `以下の未使用キーワードから、ブログ記事のアイデアを3つ提案してください。

未使用キーワード:
${unusedKeywords.join('\n')}

既存の記事トピック（重複を避ける）:
${existingTopics.join('\n')}

対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
サービス: 学習管理サービス「Nobilva」（月18,000円〜、30日全額返金保証）

【4軸クラスター構造】
- 時間軸: テスト前・オフシーズン・引退後など時期に応じた勉強戦略
- 進路軸: スポーツ推薦・一般受験・就職など進路選択に関わる情報
- 自己認識軸: モチベーション・メンタル・自己分析など内面の成長
- 関係性軸: 保護者・コーチ・チームメイトとの関係や環境づくり
- ハブ記事（articleRole=hub）は軸のエントリーポイントとして、軸全体を網羅する包括的な記事にする
- 子記事はハブ記事への内部リンクを含む設計にする
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
- 記事全体: ${ARTICLE_LENGTH.standard.totalMin}〜${ARTICLE_LENGTH.standard.totalMax}字、各H2セクション: ${ARTICLE_LENGTH.standard.perH2Min}〜${ARTICLE_LENGTH.standard.perH2Max}字で設計する

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
- 記事全体: ${ARTICLE_LENGTH.standard.totalMin}〜${ARTICLE_LENGTH.standard.totalMax}字
- 各H2セクション: ${ARTICLE_LENGTH.standard.perH2Min}〜${ARTICLE_LENGTH.standard.perH2Max}字程度。同じ話を薄く伸ばさず情報密度を保つ

【セクションの役割】
- 各セクションはアウトラインの keyPoints のスコープだけを扱い、他セクションとの重複を避ける
- 似たテーマのセクションは役割分担をはっきりさせる（数値・条件／スケジュール／具体的な勉強法など）

【具体例・エピソード】
- 各セクションで**異なる野球の場面・状況**の例を使うこと（朝練前・テスト週間・大会期間・オフシーズン・引退後などをローテーション）。同じパターンを繰り返さない

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
記事の最後（まとめの後）に、以下の形式でCTAブロックを必ず追加してください。
※ 以下は一例であり、**記事のテーマ・読者に応じてタイトル・説明文・ボタン文言は適宜変更してよい**。

---

:::cta-${keywordData.relatedBusiness[0] || 'nobilva'}
title: 記事のテーマに合わせた魅力的なタイトル
description: ${relatedServices}に関連した説明文（100-150文字）。読者の悩みを解決できることを具体的に伝える。改行したい位置に‖を入れる。
button: 詳しく見る または 無料相談に申し込む など、行動を促すテキスト
link: /${keywordData.relatedBusiness[0] === 'teachit' ? 'teachit' : keywordData.relatedBusiness[0] === 'translation' ? 'services/translation' : keywordData.relatedBusiness[0] === 'web-design' ? 'services/web-design' : keywordData.relatedBusiness[0] === 'print' ? 'services/print' : 'services/nobilva'}
:::

【CTA作成の例】（野球に限らず、記事の種目・テーマに合わせて変える）
Nobilvaの場合（例：サッカー・勉強両立の記事向け）：
:::cta-nobilva
title: 部活と勉強の両立をサポートする‖学習管理サービス「Nobilva」
description: Nobilvaでは、‖部活に打ち込む中高生のための‖学習管理サービスを提供しています。‖専属メンター制度（日割り学習計画・‖週1回オンライン面談・毎日の進捗確認）で‖部活と勉強の両立を全力でサポート。
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

// ---------------------------------------------------------------------------
// 画像プロンプト生成（Nanobanana用）
// ---------------------------------------------------------------------------

import { IMAGE_COMMON_TEMPLATE, IMAGE_THUMBNAIL_TEMPLATE } from './image-prompt-template';
export { IMAGE_COMMON_TEMPLATE, IMAGE_THUMBNAIL_TEMPLATE };

const IMAGE_AXIS_CONTEXT: Record<string, string> = {
  time: '時間管理・スキマ時間・練習後の疲れ・早朝・深夜・通学',
  career: '進路選択・志望校・推薦・受験準備・進路相談',
  self: '自己認識・自信・習慣・苦手克服・立て直し・モチベーション',
  relationship: '親子コミュニケーション・家庭内の会話・声かけ・家族関係',
  other: '野球部・勉強・学習・両立',
};

export interface ImagePrompt {
  label: string;
  sceneDescription: string;
  fullPrompt: string;
}

export interface GenerateImagePromptsOptions {
  topic: string;
  clusterAxis?: ClusterAxis;
  articleRole?: ArticleRole;
  volume?: 'light' | 'standard' | 'heavy';
  /** アウトラインの章タイトル（重量記事でセクション別プロンプトに使用） */
  sections?: string[];
}

export async function generateImagePrompts(
  options: GenerateImagePromptsOptions,
): Promise<ImagePrompt[]> {
  const { topic, clusterAxis, volume = 'standard', articleRole, sections = [] } = options;

  const isHeavy = volume === 'heavy' || articleRole === 'hub';
  const isLight = volume === 'light';

  // A9 配置パターンに従って配置位置を決定
  const positions: string[] = ['ヘッダー画像'];
  if (isHeavy && sections.length > 0) {
    // パターン2（リッチ構成）: header + 各章 + CTA直前
    sections.slice(0, 4).forEach((s) => positions.push(`章冒頭（${s}）`));
    positions.push('CTA直前');
  } else if (!isLight) {
    // パターン1（シンプル構成）: header + 中盤 + CTA直前
    positions.push('中盤');
    positions.push('CTA直前');
  } else {
    // パターン3（最小構成）: header + CTA直前
    positions.push('CTA直前');
  }

  const axisContext = clusterAxis ? (IMAGE_AXIS_CONTEXT[clusterAxis] ?? IMAGE_AXIS_CONTEXT.other) : IMAGE_AXIS_CONTEXT.other;

  const prompt = `あなたはNobilvaブログ（野球をがんばる中高生とその保護者向け）の画像プロンプト生成担当です。

記事テーマ：${topic}
クラスター軸の文脈：${axisContext}

以下の${positions.length}箇所に配置する画像のシーン描写を英語で生成してください。

【配置位置】
${positions.map((p, i) => `${i + 1}. ${p}`).join('\n')}

【シーン描写のルール】
- 1〜3行の英語で簡潔に記述
- 日本の家庭・学校・野球の場面（NPB/高校野球風・MLB風にならないこと）
- 人物の顔を映さない（物・手・後ろ姿・シルエット・背景のみ）
- 同一記事内で被写体が重複しないよう、各位置で異なる場面・被写体を使う
- CTA直前は「問題解決・前向きなイメージ」を意識したシーン

以下のJSON配列のみを返してください（説明文不要）：
[
  { "label": "ヘッダー画像", "scene": "..." },
  ...
]`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Failed to parse image prompts response');

  const items: { label: string; scene: string }[] = JSON.parse(jsonMatch[0]);
  return items.map((item) => ({
    label: item.label,
    sceneDescription: item.scene,
    fullPrompt: `${item.scene}\n\n${IMAGE_COMMON_TEMPLATE}`,
  }));
}

// ---------------------------------------------------------------------------
// 記事画像プロンプト生成（IMAGE_PLACEHOLDER + サムネ）
// ---------------------------------------------------------------------------

export interface ArticleImagePromptsConfig {
  topic: string;
  clusterAxis?: ClusterAxis;
  /** 本文内の IMAGE_PLACEHOLDER から抽出したエントリー */
  bodyPlaceholders: Array<{ alt: string; keywords: string }>;
}

export interface ArticleImagePromptsResult {
  thumbnail: ImagePrompt;
  bodyImages: ImagePrompt[];
}

/**
 * 記事のサムネ + 本文画像用の Nanobanana プロンプトをまとめて生成
 */
export async function generateArticleImagePrompts(
  config: ArticleImagePromptsConfig
): Promise<ArticleImagePromptsResult> {
  const { topic, clusterAxis, bodyPlaceholders } = config;
  const axisContext = clusterAxis
    ? (IMAGE_AXIS_CONTEXT[clusterAxis] ?? IMAGE_AXIS_CONTEXT.other)
    : IMAGE_AXIS_CONTEXT.other;

  const bodyItems = bodyPlaceholders.length > 0
    ? bodyPlaceholders.map((p, i) => `${i + 1}. alt="${p.alt}" keywords="${p.keywords}"`).join('\n')
    : '（本文画像なし）';

  const prompt = `あなたはNobilvaブログ（野球をがんばる中高生とその保護者向け）の画像プロンプト生成担当です。

記事テーマ：${topic}
クラスター軸の文脈：${axisContext}

以下の各画像について、Nanobananaで生成するための英語シーン描写（1〜3行）を生成してください。

【サムネイル（OGP画像・1200x630 / 1.91:1）】
記事全体のテーマを象徴する、目を引くヘッダー画像。記事一覧やSNSシェア時に表示される。横長で視認性の高い構図にする。

【本文画像（16:9 / 1920x1080）】
${bodyItems}

【シーン描写のルール】
- 1〜3行の英語で簡潔に記述
- 日本の家庭・学校・野球の場面（NPB/高校野球風・MLB風にならないこと）
- 人物の顔を映さない（物・手・後ろ姿・シルエット・背景のみ）
- 各画像で異なる場面・被写体を使う（重複しない）
- altとkeywordsのニュアンスを活かした具体的な場面にする

以下のJSON形式のみを返してください：
{
  "thumbnail": "scene description for thumbnail",
  "bodyImages": ["scene for image 1", "scene for image 2"]
}
※ 本文画像がない場合は "bodyImages": [] で返す`;

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1500,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Failed to parse article image prompts');

  const result = JSON.parse(jsonMatch[0]) as {
    thumbnail: string;
    bodyImages: string[];
  };

  return {
    thumbnail: {
      label: 'サムネイル（OGP）',
      sceneDescription: result.thumbnail,
      fullPrompt: `${result.thumbnail}\n\n${IMAGE_THUMBNAIL_TEMPLATE}`,
    },
    bodyImages: bodyPlaceholders.map((p, i) => ({
      label: p.alt || `本文画像${i + 1}`,
      sceneDescription: result.bodyImages[i] ?? p.keywords,
      fullPrompt: `${result.bodyImages[i] ?? p.keywords}\n\n${IMAGE_COMMON_TEMPLATE}`,
    })),
  };
}
