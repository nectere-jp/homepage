/**
 * SEO戦略ドキュメントからキーワードを一括登録するスクリプト
 */
import { saveTargetKeyword } from '../lib/keyword-manager';

const keywords = [
  // プライマリキーワード（最優先）
  {
    keyword: '野球 勉強 両立できない',
    priority: 5,
    estimatedPv: 3000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['野球', '勉強両立', '時間管理', '部活動'],
    notes: '深刻な悩み、今すぐ解決策を求めている。切迫感が高く、コンバージョン可能性が非常に高い。',
    status: 'active',
  },
  {
    keyword: 'スポーツ推薦 成績 対策',
    priority: 5,
    estimatedPv: 2500,
    relatedBusiness: ['nobilva'],
    relatedTags: ['スポーツ推薦', '成績管理', '受験対策'],
    notes: '推薦入試を目指しているが成績が足りない。期限が迫っている可能性が高い。',
    status: 'active',
  },
  {
    keyword: 'スポーツ推薦 評定 対策',
    priority: 5,
    estimatedPv: 2500,
    relatedBusiness: ['nobilva'],
    relatedTags: ['スポーツ推薦', '成績管理', '内申点'],
    notes: '推薦入試で評定が足りない。具体的な対策方法を探している。',
    status: 'active',
  },
  {
    keyword: '遠征 勉強 時間確保',
    priority: 4,
    estimatedPv: 1500,
    relatedBusiness: ['nobilva'],
    relatedTags: ['時間管理', '遠征', '部活動'],
    notes: '遠征が多く勉強時間が取れない。特にチーム競技の選手に多い悩み。',
    status: 'active',
  },
  {
    keyword: '練習 疲れて寝る 対策',
    priority: 4,
    estimatedPv: 1500,
    relatedBusiness: ['nobilva'],
    relatedTags: ['時間管理', '部活動', '勉強両立'],
    notes: 'よくある悩み。やる気はあるけど体がついていかない。',
    status: 'active',
  },
  {
    keyword: 'スポーツ推薦 成績 やばい',
    priority: 4,
    estimatedPv: 1000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['スポーツ推薦', '成績管理', '緊急対策'],
    notes: '危機感が非常に高い。「やばい」という口語表現で切迫度MAX。',
    status: 'active',
  },
  
  // セカンダリキーワード（中優先）
  {
    keyword: '自習 できない スポーツ少年',
    priority: 3,
    estimatedPv: 1000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['勉強両立', '自習', '学習習慣'],
    notes: '自律的な学習習慣がない。保護者が検索している可能性が高い。',
    status: 'active',
  },
  {
    keyword: 'スポーツ 両立できる 勉強計画の立て方',
    priority: 3,
    estimatedPv: 2000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['勉強両立', '時間管理', '学習計画'],
    notes: '具体的な計画立案方法を求めている。実践的なアドバイスが必要。',
    status: 'active',
  },
  {
    keyword: '内申点 上げる方法',
    priority: 3,
    estimatedPv: 5000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['内申点', '成績管理', '受験対策'],
    notes: '一般的なキーワードだが、スポーツ選手向けにアプローチ可能。',
    status: 'active',
  },
  {
    keyword: 'オンライン指導 スポーツ 優先',
    priority: 3,
    estimatedPv: 800,
    relatedBusiness: ['nobilva'],
    relatedTags: ['オンライン学習', 'スポーツ推薦'],
    notes: 'スポーツを優先しながら学習できるオンライン指導を探している。',
    status: 'active',
  },
  
  // ロングテールキーワード（種目別）
  {
    keyword: 'サッカー 勉強 両立 こつ',
    priority: 3,
    estimatedPv: 2000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['サッカー', '勉強両立', '時間管理'],
    notes: 'サッカー特有の悩み。週末試合、平日練習のスケジュール。',
    status: 'active',
  },
  {
    keyword: 'バスケ 勉強 両立',
    priority: 3,
    estimatedPv: 1500,
    relatedBusiness: ['nobilva'],
    relatedTags: ['バスケ', '勉強両立', '時間管理'],
    notes: 'バスケ特有の悩み。室内競技、年間通しての活動。',
    status: 'active',
  },
  {
    keyword: 'テニス 勉強 両立',
    priority: 2,
    estimatedPv: 1000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['テニス', '勉強両立', '時間管理'],
    notes: 'テニス特有の悩み。個人競技だが遠征・試合が多い。',
    status: 'active',
  },
  {
    keyword: '学習管理アプリ おすすめ',
    priority: 2,
    estimatedPv: 4000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['学習アプリ', '学習管理', 'おすすめ'],
    notes: '比較・検討フェーズ。Nobilvaの強みを客観的に紹介する記事向き。',
    status: 'active',
  },
  {
    keyword: '引退後 成績 伸びる子 特徴',
    priority: 2,
    estimatedPv: 800,
    relatedBusiness: ['nobilva'],
    relatedTags: ['引退', '成績管理', '学習習慣'],
    notes: '引退前からの準備の重要性を訴求。Nobilvaの価値提案につながる。',
    status: 'active',
  },
  {
    keyword: 'スポーツ 両立できる 定期テスト対策',
    priority: 2,
    estimatedPv: 1200,
    relatedBusiness: ['nobilva'],
    relatedTags: ['定期テスト', '勉強両立', 'テスト対策'],
    notes: '定期テスト前の短期集中対策を求めている。',
    status: 'active',
  },
  
  // 追加の重要キーワード
  {
    keyword: '野球 勉強 両立',
    priority: 5,
    estimatedPv: 4000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['野球', '勉強両立', '時間管理'],
    notes: '既存記事で使用中。野球と勉強の両立に関する一般的な検索。',
    status: 'active',
  },
  {
    keyword: '部活 時間管理',
    priority: 4,
    estimatedPv: 3000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['部活動', '時間管理', '勉強両立'],
    notes: '既存記事で使用中。部活動と学習の両立における時間管理術。',
    status: 'active',
  },
  {
    keyword: 'スポーツ 成績管理',
    priority: 4,
    estimatedPv: 2000,
    relatedBusiness: ['nobilva'],
    relatedTags: ['成績管理', 'スポーツ推薦', '学習管理'],
    notes: '既存記事で使用中。スポーツ選手向けの成績管理サービス。',
    status: 'active',
  },
] as const;

async function addKeywords() {
  console.log('🚀 SEO戦略キーワードの一括登録を開始します...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const keywordData of keywords) {
    try {
      await saveTargetKeyword(keywordData.keyword, {
        priority: keywordData.priority as 1 | 2 | 3 | 4 | 5,
        estimatedPv: keywordData.estimatedPv,
        relatedBusiness: [...keywordData.relatedBusiness],
        relatedTags: [...keywordData.relatedTags],
        currentRank: null,
        rankHistory: [],
        notes: keywordData.notes,
        status: keywordData.status as 'active',
        assignedArticles: [],
      });
      
      console.log(`✅ 登録完了: ${keywordData.keyword} (優先度: ${keywordData.priority}, 想定PV: ${keywordData.estimatedPv.toLocaleString()})`);
      successCount++;
    } catch (error) {
      console.error(`❌ 登録失敗: ${keywordData.keyword}`, error);
      errorCount++;
    }
  }

  console.log(`\n📊 登録結果:`);
  console.log(`   ✅ 成功: ${successCount}件`);
  console.log(`   ❌ 失敗: ${errorCount}件`);
  console.log(`\n🎉 一括登録が完了しました！`);
}

addKeywords().catch(console.error);
