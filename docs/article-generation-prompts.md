# ブログ記事生成プロンプト集（外部AIモデル向け）

このドキュメントは、Nobilva ブログの admin 画面（`/admin/claude` ほか）で Claude API に投げている**全プロンプトを、他のAIモデル（GPT 系・Gemini 系・ローカルLLM 等）に移植できる形で網羅的にまとめた資料**です。

実装の正は `lib/claude.ts` と `app/api/admin/claude/*/route.ts`。本資料はそのスナップショット（2026-10-14 時点）で、生成パイプライン・各ステップの入出力・テンプレート文字列を再現できるようになっています。

成果物（Markdown + frontmatter）の仕様は別紙 [`docs/article-format-for-agents.md`](./article-format-for-agents.md) を参照してください。本資料は「どのプロンプトで、どの順序で生成しているか」のみを扱います。

---

## 0. 前提: ドメインコンテキスト

全プロンプトに共通で埋め込まれる定数です。移植先でも同じコンテキストを渡すこと。

### 対象読者（固定）

```
野球をがんばる中高生（中学硬式野球クラブチーム / 中学軟式野球部 / 高校野球部）とその保護者
```

### サービス（CTA 用）

```
学習管理サービス「Nobilva」
- 月18,000円〜
- 30日全額返金保証
- 月20名限定の無料学習面談
```

### メタ軸（4つのスイッチ）

| 軸 | 値 | ラベル（プロンプトに展開される文字列） |
| --- | --- | --- |
| `clusterAxis` | `time` | 時間軸（テスト前・オフシーズン・引退後など時期に応じた勉強戦略） |
| | `career` | 進路軸（野球推薦・一般受験・就職など進路選択に関わる情報） |
| | `self` | 自己認識軸（モチベーション・メンタル・自己分析など内面の成長） |
| | `relationship` | 関係性軸（保護者・コーチ・チームメイトとの関係や環境づくり） |
| | `other` | その他（一般的な学習・勉強に関するトピック） |
| `articleRole` | `hub` | 軸全体を網羅する包括的なエントリーポイント記事 |
| | `child` | 子記事。ハブ記事へ内部リンクを張る |
| `targetReader` | `parent` | 保護者向け（「お子さん」「ご家庭」などの敬語表現。情報・安心感重視） |
| | `student` | 生徒向け（「あなた」「自分」などの親しみやすい表現。行動促進重視） |
| | `both` | 両方向け（保護者への説明＋生徒への励ましを両立。中立的な文体） |
| `volume` | `light` | 2000-3000字 / H2あたり 400-600字 |
| | `standard` | 3000-5000字 / H2あたり 500-900字 |
| | `heavy` | 6000-8000字 / H2あたり 700-1200字 |

### モデル選択（Anthropic 実装での実例）

| ステップ | 使用モデル | max_tokens |
| --- | --- | --- |
| キーワード提案・アイデア生成 | `claude-sonnet-4-5-20250929` | 1024 / 2048 |
| 深掘り / アウトライン / アウトライン修正 | `claude-sonnet-4-5-20250929` | 4096 / 8192 |
| 本文一括生成 / リライト | `claude-sonnet-4-5-20250929` | 16000 / 8192 |
| 画像プロンプト生成 | `claude-haiku-4-5-20251001` | 1000 / 1500 |

JSON を返させるステップは Anthropic の **Structured Outputs（`output_config: { format: { type: 'json_schema', schema } }`）** を使用。他モデルでは JSON mode / function calling / レスポンスのコードフェンス抽出で代替してください。

---

## 1. 生成パイプライン全体像

```
┌────────────────────────────────────────────────────────────┐
│ Step 1  キーワード提案          suggestKeywords()           │
│         （トピック → 主要/関連キーワード）                  │
├────────────────────────────────────────────────────────────┤
│ Step 2  5W1H × マズロー深掘り   generateSearchIntentDeepDive() │
│         （検索意図を 5W1H で割り、欲求5段階へマッピング）    │
├────────────────────────────────────────────────────────────┤
│ Step 3  アウトライン生成        generateOutline()           │
│         （タイトル・スラッグ・description・導入・H2/H3/keyPoints・まとめ） │
├────────────────────────────────────────────────────────────┤
│ Step 3' アウトライン修正         updateOutline()            │
│         （ユーザー修正指示を反映して再生成）                │
├────────────────────────────────────────────────────────────┤
│ Step 4  本文一括生成            generateFullArticle()       │
│         （導入 + 各H2セクション本文。まとめとCTAは末尾に自動付与）│
├────────────────────────────────────────────────────────────┤
│ Step 4' リライト                improveArticle()            │
├────────────────────────────────────────────────────────────┤
│ Step 5  画像プロンプト生成      generateArticleImagePrompts()│
│         （サムネ + 本文プレースホルダー ×N）                │
└────────────────────────────────────────────────────────────┘
```

キーワードマスターからワンショット生成する補助パス:

```
generateOutlineFromKeyword()  →  generateArticleFromKeyword()
```

未使用キーワードから記事アイデアだけ量産する補助パス:

```
generateArticleIdeas()
```

---

## 2. Step 1 — キーワード提案

### 関数
`suggestKeywords(topic: string, context?: string)` → `KeywordSuggestion`

### プロンプト

