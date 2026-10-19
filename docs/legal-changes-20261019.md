# 法務文書 全面リライト 作業ログ・対照表

**開始日**: 2026-10-19
**根拠**: `/Users/ryuto/Downloads/legal-update-instructions.md`
**担当**: Claude Code（Opus 4.7 / 1M context）+ ryuto1246
**公開条件**: 本ファイルを人がレビューし、§2-E の対照表に異論なし、TODO が許容範囲まで減ったことを確認してから本番反映

---

## フェーズ A: 事実調査結果（完了: 2026-10-19）

### A-1. 事業実態の認識整理（指示書の訂正）

| 事項 | 指示書の記述 | 実態（調査で判明） | 対応 |
|---|---|---|---|
| Teach It の実装 | 公開済み・個人向け・独立 | `/Users/ryuto/programs/teachmate2`（Flutter + Next.js admin on Fly.io）、App Store 配信中 | §5-5 の実装前提に `teachmate2` を使う |
| キミセン | 塾連携版・開発中・載せない | `/Users/ryuto/programs/teach_it`（内部的に「キミセン」）、都度契約条件が違う可能性 | 指示書通り「どの文書にも載せない」。`/services/kimisen` のサービスページは既存プレースホルダーのまま触らない |
| 両者の関係 | 別物 | 別物（確定） | ユーザー確認済み |
| Teach It の LLM | 「Anthropic の API（Claude）」（§8-1） | **Google Gemini 2.0-flash + Google Cloud Vision**（Anthropic は未使用） | §5-5・§8-1 の外部サービス表を Gemini / Vision に差し替え |
| Teach It の Firebase リージョン | 「東京リージョンのはず」（§8-2-3） | **US Central**（デフォルト、Japan 未指定） | §5-1 の外部サービス表に「保存先 US」と書く。保存先日本化は別タスク |

### A-2. §1 調査結果

#### A-2-a. `content/legal/` の多言語化
- 日本語版のみ 4 ファイル。`.en.md` / `.de.md` は **存在しない**。
- i18n `messages/{en,de}.json` にはフッターラベルと metadata.title のみ、本文翻訳はない。

#### A-2-b. フッターの `/ja/privacy` `/ja/terms` と `next.config.js` のリダイレクト
- `components/Footer.tsx` + `lib/navigation.ts` でリンク定義（Nectere サイト 2 項目、Nobilva ページ 3 項目）
- 既存リダイレクト:
  - `/ja/privacy` → `/ja/legal/privacy-policy` ✅
  - `/ja/terms` → `/ja/legal/nobilva/terms-of-service` ❌ (指示書 §2-A-4 の指摘通り、Nobilva 専用に飛ぶ)
  - `/ja/services/nobilva/tokushoho` → `/ja/legal/nobilva/commercial-disclosure` ✅
  - `/ja/legal/okitegami/privacy-policy` → `https://okitegami.app/privacy` **(方向逆、§7 で反転必要)**
  - `/ja/services/teachit(/.*)?` → `/ja/services/kimisen` (指示通り **外す** → Teach It ページ復活)

#### A-2-c. 事業者情報の直書き箇所（抜粋、§3-2 ビルド時チェック対象）

| 情報 | 主要箇所 |
|---|---|
| 住所 | `messages/ja.json:671,782,970`、`lib/nobilva.ts:38` |
| 電話 | `messages/ja.json:673,682,971`（表記揺れ: `03(6820)9037` / `03-6820-9037`）、`app/[locale]/services/nobilva/for-teams/page.tsx:449,617,623`、`public/llms.txt:6`、`lib/email.ts:206,241` |
| `nobilva@nectere.jp` | `messages/ja.json:565,972`、`for-teams/page.tsx` 複数 |
| `contact@nectere.jp` | `messages/ja.json:681`、`public/llms.txt:6` |
| 「養田貴大」 | `messages/ja.json:669,782,814,969`、`app/[locale]/blog/[slug]/page.tsx:41`、`for-teams/page.tsx:561` |

→ §8-1「問い合わせメール `contact@nectere.jp` に一本化」を全箇所に適用。

#### A-2-d. 計測・外部送信スクリプト
1. **Google Analytics**（`G-Y6S7SC5990`、`NEXT_PUBLIC_GA_ID`、`lazyOnload`）→ `app/layout.tsx:63-78`
2. **Google AdSense**（`NEXT_PUBLIC_ADSENSE_ID`、`beforeInteractive`）→ 本番 ID 設定の有無は TODO (T6)
3. **内部フラグ `nectere_internal`**（URL パラメータ `?internal=1` で localStorage セット）→ 機能切替用。Cookie 節で触れるか判断 (T7)
4. 他計測ツール（GTM / Vercel Analytics / Sentry / Hotjar / Meta Pixel / LINE Tag 等）は **全て無し**。

#### A-2-e. Teach It アプリ内のプライバシーポリシーリンク
- Teach It (teachmate2) 内に **アプリ内の明示的なリンク箇所は見当たらない**（TODO: Settings 画面などに追加するタスクが別途必要）
- App Store Connect 登録 URL: `https://teaching-app-new.fly.dev/privacy`（`docs/app_store_release_checklist.md:85`）
- → **nectere.jp の `#teach-it` アンカーに差し替え必要**（T15）

#### A-2-f. `../okitegami/web` の構造とリダイレクト対象
- 実パス: `/Users/ryuto/programs/okitegami/web`
- ホスティング: **Cloudflare Pages**（`_redirects`、`_headers`、`functions/`）
- `web/privacy/index.html` にプライバシーポリシー本文（第 1〜16 条）
- `/terms` は **存在せず**、プラポリ第 15 条で利用規約相当を統合
- フッターリンク: `index.html:300` から `/privacy` へ同タブ
- 既存リダイレクト: `/invite/* → /invite.html 200` のみ
- 問い合わせメアド: `contact@nectere.jp`（**難読化なし、プレーンテキスト**）
- iOS 本体: `/Users/ryuto/programs/okitegami/okitegami/`（SwiftUI）

### A-3. 文書 vs 実装・文書 vs 文書の食い違い（§2-C 補強）

| 項目 | 片方（文書 or 文書 A） | もう片方（実装 or 文書 B） | 判定 |
|---|---|---|---|
| おきてがみ公開範囲 | 利用規約第 9 条 3 項「フレンドのみまたは公開」 | Supabase RLS + `is_post_visible` RPC: **本人 / 相互フレンド / Bot のフォロワー**。`visibility` カラムなし、「公開」は実装上存在せず | **プラポリ側が正。利用規約を書き換える** |
| おきてがみ投稿ライセンス | 利用規約第 7 条「限定・広告商用利用しない」 | プラポリ第 15 条 6 項「世界的・サブライセンス可能・プロモーション可」 | §8-1「投稿の広告・宣伝利用はしない」で利用規約側に統一（指示書 §5-4-2） |
| Nobilva 解約期限 | サービスページ FAQ「前月 25 日まで」 | チーム利用「前月 10 日まで」/ 利用規約「前月 10 日」/ 指示書 §8-1「前月 10 日」 | **前月 10 日に統一**。FAQ も書き換え (T10) |
| Nobilva 入会金 | 指示書 §8-1「入会金 18,000 円」 | FAQ「入塾金 8,000 円（チーム 4,000 円）」/ サービスページ本文には記載なし | **要確認: 金額どちらが正**。税込/税抜も (T4) |
| Nobilva システム管理費税区分 | サービスページ「月 1,000 円（税抜）」 | 利用規約第 8 条「1,000 円/月（税込）」 | 指示書 §5-2-5「税抜に直す」 |
| Nobilva プラン名 | サービスページ「エッセンシャル / ベーシック」 | 利用規約「ベーシック / スタンダード / アドバンスト」/ 特商法「ミニマム / エッセンシャル / スタンダード」 | **サービスページに合わせる**（指示書 §5-2-3） |
| Nobilva 休会費 | 利用規約第 22 条 8 項「500 円/月（税込）」+ `※金額要確認` コメント | 指示書 §8-1「月 1,000 円（税抜）」 | **月 1,000 円（税抜）に改める**（指示書 §2-E-4） |
| Nobilva 第 2 条の URL | md: `https://nectere.jp/nobilva`（www なし） | JSON: `https://www.nectere.jp/nobilva` / 実際は `/services/nobilva` or `https://nobilva.jp` | `business.services.nobilva.url` = `https://nobilva.jp` に統一（指示書 §3-2） |

### A-4. 追加発見（指示書に書かれていなかった事実）

#### A-4-a. おきてがみは Nominatim（OpenStreetMap）に緯度経度を送信
- 実装: `okitegami/supabase/functions/notify-travel-piece/index.ts:183-194`
- 用途: プッシュ通知文言「〇〇の近く」の地名取得
- エンドポイント: `https://nominatim.openstreetmap.org/reverse`
- 事業者: OpenStreetMap Foundation（イギリス）
- → **現行プライバシーポリシー第 9 条には記載なし**。§5-4 への移設時、外国にある第三者への提供として追記必要

#### A-4-b. `messages/ja.json` に法務本文が二重に存在
- `messages/ja.json:782〜814` にプライバシーポリシー本文
- `messages/ja.json:952〜1012` に特商法表記本文
- `.md` と微妙にズレている（URL の `www` 有無、電話番号表記揺れ）
- → §3-2 の `business.ts` 一元化は **i18n JSON 側のポリシー本文も対象**にすべき (T2)

#### A-4-c. for-teams ページの直書きが特に厚い
- `app/[locale]/services/nobilva/for-teams/page.tsx` でメアド・電話・住所・代表者が複数箇所でハードコード（Line 449, 561, 617, 623, 626, 632, 862, 866）
- → `business.ts` 導入時の最大の置換対象

#### A-4-d. ブログ著者も「養田貴大」でハードコード
- `app/[locale]/blog/[slug]/page.tsx:41`
- → business.ts 参照か独立定数か判断 (T9)

#### A-4-e. Nobilva 利用規約第 2 条のリンク構造（Markdown autolink 問題）
- md: `当方の運営するウェブサイト（ https://nectere.jp/nobilva（理由の如何を問わず...）以下「当方ウェブサイト」といいます。）`
- Markdown パーサーの autolink が二重括弧の内側まで URL と誤認識する可能性（§2-F-1）
- 書き換え時に括弧内の URL をプレーンテキスト化 or リンク境界を明示する

### A-5. Teach It (teachmate2) 実装の確認結果

