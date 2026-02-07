# Google Search Console 設定ガイド

このドキュメントでは、nectere.jpのサイトマップをGoogle Search Consoleに登録し、SEO設定を最適化する手順を説明します。

## 前提条件

- Google Search Consoleアカウントを持っていること
- nectere.jpのドメイン所有権が確認済みであること

## 1. サイトマップの送信

### 手順

1. **Google Search Consoleにアクセス**
   - [Google Search Console](https://search.google.com/search-console) にログイン
   - 対象プロパティ（nectere.jp）を選択

2. **サイトマップページに移動**
   - 左メニューから「インデックス作成」→「サイトマップ」を選択

3. **サイトマップURLを送信**
   - 「新しいサイトマップの追加」セクションに以下のURLを入力:
     ```
     https://nectere.jp/sitemap.xml
     ```
   - 「送信」ボタンをクリック

4. **送信結果を確認**
   - ステータスが「成功しました」になることを確認
   - 検出されたURLの数を確認（ja/en/de の全ページが含まれているはず）

### 含まれるページ

サイトマップには以下のページが含まれます：

**静的ページ（各言語ごと）:**

- トップページ: `/ja/`, `/en/`, `/de/`
- 会社情報: `/ja/company`, `/en/company`, `/de/company`
- お問い合わせ: `/ja/contact`, `/en/contact`, `/de/contact`
- サービスページ:
  - `/ja/services/nobilva`, `/en/services/nobilva`, `/de/services/nobilva`
  - `/ja/services/nobilva/articles`, `/en/services/nobilva/articles`, `/de/services/nobilva/articles`
  - `/ja/services/teachit`, `/en/services/teachit`, `/de/services/teachit`
- ブログ一覧: `/ja/blog`, `/en/blog`, `/de/blog`

**動的ページ:**

- ブログ記事: `/ja/blog/{slug}`, `/en/blog/{slug}`, `/de/blog/{slug}`
  - 各言語のブログ記事がそれぞれの言語パスで生成されます

**除外されるページ:**

- `/admin/` 配下のすべてのページ（robots.txtで除外）
- `/api/` 配下のすべてのエンドポイント（robots.txtで除外）

## 2. robots.txtの確認

Google Search Consoleで robots.txt が正しく読み込まれているか確認します。

### 手順

1. 左メニューから「設定」→「クロール統計情報」を選択
2. robots.txtのエラーがないことを確認
3. または、直接 `https://nectere.jp/robots.txt` にアクセスして内容を確認

### robots.txtの内容

現在の設定:

- すべてのクローラーに対して `/` を許可
- `/admin/` と `/api/` を disallow に設定
- サイトマップのURLを指定: `https://nectere.jp/sitemap.xml`

## 3. URL検査ツールでの確認

個別のページがインデックス可能か確認する場合に使用します。

### 手順

1. Google Search Consoleの上部検索バーに確認したいURLを入力
   - 例: `https://nectere.jp/ja/`
   - 例: `https://nectere.jp/ja/services/nobilva`
2. 「URL検査」を実行
3. 結果を確認:
   - 「URLはGoogleに登録されています」→ 正常にインデックスされています
   - 「URLがGoogleに登録されていません」→ 下記の対処を実施
4. 必要に応じて「インデックス登録をリクエスト」をクリック

## 4. 除外URLの確認

adminパスが正しく除外されているか確認します。

### 手順

1. 左メニューから「インデックス作成」→「ページ」を選択
2. 「ページがインデックスに登録されなかった理由」セクションを確認
3. `/admin/` 配下のURLが「robots.txtによりブロック済み」となっていればOK

### 期待される結果

- `/admin/login` → 「robots.txtによりブロック済み」
- `/admin/posts` → 「robots.txtによりブロック済み」
- `/api/*` → 「robots.txtによりブロック済み」

## 5. カバレッジレポートの監視

定期的にカバレッジレポートを確認することで、インデックス状況を把握できます。

### 手順

1. 「インデックス作成」→「ページ」でインデックス状況を確認
2. エラーや警告がないかチェック
3. 新しいページが正しくインデックスされているか確認

### チェックポイント

- **有効なページ数**: ja/en/de の全ページが含まれているか
- **エラー**: 404エラーやサーバーエラーがないか
- **警告**: リダイレクトや重複コンテンツの警告がないか

## 6. 国際ターゲティング（多言語サイト）

多言語対応サイトの場合、hreflang タグの設定を推奨します。

### hreflangタグとは

検索エンジンが言語・地域ごとに適切なページを表示するためのタグです。

### 実装方法

Next.jsの場合、各ページの `<head>` タグ内に以下のようなタグを追加します：

```tsx
// app/[locale]/layout.tsx または個別ページ
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;

  return {
    alternates: {
      canonical: `https://nectere.jp/${locale}`,
      languages: {
        ja: "https://nectere.jp/ja",
        en: "https://nectere.jp/en",
        de: "https://nectere.jp/de",
        "x-default": "https://nectere.jp/ja",
      },
    },
  };
}
```

これにより、以下のようなタグが自動生成されます：

```html
<link rel="alternate" hreflang="ja" href="https://nectere.jp/ja/page" />
<link rel="alternate" hreflang="en" href="https://nectere.jp/en/page" />
<link rel="alternate" hreflang="de" href="https://nectere.jp/de/page" />
<link rel="alternate" hreflang="x-default" href="https://nectere.jp/ja/page" />
```

### Google Search Consoleでの確認

1. 左メニューから「設定」→「インターナショナル ターゲティング」を選択
2. hreflangタグのエラーがないか確認
3. 言語ごとの代替URLが正しく認識されているか確認

## 7. パフォーマンスの監視

定期的にサイトのパフォーマンスを監視します。

### 手順

1. 左メニューから「検索結果」を選択
2. 以下の指標を確認:
   - **合計クリック数**: サイトへの流入数
   - **合計表示回数**: 検索結果での表示回数
   - **平均CTR**: クリック率
   - **平均掲載順位**: 検索結果での平均順位

### 最適化のヒント

- 表示回数は多いがCTRが低い場合 → タイトルやメタディスクリプションを改善
- 掲載順位が低い場合 → コンテンツの質やSEO対策を見直し
- 特定のキーワードでのパフォーマンスを確認 → 「クエリ」タブで分析

## 注意事項

### サイトマップの更新について

- Next.jsが動的にサイトマップを生成するため、新しいページやブログ記事を追加すると自動的にサイトマップに反映されます
- Google Search Consoleで再送信する必要はありません（Googleが定期的にクロールします）
- ただし、大幅な変更があった場合は手動で再送信することも可能です

### インデックスのタイミング

- サイトマップ送信後、Googleがクロール・インデックスするまで**数日〜数週間**かかる場合があります
- 新しいページの即時インデックスが必要な場合は、URL検査ツールから「インデックス登録をリクエスト」を利用してください

### 定期チェックの推奨

以下の項目を定期的に（週1回程度）チェックすることを推奨します：

- [ ] カバレッジレポートでエラーがないか
- [ ] 新しいページが正しくインデックスされているか
- [ ] 検索パフォーマンスの変化
- [ ] モバイルユーザビリティの問題がないか
- [ ] Core Web Vitalsのスコア

## トラブルシューティング

### サイトマップが送信できない

- サイトマップのURL（`https://nectere.jp/sitemap.xml`）にブラウザでアクセスできるか確認
- Next.jsのビルドが正常に完了しているか確認
- サーバーが正常に稼働しているか確認

### ページがインデックスされない

1. robots.txtで誤ってブロックしていないか確認
2. URL検査ツールでクロール可能か確認
3. ページにnoindexタグが設定されていないか確認
4. サーバーエラー（500系）が発生していないか確認

### hreflangエラーが表示される

1. すべての言語バージョンで相互にhreflangタグが設定されているか確認
2. URLが正しく記載されているか確認（https、末尾のスラッシュなど）
3. 言語コードが正しいか確認（ja, en, de）

## 参考リンク

- [Google Search Console ヘルプ](https://support.google.com/webmasters/)
- [サイトマップについて](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [hreflangタグについて](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [robots.txtについて](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
