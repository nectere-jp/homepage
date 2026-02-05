import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_OWNER!;
const repo = process.env.GITHUB_REPO!;
const branch = process.env.GITHUB_BRANCH || 'main';

/**
 * ファイルをGitHubにコミット
 */
export async function commitFile(
  path: string,
  content: string,
  message: string
): Promise<void> {
  try {
    // 既存ファイルのSHAを取得（更新の場合）
    let sha: string | undefined;
    try {
      const { data } = await octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if ('sha' in data) {
        sha = data.sha;
      }
    } catch (error) {
      // ファイルが存在しない場合（新規作成）
      console.log('File does not exist, creating new file');
    }

    // ファイルを作成または更新
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch,
    });

    console.log(`Successfully committed: ${path}`);
  } catch (error) {
    console.error('Failed to commit file:', error);
    throw error;
  }
}

/**
 * ファイルをGitHubから削除
 */
export async function deleteFile(
  path: string,
  message: string
): Promise<void> {
  try {
    // ファイルのSHAを取得
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch,
    });

    if (!('sha' in data)) {
      throw new Error('File not found');
    }

    // ファイルを削除
    await octokit.repos.deleteFile({
      owner,
      repo,
      path,
      message,
      sha: data.sha,
      branch,
    });

    console.log(`Successfully deleted: ${path}`);
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw error;
  }
}