```
以下のトピックに対して、SEOに効果的な主要キーワード（1つ）と関連キーワード（3-5個）を日本語で提案してください。

トピック: {{topic}}
{{#if context}}コンテキスト: {{context}}{{/if}}

対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
サービス: 学習管理サービス「Nobilva」

JSON形式で返してください：
{
  "primaryKeyword": "主要キーワード",
  "secondaryKeywords": ["関連キーワード1", "関連キーワード2", "関連キーワード3"],
  "reason": "これらのキーワードを選んだ理由"
}
```

### JSON Schema

```json
{
  "type": "object",
  "properties": {
    "primaryKeyword": { "type": "string" },
    "secondaryKeywords": { "type": "array", "items": { "type": "string" } },
    "reason": { "type": "string" }
  },
  "required": ["primaryKeyword", "secondaryKeywords", "reason"],
  "additionalProperties": false
}
```

---

## 3. Step 2 — 5W1H × マズロー深掘り

### 関数
`generateSearchIntentDeepDive(topic, mainKeyword, options)` → `string (Markdown)`

### options（任意、プロンプトに動的ブロックで差し込む）
- `mainKeywordVariants?: string[]` — 表記揺れ
- `coOccurrenceWords?: string[]` — ラッコキーワード等で得た共起語
- `targetReader?: TargetReader`
- `clusterAxis?: ClusterAxis`

### プロンプト

```
以下のキーワード・トピックについて、5W1H（Who/What/When/Where/Why/How）それぞれの観点で検索意図を分析し、マズローの欲求五段階（生理的欲求・安全欲求・所属と愛の欲求・承認欲求・自己実現欲求）のどれに当たるかまで段階的に深掘りしてください。

【トピック・キーワード】
トピック: {{topic}}
主要キーワード: {{mainKeyword}}
{{#if variants}}表記揺れ（variants）: {{variants.join(', ')}}{{/if}}
{{#if coOccur}}共起語（読者が一緒に求めやすい語）: {{coOccur.join(', ')}}{{/if}}
{{#if clusterAxis}}クラスター軸: {{AXIS_LABEL[clusterAxis]}}{{/if}}

【読者・サービス】
対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
文体・トーン: {{TARGET_READER_LABEL[targetReader] ?? '両方向け（保護者への説明＋生徒への励ましを両立。中立的な文体）'}}
サービス: 学習管理サービス「Nobilva」（月18,000円〜、30日全額返金保証、月20名限定の無料学習面談）

【出力形式】
- 各5W1Hの観点ごとに「検索意図の分析 → マズローのどの段階に当たるか」を簡潔に書く
- 最後に「導入文や章立て（H2/H3）に活かせる発想・メモ」を2〜4行でまとめる
- Markdown形式で読みやすく出力（見出しは ## や ### を使用）

深掘り結果をMarkdown形式で出力してください。
```

---

## 4. Step 3 — アウトライン生成

### 関数
`generateOutline(topic, keywords, targetLength, options)` → `ContentOutline`

### options
- `clusterAxis?`, `articleRole?`, `targetReader?`, `volume?` — メタ軸
- `hubSlug?: string` — 子記事なら親ハブの slug
- `mainKeywordVariants?: string[]`
- `avoidKeywords?: string[]` — カニバリ回避
- `coOccurrenceWords?: string[]`
- `deepDiveText?: string` — Step 2 の出力をそのまま流す
- `userFeedbackOnDeepDive?: string` — Step 2 に対するユーザー補足

### プロンプト

```
以下の情報をもとに、SEOに最適化されたブログ記事のアウトラインを作成してください。
**まずタイトルと見出し（H2/H3）を決め、各セクションの keyPoints でスコープを明確にしてください。**

【トピック・キーワード】
トピック: {{topic}}
主要キーワード: {{keywords[0]}}
{{#if variants}}表記揺れ（variants）: {{variants.join(', ')}}（タイトル・見出し・本文で自然に使い分ける）{{/if}}
{{#if coOccur}}共起語（読者が一緒に求めやすい語）: {{coOccur.join(', ')}}（導入や見出し・本文に自然に織り込む）{{/if}}
関連キーワード: {{keywords.slice(1).join(', ')}}
{{#if avoidKeywords}}

【カニバリ回避】
以下のキーワードは既に別記事で扱うため、この記事では主題にしないでください: {{avoidKeywords.join(', ')}}{{/if}}
{{#if deepDiveText || userFeedbackOnDeepDive}}

【検索意図・マズロー深掘り（参照）】
以下で行った5W1H×検索意図→マズロー深掘り（およびユーザーからの補足・修正）を踏まえ、導入文や章立て（H2/H3）を設計してください。

深掘り結果:
{{deepDiveText}}
{{#if userFeedbackOnDeepDive}}
ユーザー補足・修正:
{{userFeedbackOnDeepDive}}{{/if}}{{/if}}

【読者・目的】
- 対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
文体・トーン: {{TARGET_READER_LABEL[targetReader] ?? '両方向け（...）'}}
{{#if clusterAxis}}クラスター軸: {{AXIS_LABEL[clusterAxis]}}{{/if}}
- 目的: 学習管理サービス「Nobilva」への興味喚起と問い合わせ促進

【EEAT・LLM最適化】
- EEAT（経験・専門性・権威性・信頼性）を重視する。嘘をつかない範囲で、具体例・データ・手順の明確さで説得力を高める
- 見出し（H2/H3）は「〜するには？」「〜の理由は？」など疑問形を適宜使い、AI/検索エンジンへの回答性を高める
- 各セクションの冒頭に結論・要点を先出しする設計にする

【文字数設計】
- 記事全体: {{len.totalMin}}〜{{len.totalMax}}字
- 各H2セクション: {{len.perH2Min}}〜{{len.perH2Max}}字で設計（H3ごとに均等でなくてよい）

【セクション設計のルール】
- 各セクションは「このセクションだけで扱う情報」を明確にし、他セクションとの重複を避ける
- keyPointsには、他セクションと被らないスコープ（この見出しでだけ述べる内容）を書く
- 「成績基準」「時間管理」「成績アップ対策」のようにテーマが近いセクションは、役割分担をはっきりさせる（例: 成績基準＝数値・条件の説明、時間管理＝スケジュールの立て方、成績アップ＝具体的な勉強法のみ）
{{#if articleRole === 'hub'}}

【ハブ記事（軸エントリーポイント）】
この記事は軸のハブ記事です。{{#if clusterAxis}}「{{AXIS_LABEL[clusterAxis]}}」{{/if}}の全体像を網羅し、今後紐づける子記事への内部リンク候補コメントをまとめ直前に1つ挿入してください: `<!-- 子記事リンク候補: （今後追加するキーワードの例を1行で） -->`{{/if}}
{{#if articleRole !== 'hub' && hubSlug}}

【子記事・内部リンク（必須）】
この記事は子記事です。導入またはまとめ付近に、ハブ記事（/blog/{{hubSlug}}）への内部リンクを自然な形で1箇所以上含めてください。{{/if}}

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
※ まとめの後に自動でCTAブロックが追加されるため、conclusionでは記事の内容を総括することに専念してください
```

