# ブログ/プレスリリース機能 セットアップガイド

このドキュメントでは、実装されたブログ機能の使い方とFirebaseのセットアップ方法を説明します。

## 📋 機能概要

### 実装済み機能

✅ **マークダウンベースのブログシステム**
- `content/blog/` フォルダでマークダウン記事を管理
- フロントマター形式でメタデータを定義
- 記事一覧・詳細ページ
- カテゴリー・タグフィルタリング

✅ **管理画面（`/admin`）**
- Firebase Authenticationによる認証
- マークダウンエディター（@uiw/react-md-editor）
- 記事のCRUD操作
- リアルタイムプレビュー

✅ **Claude API統合**
- トピックからキーワード提案
- SEO最適化アウトライン生成
- 本文下書き自動生成
- 記事アイデア提案

✅ **SEOキーワード管理**
- キーワードデータベース（JSON）
- 競合検出（同一キーワード使用チェック）
- キーワード分析ダッシュボード
- 未使用キーワード抽出

✅ **SEO最適化**
- 構造化データ（JSON-LD）
- サイトマップ自動生成
- robots.txt
- OGP設定

✅ **GitHub自動コミット**
- 管理画面から保存時に自動的にGitHubにコミット
- Vercel自動デプロイ（3-5分で反映）
- Git履歴管理
- バージョン管理

---

## 🚀 セットアップ手順

### 1. 環境変数の設定

`.env.local.example` をコピーして `.env.local` を作成：

```bash
cp .env.local.example .env.local
```

### 2. Firebaseプロジェクトの作成

#### 2.1 Firebaseコンソールでプロジェクト作成

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」をクリック
3. プロジェクト名を入力（例: `nectere-blog`）
4. Google Analyticsは任意で設定

#### 2.2 Authenticationの設定

1. Firebaseコンソールで「Authentication」を選択
2. 「始める」をクリック
3. 「Sign-in method」タブで「メール/パスワード」を有効化
4. 「Users」タブで管理者ユーザーを追加
   - メールアドレス: `admin@nectere.jp`
   - パスワードを設定

#### 2.3 Web アプリの登録

1. プロジェクト設定 > 「アプリを追加」 > Web アイコンをクリック
2. アプリのニックネームを入力（例: `Nectere Blog`）
3. 表示される設定情報を `.env.local` にコピー：

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

#### 2.4 Admin SDKの設定

1. プロジェクト設定 > 「サービスアカウント」タブ
2. 「新しい秘密鍵の生成」をクリック
3. ダウンロードしたJSONファイルから以下を `.env.local` にコピー：

```env
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**注意**: `FIREBASE_ADMIN_PRIVATE_KEY` は改行を `\n` に置換してください。

#### 2.5 管理者メールアドレスの設定

```env
ADMIN_EMAILS=admin@nectere.jp,another@example.com
```

複数の管理者がいる場合は、カンマ区切りで追加します。

### 3. GitHub API の設定（自動コミット用）

#### 3.1 Personal Access Token の作成

1. [GitHub Settings](https://github.com/settings/tokens) にアクセス
2. 「Personal access tokens」 > 「Tokens (classic)」 を選択
3. 「Generate new token (classic)」 をクリック
4. トークンの設定:
   - **Note**: `Nectere Blog Auto Commit`
   - **Expiration**: `No expiration` または適切な期限
   - **Scopes**: ✅ `repo` (全て)
5. 「Generate token」 をクリック
6. **トークンをコピー**（再表示できないため注意）

#### 3.2 環境変数の設定

`.env.local` に追加：

```env
# GitHub API (自動コミット用)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxx
GITHUB_OWNER=your-github-username
GITHUB_REPO=homepage
GITHUB_BRANCH=main
```

**説明**:
- `GITHUB_TOKEN`: 上記で作成したPersonal Access Token
- `GITHUB_OWNER`: GitHubユーザー名（例: `ryuto`）
- `GITHUB_REPO`: リポジトリ名（例: `homepage`）
- `GITHUB_BRANCH`: ブランチ名（通常は`main`または`dev`）

**重要**: `.env.local` は `.gitignore` に含まれているため、Gitにコミットされません。

### 4. Claude APIキーの設定

1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. APIキーを生成
3. `.env.local` に追加：

```env
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

---

## 📝 使い方

### ブログ記事の作成

#### 方法1: 管理画面で作成

1. `http://localhost:3000/admin/login` にアクセス
2. 管理者アカウントでログイン
3. 「新規作成」をクリック
4. フォームに記事情報を入力
5. マークダウンエディターで本文を執筆
6. 「記事を作成」をクリック

#### 方法2: Claude AIで作成

1. 管理画面の「Claude支援」をクリック
2. トピックを入力
3. AIがキーワードを提案
4. アウトラインを生成
5. 本文を自動生成
6. 記事作成ページで最終調整

#### 方法3: 直接マークダウンファイルを作成

`content/blog/` フォルダに `.md` ファイルを作成：

```markdown
---
title: "記事タイトル"
description: "記事の説明"
date: "2026-02-05"
author: "Nectere編集部"
category: "カテゴリー"
tags: ["タグ1", "タグ2"]
image: "/images/blog/image.jpg"
seo:
  primaryKeyword: "主要キーワード"
  secondaryKeywords: ["関連キーワード1", "関連キーワード2"]
locale: ja
published: true
---

# 記事本文

マークダウンで記事を書きます。
```

### キーワード管理

1. 管理画面の「キーワード管理」をクリック
2. 「再分析実行」で最新のキーワード状況を取得
3. 競合しているキーワードを確認
4. よく使われるキーワードをチェック

### 記事編集・削除

1. 管理画面の「記事一覧」をクリック
2. 編集したい記事の「編集」ボタンをクリック
3. 変更を保存または削除

