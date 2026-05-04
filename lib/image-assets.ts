import fs from 'fs/promises';
import path from 'path';

const ASSETS_PATH = path.join(process.cwd(), 'content', 'image-assets.json');

export interface ImageAsset {
  /** ファイルパス（/images/blog/xxx.jpg） */
  path: string;
  /** タグ（検索用） */
  tags: string[];
  /** アスペクト比 */
  aspect: 'thumbnail' | 'body';
  /** 追加日 */
  addedAt: string;
  /** 使用記事slug一覧（自動計算） */
  usedIn?: string[];
  /** ファイルサイズ（バイト、自動計算） */
  fileSize?: number;
}

interface ImageAssetsFile {
  version: string;
  assets: ImageAsset[];
}

export async function getImageAssets(): Promise<ImageAsset[]> {
  try {
    const raw = await fs.readFile(ASSETS_PATH, 'utf8');
    const data = JSON.parse(raw) as ImageAssetsFile;
    return data.assets;
  } catch {
    return [];
  }
}

export async function saveImageAssets(assets: ImageAsset[]): Promise<void> {
  // パスで重複除去（後のものを優先してタグをマージ）
  const seen = new Map<string, ImageAsset>();
  for (const a of assets) {
    const existing = seen.get(a.path);
    if (existing) {
      existing.tags = [...new Set([...existing.tags, ...a.tags])];
      if (a.usedIn) existing.usedIn = a.usedIn;
      if (a.fileSize) existing.fileSize = a.fileSize;
    } else {
      seen.set(a.path, a);
    }
  }
  const data: ImageAssetsFile = { version: '1.0', assets: [...seen.values()] };
  await fs.writeFile(ASSETS_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

export async function addImageAsset(asset: Omit<ImageAsset, 'addedAt'>): Promise<ImageAsset> {
  const assets = await getImageAssets();
  const existing = assets.find((a) => a.path === asset.path);
  if (existing) {
    // タグを追加マージ
    existing.tags = [...new Set([...existing.tags, ...asset.tags])];
    await saveImageAssets(assets);
    return existing;
  }
  const newAsset: ImageAsset = { ...asset, addedAt: new Date().toISOString().split('T')[0] };
  assets.push(newAsset);
  await saveImageAssets(assets);
  return newAsset;
}

export async function updateImageAssetTags(imagePath: string, tags: string[]): Promise<void> {
  const assets = await getImageAssets();
  const asset = assets.find((a) => a.path === imagePath);
  if (asset) {
    asset.tags = tags;
    await saveImageAssets(assets);
  }
}

export async function deleteImageAsset(imagePath: string): Promise<void> {
  const assets = await getImageAssets();
  const filtered = assets.filter((a) => a.path !== imagePath);
  await saveImageAssets(filtered);
}

/**
 * 全記事内の画像パスを一括置換する
 */
export async function replaceImageInArticles(oldPath: string, newPath: string): Promise<string[]> {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  const files = await fs.readdir(blogDir);
  const mdFiles = files.filter((f) => f.endsWith('.md'));
  const affected: string[] = [];

  for (const file of mdFiles) {
    const filePath = path.join(blogDir, file);
    const raw = await fs.readFile(filePath, 'utf8');
    if (raw.includes(oldPath)) {
      const updated = raw.split(oldPath).join(newPath);
      await fs.writeFile(filePath, updated, 'utf8');
      affected.push(file.replace(/\.md$/, ''));
    }
  }

  // blog-index.json のサムネイルも更新
  const indexPath = path.join(process.cwd(), 'content', 'blog-index.json');
  try {
    const indexRaw = await fs.readFile(indexPath, 'utf8');
    if (indexRaw.includes(oldPath)) {
      await fs.writeFile(indexPath, indexRaw.split(oldPath).join(newPath), 'utf8');
    }
  } catch { /* ignore */ }

  return affected;
}

/**
 * 2つのアセットを統合する（keepPath を残し、removePath の参照を keepPath に書き換え）
 */
export async function mergeImageAssets(keepPath: string, removePath: string): Promise<{ affected: string[] }> {
  // 記事内の参照を更新
  const affected = await replaceImageInArticles(removePath, keepPath);

  // アセットデータを統合
  const assets = await getImageAssets();
  const keepAsset = assets.find((a) => a.path === keepPath);
  const removeAsset = assets.find((a) => a.path === removePath);

  if (keepAsset && removeAsset) {
    keepAsset.tags = [...new Set([...keepAsset.tags, ...removeAsset.tags])];
  }

  const filtered = assets.filter((a) => a.path !== removePath);
  await saveImageAssets(filtered);

  return { affected };
}

/**
 * アセットの画像パスを変更し、全記事の参照も更新する
 */
export async function replaceImageAsset(oldPath: string, newPath: string): Promise<{ affected: string[] }> {
  const affected = await replaceImageInArticles(oldPath, newPath);

  const assets = await getImageAssets();
  const oldAsset = assets.find((a) => a.path === oldPath);
  const newAsset = assets.find((a) => a.path === newPath);

  if (oldAsset && newAsset) {
    // アップロード時に自動登録された新アセットにタグを引き継ぎ、旧アセットを削除
    newAsset.tags = [...new Set([...newAsset.tags, ...oldAsset.tags])];
    const filtered = assets.filter((a) => a.path !== oldPath);
    await saveImageAssets(filtered);
  } else if (oldAsset) {
    oldAsset.path = newPath;
    await saveImageAssets(assets);
  }

  return { affected };
}

/**
 * content/blog 内の全mdファイルを走査して、各アセットの usedIn を更新する
 */
export async function syncImageAssetUsage(): Promise<ImageAsset[]> {
  const blogDir = path.join(process.cwd(), 'content', 'blog');
  const files = await fs.readdir(blogDir);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  // slug → 画像パス集合
  const usageMap: Map<string, Set<string>> = new Map();

  for (const file of mdFiles) {
    const slug = file.replace(/\.md$/, '');
    const raw = await fs.readFile(path.join(blogDir, file), 'utf8');
    const refs = raw.matchAll(/\/images\/blog\/[^"'\s)]+/g);
    for (const match of refs) {
      if (!usageMap.has(match[0])) usageMap.set(match[0], new Set());
      usageMap.get(match[0])!.add(slug);
    }
  }

  const publicDir = path.join(process.cwd(), 'public');
  const assets = await getImageAssets();
  for (const asset of assets) {
    asset.usedIn = [...(usageMap.get(asset.path) || [])];
    try {
      const stat = await fs.stat(path.join(publicDir, asset.path));
      asset.fileSize = stat.size;
    } catch {
      asset.fileSize = undefined;
    }
  }
  await saveImageAssets(assets);
  return assets;
}