### JSON Schema（`ContentOutline`）

```json
{
  "type": "object",
  "properties": {
    "title": { "type": "string" },
    "slug": { "type": "string" },
    "description": { "type": "string" },
    "introduction": { "type": "string" },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "heading": { "type": "string" },
          "subheadings": { "type": "array", "items": { "type": "string" } },
          "keyPoints": { "type": "array", "items": { "type": "string" } }
        },
        "required": ["heading", "subheadings", "keyPoints"],
        "additionalProperties": false
      }
    },
    "conclusion": { "type": "string" }
  },
  "required": ["title", "introduction", "sections", "conclusion"],
  "additionalProperties": false
}
```

---

## 5. Step 3' — アウトライン修正

### 関数
`updateOutline(currentOutline, revisionRequest, keywords, options)` → `ContentOutline`

### プロンプト

```
以下のアウトラインを、指定された修正点に基づいて更新してください。

【現在のアウトライン】
タイトル: {{currentOutline.title}}
スラッグ: {{currentOutline.slug ?? ''}}
メタ説明: {{currentOutline.description ?? ''}}
導入文: {{currentOutline.introduction}}

セクション構成:
{{#each currentOutline.sections}}
{{index + 1}}. {{heading}}
   - {{subheadings.join('\n   - ')}}
{{/each}}

まとめ: {{currentOutline.conclusion}}

【修正リクエスト】
{{revisionRequest}}

【キーワード情報】
主要キーワード: {{keywords[0]}}
関連キーワード: {{keywords.slice(1).join(', ')}}

【読者・設定】
対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
文体・トーン: {{TARGET_READER_LABEL[targetReader] ?? '両方向け（...）'}}
{{#if clusterAxis}}クラスター軸: {{AXIS_LABEL[clusterAxis]}}{{/if}}
{{#if articleRole === 'hub'}}記事タイプ: ハブ記事（軸全体を網羅する6000-8000字構成を維持）{{/if}}
{{#if articleRole !== 'hub' && hubSlug}}記事タイプ: 子記事（ハブ記事 /blog/{{hubSlug}} への内部リンクを保持）{{/if}}
{{#if deepDiveText || userFeedbackOnDeepDive}}

【検索意図・マズロー深掘り（参照）】
以下の深掘り結果を踏まえ、修正後もアウトラインの章立て・導入文に活かしてください。

深掘り結果:
{{deepDiveText}}
{{#if userFeedbackOnDeepDive}}
ユーザー補足・修正:
{{userFeedbackOnDeepDive}}{{/if}}{{/if}}

【要件】
- 修正リクエストに従って、必要な部分を変更してください
- 変更が不要な部分は元の内容を保持してください
- 各セクションのスコープを明確に保ち、他セクションとの重複を避けてください
- 記事全体{{len.totalMin}}〜{{len.totalMax}}字、各H2は{{len.perH2Min}}〜{{len.perH2Max}}字で設計できる構成にしてください
- 主要キーワード「{{keywords[0]}}」をタイトルに含めてください
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
※ まとめの後に自動でCTAブロックが追加されるため、conclusionでは記事の内容を総括することに専念してください
```

Schema は Step 3 と同じ `ContentOutline`。

---

## 6. Step 4 — 本文一括生成

### 関数
`generateFullArticle(topic, keywords, outline, options)` → `string (Markdown)`

### options
- `clusterAxis?`, `articleRole?`, `targetReader?`, `volume?`
- `hubSlug?: string`
- `mainKeywordVariants?: string[]`
- `avoidKeywords?: string[]`
- `coOccurrenceWords?: string[]`

### プロンプト（アウトラインブロック + 指示本体）

実装は **アウトラインブロック（先頭）+ 指示本体** を結合して1本のユーザーメッセージとして送信します。

**アウトラインブロック（先頭）**

```
【記事全体のアウトライン】
タイトル: {{outline.title}}
導入: {{outline.introduction}}

セクション構成:
{{#each outline.sections}}
{{index + 1}}. ## {{heading}}
   keyPoints（このセクションのみで扱う）: {{keyPoints.join(' / ')}}
   H3: {{subheadings.join(' / ')}}
{{/each}}

まとめ: {{outline.conclusion}}
```

