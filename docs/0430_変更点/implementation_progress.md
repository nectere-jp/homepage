# Nobilva ピボット 実装進捗

最終更新：2026年4月30日

---

## 凡例

- ✅ 完了
- 🔄 進行中
- ⬜ 未着手

---

## Phase 1：システム基盤（バックエンド）

### キーワードDB V4 → V5 マイグレーション

| タスク | 状態 | 備考 |
|---|---|---|
| `lib/keyword-manager/types.ts` V5型定義 | ✅ | `ArticleStatus`(6段階)、`ClusterAxis`、`ArticleRole`、`KeywordGroupData` V5形 |
| `lib/keyword-manager/storage.ts` V5読み書き | ✅ | V4→V5自動マイグレーション実装 |
| `lib/keyword-manager/groups.ts` デフォルト更新 | ✅ | `clusterAxis:'other'`/`articleRole:'child'`/`articleStatus:'pending'` |
| `lib/keyword-manager/queries.ts` | ✅ | `getClusterAxisStructure()` 追加。旧 `getPillarClusterStructure` は deprecated wrapper で互換維持 |
| `lib/keyword-manager/index.ts` エクスポート更新 | ✅ | `ClusterAxis`/`ArticleRole`/`ArticleStatus`/`KeywordDatabaseV5`/`getClusterAxisStructure` 追加 |
| `content/keywords.json` 実データ移行 | ✅ | 27→22グループ、4軸マッピング完了、タグ11→8 |

### APIルート更新

| タスク | 状態 | 備考 |
|---|---|---|
| `api/admin/keywords/pillar-cluster` | ✅ | `getClusterAxisStructure()` 呼び出し |
| `api/admin/keywords/master` GET/POST/PUT | ✅ | V5フィールド対応（`clusterAxis`/`articleRole`/`articleStatus`/`hubArticleSlug`） |
| `api/admin/keywords/master/bulk-update` | ✅ | V5フィールド対応 |
| `api/admin/keywords/master/[keyword]/detach` | ✅ | V5フィールドで新グループ作成 |
| `api/admin/claude/generate-outline` | ✅ | `clusterAxis`/`articleRole`/`targetReader`/`volume`/`hubSlug` 対応 |
| `api/admin/claude/generate-content` | ✅ | 同上 |
| `api/admin/claude/article-ideas` | ✅ | `clusterAxis`/`articleRole`/`articleStatus` 対応 |
| `api/admin/posts` GET | ✅ | `articleRole === 'hub'` でハブ判定 |

### ブログ型・Claude プロンプト

| タスク | 状態 | 備考 |
|---|---|---|
| `lib/blog.ts` 型追加 | ✅ | `ClusterAxis`/`ArticleRole`/`TargetReader` を `BlogPost` に追加 |
| `lib/claude.ts` ARTICLE_LENGTH 3段階化 | ✅ | light(2k-3k)/standard(3k-5k)/heavy(6k-8k) |
| `lib/claude.ts` generateSearchIntentDeepDive | ✅ | 野球特化コンテキスト、`targetReader`/`clusterAxis` オプション |
| `lib/claude.ts` generateOutline | ✅ | 4軸対応、ハブ/子記事指示、タイトル30-38字、LLM最適化 |
| `lib/claude.ts` generateFullArticle | ✅ | 野球特化、3パターンCTA（保護者/生徒/両方）、Nobilva新情報 |
| `lib/claude.ts` generateArticleIdeas | ✅ | 4軸構造対応、`articleRole`/`articleStatus` 考慮 |
| `lib/claude.ts` improveArticle | ✅ | 野球特化コンテキスト |

---

## Phase 2：コンテンツ整理

| タスク | 状態 | 備考 |
|---|---|---|
| 非野球記事3本を削除 | ✅ | `soccer-study-balance.md`/`basketball-study-balance-junior-high.md`/`suisogaku-bu-benkyou-ryouritsu.md` |
| `next.config.js` に 301 リダイレクト追加 | ✅ | 3件 → `/services/nobilva` |
| keywords.json 非野球グループ削除 | ✅ | サッカー勉強/バスケ勉強/バスケ勉強両立中学生/吹奏楽部勉強/吹奏楽部勉強両立 の5グループ削除 |
| `サッカー 引退後 勉強` バリアント削除 | ✅ | 部活引退後勉強グループから除去 |
| タグ整理（サッカー/スポーツ/家庭教師 削除） | ✅ | 11→8タグ |

---

## Phase 3：管理画面UI

| タスク | 状態 | 備考 |
|---|---|---|
| `app/admin/claude/page.tsx` | ✅ | 4軸セレクター/articleRoleセレクター/targetReaderセレクター/volumeセレクター/hubSlug入力 追加 |
| `app/admin/keywords/page.tsx` | ✅ | filterClusterAxis/filterArticleStatus追加、groupedByIntentをarticleRole(hub/child)ベースに変更 |
| `app/admin/keywords/master/page.tsx` | ✅ | clusterAxis/articleRoleカラム追加 |
| `components/admin/keywords/KeywordTableRow.tsx` | ✅ | articleStatus/clusterAxisバッジ表示 |
| `components/admin/keywords/KeywordsFilterSection.tsx` | ✅ | filterClusterAxis/filterArticleStatusドロップダウン追加 |

---

## Phase 4：LP更新（未着手・別タスク）

| タスク | 状態 | 備考 |
|---|---|---|
| Nobilva LP 野球特化コピー更新 | ⬜ | 月18,000円〜/30日全額返金/月20名限定無料診断/野球特化 |
| Header/Footer のNobilva文言更新 | ⬜ | 必要に応じて |

---

## Phase 5：記事コンテンツ（Part B ロードマップ通り）

→ **Part B の進捗ボード（B4〜B8）を参照。**

B9 削除対象処理の進捗：

| キーワード | 状態 |
|---|---|
| サッカー勉強 | ✅ DB削除・記事削除・301済み |
| サッカー 引退後 勉強 | ✅ バリアント削除（グループは温存） |
| バスケ勉強 | ✅ DB削除 |
| バスケ勉強両立 中学生 | ✅ DB削除・記事削除・301済み |
| 吹奏楽部勉強 | ✅ DB削除・記事削除・301済み |
| 吹奏楽部勉強 両立 | ✅ DB削除 |

B10 Month 1チェックリスト：

- [ ] 進路軸：既存3記事（GSC稼働中）の野球特化リライト完了
- [ ] 進路軸ハブ記事の執筆・公開
- [x] 削除対象6キーワードの記事を 301 リダイレクト処理 ← **完了**

---

*このドキュメントは Claude Code との作業都度更新する。*
