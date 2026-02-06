# ブログシステム更新ドキュメント

## 📋 更新概要

ブログシステムを 3 つのカテゴリータイプに分類し、「お役立ち情報」記事については事業との紐付けを明示的に管理できるようになりました。

## 🎯 実装内容

### 1. カテゴリータイプの追加

記事を以下の 3 タイプに分類：

- **article** - お役立ち情報（一般的な記事コンテンツ）
- **press-release** - プレスリリース
- **other** - その他

### 2. 事業との紐付け管理

「お役立ち情報（article）」タイプの記事は、関連する事業を明示的に管理：

- **translation** - 翻訳
- **web-design** - Web 制作
- **print** - 印刷物制作
- **nobilva** - Nobilva（成績管理サービス）
- **teachit** - Teachit（AI に教えるアプリ）

**重要**: お役立ち情報の記事は、少なくとも 1 つの関連事業を選択する必要があります。

## 📝 記事フロントマターの更新

### 新しいフィールド

```yaml
---
title: "記事タイトル"
description: "記事の説明"
date: "2026-02-05"
author: "Nectere編集部"
category: "学習のコツ"
categoryType: "article" # 新規追加: 記事タイプ
relatedBusiness: ["nobilva"] # 新規追加: 関連事業（articleの場合のみ）
tags: ["タグ1", "タグ2"]
# ... その他のフィールド
---
```

### フィールド説明

| フィールド        | 型       | 必須 | 説明                           | 例                       |
| ----------------- | -------- | ---- | ------------------------------ | ------------------------ |
| `categoryType`    | string   | ✅   | 記事タイプ                     | `"article"`              |
| `relatedBusiness` | string[] | △    | 関連事業（article の場合必須） | `["nobilva", "nectere"]` |

### 記事タイプごとの設定例

#### お役立ち情報の場合

```yaml
categoryType: "article"
relatedBusiness: ["nobilva"] # 必須
```

#### プレスリリースの場合

```yaml
categoryType: "press-release"
# relatedBusiness は不要
```

#### その他の場合

```yaml
categoryType: "other"
# relatedBusiness は不要
```

## 🖥️ 管理画面の更新

### 新規作成・編集画面

#### 記事タイプ選択

ドロップダウンで記事タイプを選択：

- お役立ち情報
- プレスリリース
- その他

#### 関連事業選択（お役立ち情報のみ）

記事タイプが「お役立ち情報」の場合、関連事業をチェックボックスで選択：

- 翻訳
- Web 制作
- 印刷物制作
- Nobilva（成績管理）
- Teachit（AI に教えるアプリ）

**バリデーション**: お役立ち情報の場合、少なくとも 1 つの関連事業を選択しないと保存できません。

## 🎨 ブログ一覧ページの更新

### 新しいフィルター機能

#### 1. 記事タイプフィルター

- すべて
- お役立ち情報
- プレスリリース
- その他

#### 2. 関連事業フィルター（お役立ち情報選択時のみ表示）

- すべての事業
- 翻訳
- Web 制作
- 印刷物制作
- Nobilva（成績管理）
- Teachit（AI に教えるアプリ）

#### 3. カテゴリーフィルター（既存）

従来通りのカテゴリーフィルタリング

#### 4. タグフィルター（既存）

従来通りのタグフィルタリング

### 記事カードの表示

各記事カードには以下のバッジが表示されます：

- **記事タイプバッジ**

  - お役立ち（青色）
  - プレス（紫色）
  - その他（灰色）

- **関連事業バッジ**（お役立ち情報のみ）
  - 翻訳（緑色）
  - Web 制作（緑色）
  - 印刷物（緑色）
  - Nobilva（緑色）
  - Teachit（緑色）

## 🔗 URL パラメータ

### フィルタリング URL 例

```
# すべての記事
/blog

# お役立ち情報のみ
/blog?type=article

# Nobilva関連の記事のみ
/blog?type=article&business=nobilva

# プレスリリースのみ
/blog?type=press-release

# 特定カテゴリー
/blog?category=学習のコツ

# 複合フィルター（お役立ち情報 × 翻訳 × 学習のコツ）
/blog?type=article&business=translation&category=学習のコツ
```

