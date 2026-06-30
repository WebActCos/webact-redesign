const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = process.cwd();
const outDir = path.join(root, 'about', 'portfolio');
const imageDir = path.join(root, 'Resources', 'images');
const portfolioUrl = 'https://www.webact.com/portfolio';

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeImage(src) {
  if (!src) return '';

  let value = src
    .replace(/^https?:\/\/www\.webact\.com/i, '')
    .replace(/^https?:\/\/irp\.cdn-website\.com\/[^/]+\//i, '/')
    .replace(/^\/+/, '/');

  value = decodeURIComponent(value);

  const file = path.basename(value);

  if (!file) return '';

  let finalFile = file;

  if (!/-1920w\./i.test(finalFile)) {
    finalFile = finalFile.replace(/(-640w)?(\.[a-z0-9]+)$/i, '-1920w$2');
  }

  return `../../Resources/images/${finalFile}`;
}

function guessIndustry(name) {
  const n = name.toLowerCase();

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
      const href = link ? link.href || link.getAttribute('href') || '' : '';

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

      const alt = img ? img.alt || '' : '';

      return { index, name, href, image, alt };
    }).filter(card => card.name && card.image);
  });

  await browser.close();

  console.log(`Found ${cards.length} portfolio cards.`);

  const rows = cards.map(card => {
    const imagePath = normalizeImage(card.image);
    const fileName = imagePath.replace('../../Resources/images/', '');
    const localPath = path.join(imageDir, fileName);

    if (!fs.existsSync(localPath)) {
      console.warn(`Missing local image: ${card.name} -> ${fileName}`);
    }

    return {
      name: clean(card.name),
      slug: slug(card.name),
      industry: guessIndustry(card.name),
      image: imagePath,
      alt: clean(card.alt || `${card.name} website design by WebAct`),
      previewUrl: '',
      liveUrl: ''
    };
  });

  const js = `window.PORTFOLIO_ITEMS = ${JSON.stringify(rows, null, 2)};\n`;

  fs.writeFileSync(path.join(outDir, 'portfolio-data-all.js'), js, 'utf8');

  const chunkSize = Math.ceil(rows.length / 4);

  for (let i = 0; i < 4; i++) {
    const chunk = rows.slice(i * chunkSize, (i + 1) * chunkSize);
    const partJs = `window.PORTFOLIO_ITEMS_PART_${i + 1} = ${JSON.stringify(chunk, null, 2)};\n`;
    fs.writeFileSync(path.join(outDir, `portfolio-data-part${i + 1}.js`), partJs, 'utf8');
  }

  console.log(`Saved ${rows.length} items.`);
  console.log('Wrote:');
  console.log('about/portfolio/portfolio-data-all.js');
  console.log('about/portfolio/portfolio-data-part1.js');
  console.log('about/portfolio/portfolio-data-part2.js');
  console.log('about/portfolio/portfolio-data-part3.js');
  console.log('about/portfolio/portfolio-data-part4.js');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});