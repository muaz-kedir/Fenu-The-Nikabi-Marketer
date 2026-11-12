import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const htmlFile = path.join(distDir, 'index.html');

if (!fs.existsSync(htmlFile)) {
  console.error('ERROR: dist/index.html does not exist!');
  process.exit(1);
}

const htmlContent = fs.readFileSync(htmlFile, 'utf8');
const assetRegex = /(?:src|href)="(\/[^"#?]+(?:[#?][^"]*)?)"/g;
let match;
const localRefs = [];

while ((match = assetRegex.exec(htmlContent)) !== null) {
  const rawUrl = match[1];
  // Ignore external URLs or protocols
  if (rawUrl.startsWith('//') || rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
    continue;
  }
  const cleanPath = rawUrl.split(/[?#]/)[0].replace(/^\//, '');
  localRefs.push({ raw: rawUrl, clean: cleanPath });
}

console.log(`[verify-build] Checking ${localRefs.length} asset references in dist/index.html...`);

let hasError = false;
for (const item of localRefs) {
  const physicalPath = path.join(distDir, item.clean);
  if (!fs.existsSync(physicalPath)) {
    console.error(`[verify-build] FAIL: Referenced file "${item.raw}" not found on disk at ${physicalPath}`);
    hasError = true;
  } else {
    const stats = fs.statSync(physicalPath);
    console.log(`[verify-build] OK: ${item.raw} (${stats.size} bytes)`);
  }
}

if (hasError) {
  console.error('[verify-build] Build verification failed! One or more assets referenced in index.html are missing.');
  process.exit(1);
}

console.log('[verify-build] All referenced assets exist in dist/!');