**指示本体**

```
上記のアウトラインに従い、記事本文を**一括で**作成してください。決まったアウトライン（タイトル・見出し・keyPoints）に従って一貫した本文を書いてください。見出しごとに別々に書いて結合するのではなく、全体の文脈を共有した1本の記事にしてください。

【トピック・キーワード】
トピック: {{topic}}
主要キーワード: {{keywords[0]}}
{{#if variants}}表記揺れ（variants）: {{variants.join(', ')}}（タイトル・見出し・本文で自然に使い分ける）{{/if}}
{{#if coOccur}}共起語: {{coOccur.join(', ')}}（導入・見出し・本文に自然に織り込む）{{/if}}
関連キーワード: {{keywords.slice(1).join(', ')}}
{{#if avoidKeywords}}【カニバリ回避】以下のキーワードは別記事で扱うため主題にしない: {{avoidKeywords.join(', ')}}{{/if}}

【読者・サービス】
対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
文体・トーン: {{TARGET_READER_LABEL[targetReader] ?? '両方向け（...）'}}
{{#if clusterAxis}}クラスター軸: {{AXIS_LABEL[clusterAxis]}}{{/if}}
サービス: 学習管理サービス「Nobilva」（月18,000円〜、30日全額返金保証、月20名限定の無料学習面談）
{{#if articleRole === 'hub'}}

【ハブ記事・子記事リンク候補（必須）】
この記事はハブ記事です。**まとめ（## まとめ）の直前に**、`<!-- 子記事リンク候補: （今後紐づけたいキーワードやテーマの例を1行で） -->` の形式で1行コメントを1つ挿入してください。{{/if}}
{{#if articleRole !== 'hub' && hubSlug}}

【子記事・内部リンク（必須）】
この記事は子記事です。導入またはまとめ付近に、ハブ記事（/blog/{{hubSlug}}）への内部リンクを自然な形で1箇所以上含めてください。{{/if}}

【EEAT・LLM最適化・一貫性】
- EEAT（経験・専門性・権威性・信頼性）を重視する。嘘をつかない範囲で、具体例・データ・手順の明確さで説得力を高める
- 各セクションの冒頭に結論・要点を先出しする（AI/検索エンジンが回答を抜き出しやすい構造）
- 記事内のトーン・用語・主張の一貫性を保つ。同じ話を薄く伸ばさず、情報密度を保ちつつ指定文字数内に収める

【文字数】
- 記事全体（導入＋本文＋まとめ）: {{len.totalMin}}〜{{len.totalMax}}字
- 各H2セクション: {{len.perH2Min}}〜{{len.perH2Max}}字程度。同じ話を薄く伸ばさず、情報密度を保つ

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
- 画像プレースホルダー: 記事として読みやすい位置に2〜4箇所（導入付近・要点の直後など）、`![説明](IMAGE_PLACEHOLDER:検索キーワード)` の形式で挿入。野球に関連する場面の英語キーワードを推奨（例: baseball practice, student studying, baseball player）

マークダウン形式で記事本文（まとめ以外）のみを出力してください。
```

### 後処理（コード側で追記される部分）

モデルの出力の末尾に、以下を**プログラムで**連結します（モデルには出力させない）:

```markdown

## まとめ

{{outline.conclusion}}

---

:::cta-nobilva
...（下記「CTA テンプレート」参照）
:::
```

### CTA テンプレート（`targetReader` で分岐）

**parent（保護者向け）**
```
:::cta-nobilva
title: 野球をがんばる‖お子さんの学習を‖サポートします
description: 野球に打ち込む‖中高生のための‖学習管理サービス。‖月18,000円〜・‖30日全額返金保証。
button: 無料学習面談を受ける（月20名限定）
link: /services/nobilva
:::
```

**student（生徒向け）**
```
:::cta-nobilva
title: 野球しながら‖成績アップを目指す‖あなたをサポート
description: 部活に全力の‖君のための‖学習管理サービス。‖月18,000円〜・‖30日全額返金保証。
button: 無料学習面談を受ける（月20名限定）
link: /services/nobilva
:::
```

**both（デフォルト）**
```
:::cta-nobilva
title: 野球をがんばる‖中高生のための‖学習管理サービス‖「Nobilva」
description: 練習スケジュールに合わせた‖学習プランで‖両立を全力サポート。‖月18,000円〜・‖30日全額返金保証。
button: 無料学習面談を受ける（月20名限定）
link: /services/nobilva
:::
```

> `‖`（U+2016 DOUBLE VERTICAL LINE）は改行ヒント。`title`/`description` の各 8〜15文字ごとに入れる（スマホで文字が溢れないため）。

利用可能な CTA タイプ: `:::cta-nobilva`, `:::cta-teachit`, `:::cta-translation`, `:::cta-web-design`, `:::cta-print`

---

## 7. 補助: セクション単発生成

一括生成せず、1セクションだけ生成したい場合に使用。

### 関数
`generateSectionContent(outline, context, keywords, options)` → `string (Markdown)`

### プロンプト

