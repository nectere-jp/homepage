# Nobilva LP 変更点サマリー（0513_2）

最終更新：2026年5月13日
位置づけ：0513_1 以降の LP 実装変更点メモ

---

## 変更1：セクション5「伴走のリアル」を分割・再配置

### 旧構成
- **AccompanimentSection**（1コンポーネント）
- タブ切替式の3レイヤー：「1日」「1週間」「1年」
- セクション5として三本柱の直後に配置

### 新構成
- **DayFlowSection**（1日の流れ）— セクション5（三本柱の直後）
- **YearRoadmapSection**（1年ロードマップ）— セクション7（実績の直後）
- **1週間レイヤーは削除**

### 変更の意図
- 1週間レイヤーは情報量が多く、LPとしては読み進めるモチベーションを下げていた
- 1日の流れは三本柱の直後に配置し「仕組み→具体的な1日」の流れを作る
- 1年ロードマップは実績の後に配置し「信頼→長期伴走の安心感」の流れを作る
- セクション数：14→15に増加

### DayFlowSection の設計
- 3カード横並び（md:grid-cols-3）
- 各カードに：時間帯（オレンジ）、三本柱タグ（計画=黄/チャット=黒）、キャッチー見出し、短文
- セクション見出し：「練習で疲れて帰っても、やることは決まっている。」
- **マーケティングコピーとして設計**（説明資料ではない）

### YearRoadmapSection の設計
- 5フェーズカード（4〜6月/7〜8月/9〜11月/12〜2月/3月〜）
- モバイル：横スクロール、デスクトップ：5カラムグリッド
- セクション見出し：「1年間、ずっと隣にいます。」

---

## 変更2：LP各セクションのUI改善

### HeroSection
- Adobe Firefly 生成画像を背景に配置（next/image fill）
- 斜めスプリットグラデーション演出（bg-split-yellow/gray/white ユーティリティクラス）
- 「野球」「学習管理」をオレンジアクセント
- バッジ・CTAにもスプリット演出適用

### EmpathySection
- hero-desk.jpg（グローブと教科書の画像）を追加

### ResultsSnippetSection
- 数字部分をオレンジ・大きめに強調（HighlightNumbers コンポーネント）
- 指導期間・内容をピル型タグに変更（期間=黄/内容=白）
- コメントを吹き出し＋アイコン付きに変更

### ComparisonSection
- Nobilva列を太字に
- 各セルに◯△×アイコン追加（RatingIcon コンポーネント）

### FAQExcerptSection
- 質問文を `text-base md:text-lg font-bold` に拡大

### PricingSection
- エッセンシャル/ベーシックプランカードを上下中央揃え

---

## 変更3：コードレビュー・統一性修正

- 見出しpadding統一：`px-10 py-4 text-2xl md:text-3xl lg:text-4xl font-black`（SubpageCTA, SubpageFAQ, CareerPathSection）
- inline style（`style={{ background: ... }}`）をTailwindユーティリティクラスに置換
- 未使用画像9ファイル削除（features-point1-4.svg, problems-1-5.svg）

---

## 影響ファイル

### 新規
- `components/nobilva/DayFlowSection.tsx`
- `components/nobilva/YearRoadmapSection.tsx`

### 削除
- `components/nobilva/AccompanimentSection.tsx`
- `public/images/nobilva/features-point{1,2,3,4}.svg`
- `public/images/nobilva/problems-{1,2,3,4,5}.svg`

### 変更
- `app/[locale]/services/nobilva/page.tsx` — セクション配置変更
- `components/nobilva/HeroSection.tsx` — 画像・スプリット演出
- `components/nobilva/EmpathySection.tsx` — 画像追加
- `components/nobilva/ResultsSnippetSection.tsx` — 数字強調・タグ化
- `components/nobilva/ComparisonSection.tsx` — 太字・◯△×
- `components/nobilva/FAQExcerptSection.tsx` — 質問文拡大
- `components/nobilva/PricingSection.tsx` — 中央揃え
- `components/nobilva/SubpageCTA.tsx` — padding統一
- `components/nobilva/SubpageFAQ.tsx` — padding統一
- `components/nobilva/CareerPathSection.tsx` — padding統一
- `app/globals.css` — bg-split-yellow/gray/white ユーティリティ追加