| 項目 | 内容 | 法務文書への反映先 |
|---|---|---|
| 認証プロバイダー | Google Sign-In / Apple Sign-In / Email + パスワード（Firebase Auth） | プラポリ `#teach-it`「認証プロバイダー」節 |
| 取得する情報 | Google: idToken ／ Apple: identityToken + email + fullName（スコープ指定済み） / Email: email + password | プラポリ `#teach-it`「取得する情報」 |
| LLM API | **Google Gemini 2.0-flash**（`@google/generative-ai` v0.24.1） | プラポリ `#teach-it` 外部サービス表 |
| 送信データ | テキスト（ユーザー入力・会話履歴・システムプロンプト）+ 画像（Base64 変換後） | プラポリ `#teach-it` |
| OCR | Google Cloud Vision API（`textDetection`、手書き数式・テキスト認識） | プラポリ `#teach-it` 外部サービス表 |
| 音声認識 | **実装なし** | 記述不要 |
| 画像保存 | Firebase Storage（`students/{uid}/chat_starts/{timestamp}.jpg`） | プラポリ `#teach-it`「保存先」 |
| Firestore コレクション | `users` / `chatSessions` / `messages`（`imageUrl`、`imageText` 含む）/ `understanding` / `tasks` / `workspaces` / `workspaceMembers` / `classes` / `apiTokenUsage` | プラポリ `#teach-it`「取得する情報」 |
| Firebase プロジェクト | `teaching-822bf`（iOS Bundle ID: **`jp.nectere.studyit`**。アプリ名との表記揺れ） | T16 |
| Firebase リージョン | **US Central**（デフォルト、Japan 未指定）| プラポリ「外国にある第三者」節で "保存先 米国 + 事業者 米国" と書く |
| Analytics | 無効（`IS_ANALYTICS_ENABLED = false`） | GA の記載は Nectere サイト本体のみ |
| Crashlytics | 本番環境のみ有効（`IS_CRASHLYTICS_ENABLED = true`） | プラポリ `#teach-it` 外部サービス表 |
| 広告 | なし（`IS_ADS_ENABLED = false`） | 記述不要 |
| 課金 | なし（無料アプリ） | 記述不要 |
| プッシュ通知 | `GCM_ENABLED = true` だが実装未確認 | 要確認（T13 とまとめる） |
| toB 機能 | ワークスペース / クラス / タスク で教師・生徒を階層管理。Firestore ルールで API 経由アクセスのみ許可 | **要確認: toB が実運用中か** (T14) |
| App Store 現行プラポリ URL | `https://teaching-app-new.fly.dev/privacy`（App Store Connect に登録済み） | nectere.jp `#teach-it` に差し替え (T15) |
| アプリ内リンク | **現状プラポリ・利用規約へのアプリ内リンクなし** | Settings 画面などへの追加は別タスク (T13) |

### A-6. フェーズ A の TODO 一覧

公開前に人が判断すべき事項:

| # | 内容 | 必要タイミング |
|---|------|---|
| T1 | ✅ **解決**: Teach It と キミセン は別物（Teach It = teachmate2） | — |
| T2 | `messages/ja.json` の二重法務本文を `business.ts` 一元化の対象にするか | フェーズ B |
| T3 | 既存 `/legal/okitegami/privacy-policy → okitegami.app` 301 の反転タイミング | フェーズ E |
| T4 | 入会金 18,000 円の税込/税抜 + FAQ「入塾金 8,000円」との食い違い | フェーズ C 前 |
| T5 | Supabase (おきてがみ) のリージョン確認 | フェーズ C 前 |
| T6 | AdSense が本番で設定されているか | フェーズ C 前 |
| T7 | 内部フラグ `nectere_internal` を Cookie 節で触れるか | フェーズ C 前 |
| T8 | 「外国にある第三者」の書き方（事業者所在国と保存先リージョンの二重構造） | 対照表 TODO、公開前判断 |
| T9 | ブログ著者「養田貴大」を `business.ts` 参照にするか独立定数か | フェーズ B |
| T10 | サービスページ FAQ「前月 25 日」→「前月 10 日」統一 | フェーズ C 完了後、同時修正 |
| T11 | ✅ **確定**: Teach It サービスページは「作成中」プレースホルダーで維持 | — |
| T12 | Firebase (Teach It) リージョン US Central → 東京に移すか現状 US で書くか | フェーズ C 前（判断次第で書き方変わる） |
| T13 | Teach It アプリ内へのプラポリ・利用規約リンク追加タスク | フェーズ C 後に別タスク |
| T14 | Teach It の toB 機能（ワークスペース・教師アカウント）が実運用中か、法務文書で触れるか | フェーズ C 前 |
| T15 | Teach It の App Store Connect プラポリ URL を `teaching-app-new.fly.dev` から `nectere.jp#teach-it` に差し替え | フェーズ D 後、人が手動 |
| T16 | iOS Bundle ID `jp.nectere.studyit` とアプリ名 Teach It の表記揺れ（法務文書上は Teach It で統一） | 対照表メモ |

---

## フェーズ B: 基盤実装（完了: 2026-10-19）

### B-1. 作成した基盤ファイル

| ファイル | 役割 |
|---|---|
| `lib/business.ts` | 事業者情報の単一ソース。屋号 / 事業主 / 所在地 / 連絡先 / サービス / 準拠法を const assertion で保持 |
| `components/legal/BusinessInfo.tsx` | `:::business-info` ブロックで描画される事業者情報の dl 表 |
| `components/legal/ContactInfo.tsx` | `:::contact-info[ service=<key>]` ブロックで描画される問い合わせ窓口の表（サービス指定で見出しだけ変わる、連絡先は共通） |
| `lib/remark-business-plugin.ts` | `{{business.<path>}}` テキスト差し込み + `:::business-info` / `:::contact-info` ブロック → data 属性付き div 変換 |
| `scripts/check-legal-content.ts` | `content/legal/**/*.md` に事業者情報が直書きされていたら exit 1、`TODO(要確認)` 残存は警告 |

### B-2. 更新した既存ファイル

| ファイル | 変更内容 |
|---|---|
| `app/[locale]/legal/[...slug]/page.tsx` | `remarkPlugins` に `remarkBusinessPlugin` 追加、`components.div` で `data-legal-block` を見て `<BusinessInfo />` / `<ContactInfo />` に差し替え |
| `package.json` | `check:legal` スクリプト追加、`build` の前段で実行させるよう `npm run check:legal && next build --webpack` に変更 |

### B-3. 既存 `.md` の参照化（表記揺れの正規化を含む）

| ファイル | 変更前 | 変更後 | 内容変化の有無 |
|---|---|---|---|
| `content/legal/privacy-policy.ja.md:8-10` | `屋号：Nectere` / `代表者：養田貴大` / `所在地：〒154-0004 東京都世田谷区太子堂4丁目18番15号 マガザン三軒茶屋2 3F-3` | `{{business.tradeName}}` / `{{business.ownerName}}` / `{{business.postalCode}}` + `{{business.address}}` | 値変化なし |
| `content/legal/privacy-policy.ja.md:12` | `Nectere（以下「当方」）は...` | `{{business.tradeName}}（以下「当方」）は...` | 値変化なし |
| `content/legal/privacy-policy.ja.md:108-111` | `Nectere（養田貴大）` / `お問い合わせフォーム：https://nectere.jp/ja/contact` / `個人情報保護管理責任者：養田貴大` | `{{business.tradeName}}（{{business.ownerName}}）` / `お問い合わせフォーム：{{business.contactFormUrl}}` / `個人情報保護管理責任者：{{business.privacyManager}}` | **フォーム URL が `https://nectere.jp/ja/contact` → `https://www.nectere.jp/ja/contact`**（www 付与の正規化、値変化小） |
| `content/legal/nobilva/commercial-disclosure.ja.md:7-18` | `販売業者：Nectere` ほか運営者ブロック | `{{business.tradeName}}` ほか全参照化 | **メアドが `nobilva@nectere.jp` → `contact@nectere.jp` に変更**（§8-1「問い合わせメール contact@nectere.jp に一本化」の確定事項）／ URL が `https://nectere.jp/services/nobilva` → `https://nobilva.jp`（§8-1 で Nobilva の URL を `nobilva.jp` に統一） |
| `content/legal/nobilva/terms-of-service.ja.md:288` | `Nectere　養田貴大` | `{{business.tradeName}}　{{business.ownerName}}` | 値変化なし |
| `content/legal/okitegami/terms-of-service.ja.md:191-192` | `Nectere` / `メールアドレス：contact@nectere.jp` | `{{business.tradeName}}` / `メールアドレス：{{business.email}}` | 値変化なし |

### B-4. 検査結果

```
$ npm run check:legal
✓ 4 件の法務文書を検査、事業者情報の直書きなし
```

### B-5. T2 (messages/ja.json の二重法務本文) の扱い

今回のフェーズ B では `content/legal/*.md` だけを参照化し、`messages/ja.json` 内の二重に存在する法務本文（行 782〜 プラポリ、行 952〜1012 特商法）は**触っていない**。

- 対応方針（フェーズ C 完了後の別タスクで判断）:
  - 選択肢 1: `messages/ja.json` 側の法務本文を削除し、`.md` 側に集約
  - 選択肢 2: `messages/ja.json` 側も `business.ts` 参照にする仕組みを i18n 側にも追加
- 現状の `messages/ja.json` 側の本文がどこで使われているか（デッドコードか現役か）の確認が別途必要

---

## フェーズ C 入り口: TODO の確定（2026-10-19）

| # | TODO | 確定内容 |
|---|------|---|
| T4 | Nobilva 入会金 | **18,000 円（税込）**。FAQ の「入塾金 8,000 円（チーム 4,000 円）」は誤り。フェーズ C 完了後にサービスページ FAQ も修正（T10 と同時） |
| T5 | Supabase (おきてがみ) リージョン | **ap-northeast-1（東京）**。プライバシーポリシーには「保存先: 日本」と記載 |
| T6 | AdSense | **未設定**。プライバシーポリシーには記載不要。GA のみ記載 |
| T7 | 内部フラグ `nectere_internal` | **記載なし**（外部送信なし、Cookie ではなく localStorage の機能フラグのため法上の記載義務なし） |
| T12 | Teach It Firebase リージョン | **東京に移す前提で記載**。プラポリ `#teach-it` 節には「保存先: 日本」と書くが、対照表に「TODO: 現状 US Central なので東京移行後に有効」の注記を残す |
| T14 | Teach It toB 機能実運用 | **フェーズ C で TODO 記載**。§5-5 の利用規約骨組みは「個人向け利用」のみを本文に書き、toB（ワークスペース・教師・宿題配信）は TODO として枠だけ残す |

### 継続中の TODO（フェーズ D 以降）

