import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, extname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules', 'dist', '.impeccable']);
function walk(folder) {
  return readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    if (ignored.has(entry.name)) return [];
    const file = resolve(folder, entry.name);
    return entry.isDirectory() ? walk(file) : [file];
  });
}
const errors = []; let checked = 0;
function check(from, raw) {
  const value = raw.replace(/^<|>$/g, '').replaceAll('&amp;', '&');
  if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value)) return;
  const pathname = value.split(/[?#]/)[0];
  if (!pathname) return;
  let destination;
  try { destination = resolve(dirname(from), decodeURIComponent(pathname)); }
  catch { errors.push(`${relative(root, from)}: invalid path ${raw}`); return; }
  checked++;
  if (!existsSync(destination)) errors.push(`${relative(root, from)} → ${raw}`);
}
for (const file of walk(root)) {
  const type = extname(file);
  if (!['.html', '.md', '.css'].includes(type)) continue;
  const source = readFileSync(file, 'utf8');
  if (type === '.html') {
    for (const match of source.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/g)) check(file, match[1]);
  } else if (type === '.md') {
    // Fenced examples are prose/code samples, not rendered Markdown links.
    const prose = source.replace(/^```[^\n]*\n[\s\S]*?^```\s*$/gm, '');
    for (const match of prose.matchAll(/\]\((<[^>\n]+>|[^\s)]+)(?:\s+["'][^\n)]*)?\)/g)) check(file, match[1]);
  } else {
    for (const match of source.matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g)) check(file, match[1]);
  }
}
if (errors.length) {
  console.error(`Broken local references (${errors.length}):\n${errors.join('\n')}`);
  process.exitCode = 1;
} else console.log(`PASS · ${checked} local HTML, CSS and Markdown references resolve`);
