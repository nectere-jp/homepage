# ブログ記事の記法（外部エージェント向け）

このドキュメントは、外部エージェント（AI・自動生成ツール等）が当サイトのブログ記事を生成する際の仕様・記法をまとめたものです。  
記事を新規作成・編集する場合は、この記法に従ってください。

---

## 0. 事業別コンテンツ方針（ターゲット・トーン）

記事を作成する前に、対象事業のターゲット読者とトーンを確認してください。

### Nobilva（`relatedBusiness: nobilva`）

- **ターゲット読者**: **高校受験を目指す中学生（受験生）とその保護者**
  - 一次読者: 部活に打ち込む中学1〜3年生（特に受験を意識し始めた中2〜中3）
  - 二次読者: 子どもの成績や進路を心配する保護者
- **検索意図の背景**: 「部活と勉強を両立したい」「内申点を上げたい」「高校受験に向けて成績を上げたい」
- **トーン・文体**:
  - 中学生が読んでも理解できる平易な言葉を使う（難解な漢字・専門用語は避けるか読み仮名を添える）
  - 「〜できます」「〜しましょう」など、前向きで励ます語調
  - 具体的な数字・事例を用いて信頼感を出す
- **禁止事項**: 大学受験・高校生向けの文脈で書かない。記事内で言及する「受験」は**高校受験**を指す

### その他の事業

| 事業 | 主なターゲット | トーン |
| ---- | -------------- | ------ |
| `translation` | 企業・個人の翻訳依頼者 | プロフェッショナル、信頼感重視 |
| `web-design` | 中小企業・個人事業主 | 親しみやすく、実績訴求 |
| `print` | 企業の担当者 | 丁寧・具体的 |
| `teachit` | 学習者・教育関係者 | 革新的、ポジティブ |

---

## 1. ファイル配置

- **保存場所**: `content/blog/`
- **ファイル名**: `{slug}.md`（スラッグは英小文字・数字・ハイフンのみ、例: `soccer-study-balance.md`）
- **エンコーディング**: UTF-8
- **形式**: Markdown + YAML フロントマター（gray-matter）

---

## 2. フロントマター（必須フィールド）

記事の先頭を `---` で囲んだ YAML ブロック内にメタデータを記述します。

```yaml
---
title: "記事タイトル"
description: "記事の説明（OGP・検索結果に使用、150〜160文字推奨）"
date: "2026-02-10"
author: "Nectere編集部"
category: "学習のコツ"
categoryType: article
relatedBusiness:
  - nobilva
tags:
  - タグ1
  - タグ2
image: "/images/blog/xxx.jpg"
seo:
  primaryKeyword: "主要キーワード"
  secondaryKeywords: []
  relatedArticles: []
locale: ja
published: true
---
```

### フロントマター フィールド一覧

| フィールド              | 型       | 必須 | 説明                                             |
| ----------------------- | -------- | ---- | ------------------------------------------------ |
| `title`                 | string   | ✅   | 記事タイトル                                     |
| `description`           | string   | ✅   | 記事の説明（メタ説明・OGP用）                    |
| `date`                  | string   | ✅   | 公開日（ISO 8601: `YYYY-MM-DD`）                 |
| `author`                | string   | △    | 著者（デフォルト: `Nectere編集部`）              |
| `category`              | string   | ✅   | カテゴリ（例: 学習のコツ、お知らせ）             |
| `categoryType`          | string   | ✅   | 記事タイプ（後述）                               |
| `relatedBusiness`       | string[] | △    | 関連事業（`categoryType: article` の場合必須）   |
| `tags`                  | string[] | ✅   | タグの配列                                       |
| `image`                 | string   | △    | サムネイル画像パス（例: `/images/blog/xxx.jpg`） |
| `seo.primaryKeyword`    | string   | ✅   | 主要SEOキーワード                                |
| `seo.secondaryKeywords` | string[] | △    | サブキーワード                                   |
| `seo.relatedArticles`   | string[] | △    | 関連記事の slug 一覧                             |
| `locale`                | string   | △    | 言語（デフォルト: `ja`）                         |
| `published`             | boolean  | △    | 公開可否（デフォルト: `true`）                   |

### `categoryType`（記事タイプ）

| 値              | 説明                         |
| --------------- | ---------------------------- |
| `article`       | お役立ち情報（一般的な記事） |
| `press-release` | プレスリリース               |
| `other`         | その他                       |

**重要**: `categoryType: article` の場合は `relatedBusiness` が必須です。

### `relatedBusiness`（関連事業）

`categoryType: article` の場合、少なくとも1つ指定してください。

| 値            | 説明                        |
| ------------- | --------------------------- |
| `translation` | 翻訳                        |
| `web-design`  | Web制作                     |
| `print`       | 印刷物制作                  |
| `nobilva`     | Nobilva（成績管理サービス） |
| `teachit`     | Teachit（AIに教えるアプリ） |

---

## 3. SEO・LLMO ライティングガイドライン

記事の品質と検索・AI両方での可視性を高めるための執筆指針です。

### 3.1 キーワード配置（SEO）

