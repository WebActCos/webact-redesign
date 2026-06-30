const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = process.cwd();
const outDir = path.join(root, 'about', 'portfolio');
const imageDir = path.join(root, 'Resources', 'images');
const portfolioUrl = 'https://www.webact.com/portfolio';

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function fixFileName(file) {
  return decodeURIComponent(String(file || '').replace(/\+/g, ' '));
}

function normalizeImage(src) {
  if (!src) return '';

  let value = String(src)
    .replace(/^https?:\/\/www\.webact\.com/i, '')
    .replace(/^https?:\/\/irp\.cdn-website\.com\/[^/]+\//i, '/')
    .replace(/^\/+/, '/');

  value = fixFileName(value);

  let file = path.basename(value);

  if (!file) return '';

  if (!/-1920w\./i.test(file)) {
    file = file.replace(/(-640w)?(\.[a-z0-9]+)$/i, '-1920w$2');
  }

  return `../../Resources/images/${file}`;
}

function guessIndustry(name) {
  const n = name.toLowerCase();
if (/(360 sales advantage|consulting|coach|agency|business|sales|marketing|executive|capital|benefits|insurance|group|partners)/.test(n)) return 'Professional Services';
  if (/(dental|dentist|orthodont|implant|smile|dentures)/.test(n)) return 'Dental';
  if (/(law|legal|attorney|defender|creditor)/.test(n)) return 'Legal';
  if (/(restaurant|cuisine|pizza|sushi|zaika|mehak|haveli|tadka|nirvana|sage)/.test(n)) return 'Restaurant';
  if (/(pest|lawn|landscap|roof|hvac|heating|plumbing|electric|construction|remodel|shower|glass|home|inspection)/.test(n)) return 'Home Services';
  if (/(driving|traffic|school)/.test(n)) return 'Education';
  if (/(care|health|medical|hospice|wellness|fitness|bodywork|skin)/.test(n)) return 'Healthcare';
  if (/(insurance|benefits|finance|capital|tax|accounting)/.test(n)) return 'Professional Services';
  if (/(dog|pet|k9|papillon|labradoodle|equine)/.test(n)) return 'Pets';
  if (/(fair|festival|charity|foundation|nonprofit|children)/.test(n)) return 'Nonprofit';
  if (/(wireless|cell|technology|app|esports|gaming)/.test(n)) return 'Technology';

  return 'Business';
}

function jsArray(rows, varName) {
  return `window.${varName} = [\n${rows
    .map(row => `  ${JSON.stringify(row)}`)
    .join(',\n')}\n];\n`;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  console.log(`Opening ${portfolioUrl}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1400 }
  });

  await page.goto(portfolioUrl, {
    waitUntil: 'domcontentloaded',
    timeout: 90000
  });

  await page.waitForTimeout(5000);

  for (let i = 0; i < 60; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
  }

  const cards = await page.evaluate(() => {
    function text(el) {
      return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    const thumbs = Array.from(document.querySelectorAll('.photoGalleryThumbs'));

    return thumbs.map((thumb, index) => {
      const title = thumb.querySelector('.caption-title');
      const link = thumb.querySelector('a');
      const img = thumb.querySelector('img');

      const name = text(title);

      let image =
        img?.getAttribute('data-src') ||
        img?.getAttribute('src') ||
        img?.currentSrc ||
        link?.getAttribute('data-image-url') ||
        '';

      if (!image && link) {
        const bg = link.style.backgroundImage || '';
        const match = bg.match(/url\(["']?(.+?)["']?\)/);
        if (match) image = match[1];
      }

      return { index, name, image };
    }).filter(card => card.name && card.image);
  });

  await browser.close();

  console.log(`Found ${cards.length} portfolio cards.`);

  const rows = cards.map(card => {
    const name = clean(card.name);
    const imagePath = normalizeImage(card.image);
    const fileName = imagePath.replace('../../Resources/images/', '');
    const localPath = path.join(imageDir, fileName);

    if (!fs.existsSync(localPath)) {
      console.warn(`Missing local image: ${name} -> ${fileName}`);
    }

    return [
      name,
      guessIndustry(name),
      imagePath,
      ''
    ];
  });

  fs.writeFileSync(
    path.join(outDir, 'portfolio-data-all.js'),
    jsArray(rows, 'webactPortfolioRows'),
    'utf8'
  );

  const chunkSize = Math.ceil(rows.length / 4);

  for (let i = 0; i < 4; i++) {
    const chunk = rows.slice(i * chunkSize, (i + 1) * chunkSize);
    fs.writeFileSync(
      path.join(outDir, `portfolio-data-part${i + 1}.js`),
      jsArray(chunk, `PORTFOLIO_ITEMS_PART_${i + 1}`),
      'utf8'
    );
  }

  console.log(`Saved ${rows.length} old-format portfolio rows.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});