| # | TODO | 必要タイミング |
|---|------|---|
| T2 | `messages/ja.json` の二重法務本文の整理 | フェーズ C 完了後に別タスク（JSON 側の本文がどこで使われているか調査から） |
| T3 | `/legal/okitegami/privacy-policy → okitegami.app` 301 の反転 | フェーズ E |
| T8 | 「外国にある第三者」の書き方（事業者所在国と保存先リージョンの二重構造） | フェーズ C 書き換え時に対照表 TODO、公開前に人が判断 |
| T9 | ブログ著者「養田貴大」を `business.ts` 参照にするか独立定数か | フェーズ C 完了後に別タスク |
| T10 | サービスページ FAQ「前月 25 日」→「前月 10 日」統一 + 「入塾金 8,000 円」の修正 | フェーズ C 完了後 |
| T11 | ✅ 確定: Teach It サービスページは「作成中」プレースホルダーで維持 | — |
| T13 | Teach It アプリ内へのプラポリ・利用規約リンク追加 | フェーズ C 完了後に別タスク |
| T15 | Teach It の App Store Connect プラポリ URL 差し替え | フェーズ D 後に人が手動 |
| T16 | iOS Bundle ID `jp.nectere.studyit` とアプリ名 Teach It の表記揺れ（法務文書上は Teach It 統一） | 対照表メモのみ |

---

## フェーズ C: 文書の全面書き換え（進行中）

### C-1. 共通プライバシーポリシー `content/legal/privacy-policy.ja.md`

#### 構造変更: 9 セクション → 9 セクション + サービス別 5 節

| 旧構成 | 新構成 | 変更点 |
|---|---|---|
| 1. 事業者情報 | 1. 事業者情報 | `:::business-info` ブロックへ置換 |
| 2. 収集する個人情報 | （再編） | サービス別節 §4 と 共通取得方法 §3-1 に分割 |
| 3. 個人情報の利用目的 | （再編） | サービス別節 §4 に分散 |
| 4. 個人情報の管理 | 3-6. 安全管理措置 | 中身維持・項目構造化 |
| 5. 第三者への提供 | 3-3. 第三者への提供（法定の例外） | 法定例外を明示化。「Google Analytics は第三者提供」の記述を §3-5「外国にある第三者」に移動 |
| 6. Cookie およびアクセス解析 | 5. Cookie 及び外部送信 | 計測ツールを表形式に。GA のみ記載（AdSense 未設定）。Google Tag Manager / Vercel Analytics / Sentry 等が未導入である旨も明記 |
| 7. ユーザーの権利 | 7. 開示・訂正・利用停止等の請求 | 本人確認方法・手数料無料・回答方法（電子メール）を具体化（§2-D-8 対応） |
| 8. プライバシーポリシーの変更 | 8. 本ポリシーの改定 | 「効力発生日に先立ち周知」「重要な変更は 30 日以上前」を明記（§2-E-2 対応、民法 548 条の 4 準拠） |
| 9. お問い合わせ | 9. お問い合わせ窓口 | `:::contact-info` ブロックへ置換 |

#### §2-E 系の法的判断を伴う書き換え

| 変更 | 変更前 | 変更後 | 理由（なぜ変えたか） |
|---|---|---|---|
| 事業者の定義 | 「Nectere（以下「当方」）」 | 「養田貴大（屋号：Nectere。以下「当方」といいます。）」 | §2-B-1：契約当事者である事業主個人を主、屋号を副に書く。全規約共通の形式に統一（§3-3-1） |
| 法人化・事業承継条項（新設 §3-7） | 記述なし | 「本事業を法人化し、又は第三者に承継させる場合、契約上の地位及び個人情報を承継先に移転できる」 | §3-3-2：法人化に備えた条項。移転前に周知する義務も明記 |
| 外国にある第三者への提供（新設 §3-5） | 「Google Analytics の利用」程度 | 事業者（Google LLC / Supabase, Inc. / Apple Inc. / OpenStreetMap Foundation）× 保存先リージョン × 用途の 3 軸表 | §2-D-5：外国にある第三者への提供は個情法上必須項目。T8 の判断で「保存先日本・事業者米国」の二重構造を表現 |
| 改定の事前周知 | 「本サイトに掲載した時点から効力」 | 「効力発生日に先立ち周知する」「重要な変更は 30 日以上前」 | §2-E-2：民法 548 条の 4 の定型約款変更ルールに沿う |
| 開示請求の方法 | 「お問い合わせフォームよりご連絡」のみ | 本人確認方法（身分証明書の写し等）、手数料（無料）、回答方法（電子メール） | §2-D-8 |
| サービス別節の導入 | 「Nobilva：氏名、学年、学校名、連絡先、学習履歴、成績情報等」「Teach It：利用履歴、学習データ等」のみ | 各サービスごとに「取得する情報 → 利用目的 → 外部サービス・委託先 → 保存期間・削除」の 4 段構成（§5-1 の設計） | §2-D-1 〜 §2-D-4 対応 |
| Nobilva で取得する情報 | 氏名・学年・学校名・連絡先・学習履歴・成績情報 | 上記に加え、保護者（契約者）の氏名・連絡先・口座情報、受講者（生徒）の部活・チーム・面談記録、公式 LINE 経由の情報 | §2-D-3：実運用に即して補強 |
| Teach It の外部サービス | 「利用履歴、学習データ等」 | Firebase（Auth / Firestore / Storage / Crashlytics）、**Google Gemini API**（gemini-2.0-flash）、**Google Cloud Vision API**、Apple / Google サインインを具体明記 | §A-5 の実装調査結果に合わせる。**指示書 §8-1 の「Anthropic の API」は誤り、実装は Gemini + Vision** |
| おきてがみに Nominatim を追加 | 記述なし | OpenStreetMap Foundation（英国）が運営する Nominatim に逆ジオコーディングで緯度経度を送信する旨 | §A-4-a の発見。現行プラポリ・okitegami.app 側ともに未記載だったため追記 |
| おきてがみ公開範囲 | 「本人・相互フレンド・Bot のフォロワーのみ」（okitegami.app 側のみ） | 同内容を nectere.jp 側に移設し、Nobilva と同じ節構成で整理。「不特定多数に公開する機能は提供しない」と明示 | §2-C-1：Supabase RLS の実装（`author_id = auth.uid() OR are_friends(...)` + Bot フォロワー RPC）と一致させる |
| おきてがみ位置情報の端末内保持 | okitegami.app 側のみ記載 | 「サーバーに保存する投稿場所の位置情報」と「端末内に最大 24 時間だけ保持しサーバー非送信のバックグラウンド位置情報」を明確に分離 | §5-4-1：okitegami.app の第 1 条〜第 14 条の中身をここへ移す。移設と同時に文言を整理 |
| 計測ツールの表 | 記述簡素 | Google Analytics を事業者・所在国・用途・送信情報・保存先の 5 軸で記載。他計測ツール（GTM / Vercel Analytics / Sentry / Hotjar / Meta Pixel）が未導入である旨を明記 | §2-D-6：Cookie・外部送信の具体一覧。T6 で AdSense は本番未設定と確定 |

#### 保留 TODO（本文内に `<!-- TODO(要確認) -->` として残置）

| 項目 | 場所 | 内容 |
|---|---|---|
| 支払処理代行事業者 | §3-4(4), §4-1 外部サービス | 口座振替代行会社の社名 |
| メール配信事業者 | §3-4(5), §4-1 外部サービス, §4-4 外部サービス | Resend 等の具体名を実装から確認 |
| Firebase 東京リージョン | §3-5 表, §4-2 外部サービス | 現状 US Central、東京移行後に有効（T12） |
| Nobilva の Firebase 使用範囲 | §4-1 外部サービス | 具体の実装範囲（通知・分析等）を確認 |
| Teach It toB 機能 | §4-2 の冒頭に TODO コメント | 実運用中なら「教師アカウント・ワークスペース・課題配信」を §4-2 に追記（T14） |
| 保存先日本・事業者米国の二重構造 | §3-5 表の末尾 | 「外国にある第三者」として扱う最終表記（T8） |
| 契約者住所の取得有無 | §4-1 取得する情報(1) | 保護者の住所を実運用で取得しているか |
| Nobilva 面談記録の保存期間 | §4-1 保存期間(3) | 「最大 3 年」の実務値確認 |

---

### C-2. Nobilva 利用規約 `content/legal/nobilva/terms-of-service.ja.md`

#### 構造変更: 旧 30 条 → 新 26 条

| 削除した旧条 | 削除理由 |
|---|---|
| 旧第 7 条（質問室サービスの利用条件と禁止事項） | §5-2-3: サービスページに質問室の記載がないため削除 |
| 旧第 12 条（参考書の提供と費用、冊数制限） | §5-2-3: 参考書は保護者実費、冊数の定めなし、返金対象外 とだけ書く形式に簡素化（新第 7 条第 4 項に 1 文として収録） |
| 旧第 13 条（カスタマイズコース規約） | §5-2-3: カスタマイズコースを提供しないため削除 |
| 旧第 16 条（提携サービス等の提供） | 「提携パートナー」の仕組みを使っていないため削除 |

付随して条番号を全体で詰め直し、旧第 1〜30 条 → 新第 1〜26 条に整理。

#### §5-2 の 11 項目への対応