```
以下のアウトラインをもとに、SEOに最適化された本文を作成してください。
{{#if previousSectionsMarkdown}}
【既に書いた内容（参照して重複・言い換えを避ける）】
{{previousSectionsMarkdown}}
{{/if}}

【このセクション】
見出し: {{outline.heading}}
小見出し: {{outline.subheadings.join(', ')}}
キーポイント（このセクションだけで扱う内容。他セクションと重複しない）: {{outline.keyPoints.join(', ')}}

【コンテキスト】
トピック: {{context}}
キーワード: {{keywords.join(', ')}}

【読者】
主な読者: 中高生の保護者（副次的に学生本人）。文体はこのペルソナで統一する。

【要件】
- このセクションのスコープだけを扱い、既出内容や他セクションと重複しないようにする
- 具体例は「このセクションでだけ」使う状況を1つ選び、他セクションと異なる場面にする（例: 朝練前の隙間時間・テスト週間・秋季大会後のオフシーズンなど野球の場面をローテーション）
- キーワードは見出し・導入に自然に含める。本文中でSEOキーワードを太字（**）で囲んだり強調しない
- 文字数: このセクションで500〜900字を目安に、情報密度を保つ
- タイトル・description（メタ説明）は別枠のため本文に書かない
- 見出しは ## または ### のみ使用（# はページタイトル用のため使わない）

【画像プレースホルダー】
- 内容に合う画像が適切な場合、このセクションに0〜1箇所、次の形式で挿入: `![画像の説明](IMAGE_PLACEHOLDER:Unsplash検索キーワード)`
- 視覚で伝えやすい箇所（手順・事例・イメージなど）のみ。不要なセクションでは入れない。

マークダウン形式で返してください。
```

---

## 8. Step 4' — リライト

### 関数
`improveArticle(content, improvements, options)` → `string (Markdown)`

### プロンプト

```
以下の記事を、指定された改善点に基づいてリライトしてください。

現在の記事:
{{content}}

改善点:
{{#each improvements}}
{{index + 1}}. {{this}}
{{/each}}

【読者・サービス】
対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
文体・トーン: {{TARGET_READER_LABEL[targetReader] ?? '両方向け（...）'}}
{{#if clusterAxis}}クラスター軸: {{AXIS_LABEL[clusterAxis]}}{{/if}}
サービス: 学習管理サービス「Nobilva」（月18,000円〜、30日全額返金保証、月20名限定の無料学習面談）

要件：
- 元の情報を保持しながら改善
- 自然な文章フロー
- SEOキーワードは見出し・導入に自然に含め、本文中で太字強調しない
- SEO最適化

マークダウン形式で返してください。
```

---

## 9. Step 5 — 画像プロンプト生成

Nanobanana（Google の画像生成）向けの英語シーン描写を生成する。実装は2系統ある。

### 9-A. 配置パターン先出し版

#### 関数
`generateImagePrompts({ topic, clusterAxis, articleRole, volume, sections })` → `ImagePrompt[]`

#### 配置パターン（事前計算）

- `volume === 'heavy'` または `articleRole === 'hub'` → **パターン2（リッチ）**: `ヘッダー画像` + `章冒頭（sections[0..3]）` + `CTA直前`
- `volume === 'light'` → **パターン3（最小）**: `ヘッダー画像` + `CTA直前`
- それ以外 → **パターン1（シンプル）**: `ヘッダー画像` + `中盤` + `CTA直前`

#### クラスター軸別の文脈マッピング

| clusterAxis | 文脈キーワード |
| --- | --- |
| time | 時間管理・スキマ時間・練習後の疲れ・早朝・深夜・通学 |
| career | 進路選択・志望校・推薦・受験準備・進路相談 |
| self | 自己認識・自信・習慣・苦手克服・立て直し・モチベーション |
| relationship | 親子コミュニケーション・家庭内の会話・声かけ・家族関係 |
| other | 野球部・勉強・学習・両立 |

#### プロンプト

```
あなたはNobilvaブログ（野球をがんばる中高生とその保護者向け）の画像プロンプト生成担当です。

記事テーマ：{{topic}}
クラスター軸の文脈：{{axisContext}}

以下の{{positions.length}}箇所に配置する画像のシーン描写を英語で生成してください。

【配置位置】
{{#each positions}}
{{index + 1}}. {{this}}
{{/each}}

【シーン描写のルール】
- 1〜3行の英語で簡潔に記述
- 記事のコンテクストに合った人物・場面を具体的に描写する
- 日本の家庭・学校・野球の場面（NPB/高校野球風・MLB風にならないこと）
- 同一記事内で被写体が重複しないよう、各位置で異なる場面・被写体を使う
- CTA直前は「問題解決・前向きなイメージ」を意識したシーン

以下のJSON配列のみを返してください（説明文不要）：
[
  { "label": "ヘッダー画像", "scene": "..." },
  ...
]
```

### 9-B. プレースホルダー対応版（記事本文からセクション抽出）

#### 関数
`generateArticleImagePrompts({ topic, clusterAxis, bodyPlaceholders, content })` → `{ thumbnail, bodyImages[] }`

本文中の `![alt](IMAGE_PLACEHOLDER:keywords)` を抽出し、プレースホルダーごとに前後セクションの本文抜粋を文脈として渡す。

#### プロンプト