### ドキュメント更新
- `docs/2605_update/nobilva_lp_redesign_v1_2.md` — セクション5分割・番号更新・紹介手数料制修正
- `docs/0430_変更点/implementation_progress.md` — Phase 4 完了状態を反映

---

## 変更4：面談時間 30分 → 40〜50分

全箇所を一括変更。

### コード
- `ThreePillarsSection.tsx`: subtitle + description
- `PricingSection.tsx`: エッセンシャル・ベーシック両方
- `FAQExcerptSection.tsx`: Q6「無料学習診断はどんな内容ですか？」

### 設計書
- `nobilva_lp_redesign_v1_2.md`: 三本柱・料金プラン・FAQ
- `nobilva_subpage_pricing_v1.md`: プラン詳細
- `nobilva_subpage_diagnosis_v1.md`: ヒーロー・完了画面

---

## 変更5：/pricing 設計書の規約更新

- **教材**: 「特別な教材販売はありません」→「独自教材の準備もございますが、基本的には市販の〜」
- **支払方法**: 「銀行振込のみ」→「口座振替または銀行振込」
- **休会**: 「1ヶ月単位」→「いつでも可能（期間の制限なし）」
- **解約期限**: 「前月25日まで」→「前月10日までに公式LINEまたはメールで連絡」
- **兄弟割引**: 「月額10%割引」→「入会金免除のみ」

---

## 変更6：/diagnosis 設計書の修正

- Q3 電話番号の補足から「営業電話には使用しません」を削除
- 面談時間を30分→40〜50分に統一

---

## 追加TODO（要検討として TODO.md に記録）

- Hero写真の改善
- 最大料金表示の扱い
- 「学校の成績足りない〜」のターゲティング表現
- 指導実績にAI顔写真/絵
- プラン順序（ベーシックが一番上？）
- 入会金の金額確定
- 他社比較の具体名使用可否
- 「この子にあった計画」の表現
- /diagnosis「起きること/起きないこと」の表現

---

## 変更7：全設計書の整合性一括修正

以下の旧表現を全設計書で一括修正。

### 修正内容

| 項目 | 旧 | 新 |
|---|---|---|
| 面談時間 | 30分 | 40〜50分 |
| 解約期限 | 前月25日まで | 前月10日までに公式LINEまたはメールで連絡 |
| 兄弟割引 | 月額10%割引 | 入会金免除のみ |
| 支払方法 | 銀行振込のみ | 口座振替または銀行振込 |
| 入会金 | 0円 | 未定（00,000円プレースホルダー） |
| 休会 | 1ヶ月単位 | いつでも可能（期間の制限なし） |

### 修正ファイル

- `nobilva_subpage_how_it_works_v1.md` — 面談30分→40〜50分（構成図の時間配分含む10箇所）
- `nobilva_subpage_faq_v1_2.md` — 面談30分(3), 前月25日→10日(2), 月額10%割引→入会金免除(1), 銀行振込→口座振替/振込(1), 休会1ヶ月単位→いつでも(1)
- `nobilva_site_redesign_guide_v1_2.md` — 銀行振込(1), 入会金0円→未定(1), 前月25日→10日(1), 月額10%割引→入会金免除(1), 休会(1), 面談30分(1), SVG面談構成図(1)
- `nobilva_subpage_for_teams_v1_2.md` — 面談30分(2), 入会金0円(1)
- `nobilva_subpage_pricing_v1.md` — チェックリスト銀行振込→口座振替/振込(1), 前月25日→10日(1), 入会金0円バッジ(1)
- `nobilva_subpage_diagnosis_v1.md` — 面談30分(3)
- `nobilva_lp_redesign_v1.md` — 面談30分(4), 入会金0円(2)
- `nobilva_lp_redesign_v1_2.md` — 入会金0円(2)

---

*このサマリーは 0513 の LP 実装作業の記録。詳細は各設計書・コミットログを参照。*