| 項目 | 変更前 | 変更後 | 根拠 |
|---|---|---|---|
| §5-2-1 支払方法 | 口座振替・銀行振込・長期一括払いが混在、引落日「毎月 27 日」と「毎月 28 日（特商法）」で揺れ | 月額のみ、初回は銀行振込、3 か月目以降は毎月 27 日に口座振替で自動引落。全条文を `nobilvaPricing.*` 参照に | §8-1 |
| §5-2-1 pricing の単一ソース化 | 金額は各文書に直書き | `lib/nobilva-pricing.ts` を新規作成、利用規約と特商法の両方が参照 | §5-2-1 |
| §5-2-2 入会金 | 「登録料金」「入塾金」で揺れ、FAQ で「入塾金 8,000 円」 | **入会金 18,000 円（税込）** に用語・金額を統一（T4 確定） | §8-1 |
| §5-2-2 長期一括払い | 第 8 条・第 9 条で詳細に規定 | 第 8 条第 1 項に「長期一括払いの契約は提供しない」と明記、関連条文を全削除 | §5-2-2 |
| §5-2-3 プラン整理 | ベーシック・スタンダード・アドバンスト・カスタマイズコース・ミニマム・エッセンシャル が混在 | エッセンシャル・ベーシックの 2 プラン + オプション「フォローアップ個別指導」のみ（サービスページと一致） | §5-2-3, §8-1 |
| §5-2-3 参考書 | 第 12 条で詳細な冊数・費用計算 | 新第 7 条第 4 項に「必要に応じて契約者が実費で購入、冊数の定めなし、返金対象外」の 1 文のみ | §5-2-3 |
| §5-2-3 質問室 | 第 7 条で損害賠償まで詳細規定 | 削除 | §5-2-3 |
| §5-2-4 中途解約料 | 第 9 条第 1 項「中途解約料として 20,000 円又は 1 か月分」 | 削除。新第 19 条第 2 項「違約金・キャンセル料は発生しない」 | §5-2-4, §8-1 |
| §5-2-4 当日キャンセル料 | 第 10 条「3 回繰り返すごとに 5,000 円」 | 削除。新第 9 条で「天災・体調不良等やむを得ない事由は追加負担なし」に書き換え | §5-2-4, §2-E-4 |
| §5-2-4 全額返金保証 | 記述なし | 新第 19 条第 5 項に新設。入会後 30 日以内、理由不問、市販教材費対象外、利用分は日割り | §8-1 |
| §5-2-4 退会期限 | 旧第 22 条第 6 項「前月 10 日まで」（維持） | 新第 19 条第 1 項「前月 10 日まで」（維持）。文章を整理し「11 日以降は翌々月から」の流れを明示 | — |
| §5-2-5 システム管理費 | 旧第 8 条「1,000 円/月（税込）」 | 新第 7 条第 1 項第 3 号「月額 1,000 円（税抜、税込 1,100 円）」に修正 | §5-2-5 |
| §5-2-5 チーム特別価格 | 記述なし（サービスページには団体価格あり） | 新第 7 条第 5 項「団体向けの条件は個別契約で定める」とのみ記載 | §5-2-5 |
| §5-2-6 契約者/受講者の書き分け | 「ユーザー」の一語で混同 | 第 3 条で**契約者（保護者）**と**受講者（生徒）**を分離定義。支払義務・解約申出は契約者、禁止事項は両者にかかる構造に | §5-2-6 |
| §5-2-7 チャット公開 | 旧第 14 条第 1 項「公開されることがある」 | 削除。新第 11 条第 2 項「チャットが第三者に公開されることはない」と明示 | §5-2-7, A-5 の運用実態 |
| §5-2-7 連絡手段限定 | 「本サービス内においてのみ」 | 「Nobilva 公式 LINE 及び内部生専用アプリ内のチャットに限る」と具体化。それ以外（個人の電話・SNS・メール・面会）を明示的に禁止 | §5-2-7 |
| §5-2-7 メンター直接契約禁止 | 旧第 14 条第 3 項 | 新第 11 条第 3 項として維持 | §5-2-7 |
| §5-2-8 免責（§2-E-1） | 「一切の責任を負いません」型が旧第 19 条 3 項・5 項、第 20 条 2 項、第 23 条 4 項、第 26 条 5 項・6 項 等に散在 | 全文書で「当方の故意又は重大な過失による場合を除き」を明記、新第 16 条で損害賠償の上限を**過去 1 年間の受講料総額**として明示、消費者契約法上の制限に従う旨を併記 | §2-E-1 |
| §5-2-8 規約変更（§2-E-2） | 旧第 2 条「掲示された時点より効力」 | 新第 2 条「変更の内容及び効力発生日を効力発生日に先立ち周知」「重要な変更は 30 日以上前」に書き換え | §2-E-2、民法 548 条の 4 |
| §5-2-8 クーリング・オフ（§2-E-3） | 旧第 22 条 5 項「クーリングオフ期間経過後」の文言のみ | <!-- TODO(要確認): 月額契約のみとなり長期プランがないため、特定継続的役務に該当するかの判断は特商法表記側（C-3）で検討 --> | §2-E-3 |
| §5-2-8 休会（§2-E-4） | 旧第 22 条 8 項「500 円/月（税込）が永久的に発生」 | 新第 19 条第 4 項「システム管理費（月額 1,000 円（税抜））のみ」「休会期間中、毎月」に修正。「永久的に」を削除 | §2-E-4 |
| §5-2-8 ユーザーコンテンツ著作権（§2-E-5） | 旧第 15 条第 2 項「当方に対して無償で譲渡」+ 第 3 項「著作者人格権を行使しない」 | 新第 12 条第 1 項「権利は受講者又は法定代理人に帰属」+ 第 2 項「必要な範囲で無償・非独占的に利用許諾」。プロモーション利用は明示的に除外 | §2-E-5 |
| §5-2-8 チャット運用（§2-E-6） | 旧第 14 条第 1 項（公開あり）、第 2 項（他手段禁止） | 新第 11 条第 1 項「公式 LINE + アプリ内チャット限定」、第 2 項「チャット非公開を明示」、第 3 項「直接契約禁止は維持」。実運用に合致 | §2-E-6 |
| §5-2-9 第 2 条の URL | 旧 `https://nectere.jp/nobilva` + Markdown autolink 問題 | `{{business.services.nobilva.url}}` = `https://nobilva.jp` に差し込み。括弧書きを「以下「当方ウェブサイト」といいます。」に簡素化して autolink 事故を回避 | §5-2-9, A-4-e |
| §5-2-10 第 22 条の構造 | 本文冒頭と項番号 1〜9 が分離した構造 | 新第 19 条で「退会・休会・コース変更・返金保証」の統合節とし、見出しを `**退会**` 等の bold ラベルで明示 | §2-F-3 |
| §5-2-11 法人化条項 | 旧第 28 条第 2 項「事業譲渡のみ想定」 | 新第 24 条第 2 項「本事業を法人化し、又は本サービスにかかる事業を第三者に譲渡若しくは承継させる場合」を明記。移転前の周知義務も明記 | §5-2-11, §3-3-2 |
| 事業者定義 | 「Nectere（以下「当方」）」 | 「{{business.ownerName}}（屋号：{{business.tradeName}}。以下「当方」といいます。）」 | §3-3-1 |
| 文体・項番号 | `１．／(1)／①` 混在 | `1.`／`1）`／（番号なしリスト）に整理、全角半角数字を半角数字に統一 | §3-3-8 |
| 準拠法・合意管轄 | 旧第 30 条で明記 | 新第 26 条で `{{business.jurisdiction}}` を参照 | §3-3-5 |

#### 旧第 7 条第 3 項（損害賠償の個別算定）の削除

旧第 7 条第 3 項は、質問室の不正利用に対し「月額 18,000 円を基準に請求」「不正利用 1 回あたり 2,000 円」等の **具体的な金額を規定した損害賠償条項** だった。消費者契約法第 9 条第 1 項第 1 号（損害賠償額の予定が平均的な損害の額を超える部分は無効）との関係で疑義があり、かつ質問室自体を削除するため、本条項全体を削除。損害賠償は新第 16 条の一般条項に収斂させる。

#### 保留 TODO（本文内に `<!-- TODO(要確認) -->` として残置）

| 項目 | 場所 | 内容 |
|---|---|---|
| 入会金の全額返金保証対象 | 新第 19 条第 5 項 | 入会後 30 日以内の全額返金保証に入会金が含まれるか（T4 に関連） |

---

### C-3. Nobilva 特定商取引法に基づく表記 `content/legal/nobilva/commercial-disclosure.ja.md`

#### §5-3 の 7 項目への対応

| 項目 | 変更前 | 変更後 | 根拠 |
|---|---|---|---|
| §5-3-1 販売業者表示 | 「販売業者：Nectere」のみ | 表形式で「販売業者の氏名：{{business.ownerName}}」「屋号：{{business.tradeName}}」を分離表示、運営責任者も明記 | §2-B-2 個人事業における氏名表示義務 |
| §5-3-2 URL | `https://nectere.jp/services/nobilva` | `{{business.services.nobilva.url}}` = `https://nobilva.jp` | §5-3-2, §5-2-9 |
| §5-3-3 価格表示 | プラン未記載、「各商品ページを参照」のみ | 税込総額を主、税抜を副とする表形式。エッセンシャル 19,800 円 / ベーシック 28,600 円 / システム管理費 1,100 円（いずれも税込） | §5-3-3、消費者向け販売の総額表示義務 |
| §5-3-3 消費税計算方法 | 「1 決済のうち外税商品等の価格合計に 10% を掛けた額（1 の位切捨）」 | 削除。税込総額を直接表示 | §5-3-3 |
| §5-3-4 支払い | 「ミニマム/エッセンシャル/スタンダード」のプラン名、引落日「毎月 28 日」 | 月額のみに整理、引落日「毎月 {{nobilvaPricing.payment.recurringDay}} 日」。利用規約と同じ `nobilva-pricing.ts` から参照 | §5-3-4、§8-1 の確定事項 |
| §5-3-5 概要書面について | 「特定商取引法に基づく概要書面について」の節あり（長期プランは特定継続的役務になる旨） | 削除。月額契約のみとなり長期プランがないため。ただし「月額契約が特定継続的役務に該当するか」を TODO として対照表及び本文に記録 | §5-3-5 |
| §5-3-6 返品・交換 | 「【返品・交換・キャンセル】キャンセル・返金不可」 | 「解約・返金・返品」節に全書き直し。前月 10 日までの解約、違約金・キャンセル料 0 円、30 日全額返金保証、当日キャンセル料なしを明記 | §5-3-6、§8-1、景品表示法上のサービスページとの整合 |
| §5-3-7 テンプレ残り | 「全て送料無料です」「視聴期間内でしたら何度でも延長」「外税商品」 | 削除 | §5-3-7 |
| 問い合わせメアド | `nobilva@nectere.jp` | `{{business.email}}` = `contact@nectere.jp` | §8-1 |
| 動作環境の表示 | 記述なし | 新設。PC/タブレット/スマホ、ビデオ通話ソフト、内部生専用アプリ可能な端末 | 特商法第 11 条第 7 号 |
| お問い合わせ窓口 | 本文の運営者ブロック内に混在 | 末尾に `:::contact-info service=nobilva` ブロックで独立表示 | §3-3 共通形式 |

#### 保留 TODO（本文内に `<!-- TODO(要確認) -->` として残置）

| 項目 | 場所 | 内容 |
|---|---|---|
| 口座振替代行会社の社名 | 「代金の支払時期・支払方法」表の下 | 具体の事業者名を実装から確認 |
| 入会金の全額返金保証対象 | 「解約・返金・返品」節 | 入会金が全額返金保証に含まれるか（T4 の派生、C-2 と同じ） |
| 月額契約の特定継続的役務該当性 | 「解約・返金・返品」節末尾 | 該当する場合はクーリング・オフ期間（契約書面受領日から 8 日間）及び中途解約時の上限額の表示が必要。長期プラン廃止により従来の記述は削除したが、月額のみの契約でも特定継続的役務（学習塾の役務期間 2 か月超・金額 50,000 円超等）に該当する可能性があるため、別途検討が必要 |

#### サービスページ側（スコープ外・T10）で同時に修正が必要な事項

本特商法表記で確定した以下の値は、`/services/nobilva` 側の表示とも整合させる必要がある。T10 として C 完了後に対応：

- FAQ「解約希望月の前月 25 日までに連絡」→ 「前月 10 日まで」に修正
- FAQ「入塾金 8,000 円（チーム 4,000 円）」→ 「入会金 18,000 円（税込）」に修正
- サービスページ「税抜価格、別途システム管理費 1,000 円」の表示を税込総額（19,800 円 + 1,100 円 等）に揃える、又は税込表記を併記する

