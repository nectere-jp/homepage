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
 * 複数ファイルを1コミットでGitHubに反映
 * @param files - { path: string, content: string | null } の配列（path はリポジトリルート相対）。content が null の場合はそのファイルを削除
 * @param message - コミットメッセージ
 */
export async function commitFiles(
  files: { path: string; content: string | null }[],
  message: string
): Promise<void> {
  if (files.length === 0) return;
  try {
    const ref = `heads/${branch}`;
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref });
    const commitSha = refData.object.sha;

    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: commitSha,
    });
    const rootTreeSha = commitData.tree.sha;

    const { data: rootTree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: rootTreeSha,
    });
    const contentEntry = rootTree.tree.find((e) => e.path === 'content' && e.type === 'tree');
    if (!contentEntry || !contentEntry.sha) {
      throw new Error('content tree not found');
    }

    const toAdd = files.filter((f): f is { path: string; content: string } => f.content !== null);
    const toDelete = files.filter((f): f is { path: string; content: null } => f.content === null);

    const blobs: { path: string; sha: string }[] = [];
    for (const f of toAdd) {
      const { data: blobData } = await octokit.git.createBlob({
        owner,
        repo,
        content: Buffer.from(f.content, 'utf8').toString('base64'),
        encoding: 'base64',
      });
      blobs.push({ path: f.path, sha: blobData.sha });
    }

    const toRel = (p: string) => (p.startsWith('content/') ? p.slice('content/'.length) : p);
    const contentTreeEntries: { path: string; mode: '100644'; type: 'blob'; sha: string | null }[] = [
      ...blobs.map(({ path: filePath, sha }) => ({
        path: toRel(filePath),
        mode: '100644' as const,
        type: 'blob' as const,
        sha,
      })),
      ...toDelete.map((f) => ({
        path: toRel(f.path),
        mode: '100644' as const,
        type: 'blob' as const,
        sha: null as string | null,
      })),
    ];
    const { data: newContentTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: contentEntry.sha,
      tree: contentTreeEntries,
    });

    const { data: newRootTree } = await octokit.git.createTree({
      owner,
      repo,
      base_tree: rootTreeSha,
      tree: [{ path: 'content', mode: '040000', type: 'tree' as const, sha: newContentTree.sha }],
    });

    const { data: newCommit } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: newRootTree.sha,
      parents: [commitSha],
    });

    await octokit.git.updateRef({
      owner,
      repo,
      ref,
      sha: newCommit.sha,
    });

    const added = toAdd.length;
    const deleted = toDelete.length;
    const desc = [added && `${added} file(s)`, deleted && `${deleted} delete(s)`].filter(Boolean).join(', ');
    console.log(`Successfully committed: ${desc} (${files.map((f) => f.path).join(', ')})`);
  } catch (error) {
    console.error('Failed to commit files:', error);
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
