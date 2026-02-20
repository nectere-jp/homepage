#!/usr/bin/env node
/**
 * stage-blog-images.js の動作確認用。
 * 使い方: node scripts/verify-stage-blog-images.js [content/blog/xxx.md ...]
 * 引数なしなら content/blog/*.md をすべて検査する。
 */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const args = process.argv.slice(2);

function collectImagePaths(content) {
  const paths = new Set();
  const frontmatterImage = content.match(/^image:\s*["']?(\/images\/blog\/[^"'\s]+)["']?/m);
  if (frontmatterImage) paths.add(frontmatterImage[1]);
  const bodyRefs = content.matchAll(/\]\s*\(\s*(\/images\/blog\/[^)\s]+)\s*\)/g);
  for (const m of bodyRefs) paths.add(m[1]);
  return paths;
}

const mdFiles = args.length
  ? args.filter((f) => f.endsWith('.md'))
  : fs.readdirSync(path.join(repoRoot, 'content/blog')).filter((f) => f.endsWith('.md')).map((f) => path.join('content/blog', f));

console.log('Checking blog .md files and referenced images:\n');

for (const mdFile of mdFiles) {
  const absPath = path.isAbsolute(mdFile) ? mdFile : path.join(repoRoot, mdFile);
  if (!fs.existsSync(absPath)) {
    console.log('SKIP (not found):', mdFile);
    continue;
  }
  const content = fs.readFileSync(absPath, 'utf8');
  const imagePaths = collectImagePaths(content);
  if (imagePaths.size === 0) {
    console.log('OK (no refs):', mdFile);
    continue;
  }
  const missing = [];
  const found = [];
  for (const imagePath of imagePaths) {
    const publicPath = path.join(repoRoot, 'public', imagePath);
    if (fs.existsSync(publicPath)) {
      found.push(imagePath);
    } else {
      missing.push(imagePath);
    }
  }
  if (missing.length) {
    console.log('MISSING images for', mdFile);
    missing.forEach((p) => console.log('  -', p));
  }
  if (found.length) {
    console.log('REFERENCED (would be staged on commit):', mdFile);
    found.forEach((p) => console.log('  +', p));
  }
  console.log('');
}