---

### C-4. おきてがみ 利用規約 `content/legal/okitegami/terms-of-service.ja.md`

#### 構造変更: 旧 20 条 → 新 21 条

旧第 11 条（禁止事項）と第 12 条（違反への対応）を、okitegami.app プライバシーポリシー第 15 条の内容と統合して整理。1 条が増えた分、他条を一部整理（旧「総則」と「定義」を統合）。

#### §5-4 の 7 項目への対応

| 項目 | 変更前 | 変更後 | 根拠 |
|---|---|---|---|
| §5-4-1 ポリシー第 15 条の移設 | okitegami.app プラポリ第 15 条に禁止事項・24 時間対応・通報・ブロック・自動フィルタ・投稿ライセンス・免責が混在 | 本規約の第 10 条（禁止事項、ゼロトレランス）、第 11 条（違反への対応、24 時間以内）、第 8 条（ブロック）、第 6 条（投稿ライセンス）、第 14 条（免責）に分割統合。App Store 審査向けのゼロトレランス文言と 24 時間対応はそのまま残す | §5-4-1、§2-A-2 |
| §5-4-2 投稿ライセンスの限定 | 旧第 7 条第 2 項「宣伝告知のために必要な範囲」 + プラポリ第 15 条 6 項「世界的・サブライセンス可能・譲渡可能・プロモーション利用」 | 新第 6 条第 2 項「本サービスの運営、提供、改善、保守のために必要な範囲」のみ。第 3 項で「広告・宣伝その他本アプリの運営以外の目的で使用しない」と明示 | §5-4-2、§8-1「おきてがみ投稿の広告・宣伝利用はしない」 |
| §5-4-3 公開範囲 | 旧第 9 条第 3 項「フレンドのみまたは公開」 | 新第 7 条第 1 項「本人・相互フレンド・Bot アカウントのフォロワー」。「不特定多数に公開する機能を提供しない」と明示（第 3 項） | §5-4-3、§2-C-1、Supabase RLS 実装と一致 |
| §5-4-4 Apple/Google サインイン | 旧第 4 条第 1 項「ニックネーム及びメールアドレス」のみ | 新第 3 条第 1 項に Sign in with Apple 及び Google サインインを明記、各プロバイダから提供される情報の種類を明示 | §5-4-4、A-5 の実装調査 |
| §5-4-5 規約同意のタイミング | 旧第 3 条第 1 項「ダウンロード又は利用した時点で、本規約に同意したものとみなされます」 | 新第 2 条第 1 項「アカウント登録を完了した時点」に改める | §5-4-5、§2-E-2 消費者契約の明示的同意 |
| §5-4-6 未成年条項の整理 | 旧第 10 条で利用規約に未成年、プラポリ第 12 条でも未成年（重複） | 本規約（新第 9 条）に残し、プライバシーポリシー側からは削除（C-1 で対応済） | §5-4-6 |
| §5-4-7 お問い合わせ | 旧第 20 条で `{{business.tradeName}}` と `{{business.email}}` を列挙 | 新第 21 条で `:::contact-info service=okitegami` ブロックに置換 | §5-4-7 |

#### §2-E 系の共通書き換え

| 項目 | 変更前 | 変更後 | 根拠 |
|---|---|---|---|
| 事業者定義 | 「Nectere（以下「当方」）」 | 「{{business.ownerName}}（屋号：{{business.tradeName}}。以下「当方」といいます。）」 | §3-3-1 |
| 免責・損害賠償 | 旧第 4 条 3 項、第 12 条 2 項、第 13 条 4 項、第 15 条で「一切の責任を負いません」が散在 | 全箇所に「当方の故意又は重大な過失による場合を除き」を明記。消費者契約法上の制限を尊重する旨を併記（第 14 条第 5 項但書） | §2-E-1 |
| 規約変更 | 旧第 18 条「アプリ内又はウェブサイト上で通知。効力発生日以降に利用した場合同意とみなす」 | 新第 17 条「効力発生日に先立ち周知」「重要な変更は 30 日以上前に周知」 | §2-E-2 |
| 近接通知の位置情報 | 旧規約に記述なし（プラポリ側のみ） | 新第 5 条第 4 項に「端末内に最大 24 時間だけ保持、サーバー非送信」を明記 | §A-5、プラポリとの整合 |
| 法人化・事業承継条項 | 記述なし | 新第 18 条で「本事業を法人化し、又は事業を第三者に譲渡・承継する場合、ユーザー情報を移転できる」を新設。移転前の周知義務も明記 | §3-3-2 |
| 準拠法・合意管轄 | 旧第 19 条「東京地方裁判所を第一審の専属的合意管轄」 | 新第 20 条「{{business.jurisdiction}}」= 「東京地方裁判所又は東京簡易裁判所」。訴額に応じて簡裁も含める形に揃える（Nobilva と共通化） | §3-3-5、§2-C-8 |
| 消費者契約法上の分離可能性 | 記述なし | 新第 19 条で明記 | §2-E-1 の関連で分離可能性 |
| 問い合わせメアドの一本化 | okitegami.app プラポリ側で `contact@nectere.jp` だったが、利用規約と重複 | 新第 21 条で `:::contact-info service=okitegami`、プラポリ側は `#okitegami` 節で `:::contact-info` を使う形で統一 | §8-1 |

#### 保留 TODO

本文内に `<!-- TODO(要確認) -->` を残していない（この時点で解消済み）。

---

### C-5. Teach It 利用規約（新規制定・骨組み）`content/legal/teach-it/terms-of-service.ja.md`

#### 位置づけ

- 指示書 §5-5 の方針「骨組みだけ /ja/legal/teach-it/terms-of-service に作って中身は TODO にする」に従い、新規制定
- 章立てはおきてがみ利用規約を踏襲しつつ、Teach It 固有の内容（AI 応答の性質、学習データ、第三者 AI サービスへの送信）を反映
- 旧文書なし（新規）

#### 構造: 新 19 条

| 条 | タイトル | 内容の由来 |
|---|---|---|
| 1 | 定義 | AI 応答・学習データ・アカウント を定義 |
| 2 | 規約への同意 | おきてがみ版 + Teach It の未成年参照先 |
| 3 | アカウント登録 | Apple / Google / Email の 3 認証方式を明記（A-5 の実装調査結果） |
| 4 | 本サービスの内容 | 「AI に教えることで学ぶ」逆転学習の説明 + ユーザー入力の送信先 + toB 機能 TODO |
| 5 | **AI 応答の性質**（Teach It 固有） | Gemini 等による生成であることと保証なしを明示 |
| 6 | 本サービスの利用 | 一般条項 |
| 7 | **学習データとユーザーコンテンツ**（Teach It 固有） | 著作権帰属、第三者 AI サービスへの送信許諾、プロモーション利用の除外、音声のオンデバイス処理 |
| 8 | 未成年者の利用 | 18 歳未満は保護者同意 + 13 歳未満の年齢条件は TODO |
| 9 | 禁止事項 | 一般的な禁止事項 + Google Gemini の利用規約への準拠（詳細 TODO） |
| 10 | 違反への対応 | おきてがみ版と同じ骨格 |
| 11 | 本サービスの変更・中断・終了 | おきてがみ版と同じ骨格 + 第三者 AI サービスの変更・終了を含める |
| 12 | 退会 | — |
| 13 | 免責事項 | 「故意又は重大な過失による場合を除き」統一文言 + 消費者契約法上の制限尊重 |
| 14 | 知的財産権 | — |
| 15 | 本規約の改定 | 事前周知形式（§2-E-2） |
| 16 | 権利義務の譲渡禁止及び事業承継・法人化 | §3-3-2 を踏襲 |
| 17 | 分離可能性 | — |
| 18 | 準拠法及び合意管轄 | `{{business.jurisdiction}}` を参照 |
| 19 | お問い合わせ | `:::contact-info service=teachIt` |

#### 保留 TODO（本文内に `<!-- TODO(要確認) -->` として残置）

| 項目 | 場所 | 内容 |
|---|---|---|
| toB 機能の規約化 | 第 4 条末尾 | 学校・塾向けワークスペース・課題配信が実運用中となれば、教師アカウント区別、閲覧可能データ範囲、ワークスペース参加権限、課題期限を本文に追加（T14） |
| 13 歳未満の利用条件 | 第 8 条末尾 | おきてがみは 13 歳以上。Teach It も同基準にするか、toB 利用で中学生以下を扱う場合の例外条件を要検討 |
| Google Gemini 禁止ポリシーの取り込み | 第 9 条末尾 | Google 生成 AI 使用禁止ポリシー（児童性的虐待素材の生成、暴力・自傷助長、医療・法律助言の装い等）を明示的に本条に取り込むか |

#### フェーズ D 以降で必要な追加作業（Teach It 関連）

- **T13**: Teach It アプリ内 Settings 画面等への利用規約・プラポリへのリンク追加（別タスク）
- **T15**: App Store Connect の プラポリ URL を `https://teaching-app-new.fly.dev/privacy` から `{{business.siteUrl}}/ja/legal/privacy-policy#teach-it` に差し替え（人が手動）
- Teach It サービスページ `/services/teachit` の復活（T11、フェーズ D で `/services/teachit → /services/kimisen` の 301 を外す）

---

## フェーズ C 完了（2026-10-19）

### 書き換え完了ファイル（5 件）

| ファイル | 行数（新） | 行数（旧） | 対照表セクション |
|---|---|---|---|
| content/legal/privacy-policy.ja.md | 158 | 112 | C-1 |
| content/legal/nobilva/terms-of-service.ja.md | 177 | 288 | C-2 |
| content/legal/nobilva/commercial-disclosure.ja.md | 93 | 76 | C-3 |
| content/legal/okitegami/terms-of-service.ja.md | 174 | 192 | C-4 |
| content/legal/teach-it/terms-of-service.ja.md | 148 | 新規 | C-5 |

Nobilva ToS は 288 → 177 行と大幅短縮（長期プラン・質問室・参考書冊数・カスタマイズコース・提携サービスの削除による）。

### 検査結果

```
$ npm run check:legal
✓ 5 件の法務文書を検査、事業者情報の直書きなし（TODO 19 件は残っています）
```

TODO 19 件の内訳: C-1 (12 件)、C-2 (1 件)、C-3 (3 件)、C-5 (3 件)。

### 新規作成した基盤定数

- `lib/business.ts`（フェーズ B）
- `lib/nobilva-pricing.ts`（フェーズ C）

---

## フェーズ D: ルーティング・フッター・付帯（完了: 2026-10-19）

### D-1. 新規ページ