| 配置場所 | ルール |
| -------- | ------ |
| `title` | `primaryKeyword` を冒頭30文字以内に含める。全体は30〜35文字が目安 |
| `description` | `primaryKeyword` を冒頭付近に含め、価値訴求＋行動促進フレーズで締める（例: 「〜を解説します」）。150〜160文字 |
| H1（記事冒頭の `#`） | タイトルと同一またはほぼ同じにする |
| 導入文 | 最初の100文字以内に `primaryKeyword` を自然な形で含める |
| 見出し（H2/H3） | `secondaryKeywords` を見出しに分散させる（詰め込み過ぎない） |
| 本文 | `primaryKeyword` の密度は1〜2%程度（500字に1〜2回が目安） |

### 3.2 コンテンツ構造（LLMO: LLM最適化）

AIアシスタント（ChatGPT、Gemini、Perplexityなど）に引用・推薦されやすい記事にするための指針です。

- **結論ファースト**: 導入文で検索意図への答えを先に示す（「〜するには〜が効果的です」）
- **定義的フレーズ**: セクションの冒頭で用語を定義する（「〜とは、〜のことです」形式）
- **箇条書き・表を積極活用**: LLMは構造化されたデータを引用しやすい
- **具体的な数値・事実**: 「多い」ではなく「約3割」、「早い」ではなく「15分以内」のように定量化する
- **FAQセクション推奨**: 記事の最後（CTAの前）にQ&A形式のよくある質問を3〜5問追加すると、Featured Snippet・AI引用の双方に効果的
- **E-E-A-T強化**: 「東大生メンターが監修」「〇〇部OBが解説」など、経験・専門性を示すフレーズを自然に含める

### 3.3 コンテンツ分量の目安

| 記事種別 | 文字数（本文） | H2見出し数 |
| -------- | ------------ | ---------- |
| ピラー記事（ミドルワード） | 2,000〜3,000字 | 4〜6個 |
| クラスター記事（ロングテール） | 1,000〜1,800字 | 3〜5個 |

### 3.4 標準的な記事構成テンプレート

```
# タイトル（H1）

## この記事でわかること（箇条書き3〜5点）

## 導入：悩み・課題への共感 → 解決できるという提示

## [本論 H2 × 3〜5個]
各H2内：H3サブセクション → 説明 → 具体例 or リスト

## まとめ：行動につながる結論（100〜200字）

## よくある質問（FAQ）← LLMO効果大、任意だが推奨

:::cta-{事業}
```

---

## 4. 本文 Markdown 記法

### 4.1 標準 Markdown

以下の Markdown 記法が利用可能です（remark-gfm 対応）:

- 見出し: `#`, `##`, `###`
- 太字: `**text**`
- italic: `*text*`
- リスト（ul / ol）
- 引用: `> quote`
- リンク: `[text](url)`
- コード: `` `code` ``, `code block`

### 4.2 画像プレースホルダー

記事に画像を挿入する場合、次の形式でプレースホルダーを記述します。  
後から編集者が Unsplash 等で画像を検索して差し替える想定です。

```
![画像の説明やキャプション](IMAGE_PLACEHOLDER:検索キーワード)
```

**例**:

```markdown
![野球の練習風景](IMAGE_PLACEHOLDER:baseball practice)
![勉強と部活の両立イメージ](IMAGE_PLACEHOLDER:student studying)
```

- `IMAGE_PLACEHOLDER:` の後は、画像検索時に使う英単語または短いフレーズ
- 日本語キーワードも可
- 記事中 1〜3 箇所程度、内容に合う場合のみ挿入（必須ではない）

### 4.3 CTA ブロック（記事末尾）

記事末尾に CTA（Call to Action）ブロックを挿入します。  
複数行形式を推奨します。**以下は一例であり、記事のテーマ・読者に応じてタイトル・説明文・ボタン文言は適宜変更してよい。**

- `title` / `description` 内で改行したい位置に **‖**（U+2016）を入れると、その位置で改行されます。

```
:::{cta-type}
title: CTAのタイトル
description: CTAの説明文（改行位置に‖を入れる）
button: ボタンラベル
link: /services/nobilva
:::
```

**利用可能な CTA タイプ**:

| タイプ               | 対象サービス                |
| -------------------- | --------------------------- |
| `:::cta-nobilva`     | Nobilva（学習管理サービス） |
| `:::cta-teachit`     | Teachit（AIに教えるアプリ） |
| `:::cta-translation` | 翻訳                        |
| `:::cta-web-design`  | Web制作                     |
| `:::cta-print`       | 印刷物制作                  |

**例（Nobilva 記事の場合。野球に限らず記事の種目・テーマに合わせて変える）**:

```markdown
:::cta-nobilva
title: 部活と勉強の両立をサポートする‖学習管理サービス「Nobilva」
description: Nobilvaでは、‖部活に打ち込む中高生のための‖学習管理サービスを提供しています。‖専属メンター制度、LINE相談、‖個別学習計画など、‖部活と勉強の両立を全力でサポート。
button: 詳しく見る
link: /services/nobilva
:::
```

