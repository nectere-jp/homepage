/**
 * content/blog 内の全 .md から blog-index.json と keywords.json を生成する。
 * パース失敗時は exit 1 で終了する（CI・デプロイ前用）。
 */
import { writeBlogIndex } from '../lib/blog';
import { updateKeywordDatabase } from '../lib/keyword-manager';

async function main() {
  try {
    // ブログインデックスを生成
    await writeBlogIndex();
    console.log('✓ blog-index.json を生成しました。');

    // キーワードデータベースを更新
    await updateKeywordDatabase();
    console.log('✓ keywords.json を更新しました。');

    console.log('\nすべてのインデックスファイルが正常に生成されました。');
  } catch (error) {
    console.error('インデックスファイルの生成に失敗しました:', error);
    process.exit(1);
  }
}

main();
