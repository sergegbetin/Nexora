// Héberge localement les polices Google Fonts (supprime la dépendance à un tiers).
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.argv[2] ?? process.cwd();
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap';
const SUBSETS = new Set(['latin', 'latin-ext']);

const res = await fetch(CSS_URL, { headers: { 'User-Agent': UA } });
if (!res.ok) throw new Error(`Google Fonts: HTTP ${res.status}`);
const css = await res.text();

const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)];
const fontsDir = join(ROOT, 'public', 'fonts');
mkdirSync(fontsDir, { recursive: true });

const out = [];
let downloaded = 0;
for (const [, subset, block] of blocks) {
  if (!SUBSETS.has(subset)) continue;
  const family = block.match(/font-family:\s*'([^']+)'/)?.[1];
  const weight = block.match(/font-weight:\s*(\d+)/)?.[1];
  const style = block.match(/font-style:\s*(\w+)/)?.[1] ?? 'normal';
  const range = block.match(/unicode-range:\s*([^;]+);/)?.[1].trim();
  const srcUrl = block.match(/url\((https:[^)]+)\)/)?.[1];
  if (!family || !weight || !srcUrl || !range) continue;

  const file = `${family.toLowerCase().replace(/\s+/g, '-')}-${weight}-${subset}.woff2`;
  const buf = Buffer.from(await (await fetch(srcUrl, { headers: { 'User-Agent': UA } })).arrayBuffer());
  writeFileSync(join(fontsDir, file), buf);
  downloaded += 1;

  out.push(
    [
      `/* ${family} ${weight} · ${subset} · SIL Open Font License 1.1 */`,
      '@font-face {',
      `  font-family: '${family}';`,
      `  font-style: ${style};`,
      `  font-weight: ${weight};`,
      '  font-display: swap;',
      `  src: url('/fonts/${file}') format('woff2');`,
      `  unicode-range: ${range};`,
      '}',
    ].join('\n'),
  );
}

writeFileSync(
  join(ROOT, 'src', 'styles', 'fonts.css'),
  `/* ============================================================
   NEXORA — polices auto-hébergées (aucun appel à un tiers)
   Généré par scripts/fetch-fonts.mjs — ne pas éditer à la main.
   Licence : SIL Open Font License 1.1
   ============================================================ */

${out.join('\n\n')}
`,
);
console.log(`${downloaded} fichiers woff2 → public/fonts · ${out.length} déclarations @font-face`);