1行形式も利用可能:

```markdown
:::cta-nobilva title: タイトル description: 説明 button: ボタン link: /path :::
```

---

## 5. 記事構造の例（Nobilva向け）

```markdown
---
title: サッカーと勉強を両立させる5つの実践的コツ【中学生向け】
description: サッカー 勉強 両立に悩む中学生必見！高校受験を見据えて、週末の試合・平日の練習で忙しくても内申点を維持・向上させる具体的な学習戦略を解説します。
date: "2026-02-10"
author: Nectere編集部
category: 学習のコツ
categoryType: article
relatedBusiness:
  - nobilva
tags:
  - サッカー
  - 勉強両立
  - 時間管理
  - 部活動
image: /images/blog/soccer-study.jpg
seo:
  primaryKeyword: サッカー 勉強 両立
  secondaryKeywords: []
  relatedArticles: []
locale: ja
published: true
---

# メインタイトル

導入文...

## セクション1の見出し

![画像説明](IMAGE_PLACEHOLDER:soccer student studying)

本文...

## セクション2の見出し

本文...

## まとめ

まとめの内容...

## よくある質問（FAQ）

**Q. サッカー部でも高校受験に間に合いますか？**

A. 間に合います。...

**Q. 毎日の練習で疲れていても勉強できますか？**

A. はい。...

:::cta-nobilva
title: サッカーと勉強の両立を全力サポート「Nobilva」
description: Nobilvaは、サッカーに打ち込む中学生の高校受験をサポートする学習管理サービスです。‖試合スケジュールに合わせた学習計画、週1面談、毎日のLINE相談で、‖部活と内申点対策の両立を実現します。
button: 詳しく見る
link: /services/nobilva
:::
```

---

## 6. ピラー-クラスター構造と内部リンク

### 6.1 キーワードの階層

- **ピラーページ（ミドルワード）**: 同じ趣旨の複数キーワードを1記事でカバー。例: 「スポーツ推薦 成績 対策」「スポーツ推薦 評定 対策」→ 1本の包括的な記事
- **クラスターページ（ロングテール）**: 種目・時間帯・状況を絞った細かい内容。例: 「野球 朝練 勉強 30分」「遠征 前日 勉強 時間」

### 6.2 クラスター記事の内部リンク

クラスター記事を作成する場合、親ピラーページへの内部リンクを**導入またはまとめ付近**に1箇所以上含めてください。

```markdown
スポーツ推薦と成績対策についてもっと詳しく知りたい方は、[こちらの記事](/blog/athletic-recruitment-grade)をご覧ください。
```

- リンク先は `/blog/{ピラーのslug}` 形式
- 自然な文脈で読者を誘導する

### 6.3 カニバリズム防止

- 1キーワード1記事: 同じ primaryKeyword を複数記事で使わない
- 同じ趣旨のミドルワードは1ピラーにまとめる
- キーワード管理画面で意図グループ・競合を確認してから記事を作成する

---

## 7. スラッグのルール

- 英小文字・数字・ハイフンのみ（ピラー/クラスター共通）
- 正規表現: `^[a-z0-9-]+$`
- 既存スラッグとの重複は不可（衝突時は `-2`, `-3` 等で区別）
- タイトルから自動生成する例: 「サッカーと勉強の両立」→ `soccer-study-balance`

---

## 8. 注意事項・禁止事項

- フロントマターの YAML 構文エラーに注意（コロン後のスペース、引用符の使い方）
- `categoryType: article` の場合、`relatedBusiness` を必ず1つ以上指定すること
- **Nobilva記事のターゲット**: `relatedBusiness: nobilva` の記事は**高校受験を目指す中学生向け**に書くこと。大学受験や高校生向けの文脈にしない。「受験」と書く際は文脈上「高校受験」を指すように書く
- CTA ブロックは記事末尾に1つ配置（複数可だが、通常は1つ）
- 画像は `IMAGE_PLACEHOLDER` 形式で指定し、後から差し替える運用を想定
- サムネイル画像は `public/images/blog/` に配置し、`image` には `/images/blog/xxx.jpg` 形式で指定
- **参照画像のコミット**: **/admin で記事を保存したとき**は、API が `commitFilesWithBlogImages` を使うため、記事で参照している `public/images/blog/` の画像が同じコミットに自動で含まれる。**ローカルで git commit するとき**は、ステージした `content/blog/*.md` から参照されている画像を pre-commit（lint-staged → `scripts/stage-blog-images.js`）が自動でステージする。いずれも「参照されている画像」は同じコミットに含まれる。
- 記事（`content/blog/*.md`）をコミットする際、pre-commit で `build:blog-index` が実行され、`content/blog-index.json` と `content/keywords.json` が自動で再生成・ステージされる

---

## 9. 参考ファイル

- 型定義: `lib/blog.ts`
- 既存記事例: `content/blog/athletic-recruitment.md`, `content/blog/soccer-study-balance.md`
- CTA パーサー: `lib/remark-cta-plugin.ts`
- ブログ管理の詳細: `README_BLOG.md`
