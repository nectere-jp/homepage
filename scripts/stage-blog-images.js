#!/usr/bin/env node
/**
 * content/blog/*.md がステージされたとき、記事内で参照している
 * public/images/blog/ の画像を同じコミットに含めるため自動でステージする。
 * lint-staged から呼ばれる想定。
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const mdFiles = process.argv.slice(2).filter((f) => f.endsWith('.md'));

function collectImagePaths(content) {
  const paths = new Set();

  // フロントマターの image: /images/blog/xxx
  const frontmatterImage = content.match(/^image:\s*["']?(\/images\/blog\/[^"'\s]+)["']?/m);
  if (frontmatterImage) paths.add(frontmatterImage[1]);

  // 本文の ](/images/blog/xxx) または ]( /images/blog/xxx )
  const bodyRefs = content.matchAll(/\]\s*\(\s*(\/images\/blog\/[^)\s]+)\s*\)/g);
  for (const m of bodyRefs) paths.add(m[1]);

  return paths;
}

for (const mdFile of mdFiles) {
  const absPath = path.isAbsolute(mdFile) ? mdFile : path.join(repoRoot, mdFile);
  if (!fs.existsSync(absPath)) continue;

  const content = fs.readFileSync(absPath, 'utf8');
  const imagePaths = collectImagePaths(content);

  for (const imagePath of imagePaths) {
    const publicPath = path.join(repoRoot, 'public', imagePath);
    if (fs.existsSync(publicPath)) {
      const rel = path.relative(repoRoot, publicPath);
      execSync(`git add "${rel}"`, { cwd: repoRoot, stdio: 'inherit' });
    }
  }
}
