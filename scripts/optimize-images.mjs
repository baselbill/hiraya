// Convert full-size photos in assets-src/originals/ into the .webp files the site serves.
//   assets-src/originals/menu/<name>.png  ->  public/menu/<name>.webp
//   assets-src/originals/<name>.(png|jpg) ->  public/<name>.webp
//
//   npm run images -- roll-dyn chef-gher   # convert just these (overwrites existing .webp)
//   npm run images -- --all                # convert every original
//
// After converting a new menu photo, point the item's `img` in src/menu.js at /menu/<name>.webp
// and run `npm run check`.
import sharp from 'sharp';
import { readdirSync, mkdirSync } from 'fs';
import { join, parse } from 'path';

const SRC = 'assets-src/originals';
const OUT = 'public';
const QUALITY = 80;

const args = process.argv.slice(2);
const all = args.includes('--all');
const names = new Set(args.filter(a => !a.startsWith('--')));
if (!all && names.size === 0) {
  console.error('Usage: npm run images -- <name> [<name>...]   or   npm run images -- --all');
  process.exit(1);
}

const found = new Set();
let converted = 0;
for (const dir of ['', 'menu']) {
  const inDir = join(SRC, dir);
  const outDir = join(OUT, dir);
  mkdirSync(outDir, { recursive: true });
  for (const file of readdirSync(inDir, { withFileTypes: true })) {
    const { name, ext } = parse(file.name);
    if (!file.isFile() || !/^\.(png|jpe?g)$/i.test(ext)) continue;
    if (!all && !names.has(name)) continue;
    found.add(name);
    const target = join(outDir, `${name}.webp`);
    await sharp(join(inDir, file.name)).webp({ quality: QUALITY }).toFile(target);
    console.log(`  ${join(inDir, file.name)} -> ${target}`);
    converted++;
  }
}
const missing = [...names].filter(n => !found.has(n));
if (missing.length) { console.error(`No original found for: ${missing.join(', ')}`); process.exit(1); }
console.log(`Done: ${converted} converted.`);