```
あなたはNobilvaブログ（野球をがんばる中高生とその保護者向け）の画像プロンプト生成担当です。

記事テーマ：{{topic}}
クラスター軸の文脈：{{axisContext}}

{{#if leadText}}
記事リード文:
{{leadText}}
{{/if}}

以下の各画像について、Nanobananaで生成するための英語シーン描写（1〜3行）を生成してください。
記事の文脈をよく読み、そのセクションの内容に合った具体的な場面を描写してください。

【サムネイル（OGP画像・1200x630 / 1.91:1）】
記事全体のテーマを象徴する、目を引くヘッダー画像。記事一覧やSNSシェア時に表示される。横長で視認性の高い構図にする。

【本文画像（16:9 / 1920x1080）】
{{#each bodyPlaceholders}}
{{index + 1}}. alt="{{alt}}" keywords="{{keywords}}"
{{#if sectionContext}}
   記事セクション抜粋: {{sectionContext}}
{{/if}}
{{/each}}

【シーン描写のルール】
- 1〜3行の英語で簡潔に記述
- 明るく前向きな雰囲気。ブログ記事にふさわしい爽やかさ
- 記事のコンテクストに合った人物・場面を具体的に描写する
- 日本の家庭・学校・野球の場面（NPB/高校野球風・MLB風にならないこと）
- 各画像で異なる場面・被写体を使う（重複しない）
- altとkeywordsのニュアンスを具体的に表現する
- 記事セクション抜粋が提供されている場合は、その内容に合った場面にする

【バリエーションを出すために】
各画像で以下の要素を意識的に変えること:
- 撮影視点: 真俯瞰フラットレイ / テーブル上クローズアップ / 引きの環境ショット / 斜め45度
- 光源・時間帯: 朝日 / 昼の自然光 / 夕方の暖色光 / 窓から差す光
- 色味の方向: 暖色寄り / 寒色寄り / ニュートラル / ソフト
- 場所: 自宅の勉強机 / 学校のグラウンド / 通学路 / 教室 / 玄関
- 被写体: 野球道具（グラブ・バット・ボール・ヘルメット）/ 勉強道具（ノート・ペン・参考書）/ 環境小物

以下のJSON形式のみを返してください：
{
  "thumbnail": "scene description for thumbnail",
  "bodyImages": ["scene for image 1", "scene for image 2"]
}
※ 本文画像がない場合は "bodyImages": [] で返す
```

### 9-C. Nanobanana 共通スタイル（コード側で各シーン描写に連結）

モデルの返した英語シーン描写の末尾に、以下の共通スタイルを**プログラムで**連結します。

**共通ベース**
```
Modern Japanese lifestyle photograph, bright and airy high-key lighting,
soft diffused natural light from a large window, almost white overexposed background,
clean minimal interior with white walls, light wood furniture, and small green plants,
pastel and muted color palette, very light tones, gentle soft shadows,
shallow depth of field with creamy bokeh, calm and inviting atmosphere,
no text, no logos, no watermarks, no Japanese characters, no written characters of any language.

Avoid: dark or moody lighting, heavy shadows, underexposed images, harsh contrast,
American baseball uniforms or MLB style,
oversaturated or neon colors, gritty or grainy film look, dramatic cinematic lighting,
stock photo style, cartoon or illustration style,
text overlays, watermarks, logos, posters, signs with letters,
any visible text or writing, books with readable text, whiteboards with writing, screens showing text.
```

**本文画像テンプレート（16:9 / 1920x1080）**
```
{{BASE_STYLE}}
Horizontal 16:9 aspect ratio (1920x1080).
```

**サムネイル / OGP画像テンプレート（1.91:1 / 1200x630）**
```
{{BASE_STYLE}}
Horizontal 1.91:1 aspect ratio (1200x630). Eye-catching composition with clear focal point.
```

---

## 10. 補助: 未使用キーワードから記事アイデア生成

### 関数
`generateArticleIdeas(unusedKeywords, existingTopics, keywordContext?)` → `Array<{title, keyword, outline}>`

### プロンプト

```
以下の未使用キーワードから、ブログ記事のアイデアを3つ提案してください。

未使用キーワード:
{{unusedKeywords.join('\n')}}

既存の記事トピック（重複を避ける）:
{{existingTopics.join('\n')}}

対象読者: 野球をがんばる中高生（中学硬式野球クラブチーム/中学軟式野球部/高校野球部）とその保護者
サービス: 学習管理サービス「Nobilva」（月18,000円〜、30日全額返金保証）

【4軸クラスター構造】
- 時間軸: テスト前・オフシーズン・引退後など時期に応じた勉強戦略
- 進路軸: 野球推薦・一般受験・就職など進路選択に関わる情報
- 自己認識軸: モチベーション・メンタル・自己分析など内面の成長
- 関係性軸: 保護者・コーチ・チームメイトとの関係や環境づくり
- ハブ記事（articleRole=hub）は軸のエントリーポイントとして、軸全体を網羅する包括的な記事にする
- 子記事はハブ記事への内部リンクを含む設計にする

{{#if keywordContext}}
キーワードの優先度情報（pending/planning を優先、ハブ記事を先行提案）:
{{#each keywordContext}}
- {{keyword}}: 軸={{AXIS_LABEL[clusterAxis].split('（')[0]}}, 種別={{articleRole}}, ステータス={{articleStatus}}, 事業インパクト={{businessImpact}}
{{/each}}
※ pending/planning のキーワードを優先して提案。ハブ記事（articleRole=hub）は軸全体をカバーする包括的な記事として提案してください。
{{/if}}

JSON形式で返してください：
[
  {
    "title": "記事タイトル",
    "keyword": "主要キーワード",
    "outline": "記事の概要（2-3文）"
  }
]
```

