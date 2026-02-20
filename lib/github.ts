import { Octokit } from '@octokit/rest';
import path from 'path';
import fs from 'fs/promises';
import { collectReferencedBlogImagePaths } from '@/lib/blog';

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
 * 記事保存時に、content の変更に加えて記事内で参照している public/images/blog の画像を同じコミットに含める。
 * /admin での保存時は pre-commit が走らないため、この関数を使う。
 */
export async function commitFilesWithBlogImages(
  files: { path: string; content: string | null }[],
  message: string,
  markdownContent: string
): Promise<void> {
  const imagePaths = collectReferencedBlogImagePaths(markdownContent);
  const publicDir = path.join(process.cwd(), 'public');
  const imageBlobs: { path: string; content: Buffer }[] = [];
  for (const imagePath of imagePaths) {
    const filePath = path.join(publicDir, imagePath);
    try {
      const content = await fs.readFile(filePath);
      imageBlobs.push({ path: imagePath, content });
    } catch {
      // ファイルが存在しない場合はスキップ（アップロード前の参照など）
    }
  }

  if (imageBlobs.length === 0) {
    await commitFiles(files, message);
    return;
  }

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
  const publicEntry = rootTree.tree.find((e) => e.path === 'public' && e.type === 'tree');
  if (!contentEntry?.sha) throw new Error('content tree not found');

  const toAdd = files.filter((f): f is { path: string; content: string } => f.content !== null);
  const toDelete = files.filter((f): f is { path: string; content: null } => f.content === null);

  const contentBlobs: { path: string; sha: string }[] = [];
  for (const f of toAdd) {
    const { data: blobData } = await octokit.git.createBlob({
      owner,
      repo,
      content: Buffer.from(f.content, 'utf8').toString('base64'),
      encoding: 'base64',
    });
    contentBlobs.push({ path: f.path, sha: blobData.sha });
  }

  const toRel = (p: string) => (p.startsWith('content/') ? p.slice('content/'.length) : p);
  const contentTreeEntries: { path: string; mode: '100644'; type: 'blob'; sha: string | null }[] = [
    ...contentBlobs.map(({ path: filePath, sha }) => ({
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

  const imageBlobShas: { path: string; sha: string }[] = [];
  for (const { path: imagePath, content } of imageBlobs) {
    const { data: blobData } = await octokit.git.createBlob({
      owner,
      repo,
      content: content.toString('base64'),
      encoding: 'base64',
    });
    const filename = imagePath.replace(/^\/images\/blog\//, '');
    imageBlobShas.push({ path: filename, sha: blobData.sha });
  }

  const newBlogTreeFromBlobs = async () => {
    const { data: newBlogTree } = await octokit.git.createTree({
      owner,
      repo,
      tree: imageBlobShas.map(({ path: filePath, sha }) => ({
        path: filePath,
        mode: '100644' as const,
        type: 'blob' as const,
        sha,
      })),
    });
    return newBlogTree.sha;
  };

  let newPublicTreeSha: string;
  if (publicEntry?.sha) {
    const { data: publicTree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: publicEntry.sha,
      recursive: 'true',
    });
    const blogEntry = publicTree.tree.find((e) => e.path === 'images/blog' && e.type === 'tree');
    const imagesEntry = publicTree.tree.find((e) => e.path === 'images' && e.type === 'tree');
    const blogTreeEntries = imageBlobShas.map(({ path: filePath, sha }) => ({
      path: filePath,
      mode: '100644' as const,
      type: 'blob' as const,
      sha,
    }));
    const newBlogTreeSha =
      blogEntry?.sha
        ? (
            await octokit.git.createTree({
              owner,
              repo,
              base_tree: blogEntry.sha,
              tree: blogTreeEntries,
            })
          ).data.sha
        : await newBlogTreeFromBlobs();
    if (imagesEntry?.sha) {
      const { data: newImagesTree } = await octokit.git.createTree({
        owner,
        repo,
        base_tree: imagesEntry.sha,
        tree: [{ path: 'blog', mode: '040000', type: 'tree' as const, sha: newBlogTreeSha }],
      });
      newPublicTreeSha = (
        await octokit.git.createTree({
          owner,
          repo,
          base_tree: publicEntry.sha,
          tree: [{ path: 'images', mode: '040000', type: 'tree' as const, sha: newImagesTree.sha }],
        })
      ).data.sha;
    } else {
      const { data: newImagesTree } = await octokit.git.createTree({
        owner,
        repo,
        tree: [{ path: 'blog', mode: '040000', type: 'tree' as const, sha: newBlogTreeSha }],
      });
      newPublicTreeSha = (
        await octokit.git.createTree({
          owner,
          repo,
          base_tree: publicEntry.sha,
          tree: [{ path: 'images', mode: '040000', type: 'tree' as const, sha: newImagesTree.sha }],
        })
      ).data.sha;
    }
  } else {
    const blogSha = await newBlogTreeFromBlobs();
    const { data: newImagesTree } = await octokit.git.createTree({
      owner,
      repo,
      tree: [{ path: 'blog', mode: '040000', type: 'tree' as const, sha: blogSha }],
    });
    const { data: newPublicTree } = await octokit.git.createTree({
      owner,
      repo,
      tree: [{ path: 'images', mode: '040000', type: 'tree' as const, sha: newImagesTree.sha }],
    });
    newPublicTreeSha = newPublicTree.sha;
  }

  const hasPublic = rootTree.tree.some((e) => e.path === 'public');
  const rootTreeEntries: { path: string; mode: '040000'; type: 'tree'; sha: string }[] = rootTree.tree
    .filter((e): e is { path: string; mode?: string; type: string; sha: string } => e.type === 'tree' && 'sha' in e && !!e.sha)
    .map((e) => ({
      path: e.path,
      mode: (e.mode ?? '040000') as '040000',
      type: 'tree' as const,
      sha: e.path === 'content' ? newContentTree.sha : e.path === 'public' ? newPublicTreeSha : e.sha!,
    }));
  if (!hasPublic) {
    rootTreeEntries.push({ path: 'public', mode: '040000', type: 'tree', sha: newPublicTreeSha });
  }
  const { data: newRootTree } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: rootTreeSha,
    tree: rootTreeEntries,
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

  console.log(
    `Successfully committed: content + ${imageBlobShas.length} image(s) (${imageBlobShas.map((b) => b.path).join(', ')})`
  );
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
