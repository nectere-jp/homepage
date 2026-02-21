# ブログ記事の記法（外部エージェント向け）

このドキュメントは、外部エージェント（AI・自動生成ツール等）が当サイトのブログ記事を生成する際の仕様・記法をまとめたものです。  
記事を新規作成・編集する場合は、この記法に従ってください。

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

## 3. 本文 Markdown 記法

### 3.1 標準 Markdown

以下の Markdown 記法が利用可能です（remark-gfm 対応）:

- 見出し: `#`, `##`, `###`
- 太字: `**text**`
- italic: `*text*`
- リスト（ul / ol）
- 引用: `> quote`
- リンク: `[text](url)`
- コード: `` `code` ``, `code block`

### 3.2 画像プレースホルダー

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

### 3.3 CTA ブロック（記事末尾）

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

## 4. 記事構造の例

```markdown
---
title: サッカーと勉強を両立させる5つの実践的コツ
description: サッカー 勉強 両立に悩む中高生必見！週末の試合、平日の練習で忙しくても成績を維持・向上させる具体的な学習戦略を解説します。
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

:::cta-nobilva
title: サッカーと勉強の両立を全力サポート「Nobilva」
description: Nobilvaは、サッカーに打ち込む中高生のための学習管理サービスです。試合スケジュールに合わせた学習計画、週1面談、毎日のLINE相談で、部活と勉強の両立を実現します。
button: 詳しく見る
link: /services/nobilva
:::
```

---

## 5. ピラー-クラスター構造と内部リンク

### 5.1 キーワードの階層

- **ピラーページ（ミドルワード）**: 同じ趣旨の複数キーワードを1記事でカバー。例: 「スポーツ推薦 成績 対策」「スポーツ推薦 評定 対策」→ 1本の包括的な記事
- **クラスターページ（ロングテール）**: 種目・時間帯・状況を絞った細かい内容。例: 「野球 朝練 勉強 30分」「遠征 前日 勉強 時間」

### 5.2 クラスター記事の内部リンク

クラスター記事を作成する場合、親ピラーページへの内部リンクを**導入またはまとめ付近**に1箇所以上含めてください。

```markdown
スポーツ推薦と成績対策についてもっと詳しく知りたい方は、[こちらの記事](/blog/athletic-recruitment-grade)をご覧ください。
```

- リンク先は `/blog/{ピラーのslug}` 形式
- 自然な文脈で読者を誘導する

### 5.3 カニバリズム防止

- 1キーワード1記事: 同じ primaryKeyword を複数記事で使わない
- 同じ趣旨のミドルワードは1ピラーにまとめる
- キーワード管理画面で意図グループ・競合を確認してから記事を作成する

---

## 6. スラッグのルール

- 英小文字・数字・ハイフンのみ（ピラー/クラスター共通）
- 正規表現: `^[a-z0-9-]+$`
- 既存スラッグとの重複は不可（衝突時は `-2`, `-3` 等で区別）
- タイトルから自動生成する例: 「サッカーと勉強の両立」→ `soccer-study-balance`

---

## 7. 注意事項・禁止事項

- フロントマターの YAML 構文エラーに注意（コロン後のスペース、引用符の使い方）
- `categoryType: article` の場合、`relatedBusiness` を必ず1つ以上指定すること
- CTA ブロックは記事末尾に1つ配置（複数可だが、通常は1つ）
- 画像は `IMAGE_PLACEHOLDER` 形式で指定し、後から差し替える運用を想定
- サムネイル画像は `public/images/blog/` に配置し、`image` には `/images/blog/xxx.jpg` 形式で指定
- **参照画像のコミット**: **/admin で記事を保存したとき**は、API が `commitFilesWithBlogImages` を使うため、記事で参照している `public/images/blog/` の画像が同じコミットに自動で含まれる。**ローカルで git commit するとき**は、ステージした `content/blog/*.md` から参照されている画像を pre-commit（lint-staged → `scripts/stage-blog-images.js`）が自動でステージする。いずれも「参照されている画像」は同じコミットに含まれる。
- 記事（`content/blog/*.md`）をコミットする際、pre-commit で `build:blog-index` が実行され、`content/blog-index.json` と `content/keywords.json` が自動で再生成・ステージされる

---

## 8. 参考ファイル

- 型定義: `lib/blog.ts`
- 既存記事例: `content/blog/athletic-recruitment.md`, `content/blog/soccer-study-balance.md`
- CTA パーサー: `lib/remark-cta-plugin.ts`
- ブログ管理の詳細: `README_BLOG.md`