### JSON Schema

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "title": { "type": "string" },
      "keyword": { "type": "string" },
      "outline": { "type": "string" }
    },
    "required": ["title", "keyword", "outline"],
    "additionalProperties": false
  }
}
```

---

## 11. 補助: キーワードマスターからワンショット生成

キーワードマスター（`content/keywords.json`）の 1 エントリー（`TargetKeywordData`）から、アウトライン → 本文を順に生成するパス。

### 11-A. アウトライン生成

#### 関数
`generateOutlineFromKeyword(keyword, keywordData, additionalContext?)` → `ContentOutline`

#### `relatedBusiness` → サービス名マッピング

```
translation   → 翻訳サービス
web-design    → Web制作
print         → 印刷物制作
nobilva       → 学習管理サービス「Nobilva」
teachit       → AI教育アプリ「Teachit」
```

#### プロンプト

```
以下の情報をもとに、SEOに最適化されたブログ記事のアウトラインを作成してください。

【キーワード情報】
主要キーワード: {{keyword}}
重要度: {{keywordData.priority}}/5
想定月間PV: {{keywordData.estimatedPv.toLocaleString()}}
関連サービス: {{relatedServices}}
関連タグ: {{keywordData.relatedTags.join(', ')}}
{{#if additionalContext}}追加情報: {{additionalContext}}{{/if}}

【記事の方向性】
- このキーワードは重要度{{priority}}/5の戦略的キーワードです
- 月間{{estimatedPv}}PVを目標としています
- {{relatedServices}}への興味喚起と問い合わせを促進することが目的です

【読者・文字数】
- 主な読者: 中高生の保護者（副次的に学生本人）。文体・トーンはこのペルソナで統一する
- 記事全体: 3000〜5000字、各H2セクション: 500〜900字で設計する

【セクション設計のルール】
- 各セクションは「このセクションだけで扱う情報」に限定し、他セクションとの重複を避ける
- keyPointsには他セクションと被らないスコープを書く（例: 成績基準＝数値・条件、時間管理＝スケジュールの立て方、成績アップ＝勉強法のみ）

【要件】
- タイトルには必ず主要キーワード「{{keyword}}」を含めてください
- 関連タグ（{{relatedTags.join(', ')}}）を自然に本文に織り込んでください
- 読者の検索意図に応える実用的な内容にしてください
- 想定PVから逆算して、多くの人に刺さる内容にしてください
- 記事の最後にはCTA（Call to Action）ブロックが自動で追加されるため、まとめは自然な締めくくりにしてください

以下のJSON形式で返してください：
{
  "title": "魅力的なタイトル（30-35文字、必ず入力。主要キーワード「{{keyword}}」を含む）",
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
※ まとめの後に自動でCTAブロックが追加されるため、conclusionでは記事の内容を総括することに専念してください
```

### 11-B. 本文生成

#### 関数
`generateArticleFromKeyword(keyword, keywordData, outline)` → `string (Markdown)`

#### プロンプト

```
以下のアウトラインをもとに、SEOに最適化された記事本文を**一括で**作成してください。見出しごとに別々に書いて結合するのではなく、全体の文脈を共有した1本の記事にしてください。

【キーワード情報】
主要キーワード: {{keyword}}
重要度: {{keywordData.priority}}/5
想定月間PV: {{keywordData.estimatedPv.toLocaleString()}}
関連サービス: {{relatedServices}}

【アウトライン】
タイトル: {{outline.title}}
導入: {{outline.introduction}}

セクション（keyPoints＝このセクションのみで扱うスコープ）:
{{#each outline.sections}}
{{index + 1}}. {{heading}}
   keyPoints: {{keyPoints.join(' / ')}}
   H3: {{subheadings.join(' / ')}}
{{/each}}

まとめ: {{outline.conclusion}}

【読者】
主な読者: 中高生の保護者（副次的に学生本人）。文体・トーンはこのペルソナで統一する。

【文字数】
- 記事全体: 3000〜5000字
- 各H2セクション: 500〜900字程度。同じ話を薄く伸ばさず情報密度を保つ

【セクションの役割】
- 各セクションはアウトラインの keyPoints のスコープだけを扱い、他セクションとの重複を避ける
- 似たテーマのセクションは役割分担をはっきりさせる（数値・条件／スケジュール／具体的な勉強法など）

【具体例・エピソード】
- 各セクションで**異なる野球の場面・状況**の例を使うこと（朝練前・テスト週間・大会期間・オフシーズン・引退後などをローテーション）。同じパターンを繰り返さない

【要件】
1. 主要キーワード「{{keyword}}」は**見出し（H2・H3）や導入部に自然に含める**。本文中で太字（**）で囲んだり強調しない
2. 具体例、データ、ストーリーを含める（上記のとおりセクションごとに異なる競技・状況で）
3. 読みやすい文章（短い段落、箇条書き活用）。読み物としての品質を最優先する
4. まとめに{{relatedServices}}への自然な誘導を含める
5. Markdown形式で出力（見出しは ## から開始。# は使用しない）

【重要】
- **冒頭にはアウトラインの「導入」(introduction)のみを1段落で書く。メタ説明(description)の文言は本文に絶対に含めない**
- タイトル・description（メタ説明文）は別枠で表示するため、本文には絶対に書かないでください
- 見出しは ## のみ使用（# はページタイトル用のため本文では使わない）。導入の次から ## でセクションを書く

【画像プレースホルダー】
- 記事の流れに応じて、適切な位置（導入付近・要点の直後など）に画像を2〜4箇所入れてください。
- 必ず次の形式でプレースホルダーを書いてください：`![画像の説明やキャプション](IMAGE_PLACEHOLDER:Unsplashで検索するキーワード)`
- 例：`![野球の練習風景](IMAGE_PLACEHOLDER:baseball practice)`、`![勉強と部活の両立イメージ](IMAGE_PLACEHOLDER:student studying)`
- `![]` 内は、その画像のalt／キャプションとして使える具体的な説明を日本語で書く。
- `IMAGE_PLACEHOLDER:` の後は、編集者がUnsplashをブラウザで検索するときに入力する英単語（または短いフレーズ）を書く。日本語キーワードでも可。
- 記事として適切な量に留める（1記事あたり2〜4枚程度。要点を補う程度にし、詰め込みすぎない）。

【CTAブロックの追加】
記事の最後（まとめの後）に、以下の形式でCTAブロックを必ず追加してください。
※ 以下は一例であり、**記事のテーマ・読者に応じてタイトル・説明文・ボタン文言は適宜変更してよい**。

---

:::cta-{{keywordData.relatedBusiness[0] || 'nobilva'}}
title: 記事のテーマに合わせた魅力的なタイトル
description: {{relatedServices}}に関連した説明文（50-80文字）。簡潔に。8〜15文字ごとに‖を入れる。
button: 詳しく見る または 無料学習面談に申し込む など、行動を促すテキスト
link: /{{businessPath}}
:::

【CTA作成の例】（野球に限らず、記事の種目・テーマに合わせて変える）
Nobilvaの場合（例：サッカー・勉強両立の記事向け）：
:::cta-nobilva
title: 部活と勉強の‖両立をサポート‖「Nobilva」
description: 部活に打ち込む‖中高生のための‖学習管理サービス。‖月18,000円〜・‖30日全額返金保証。
button: 無料学習面談を受ける（月20名限定）
link: /services/nobilva
:::

※ CTAの内容は記事のテーマとサービス（{{relatedServices}}）に合わせて適切にカスタマイズしてください
※ title/description内で改行したい位置に‖（U+2016）を入れる。8〜15文字ごとに入れること（少なすぎるとスマホではみ出す）
※ 利用可能なCTAタイプ：:::cta-nobilva、:::cta-teachit、:::cta-translation、:::cta-web-design、:::cta-print

記事本文のみを出力してください：
```

#### `relatedBusiness[0]` → URLパス

```
nobilva     → services/nobilva
teachit     → teachit
translation → services/translation
web-design  → services/web-design
print       → services/print
```

---

## 12. 他モデルへの移植ポイント

### 12-1. Structured Outputs の代替

| プロバイダ | 代替手段 |
| --- | --- |
| OpenAI | `response_format: { type: 'json_schema', json_schema: { strict: true, schema } }` |
| Google Gemini | `responseMimeType: 'application/json'` + `responseSchema` |
| ローカル LLM / その他 | `response_format: { type: 'json_object' }` + 本資料の JSON Schema をプロンプト末尾に明記 → コードフェンス抽出でパース（`lib/claude.ts` の `parseJsonFromClaudeResponse` 相当） |

### 12-2. モデル指定の置き換え目安

- **判断・設計系（キーワード提案 / 深掘り / アウトライン / 本文 / リライト）**: 推論寄りの大きめモデル（GPT-5 Pro, Gemini 2.5 Pro, Claude Sonnet 4.5 相当）
- **軽作業系（画像プロンプト生成）**: 速い小型モデル（Claude Haiku 4.5, GPT-5 mini, Gemini 2.5 Flash 相当）

### 12-3. max_tokens の目安

- アウトライン JSON は H2 × keyPoints が多いと長くなるため **8192 以上**を確保
- 本文一括生成は **16000 以上**（6000〜8000字の heavy 記事に備える）
- 画像プロンプトは 1500 で足りる

### 12-4. 動的ブロックの差し込み規約

`clusterAxis` / `articleRole` / `targetReader` / `volume` / `hubSlug` / `mainKeywordVariants` / `avoidKeywords` / `coOccurrenceWords` / `deepDiveText` / `userFeedbackOnDeepDive` は**すべて任意**。未指定なら対応ブロックごと丸ごと**プロンプトから省く**（空文字でも「情報なし」とも入れない）。これにより無関係な指示でモデルがハルシネーションするのを防いでいます。

### 12-5. 本文に関する鉄則（モデル指示の要点再掲）

- 冒頭は **`introduction`** のみ（`description` は本文に書かない）
- 見出しは `##` から始める（`#` はページタイトル用のため使用禁止）
- 主要キーワードは**見出し・導入にのみ**自然に含める。**本文中で太字強調しない**
- `## まとめ` と CTA ブロックは**モデルに出力させず、コード側で追記**（本資料の 6 章参照）
- 画像プレースホルダーは `![日本語の説明](IMAGE_PLACEHOLDER:英語検索キーワード)` 形式。1記事 2〜4箇所

---

## 13. 参考: 関連実装ファイル

| ファイル | 役割 |
| --- | --- |
| `lib/claude.ts` | 本資料の全プロンプト・JSON Schema・CTA テンプレートの実装正本 |
| `lib/image-prompt-template.ts` | Nanobanana 共通スタイル（9-C） |
| `lib/blog.ts` | `ClusterAxis` / `ArticleRole` / `TargetReader` 型定義 |
| `lib/keyword-manager.ts` | `TargetKeywordData` / `calculateBusinessImpact` / `checkKeywordConflicts` |
| `app/api/admin/claude/*/route.ts` | 各ステップのサーバーエンドポイント |
| `app/admin/claude/page.tsx` | UI 側のパイプライン制御（軸・ロール・読者・ボリュームのセレクター） |
| `docs/article-format-for-agents.md` | 成果物（Markdown + frontmatter）の仕様 |
| `docs/0430_変更点/nobilva_blog_framework_part_a.md` | 4軸・Maslow・CTA の設計背景 |