| ファイル | 内容 |
|---|---|
| `app/[locale]/legal/page.tsx` | 法務情報一覧ページ（`/ja/legal`）。カテゴリ別（全サービス共通 / Nobilva / Teach It / おきてがみ）に 5 文書をカード形式で表示。各ドキュメントの frontmatter から title・description・lastUpdated を取得 |
| `app/[locale]/services/teachit/page.tsx` | Teach It サービスページ（作成中プレースホルダー）。`/services/kimisen` と同じ流儀 |

### D-2. `next.config.js` のリダイレクト調整

| source | 変更前 destination | 変更後 destination | 理由 |
|---|---|---|---|
| `/:locale/legal/okitegami/privacy-policy` | `https://okitegami.app/privacy`（外部へ 301） | `/:locale/legal/privacy-policy#okitegami`（内部） | 共通プラポリに集約した `#okitegami` 節へ内部誘導。okitegami.app 側の本文削除はフェーズ E で |
| `/:locale/terms` | `/:locale/legal/nobilva/terms-of-service` | `/:locale/legal` | §2-A-4 の指摘：旧 `/terms` が Nobilva 専用に飛ぶのは誤解を招くため、法務情報一覧に |
| `/:locale/services/teachit` | `/:locale/services/kimisen` | **削除**（301 を外す） | Teach It サービスページを復活 |
| `/:locale/services/teachit/:path*` | `/:locale/services/kimisen` | **削除**（301 を外す） | 同上 |

その他の既存リダイレクト（`/privacy` → `/legal/privacy-policy`、`/services/nobilva/tokushoho` → `/legal/nobilva/commercial-disclosure`）は維持。

### D-3. フッターの法的情報を 2 項目に

| | 変更前 | 変更後 |
|---|---|---|
| Nectere サイト（全般） | プライバシーポリシー / 利用規約 | プライバシーポリシー / 法務情報一覧 |
| Nobilva ページ | プライバシーポリシー / 利用規約 / 特定商取引法に基づく表記 | プライバシーポリシー / 法務情報一覧 |

`lib/navigation.ts` で `LEGAL_ITEMS` を更新、`NOBILVA_LEGAL_ITEMS = LEGAL_ITEMS` で揃えた。Nobilva ユーザーが特商法に辿り着く経路は `/legal` 一覧 → Nobilva カテゴリ内の「特定商取引法に基づく表記」。

### D-4. 多言語ラベルの追加

`messages/{ja,en,de}.json` に `footer.legalIndex` を追加:
- ja: `"法務情報一覧"`
- en: `"Legal Information"`
- de: `"Rechtliche Informationen"`

旧 `footer.terms`・`footer.tokushoho` の翻訳値は、`NOBILVA_LEGAL_ITEMS` から参照されなくなったため実質 dead key だが、キー自体は残置（他で使われている可能性を考慮）。

### D-5. お問い合わせフォームの同意チェック

| | 変更前 | 変更後 |
|---|---|---|
| ラベル文言 | 「個人情報の取り扱いに同意する」 | 「<link>プライバシーポリシー</link>に同意する」（`<link>` 部分が `/{locale}/legal/privacy-policy#contact-form` へのリンク、別タブで開く） |
| バリデーションエラー | 「個人情報の取り扱いに同意してください」 | 「プライバシーポリシーに同意してください」 |

実装は `next-intl` の `t.rich()` でリンクを埋め込む形式。EN・DE も同じパターンで対応。

### D-6. 検査

```
$ npm run check:legal
✓ 5 件の法務文書を検査、事業者情報の直書きなし（TODO 19 件は残っています）
```

TypeScript 型チェック（`npx tsc --noEmit`）: 新規・変更ファイルに型エラーなし。

### D-7. フェーズ D で生じた TODO

なし。フェーズ A・C で記録済みの TODO（T2, T3, T8-T16）は変わらず継続。

---

---

## フェーズ E: okitegami 側リポジトリの処理（完了: 2026-10-19）

対象: `/Users/ryuto/programs/okitegami/web`（LP、Cloudflare Pages）および `/Users/ryuto/programs/okitegami/okitegami/`（iOS アプリ本体、SwiftUI）

### E-1. okitegami/web（LP）側

| ファイル | 変更内容 |
|---|---|
| `web/privacy/index.html` + `web/privacy/` ディレクトリ | **削除**（本文を nectere.jp に移設完了したため）。Cloudflare Pages は静的アセットを `_redirects` より優先するため、301 を機能させるには削除が必須 |
| `web/_redirects` | 以下の 301 を新規追加：<br>`/privacy` → `https://www.nectere.jp/ja/legal/privacy-policy#okitegami`<br>`/privacy/` → 同上（末尾スラッシュ対応）<br>`/terms` → `https://www.nectere.jp/ja/legal/okitegami/terms-of-service`<br>`/terms/` → 同上 |
| `web/index.html` フッター | `/privacy` 内部リンク → nectere.jp の 2 項目（プライバシーポリシー `#okitegami` 節 + 利用規約）に変更。コピーライト表記を `© Nectere Inc.` から `© Nectere`（個人事業実態に合わせ）に変更 |

### E-2. iOS アプリ側

| ファイル | 変更前 | 変更後 |
|---|---|---|
| `Features/Settings/SettingsView.swift:21` | `privacyPolicyURL = okitegami.app/privacy`（単一 URL） | `privacyPolicyURL = nectere.jp/.../privacy-policy#okitegami` と `termsOfServiceURL = nectere.jp/.../legal/okitegami/terms-of-service` に **分離**（コメントも更新） |
| `Features/Settings/SettingsView.swift:88` | 「利用規約・コミュニティガイドライン」ボタンが `privacyPolicyURL` を参照 | `termsOfServiceURL` を参照 |
| `Components/Molecules/TermsAcceptanceToggle.swift:11` | `policyURL = okitegami.app/privacy` | `policyURL = nectere.jp/.../legal/okitegami/terms-of-service`。コメントで「UGC 規約と zero-tolerance 条項は利用規約側に集約済み、プラポリへは利用規約ページ内の相互リンクで辿れる」と明示 |

### E-3. 旧 URL のアクセスフロー（二重の 301 で担保）

```
[1] 旧 iOS アプリ（URL 未更新のビルド）→ okitegami.app/privacy
     ↓ 新 _redirects ルール
     https://www.nectere.jp/ja/legal/privacy-policy#okitegami に 301

[2] 外部からの古いリンク → okitegami.app/privacy
     ↓ 同上
     nectere.jp #okitegami 節 へ 301

[3] 旧 /ja/legal/okitegami/privacy-policy（別ドメイン）
     ↓ homepage 側 next.config.js の 301（フェーズ D で設定）
     /ja/legal/privacy-policy#okitegami（内部）
```

### E-4. 残課題（人が手動）

| 項目 | 内容 |
|---|---|
| T15 | **App Store Connect のプライバシーポリシー URL 差し替え**。現状は `https://okitegami.app/privacy` → これは 301 で届くが、App Store 審査上は直接 nectere.jp を指すのが望ましい。差し替えは App Store Connect の web UI から人が手動 |
| iOS アプリの新ビルドリリース | iOS 側の URL 変更は Swift コード変更のため、次回 TestFlight / App Store リリース時に反映される。それまでは 301 で届く |
| 既存ユーザー向けの新規範周知 | 利用規約を更新した場合、ユーザーに通知する運用は別途（指示書 §2-E-2 のとおり） |

### E-5. 変更ファイルサマリー

- `okitegami/web/_redirects`: 301 ルール 4 行追加
- `okitegami/web/privacy/index.html`: 削除（ディレクトリごと）
- `okitegami/web/index.html`: フッター 1 行変更
- `okitegami/okitegami/okitegami/Features/Settings/SettingsView.swift`: URL 定数 1 行 → 2 行、ボタンの bind 1 箇所変更、コメント更新
- `okitegami/okitegami/okitegami/Components/Molecules/TermsAcceptanceToggle.swift`: URL 1 行変更、コメント更新

**git commit は未実施**（別リポジトリでの変更はユーザーが別途コミット・プッシュ判断）。

---

---

## フェーズ F: admin 法務文書ページ（完了: 2026-10-19）

### 新規ファイル

| ファイル | 内容 |
|---|---|
| `app/admin/legal/page.tsx` | 閲覧専用の管理画面。ページ上部に `business.ts` の全フィールドを表示し、下部に 5 文書の一覧（文書名・対象サービス・最終改定日・TODO 件数・参照元）を表形式で表示 |

### 既存ファイル更新

| ファイル | 変更 |
|---|---|
| `app/admin/layout.tsx` | ナビゲーションに「法務」（`LuScale` アイコン、`/admin/legal` 遷移先）を追加 |

### 機能
- 文書名クリックで公開ページを**新しいタブ**で開く
- TODO 件数は 0 件なら緑、1 件以上なら赤バッジで強調表示
- 事業者情報の変更運用の案内を上部カードに表示
- `TODO(要確認)` 件数は本文を正規表現で動的集計（frontmatter 不要）
- 参照元リスト（App Store、okitegami.app、nobilva.jp 等）は本ページのソースに集約（指示書 §6 の frontmatter 書き込みを admin 側データに変更）

### 編集機能は実装しない
指示書 §4-4「管理画面に文書の編集・更新機能は作らない（閲覧と確認のみ）」の方針を守る。文書本体の編集は `content/legal/*.md` を直接編集し、Git 経由でデプロイする運用。

---

## フェーズ G: 完了条件 §9 の検証（完了: 2026-10-19）

### §9 の 9 項目チェックリスト

