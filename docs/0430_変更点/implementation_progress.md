# Nobilva ピボット 実装進捗

最終更新：2026年5月1日

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

## Phase 4：LP更新（未着手・別タスク）

| タスク | 状態 | 備考 |
|---|---|---|
| Nobilva LP 野球特化コピー更新 | ⬜ | 月18,000円〜/30日全額返金/月20名限定無料診断/野球特化 |
| Header/Footer のNobilva文言更新 | ⬜ | 必要に応じて |

---

## Phase 5：記事コンテンツ（Part B ロードマップ通り）

→ **Part B の進捗ボード（B4〜B8）を参照。**

B10 Month 1 チェックリスト：

- [x] 進路軸：既存3記事（GSC稼働中）の野球特化リライト完了 ← 完了（2026-05-01）
- [ ] 進路軸ハブ記事の執筆・公開
- [x] 削除対象6キーワードの記事を 301 リダイレクト処理 ← 完了（2026-04-30）

---

*このドキュメントは Claude Code との作業都度更新する。*
