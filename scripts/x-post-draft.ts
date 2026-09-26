#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';
const BASE_URL = 'https://www.nectere.jp';
const LOCALE = 'ja';
const DEFAULT_N = 8;
const X_LIMIT = 280;

type CliArgs = {
  n: number;
  files: string[];
};

function parseArgs(argv: string[]): CliArgs {
  const files: string[] = [];
  let n = DEFAULT_N;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--n' || a === '-n') {
      const next = argv[i + 1];
      const parsed = Number.parseInt(next ?? '', 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`--n の値が不正です: ${next}`);
      }
      n = parsed;
      i++;
    } else if (a.startsWith('--n=')) {
      const parsed = Number.parseInt(a.slice(4), 10);
      if (!Number.isFinite(parsed) || parsed <= 0) {
        throw new Error(`--n の値が不正です: ${a}`);
      }
      n = parsed;
    } else if (a === '-h' || a === '--help') {
      printUsageAndExit(0);
    } else {
      files.push(a);
    }
  }
  if (files.length === 0) {
    printUsageAndExit(1);
  }
  return { n, files };
}

function printUsageAndExit(code: number): never {
  const usage = `使い方:
  npx tsx scripts/x-post-draft.ts [--n <案数>] <記事Markdownパス> [<記事Markdownパス>...]

例:
  npx tsx scripts/x-post-draft.ts content/blog/sports-suisen-taisaku-itsukara.md
  npx tsx scripts/x-post-draft.ts --n 12 content/blog/foo.md
`;
  const stream = code === 0 ? process.stdout : process.stderr;
  stream.write(usage);
  process.exit(code);
}

const URL_REGEX = /https?:\/\/[^\s]+/g;

function weightedLength(text: string): number {
  // URL は一律 23 として置換してから、残りは日本語=2 / ASCII=1 でカウント
  const urls = text.match(URL_REGEX) ?? [];
  const withoutUrls = text.replace(URL_REGEX, '');
  let count = urls.length * 23;
  for (const ch of withoutUrls) {
    const code = ch.codePointAt(0) ?? 0;
    if (code <= 0x7f) {
      count += 1;
    } else if (code >= 0x2000 && code <= 0x200d) {
      count += 1;
    } else if (code >= 0xe000 && code <= 0xe01f) {
      count += 1;
    } else {
      count += 2;
    }
  }
  return count;
}

function stripCodeFence(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('```')) {
    return trimmed
      .replace(/^```(?:json)?\s*\n?/, '')
      .replace(/\n?```\s*$/, '')
      .trim();
  }
  return trimmed;
}

function slugFromFile(filePath: string, frontmatterSlug?: unknown): {
  slug: string;
  urlUncertain: boolean;
} {
  if (typeof frontmatterSlug === 'string' && frontmatterSlug.trim().length > 0) {
    return { slug: frontmatterSlug.trim(), urlUncertain: false };
  }
  const base = path.basename(filePath).replace(/\.md$/i, '');
  // このリポジトリでは content/blog/<slug>.md がそのままURL slugになる規約なので、
  // 拡張子を除いたファイル名が blog slug として意味を持つ形（英数字ハイフン）なら確定扱い。
  const looksLikeSlug = /^[a-z0-9][a-z0-9-]*$/i.test(base);
  return { slug: base, urlUncertain: !looksLikeSlug };
}