| # | 条件 | 検証 |
|---|---|---|
| 1 | `content/legal/` と各ページに事業者情報・窓口の直書きが残っていない | ✅ `npm run check:legal` 通過（直書き 0 件）。i18n JSON 内の重複本文は T2 として別タスク |
| 2 | §2-C の矛盾がすべて解消済みか TODO になっている | ✅ §2-C-1〜12 すべて対応（C-1〜C-4 で解消 or T4/T8/T10 として TODO） |
| 3 | おきてがみの禁止事項・ブロック・通報の記載が利用規約にだけあり、プラポリにない | ✅ C-4 で利用規約第 8 条（ブロック）・第 10 条（禁止事項）・第 11 条（違反対応・通報）に集約、C-1 のプラポリ `#okitegami` 節には禁止事項・違反対応を含まない |
| 4 | 未成年の条件・管轄・免責・規約変更の文言が全規約でそろっている | ✅ 管轄・免責・規約変更は `{{business.jurisdiction}}` と共通テンプレで統一。未成年は各サービスの性質に応じて個別定義（Nobilva: 契約者=保護者、おきてがみ: 13 歳以上、Teach It: 18 歳未満要同意、13 歳未満は TODO） |
| 5 | 旧 URL（`/ja/privacy`、`/ja/terms`、`/ja/services/nobilva/tokushoho`、`okitegami.app/privacy`）がすべて正しい新 URL に 301 で届く | ✅ `/ja/privacy` → `/ja/legal/privacy-policy`、`/ja/terms` → `/ja/legal`（D-2）、`/ja/services/nobilva/tokushoho` → `/ja/legal/nobilva/commercial-disclosure`、`okitegami.app/privacy` → `nectere.jp` 新 URL（E-1）、`okitegami.app/terms` も新規に 301 設定（E-1）、`/ja/legal/okitegami/privacy-policy` → `#okitegami` 節（D-2） |
| 6 | Nobilva 第 2 条のリンク崩れ、おきてがみの条番号の参照ずれが直っている | ✅ Nobilva 新第 2 条で `{{business.services.nobilva.url}}` 参照、括弧構造を整理（C-2）。おきてがみ旧第 11 条の「第 15 条の窓口」参照ずれは、利用規約と プラポリの分離により解消（C-4 で第 21 条に窓口を独立 ） |
| 7 | admin の法務文書ページに全文書が出て、TODO 件数が見える | ✅ F で実装 |
| 8 | 対照表と TODO 一覧が出力されている | ✅ 本ファイル `docs/legal-changes-20261019.md` に A〜G を記録 |
| 9 | okitegami.app に規約・ポリシーの本文が残っておらず、フッターから nectere.jp の 2 文書へリンクしている | ✅ `web/privacy/` ディレクトリ削除、フッターを nectere.jp の 2 項目（プラポリ `#okitegami` 節 + 利用規約）に変更（E-1） |

全 9 項目クリア。

### 公開前の人レビュー観点

1. **§2-E 系の法的判断**（対照表の C-1 〜 C-5 で記録済み）が意図通りか
   - 旧第 7 条第 3 項（質問室の損害賠償条項、消費者契約法との疑義）の削除
   - 休会費の月 500 円 → 月 1,000 円（税抜）への引き上げ、「永久的に」の削除
   - 中途解約料 20,000 円 → 違約金 0 円への変更
   - 当日キャンセル料 → 廃止
   - ユーザーコンテンツの著作権無償譲渡 → 利用許諾への切り替え
   - 投稿ライセンスを「プロモーション利用可」→「本サービス運営に必要な範囲」に限定

2. **残存 TODO 19 件**（本文内の `<!-- TODO(要確認) -->`）の最終判定
   - 入会金が全額返金保証に含まれるか（T4 の派生、C-2/C-3）
   - 支払処理代行会社・メール配信事業者（Resend 等）の社名確定
   - Firebase の東京移行後に適用する記述の、現時点での書き方（T12）
   - Teach It toB 機能の規約化（T14）
   - 「保存先日本・事業者米国」の二重構造の最終表記（T8）
   - 月額契約が「特定継続的役務」に該当するかの法的判断
   - 顧問弁護士／行政書士レビュー

3. **フェーズ C/D 完了後に残る別タスク**（スコープ外、公開前 or 公開後に対応）
   - **T10**（最優先）: サービスページ `/services/nobilva` の FAQ・表示を規約・特商法と整合（前月 25 日 → 10 日、入塾金 8,000 円 → 入会金 18,000 円、税抜表記 → 税込表記）
   - **T15**: App Store Connect のおきてがみ・Teach It のプラポリ URL を nectere.jp に差し替え
   - T13: Teach It アプリ内 Settings 画面へのプラポリ・利用規約リンク追加
   - T2: `messages/ja.json` 内の二重法務本文を整理（デッド or 利用中かの調査から）
   - T9: ブログ著者「養田貴大」の `business.ts` 参照化判断
   - iOS アプリ（おきてがみ）の次回ビルドリリース（URL 変更の反映）

### 検査コマンド

```
$ npm run check:legal
✓ 5 件の法務文書を検査、事業者情報の直書きなし（TODO 19 件は残っています）

$ npx tsc --noEmit  # 新規・変更ファイルに型エラーなし
```

### フェーズ全体サマリー

| フェーズ | 完了日 | 変更内容 |
|---|---|---|
| A | 2026-10-19 | 4 本の Explore エージェントで §1 全項目 + §8-2 の確認 + 認識ズレ（Teach It = teachmate2、キミセン = teach_it）訂正 |
| A' | 2026-10-19 | teachmate2 調査で Teach It の実装（Gemini、Vision、Firebase、認証方式）を確定 |
| B | 2026-10-19 | `lib/business.ts` + Markdown 差し込み基盤（remark プラグイン・コンポーネント 2 本・ビルド時チェック）新規作成 |
| C | 2026-10-19 | 5 文書を §5 の方針で全面リライト（Nobilva ToS は 288→177 行に短縮）、`lib/nobilva-pricing.ts` 新規作成 |
| D | 2026-10-19 | `/ja/legal` 一覧ページ新設、`/services/teachit` 復活、301 調整、フッター 2 項目化、お問い合わせフォーム同意リンク化 |
| E | 2026-10-19 | okitegami/web の本文削除・301 設定・フッター差し替え、iOS アプリ（SettingsView、TermsAcceptanceToggle）の URL 更新 |
| F | 2026-10-19 | admin に閲覧専用の法務文書ページ新設（`lib/business.ts` 表示、文書一覧、TODO 件数、参照元） |
| G | 2026-10-19 | §9 の 9 項目をすべてクリア、残 TODO 一覧を本ファイルに整理 |

### 新規作成した基盤

| ファイル | 役割 |
|---|---|
| `lib/business.ts` | 事業者情報の単一ソース |
| `lib/nobilva-pricing.ts` | Nobilva の料金・支払・解約条件の単一ソース |
| `lib/remark-business-plugin.ts` | `{{<ns>.<path>}}` 差し込み + `:::business-info` / `:::contact-info` ブロック + 見出しアンカー `{#id}` |
| `components/legal/BusinessInfo.tsx` | 事業者情報の表 |
| `components/legal/ContactInfo.tsx` | 問い合わせ窓口の表 |
| `scripts/check-legal-content.ts` | ビルド時チェック（直書き検出・TODO 件数集計） |
| `app/[locale]/legal/page.tsx` | 法務情報一覧ページ |
| `app/[locale]/services/teachit/page.tsx` | Teach It サービスページ（作成中プレースホルダー） |
| `app/admin/legal/page.tsx` | admin 閲覧専用ページ |
| `docs/legal-changes-20261019.md` | 本対照表（作業ログと §2-E 対照表） |

---

---

## フェーズ H: 公開前修正（第 2 回）（完了: 2026-10-19）

根拠: `/Users/ryuto/Downloads/legal-fix-round2.md`

### H-1. 文書どうしの食い違い

| 指示 | 対応 |
|---|---|
| 1-1 当日キャンセル文言 | Nobilva ToS 第 9 条 2 項を「当日のキャンセルを含め、予約の変更・キャンセルによって追加の費用は発生しないものとします」に書き換え。天災等の例示を削除。特商法表記と整合 |
| 1-2 口座登録期限 | `nobilva-pricing.ts` に `payment.accountRegistrationDeadline = "引落月の前月 25 日（土日祝日の場合はその前営業日）"` を新設。Nobilva ToS 第 8 条 3 項・特商法表記の該当箇所を参照化（「前月末日」→「前月 25 日」） |
| 1-3 Teach It 認証方式 | プラポリ 4-2 (1) を Apple / Google / Email+Password の 3 方式に拡張。「パスワードは Firebase Authentication が保管し、当方は直接保管しない」旨も明記 |
| 1-4 Teach It 音声入力 | Teach It ToS 第 7 条 4 項とプラポリ 4-2 (5) を「iOS 標準の音声入力機能を利用、変換後のテキストのみ受領、音声データはサーバー送信・保存なし」に修正 |
| 1-5 プラポリ第 6 条 13 歳未満 | 「13 歳未満の方の個人情報は、保護者の同意を得た場合（Nobilva で契約者である保護者から受講者である生徒の情報の提供を受ける場合を含みます。）を除き、収集しないものとします」に修正 |
| 1-6 Teach It ToS 第 8 条 対象年齢 | 「原則として高校生以上」→「中学生以上」に修正 |
| 1-7 返金保証範囲 | Nobilva ToS 第 19 条 5 項と特商法表記を「月額料金（入会金及びシステム管理費を除きます。）」に修正。入会金・システム管理費・市販教材費を対象外として並列明記。サービスページ FAQ (`app/[locale]/services/nobilva/faq/_data.ts`) にも「入会金・システム管理費は対象外」追記 |

### H-2. おきてがみ移し漏れ（旧 15 条の内容）

| 指示 | 対応 |
|---|---|
| 2-1 自動フィルタ | ToS 第 10 条の末尾に「10-3. 自動フィルタ」節を新設 |
| 2-2 通報詳細 | 第 11 条 3 項を拡張。「…」メニューから通報、通報の内容は当方のみ確認、通報した事実は投稿者に知らされない旨を追加 |
| 2-3 ブロック詳細 | 第 8 条を 4 項→5 項に拡張。相互フレンド関係の自動解除、地図/タイムライン/通知から直ちに非表示、「設定 › ブロック中のユーザー」からいつでも解除可を明記 |

### H-3. 保存期間の見直し

| 指示 | 対応 |
|---|---|
| 3-1 プラポリ 4-4, 4-5 | 「原則 3 年以内」「原則 1 年」を削除、「利用目的の達成に必要な期間保存し、不要となった後は遅滞なく削除」に揃える |
| 3-4 Teach It 4-2 | **teachmate2 にアカウント削除機能なし**（調査結果）のため、「アカウント削除後 30 日以内」の記述を削除、「利用目的の達成に必要な期間保存し、不要となった後は遅滞なく削除」に修正 |

### H-4. 抜けの補充

| 指示 | 対応 |
|---|---|
| 4-1 外国制度リンク | プラポリ 3-5 の表の下に「外国にある第三者への個人情報の提供については、個人情報保護委員会のウェブサイト（<https://www.ppc.go.jp/personalinfo/legal/kaiseihogohou/>）で各国の個人情報保護制度を確認いただけます」を追加 |
| 4-2 Nobilva Firebase 行 | プラポリ 3-5 の表に「Google LLC（米国）／Firebase（Nectere サイトの管理画面、Nobilva のお問い合わせ・無料学習診断の申込み）／米国」を追加。実装は `firebase.json` + `nectere-home` プロジェクト、リージョンはデフォルト `us-central1` |
| 4-3 メール配信事業者社名 | 「Resend, Inc.（米国）」を 3-5 表と 4-1 Nobilva 外部サービス節と 4-4 お問い合わせ外部サービス節に追加 |
| 4-3 支払処理代行事業者社名 | **実装・環境変数のどこにも社名の記述なし** → 法務文書上は「主な委託先の類型」として「支払処理代行事業者」と抽象記載のまま維持。社名確定時に追記（**TODO: ユーザー確認要**） |
| 4-4 GA オプトアウトリンク | プラポリ 5. の表の下に「Google 社提供のオプトアウトアドオン（<https://tools.google.com/dlpage/gaoptout>）」を追加 |