## 📊 データ構造

### TypeScript 型定義

```typescript
export type CategoryType = "article" | "press-release" | "other";
export type BusinessType =
  | "translation"
  | "web-design"
  | "print"
  | "nobilva"
  | "teachit";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  categoryType: CategoryType; // 記事タイプ
  relatedBusiness?: BusinessType[]; // 関連事業（articleの場合のみ）
  tags: string[];
  image?: string;
  seo: {
    primaryKeyword: string;
    secondaryKeywords: string[];
    relatedArticles?: string[];
  };
  locale: string;
  content: string;
  published?: boolean;
}
```

## 🚀 使い方

### 新規記事の作成

1. 管理画面（`/admin/posts/new`）にアクセス
2. 記事タイプを選択
3. お役立ち情報の場合、関連事業を選択（必須）
4. その他のフィールドを入力
5. 「記事を作成」をクリック

### 既存記事の編集

1. 管理画面（`/admin/posts`）から記事を選択
2. 記事タイプを選択
3. お役立ち情報の場合、関連事業を選択（必須）
4. 「変更を保存」をクリック

### 既存記事の移行

既存の記事は自動的に `categoryType: "article"` が設定されます。必要に応じて管理画面から適切な記事タイプと関連事業を設定してください。

## 💡 SEO 効果

### 事業との明確な紐付け

- 各事業に関連するコンテンツが明確になり、サービスページからの内部リンク最適化が可能
- ユーザーが興味のある事業の記事を簡単に見つけられる

### コンテンツの整理

- 記事タイプごとの分類により、ユーザーが求める情報へのアクセスが改善
- プレスリリースと一般記事を分けることで、コンテンツの信頼性向上

## 📝 ベストプラクティス

### お役立ち情報の書き方

1. **明確な事業との関連性**

   - 記事内容が選択した事業と実際に関連していることを確認
   - 記事の最後に CTA で事業サービスへの導線を設置

2. **複数事業にまたがる場合**
   - 内容が複数の事業に関連する場合は、複数選択可能
   - 例: 成績管理と AI 学習アプリの両方に関連する学習法の記事
   - 例: Web 制作と印刷物制作の両方に関連するデザインの記事

### プレスリリースの書き方

1. **正式な発表内容**

   - 新サービスローンチ
   - 重要な企業発表
   - メディア掲載情報

2. **日付の重要性**
   - プレスリリースは日付が重要なので、正確な公開日を設定

### その他の活用

1. **一時的なコンテンツ**

   - イベント告知
   - 季節限定の情報

2. **分類が難しいコンテンツ**
   - どのカテゴリーにも明確に当てはまらない記事

## 🔄 今後の拡張性

### 事業の追加

新しい事業が増えた場合、以下のファイルを更新：

1. `lib/blog.ts` - `BusinessType` に追加
2. `app/admin/posts/new/page.tsx` - チェックボックスを追加
3. `app/admin/posts/[slug]/page.tsx` - チェックボックスを追加
4. `app/[locale]/blog/page.tsx` - フィルターボタンを追加

### カテゴリータイプの追加

新しい記事タイプが必要な場合、以下のファイルを更新：

1. `lib/blog.ts` - `CategoryType` に追加
2. 管理画面のドロップダウンに選択肢を追加
3. ブログページのフィルターに追加

## 📁 更新されたファイル一覧

- `lib/blog.ts` - 型定義とデータ読み込みロジック
- `app/admin/posts/new/page.tsx` - 新規作成画面
- `app/admin/posts/[slug]/page.tsx` - 編集画面
- `app/[locale]/blog/page.tsx` - ブログ一覧ページ
- `content/blog/2026-02-05-sample-blog-post.md` - サンプル記事

## 🎉 完了

これで、ブログシステムが記事タイプと事業の紐付けを明示的に管理できるようになりました！

管理画面から新しい記事を作成するか、既存の記事を編集して、新しい機能を活用してください。