const RULES_BLOCK = `### 禁止語彙

- 「少年野球」「球児」「スポ少」「野球少年」は使用禁止。代わりに「野球家庭」「野球部」を使う
- 高校受験の文脈で「指定校推薦」は使わない（大学受験用語のため）。「推薦入試」を使う

### 避ける表現（AIっぽい文章の型）

- 「〇〇ではなく、〇〇」のような否定で対比して強調する言い回し
- 体言止め
- 「〜が効く」「〜が効きます」
- 短いフレーズにリズム用の読点を挟む書き方（例:「絞る判断が、いちばん難しい」）
- 理由の言いさしで文を終える「〜ので。」
- 煽り・決め台詞・ウケ狙いの崩した表現

### 避けるツイートの型（AIっぽい・テンプレ的なX投稿）

- 【】で始まる見出し付きツイート（例:「【高校受験】〜」）
- 「結論から言うと」「結論:」で始める
- 「〜3選」「〜する方法まとめ」のようなリスト型ツイート、ツイート内の箇条書きや番号付きリスト
- 「知らないと損」「保存版」「保存推奨」「必見」「〜な人へ」「〜なあなたへ」といった煽り・呼びかけ
- 「〜って知っていますか?」と問いかけて自答する型
- 「実は〜なんです」
- 「→」や矢印での展開
- 一文ごとに改行して行間を空ける縦長レイアウト。改行は多くても1〜2箇所、段落として自然な範囲にとどめる
- ハッシュタグ・絵文字（要件として既述だがルールにも明記）

### 目指すトーン

- 淡々とした誠実な調子。話すように自然に流れる文
- 記事の内容を一つに絞って普通の文章で紹介し、続きは記事で読んでもらう構成
- 記事に書いていないことを足さない。推測の数字・事例を作らない`;

function buildSystemPrompt(): string {
  return `あなたは nectere.jp のブログ記事から X（旧Twitter）投稿の下書きを作るライターです。X運用は「ブログ要約を投稿してURLに誘導する」方式で、ツリー投稿ではなく、それぞれ単独で成立する別々の投稿を作ります。同じ記事から日を変えて何度も投稿する運用のため、案どうしで切り口・取り上げる箇所が重複しないようにしてください。

# 案の切り口（案ごとに異なる型を割り当てる）
- 記事の結論・最重要ポイントを先に言う
- 読者（野球部の子を持つ保護者）の悩み・疑問から入る
- 具体的な事実・数字・制度の話から入る
- よくある誤解を正す
- 記事内の個別セクションを1つだけ取り上げて紹介する（記事が長いほどこの型で複数案作れる）

# 各案の要件
- 1案につき取り上げるポイントは1つに絞る。記事全体を詰め込まない
- 末尾に指定された記事URLを1回だけ付ける（URLはそのまま貼る。短縮しない）
- 本文はURL込みでXの文字数制限に収まる長さ（日本語は1文字2カウント・URLは一律23カウントで合計280以内）
- URLは23カウント固定。改行1つは1カウント。したがって【日本語本文＋改行】部分は必ず 257 カウント以内、つまり日本語本文の実質上限は 128 文字。安全マージンを取り、日本語本文は 110〜120 文字を目安にすること
- 各案を書き終える前に、日本語本文の文字数（ASCIIは1、日本語は2）を手で数えて 250 を超えていないか自分で確認してから確定させる
- ハッシュタグは付けない
- 絵文字は使わない

# 文体・用語ルール（厳守）

${RULES_BLOCK}

# 出力形式
必ず次のJSONだけを返してください。前後に説明・コードフェンス・その他のテキストを一切含めないでください。

{
  "posts": [
    { "angle": "この案の切り口を短く（例: 結論先出し / 保護者の悩み / 制度の事実 / 誤解を正す / セクション紹介: <セクション名>）", "body": "投稿本文（末尾に記事URLを1回含める）" }
  ]
}`;
}

function buildUserPrompt(params: {
  title: string;
  url: string;
  markdown: string;
  n: number;
}): string {
  return `以下の記事から、Xの投稿案を${params.n}案作ってください。案どうしで切り口・取り上げる箇所が重複しないようにしてください。

# 記事タイトル
${params.title}

# 記事URL（本文末尾に貼るURL）
${params.url}

# 記事本文（Markdown）
${params.markdown}`;
}

type Draft = {
  angle: string;
  body: string;
};

