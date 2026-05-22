# Nobilva ピボット 実装進捗

最終更新：2026年5月13日

---

## 凡例

- ✅ 完了
- ⬜ 未着手

---

## Phase 1〜3：完了（2026-04-30〜05-01）

| カテゴリ | 内容 | 状態 |
|---|---|---|
| キーワードDB V5化 | types/storage/groups/queries/index すべてV5対応 | ✅ |
| APIルート V5対応 | master/bulk-update/detach/generate系/article-ideas/posts | ✅ |
| lib/blog.ts 型追加 | ClusterAxis/ArticleRole/TargetReader | ✅ |
| lib/claude.ts プロンプト更新 | ARTICLE_LENGTH 3段階/4軸/野球特化CTA3パターン/ハブ子記事対応 | ✅ |
| 非野球記事削除 + 301リダイレクト | 3本削除・next.config.jsにリダイレクト設定 | ✅ |
| keywords.json 非野球削除・V5化 | 5グループ削除・4軸マッピング・26グループ | ✅ |
| 既存記事 野球特化リライト | 全記事のCTA/本文/タグを野球特化に更新 | ✅ |
| タグ整理 | 20種→10種に統合・tagMaster再定義 | ✅ |
| ハブ記事プレースホルダー作成 | 4軸×1本ずつ・published: false | ✅ |
| blog-index.json 再生成 | 19件に更新 | ✅ |
| 管理画面 UI 4軸対応 | claude/keywords/master 各ページ対応 | ✅ |

---

## Phase 4：LP全面リライト（2026-05-13 完了）

| タスク | 状態 | 備考 |
|---|---|---|
| LP 15セクション全面リライト | ✅ | 日本語ハードコード・i18n廃止、旧37→新16コンポーネント |
| ヒーロー画像・斜めスプリット演出 | ✅ | Adobe Firefly 生成画像、bg-split-yellow/gray/white ユーティリティ |
| EmpathySection 画像追加 | ✅ | hero-desk.jpg 配置 |
| ResultsSnippetSection 改善 | ✅ | 数字オレンジ強調、タグ化、吹き出しコメント |
| ComparisonSection 改善 | ✅ | Nobilva列太字、◯△×アイコン追加 |
| FAQExcerptSection 改善 | ✅ | 質問文を大きく太字に |
| PricingSection 改善 | ✅ | プランカード上下中央揃え |
| 伴走セクション分割・再配置 | ✅ | AccompanimentSection → DayFlowSection + YearRoadmapSection |
| コードレビュー・統一性修正 | ✅ | 見出しpadding統一（px-10 py-4）、inline style除去 |
| 未使用画像削除 | ✅ | features-point1-4.svg, problems-1-5.svg（9ファイル） |
| en/de → ja リダイレクト | ✅ | next.config.js |
| CTA変更: LINE→/diagnosis | ✅ | 全セクション対応 |
| Header/Footer のNobilva文言更新 | ⬜ | 必要に応じて |

### Phase 4 残タスク

| タスク | 状態 | 備考 |
|---|---|---|
| `/diagnosis` 無料学習診断ページ | ⬜ | CV直結 |
| サブページ8本 | ⬜ | /how-it-works, /results, /career-path, /coach, /pricing, /for-teams, /faq |
| 構造化データ | ⬜ | Service/FAQPage/Product+Offer/Article/Person |
| Adobe Firefly 画像差し替え | ⬜ | 一部配置済み、残りプレースホルダー |
| アナリティクスダッシュボード | ⬜ | |

---

## Phase 5：記事コンテンツ（Part B ロードマップ通り）

→ **Part B の進捗ボード（B4〜B8）を参照。**

B10 Month 1 チェックリスト：

- [x] 進路軸：既存3記事（GSC稼働中）の野球特化リライト完了 ← 完了（2026-05-01）
- [ ] 進路軸ハブ記事の執筆・公開
- [x] 削除対象6キーワードの記事を 301 リダイレクト処理 ← 完了（2026-04-30）

---

*このドキュメントは Claude Code との作業都度更新する。*
