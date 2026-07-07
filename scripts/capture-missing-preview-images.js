const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = process.cwd();
const portfolioDir = path.join(root, 'about', 'portfolio');
const imageDir = path.join(root, 'Resources', 'images');
const limit = Number(process.argv[2] || 25);
const offset = Number(process.argv[3] || 0);
const mode = process.argv[4] || 'missing'; // missing or all

fs.mkdirSync(imageDir, { recursive: true });

function readRows() {
  const files = fs.readdirSync(portfolioDir).filter(f => /^portfolio-data-part\d+\.js$/.test(f)).sort();
  const rows = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(portfolioDir, file), 'utf8');
    const matches = text.matchAll(/\["([^"]+)","([^"]+)","\.\.\/\.\.\/Resources\/images\/([^"]+)","([^"]*)"\]/g);
    for (const m of matches) {
      rows.push({ name: m[1], industry: m[2], image: decodeURIComponent(m[3]), url: m[4], sourceFile: file });
    }
  }
  return rows;
}

async function bestScreenshotTarget(page) {
  const selectors = [
    'img[src*="1920w"]',
    'img[src*="Resources/images"]',
    'img[src*="dmcdn"]',
    'img[alt*="website"]',
    'img'
  ];

  let best = null;
  for (const selector of selectors) {
    const handles = await page.$$(selector);
    for (const handle of handles) {
      const box = await handle.boundingBox();
      if (!box || box.width < 320 || box.height < 180) continue;
      if (!best || (box.width * box.height) > (best.box.width * best.box.height)) best = { handle, box };
    }
  }
  return best;
}

async function capture(page, item) {
  const filePath = path.join(imageDir, item.image);
  await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(2600);

  const target = await bestScreenshotTarget(page);
  if (target) {
    await target.handle.screenshot({ path: filePath });
    return 'element';
  }

  await page.screenshot({ path: filePath, fullPage: false });
  return 'page';
}

async function main() {
  const rows = readRows();
  const candidates = rows.filter(row => row.url && row.url.includes('website.webact.com/preview/'));
  const pending = mode === 'all'
    ? candidates
    : candidates.filter(row => !fs.existsSync(path.join(imageDir, row.image)));
  const batch = pending.slice(offset, offset + limit);

  console.log(`Total portfolio rows: ${rows.length}`);
  console.log(`Rows with preview URL: ${candidates.length}`);
  console.log(`${mode === 'all' ? 'Total selected' : 'Missing with preview URL'}: ${pending.length}`);
  console.log(`Processing batch: ${batch.length} starting at offset ${offset}`);
  console.log('Using portfolio data names and expected filenames as the master source.');

  if (!batch.length) return;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  for (const item of batch) {
    try {
      const method = await capture(page, item);
      console.log(`Captured ${item.name} -> ${item.image} (${method})`);
    } catch (err) {
      console.warn(`Failed ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Done. Review Resources/images, then run git add Resources/images and commit.');
}

main().catch(err => { console.error(err); process.exit(1); });