async function generateDrafts(params: {
  client: Anthropic;
  title: string;
  url: string;
  markdown: string;
  n: number;
}): Promise<{ drafts: Draft[]; rawText: string; parseError: string | null }> {
  const message = await params.client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: buildSystemPrompt(),
    messages: [
      {
        role: 'user',
        content: buildUserPrompt({
          title: params.title,
          url: params.url,
          markdown: params.markdown,
          n: params.n,
        }),
      },
    ],
  });

  const textBlock = message.content.find((b) => b.type === 'text');
  const rawText = textBlock && textBlock.type === 'text' ? textBlock.text : '';
  const cleaned = stripCodeFence(rawText);

  try {
    const parsed = JSON.parse(cleaned) as { posts?: Draft[] };
    if (!Array.isArray(parsed.posts)) {
      throw new Error('posts フィールドが配列ではありません');
    }
    return { drafts: parsed.posts, rawText, parseError: null };
  } catch (e) {
    return {
      drafts: [],
      rawText,
      parseError: e instanceof Error ? e.message : String(e),
    };
  }
}

function renderOutput(params: {
  title: string;
  url: string;
  urlUncertain: boolean;
  drafts: Draft[];
  rawText: string;
  parseError: string | null;
  n: number;
}): string {
  const lines: string[] = [];
  lines.push(`# ${params.title}`);
  lines.push('');
  if (params.urlUncertain) {
    lines.push(`- 記事URL: URL要確認: ${params.url}`);
  } else {
    lines.push(`- 記事URL: ${params.url}`);
  }
  lines.push(`- 生成モデル: ${MODEL}`);
  lines.push(`- 生成日時: ${new Date().toISOString()}`);
  lines.push(`- 案数: ${params.drafts.length}${params.drafts.length !== params.n ? ` (要求: ${params.n})` : ''}`);
  lines.push('');

  if (params.parseError) {
    lines.push('---');
    lines.push('');
    lines.push('⚠ JSONパースに失敗しました。以下はモデルの生出力です:');
    lines.push('');
    lines.push('```');
    lines.push(params.rawText);
    lines.push('```');
    lines.push('');
    return lines.join('\n');
  }

  params.drafts.forEach((d, idx) => {
    const count = weightedLength(d.body);
    const over = count > X_LIMIT;
    lines.push('---');
    lines.push('');
    lines.push(`## 案 ${idx + 1}${d.angle ? ` — ${d.angle}` : ''}`);
    lines.push(`文字数: ${count} / ${X_LIMIT}${over ? ' ⚠ 超過' : ''}`);
    lines.push('');
    lines.push(d.body.trim());
    lines.push('');
  });

  return lines.join('\n');
}

async function processFile(params: {
  client: Anthropic;
  filePath: string;
  n: number;
  outDir: string;
}) {
  const absPath = path.resolve(params.filePath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`ファイルが見つかりません: ${absPath}`);
  }
  const raw = fs.readFileSync(absPath, 'utf8');
  const parsed = matter(raw);
  const fm = parsed.data as Record<string, unknown>;
  const title =
    (typeof fm.title === 'string' && fm.title) ||
    path.basename(absPath, path.extname(absPath));
  const { slug, urlUncertain } = slugFromFile(absPath, fm.slug);
  const url = `${BASE_URL}/${LOCALE}/blog/${slug}`;

  console.error(`[x-draft] 生成中: ${path.relative(process.cwd(), absPath)} → ${url}`);

  const { drafts, rawText, parseError } = await generateDrafts({
    client: params.client,
    title,
    url,
    markdown: parsed.content,
    n: params.n,
  });

  const output = renderOutput({
    title,
    url,
    urlUncertain,
    drafts,
    rawText,
    parseError,
    n: params.n,
  });

  const outFile = path.join(params.outDir, `${slug}.md`);
  fs.mkdirSync(params.outDir, { recursive: true });
  fs.writeFileSync(outFile, output, 'utf8');
  process.stdout.write(output);
  if (!output.endsWith('\n')) process.stdout.write('\n');
  console.error(`[x-draft] 書き出し: ${path.relative(process.cwd(), outFile)}`);
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('環境変数 ANTHROPIC_API_KEY が設定されていません。');
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));
  const client = new Anthropic({ apiKey });
  const outDir = path.resolve(process.cwd(), 'x-posts');

  let hasError = false;
  for (const file of args.files) {
    try {
      await processFile({ client, filePath: file, n: args.n, outDir });
    } catch (e) {
      hasError = true;
      console.error(`[x-draft] エラー (${file}):`, e instanceof Error ? e.message : e);
    }
  }
  if (hasError) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