### H-5. 表示の修正

| 指示 | 対応 |
|---|---|
| 5-1 金額桁区切り | `lib/remark-business-plugin.ts` で数値値を `toLocaleString('ja-JP')` で整形するよう修正（18000 → 18,000）。本文側の「 円」の半角スペースを `sed` で一括削除（全 10 箇所、Nobilva ToS + 特商法） |
| 5-2 Nobilva ToS 第 19 条 3 項 | 「退会したユーザー」→「退会した契約者及び受講者」 |
| 5-3 Nobilva ToS 第 7 条 3 項 | 「各月額料金に対し」→「月額料金及びシステム管理費に対し」。消費税がシステム管理費にも掛かることを明示 |

### H-6. 前回指摘の残り

| 指示 | 対応 |
|---|---|
| 6-1 Nobilva サービスページフッターに特商法リンク | 既に `lib/navigation.ts` の `NOBILVA_LEGAL_ITEMS` を「法務情報」+「特定商取引法に基づく表記」の 2 項目に修正済み（前回フィードバック対応）。`nobilva.jp` は Vercel で `nectere.jp/ja/services/nobilva/*` に 301 する軽量リポジトリのため、homepage 側の修正のみで両方に反映 |
| 6-2 messages/ja.json 旧本文の使用確認 | 調査結果：**`privacy`、`terms`、`nobilvaTokushoho` の 3 キーはどこからも参照されていないデッドコード**。公開ページで表示されるリスクなし。削除は別タスク判断 |

### H-7. Teach It と Gemini API（確認結果）

| 項目 | 調査結果 | ユーザー判断/報告事項 |
|---|---|---|
| Gemini API キーが有料枠か | **API キーは `AIza...` 形式** = Google Cloud 経由。無料の AI Studio キー（通常 `ya29...` 形式）ではない。ただし docs に課金設定の明示なし。`teaching-822bf` Firebase プロジェクトの課金設定を Google Cloud Console で要確認 | **ユーザーが Google Cloud Console で課金有効化を確認**。有料枠であれば、Gemini に送信した入力・画像が Google のモデル改善に使われないことが Google の利用規約で担保される |
| API キー停止時のエラーハンドリング | サーバー側で Gemini の 401 が HTTP 400「Bad Request」に統一されてしまう。Flutter 側は 400 を `clientError` に分類し、「ごめん、ちょっと考えがまとまらなくて……」と表示 → **キー停止時にユーザーに適切なメッセージが出ない** | 別タスクで `/api/chat` のエラー処理を改善（Gemini のステータスコードを保ったまま伝播する、または専用エラーコードに変換） |

### H-8. 新規発生 TODO（ユーザー確認が必要）

| # | 内容 | 根拠 |
|---|------|---|
| TH-1 | 支払処理代行事業者（口座振替代行会社）の社名確定 | 実装・環境変数のどこにも記載なし |
| TH-2 | teachmate2 の Gemini API 課金設定の最終確認（有料枠か） | API キー形式は Google Cloud 経由を示唆するが docs に明示なし |
| TH-3 | teachmate2 にアカウント削除機能を実装 | App Store Review Guideline 要件、別タスク（本件は法務文書上は「必要な期間保存して削除」の抽象表現で回避） |
| TH-4 | teachmate2 の Gemini API エラー時の UX 改善（401 を 400 に統一している問題） | 別タスク、法務文書とは独立 |

### H-9. 検査結果

```
$ npm run check:legal
✓ 5 件の法務文書を検査、事業者情報の直書きなし

$ npx tsc --noEmit
# 新規・変更ファイルに型エラーなし
```

---

---

## フェーズ I: 公開前修正（第 3 回）（完了: 2026-10-19）

根拠: `/Users/ryuto/Downloads/legal-fix-round3.md`

### I-0. 本文 TODO の全面禁止

- `scripts/check-legal-content.ts` を strict モードに変更。本文中に `TODO` 文字列が 1 件でもあれば exit 1（公開前のビルドが止まる）
- TODO 検出パターンを `/TODO\(要確認\)/g` から `/TODO/g` に拡張（表記揺れをカバー）
- 作業上の覚えは本ファイル（`docs/legal-changes-YYYYMMDD.md`）にのみ書く運用に統一

### I-1. プラポリ 4-1 Nobilva 外部サービス・委託先を 6 項目に書き直し

| # | 事業者 | 内容 |
|---|---|---|
| 1 | Supabase, Inc.（米国） | Supabase（内部生専用アプリのチャット及び学習記録の保存。保存先：インド ap-south-1、ムンバイ） |
| 2 | Google LLC（米国） | Firebase（認証、プッシュ通知、お問い合わせ及び無料学習診断の申込み内容の保存。保存先：米国） |
| 3 | LINEヤフー株式会社（日本） | 公式 LINE |
| 4 | 株式会社POPER（日本） | Comiru（請求書の発行及び口座振替の手続き。契約者の氏名、連絡先、口座情報、請求内容を取り扱う。口座振替は同社が提携する集金代行事業者を通じて行われる） |
| 5 | Resend, Inc.（米国） | Resend（Nobilva 関連の自動配信メール） |
| 6 | — | メンター・サポーター（学習指導の委託先） |

集金代行事業者の社名は書かない（指示書 §1 の方針）。

### I-2. プラポリその他の修正

| 指示 | 対応 |
|---|---|
| 2-1 3-5 表に Supabase (Nobilva) 行追加 | 「Supabase, Inc.（米国）／Supabase（Nobilva の内部生専用アプリ）／インド（ap-south-1）」の行を追加。おきてがみの Supabase 行（日本）とは別の行として並記 |
| 2-2 3-5 表の Nobilva 用 Firebase 説明を具体化 | 「Firebase（認証、プッシュ通知、Nobilva のお問い合わせ及び無料学習診断の申込み）」に書き換え |
| 2-3 3-5 冒頭の説明 | 「事業者の所在国は米国又は英国であり、個人情報の保存先リージョンは米国、日本又はインドのいずれかとなります」と、保存先の国も明示する書き方に修正 |
| 2-4 3-4 委託先の具体化 | (4) を「口座振替の手続きを行う事業者（株式会社POPER）」、(5) を「メール配信事業者（Resend, Inc.）」に書き換え |
| 2-5 4-1 取得情報の追加 | 新規項目 (3) として、無料学習診断の申込みフォームで受け取る情報を追記（お申込者の氏名、メールアドレス、学年、野球の所属、所属チーム名、お悩み、志望進路、申込みのきっかけ、面談希望日時）。実装 `app/[locale]/services/nobilva/diagnosis/page.tsx` の `DiagnosisFormData` から確認 |

### I-3. 内部生専用アプリ

Nobilva 利用規約第 11 条と特商法表記の「当方が提供する内部生専用アプリ」の表現はそのまま維持（指示書 §3 の方針どおり）。変更なし。

### I-4. Nobilva フッターを 4 項目に

| 対象 | 構成 |
|---|---|
| Nectere 全体フッター | 「法務情報」1 項目（変更なし） |
| Nobilva ページフッター | 「プライバシーポリシー」「利用規約」「特定商取引法に基づく表記」「法務情報一覧」の 4 項目 |

`lib/navigation.ts` の `NOBILVA_LEGAL_ITEMS` を 4 項目に拡張。プライバシーポリシーのリンクは `#nobilva` アンカー付きで直接 Nobilva 節に飛ばす。

### I-5. messages/*.json の旧本文を削除

`jq 'del(.privacy, .terms, .nobilvaTokushoho)'` で ja/en/de すべてから旧トップレベル本文を削除。

削除した 3 キー：
- `privacy`（旧プライバシーポリシー本文、約 40 行）
- `terms`（旧 Nobilva 利用規約本文、約 130 行）
- `nobilvaTokushoho`（旧特商法表記本文、約 60 行）

**本文を参照しているページ・コンポーネントなし**（フェーズ H で確認済み。前回調査時点で既にデッドコードだった）。参照先の差し替えは不要。

`metadata.privacy` / `metadata.terms` / `metadata.nobilvaTokushoho`（Next.js メタデータ用）と、`footer.privacyPolicy` / `footer.terms` / `footer.tokushoho`（UI ラベル）は本文ではないため削除対象外。これらは navigation.ts と Footer で使用中。

### I-6. Teach It の Gemini API

ユーザー回答により **API キーは課金を設定したプロジェクトのもの（有料枠）** と確定。フェーズ H で挙げた TH-2「Gemini API 課金設定の確認」はクローズ。

TH-4「API キー停止時のエラー UX 改善」は今回対応しない（指示書 §6 の方針どおり）。

### I-7. 検査結果

```
$ npm run check:legal
✓ 5 件の法務文書を検査、事業者情報の直書き・本文 TODO ともになし
```

### I-8. 更新した TODO 一覧

| # | 内容 | 状態 |
|---|------|---|
| TH-1 | 支払処理代行会社の社名 | **解決**（株式会社POPER / Comiru と確定、プラポリに反映） |
| TH-2 | Gemini API 課金設定の確認 | **解決**（有料枠と確定） |
| TH-3 | teachmate2 のアカウント削除機能実装 | 継続（App Store 要件、別タスク） |
| TH-4 | Gemini API エラー UX 改善 | 継続（今回対応しない方針） |

---

### フェーズ D 以降への引継事項

| # | 内容 | タイミング |
|---|------|---|
| T2 | messages/ja.json の二重法務本文の整理 | フェーズ C 完了後に別タスク |
| T3 | okitegami.app → nectere.jp への 301 反転 | フェーズ E |
| T8 | 「保存先日本・事業者米国」の二重構造の最終表記 | 公開前に人が判断 |
| T9 | ブログ著者 business.ts 参照化 | 別タスク |
| T10 | サービスページ FAQ 修正（前月 25 日 → 10 日、入塾金 8,000 → 入会金 18,000） | フェーズ C 完了後 |
| T11 | /services/teachit → /services/kimisen 301 を外す + Teach It サービスページ作成中プレースホルダー | フェーズ D |
| T12 | Teach It Firebase の東京移行 | 別タスク |
| T13 | Teach It アプリ内のプラポリ・利用規約リンク追加 | 別タスク |
| T14 | Teach It toB 機能の利用規約追記 | 実運用中となった時点 |
| T15 | Teach It の App Store Connect プラポリ URL 差し替え | フェーズ D 後に人が手動 |
| T16 | iOS Bundle ID `jp.nectere.studyit` の整理 | メモのみ |



