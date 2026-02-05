import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
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
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    // JSONを抽出（マークダウンコードブロックの場合も対応）
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error('Failed to parse Claude response');
}

/**
 * 記事のアウトラインを生成
 */
export async function generateOutline(
  topic: string,
  keywords: string[],
  targetLength: number = 2000
): Promise<ContentOutline> {
  const prompt = `以下の情報をもとに、SEOに最適化されたブログ記事のアウトラインを作成してください。

トピック: ${topic}
主要キーワード: ${keywords[0]}
関連キーワード: ${keywords.slice(1).join(', ')}
目標文字数: ${targetLength}文字

対象読者: 中高生スポーツ選手とその保護者
目的: 学習管理サービス「Nobilva」への興味喚起と問い合わせ促進

以下のJSON形式で返してください：
{
  "title": "魅力的なタイトル（30-35文字、主要キーワード含む）",
  "introduction": "導入文（100-150文字、読者の悩みに共感）",
  "sections": [
    {
      "heading": "セクション見出し（H2）",
      "subheadings": ["小見出し1（H3）", "小見出し2（H3）"],
      "keyPoints": ["このセクションで伝えるポイント1", "ポイント2"]
    }
  ],
  "conclusion": "まとめ（行動喚起を含む）"
}`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error('Failed to parse Claude response');
}

/**
 * セクションの本文を生成
 */
export async function generateSectionContent(
  outline: OutlineSection,
  context: string,
  keywords: string[]
): Promise<string> {
  const prompt = `以下のアウトラインをもとに、SEOに最適化された本文を作成してください。

見出し: ${outline.heading}
小見出し: ${outline.subheadings.join(', ')}
キーポイント: ${outline.keyPoints.join(', ')}

コンテキスト: ${context}
キーワード: ${keywords.join(', ')}

要件：
- 自然な流れで読みやすい文章
- キーワードを適切に含める（過度な詰め込みは避ける）
- 具体例や体験談を含める
- 300-500文字程度

マークダウン形式で返してください。`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
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

/**
 * 完全な記事を生成
 */
export async function generateFullArticle(
  topic: string,
  keywords: string[],
  outline: ContentOutline
): Promise<string> {
  let markdown = `# ${outline.title}\n\n`;
  markdown += `${outline.introduction}\n\n`;

  for (const section of outline.sections) {
    markdown += `## ${section.heading}\n\n`;

    for (const subheading of section.subheadings) {
      markdown += `### ${subheading}\n\n`;
      
      // 各小見出しの内容を生成
      const content = await generateSectionContent(
        {
          heading: section.heading,
          subheadings: [subheading],
          keyPoints: section.keyPoints,
        },
        topic,
        keywords
      );
      
      markdown += `${content}\n\n`;
    }
  }

  markdown += `## まとめ\n\n${outline.conclusion}\n`;

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

要件：
- 元の情報を保持しながら改善
- 自然な文章フロー
- SEO最適化

マークダウン形式で返してください。`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4096,
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

/**
 * キーワードギャップから記事アイデアを生成
 */
export async function generateArticleIdeas(
  unusedKeywords: string[],
  existingTopics: string[]
): Promise<Array<{ title: string; keyword: string; outline: string }>> {
  const prompt = `以下の未使用キーワードから、ブログ記事のアイデアを3つ提案してください。

未使用キーワード:
${unusedKeywords.join('\n')}

既存の記事トピック（重複を避ける）:
${existingTopics.join('\n')}

対象読者: 中高生スポーツ選手とその保護者
サービス: 学習管理サービス「Nobilva」

JSON形式で返してください：
[
  {
    "title": "記事タイトル",
    "keyword": "主要キーワード",
    "outline": "記事の概要（2-3文）"
  }
]`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === 'text') {
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  }

  throw new Error('Failed to generate article ideas');
}