---

## 🎨 記事フロントマターの説明

| フィールド | 必須 | 説明 | 例 |
|-----------|------|------|-----|
| `title` | ✅ | 記事タイトル | "野球と勉強の両立術" |
| `description` | ✅ | 記事の説明（120-130文字推奨） | "効率的な時間管理で文武両道を実現" |
| `date` | ✅ | 公開日（YYYY-MM-DD） | "2026-02-05" |
| `author` | ✅ | 著者名 | "Nectere編集部" |
| `category` | ✅ | カテゴリー | "学習のコツ" |
| `tags` | - | タグ配列 | ["野球", "勉強両立"] |
| `image` | - | アイキャッチ画像パス | "/images/blog/image.jpg" |
| `seo.primaryKeyword` | ✅ | 主要キーワード | "野球 勉強 両立" |
| `seo.secondaryKeywords` | - | 関連キーワード配列 | ["部活 時間管理"] |
| `locale` | ✅ | 言語 | "ja" または "en" |
| `published` | - | 公開状態（省略時はtrue） | true または false |

---

## 🔧 トラブルシューティング

### ログインできない

- Firebaseの管理者メールアドレスが正しく設定されているか確認
- `.env.local` の `ADMIN_EMAILS` にログインするメールアドレスが含まれているか確認
- Firebase Consoleで該当ユーザーが作成されているか確認

### Claude APIが動作しない

- `.env.local` の `ANTHROPIC_API_KEY` が正しく設定されているか確認
- APIキーの使用制限を超えていないか確認
- Anthropic Consoleでクレジットが残っているか確認

### GitHub自動コミットが動作しない

- `.env.local` の `GITHUB_TOKEN` が正しく設定されているか確認
- Personal Access Tokenに `repo` 権限が付与されているか確認
- `GITHUB_OWNER`、`GITHUB_REPO`、`GITHUB_BRANCH` が正しいか確認
- トークンの有効期限が切れていないか確認
- GitHub APIのレート制限を超えていないか確認

**エラーメッセージの確認方法**:
- サーバーコンソール（`npm run dev` を実行しているターミナル）を確認
- 「GitHub commit failed」のエラーログを確認

**手動でpushする方法**（GitHub APIが失敗した場合）:
```bash
cd /Users/ryuto/programs/homepage
git add content/blog/
git commit -m "Add/Update blog post"
git push origin main
```

### マークダウンエディターが表示されない

- ブラウザのJavaScriptが有効になっているか確認
- コンソールエラーを確認
- `@uiw/react-md-editor` が正しくインストールされているか確認

### 記事が表示されない

- `content/blog/` フォルダにマークダウンファイルがあるか確認
- フロントマターの形式が正しいか確認
- `published: false` になっていないか確認
- 開発サーバーを再起動
- Vercel本番環境の場合は、デプロイが完了しているか確認（3-5分）

---

## 📊 SEOベストプラクティス

### キーワード選定

1. **主要キーワードは1記事1つ**
   - 同じ主要キーワードを複数記事で使わない
   - キーワード管理画面で競合をチェック

2. **関連キーワードで補完**
   - 3-5個の関連キーワードを設定
   - 本文に自然に含める

3. **タイトルにキーワードを含める**
   - 主要キーワードは前半30文字以内に
   - 30-35文字を目安に

### コンテンツ作成

1. **見出し構造を意識**
   - H2 → H3 の論理的階層
   - 各セクション300-500文字

2. **内部リンクを活用**
   - 関連記事へのリンク
   - サービスページへの導線

3. **画像にalt属性**
   - キーワードを含む説明文
   - 画像の内容を正確に記述

---

## 🚢 デプロイ

### Vercelへのデプロイ

1. Vercelプロジェクトに環境変数を追加
2. `.env.local` の内容をコピー
3. デプロイ

### 環境変数の設定（Vercel）

Settings > Environment Variables で以下を追加：

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_ADMIN_PROJECT_ID
FIREBASE_ADMIN_CLIENT_EMAIL
FIREBASE_ADMIN_PRIVATE_KEY
ADMIN_EMAILS
ANTHROPIC_API_KEY
GITHUB_TOKEN
GITHUB_OWNER
GITHUB_REPO
GITHUB_BRANCH
```

**重要**: `GITHUB_TOKEN` と `FIREBASE_ADMIN_PRIVATE_KEY` は暗号化されて保存されるため安全です。

### GitHub自動デプロイの仕組み

```
管理画面で記事保存
    ↓
ローカルファイルに保存
    ↓
GitHub APIで自動コミット＆プッシュ
    ↓
GitHubがVercelにWebhook送信
    ↓
Vercel自動ビルド＆デプロイ（3-5分）
    ↓
記事が公開される
```

---

## 💡 ヒント

### 記事作成の効率化

1. **Claude支援を活用**
   - アウトライン生成で構成を作成
   - 下書き生成で時間短縮
   - 人間が最終調整

2. **テンプレートを作成**
   - よく使う構成をマークダウンで保存
   - コピー＆ペーストで時間短縮

3. **定期的にキーワード分析**
   - 週1回キーワード管理画面をチェック
   - 未使用キーワードから記事アイデア

### SEO効果測定

- Google Search Consoleと連携
- 記事ごとの検索パフォーマンス確認
- 効果的なキーワードを分析

---

## 📚 参考リンク

- [Next.js App Router](https://nextjs.org/docs/app)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Markdown Guide](https://www.markdownguide.org/)

---

## 🆘 サポート

問題が発生した場合は、以下を確認してください：

1. コンソールエラーメッセージ
2. `.env.local` の設定
3. Firebaseコンソールの設定
4. このドキュメントのトラブルシューティング

それでも解決しない場合は、開発チームにお問い合わせください。
