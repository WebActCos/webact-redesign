const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = process.cwd();
const portfolioDir = path.join(root, 'about', 'portfolio');
const imageDir = path.join(root, 'Resources', 'images');
const limit = Number(process.argv[2] || 25);
const offset = Number(process.argv[3] || 0);

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

async function capture(page, item) {
  const filePath = path.join(imageDir, item.image);
  await page.goto(item.url, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForTimeout(1500);

  const candidates = [
    'img[src*="1920w"]',
    'img[src*="Resources/images"]',
    'img[alt*="website"]',
    'img'
  ];

  for (const selector of candidates) {
    const handle = await page.$(selector);
    if (!handle) continue;
    const box = await handle.boundingBox();
    if (!box || box.width < 300 || box.height < 180) continue;
    await handle.screenshot({ path: filePath });
    return 'element';
  }

  await page.screenshot({ path: filePath, fullPage: false });
  return 'page';
}

async function main() {
  const rows = readRows();
  const missing = rows.filter(row => row.url && !fs.existsSync(path.join(imageDir, row.image)));
  const batch = missing.slice(offset, offset + limit);
  console.log(`Total portfolio rows: ${rows.length}`);
  console.log(`Missing with preview URL: ${missing.length}`);
  console.log(`Processing batch: ${batch.length} starting at offset ${offset}`);

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
