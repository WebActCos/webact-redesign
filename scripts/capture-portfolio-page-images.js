const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = process.cwd();
const portfolioDir = path.join(root, 'about', 'portfolio');
const imageDir = path.join(root, 'Resources', 'images');
const portfolioUrl = process.argv[2] || 'https://www.webact.com/portfolio';
const limit = Number(process.argv[3] || 250);

fs.mkdirSync(imageDir, { recursive: true });

function slug(value) {
  return String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/^website design for\s+/i, '')
    .replace(/^webact website design(?: by| for)?\s+/i, '')
    .replace(/ website design screenshot$/i, '')
    .trim();
}

function readRows() {
  const files = fs.readdirSync(portfolioDir).filter(f => /^portfolio-data-part\d+\.js$/.test(f)).sort();
  const rows = [];
  for (const file of files) {
    const text = fs.readFileSync(path.join(portfolioDir, file), 'utf8');
    const matches = text.matchAll(/\["([^"]+)","([^"]+)","\.\.\/\.\.\/Resources\/images\/([^"]+)","([^"]*)"\]/g);
    for (const m of matches) rows.push({ name: m[1], industry: m[2], image: decodeURIComponent(m[3]), url: m[4], slug: slug(m[1]) });
  }
  return rows;
}

async function autoScroll(page) {
  console.log('Scrolling portfolio page...');
  await page.evaluate(async () => new Promise(resolve => {
    let lastHeight = 0;
    let sameCount = 0;
    const timer = setInterval(() => {
      window.scrollBy(0, 900);
      const height = document.body.scrollHeight;
      if (height === lastHeight) sameCount++;
      else sameCount = 0;
      lastHeight = height;
      if (sameCount > 6 || window.scrollY + window.innerHeight >= height - 20) {
        clearInterval(timer);
        resolve();
      }
    }, 250);
    setTimeout(() => { clearInterval(timer); resolve(); }, 25000);
  }));
  await page.waitForTimeout(1500);
}

async function main() {
  const rows = readRows();
  const bySlug = new Map(rows.map(row => [row.slug, row]));
  console.log(`Loaded ${rows.length} portfolio data rows.`);
  console.log(`Opening ${portfolioUrl}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(35000);

  try {
    await page.goto(portfolioUrl, { waitUntil: 'commit', timeout: 35000 });
  } catch (err) {
    console.warn(`Initial page load warning: ${err.message}`);
  }

  try {
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 });
  } catch (_) {}

  console.log('Waiting for portfolio images/links...');
  try {
    await page.waitForSelector('img, a', { timeout: 15000 });
  } catch (err) {
    console.warn(`Selector wait warning: ${err.message}`);
  }

  await autoScroll(page);

  const cards = await page.evaluate(() => {
    function clean(value){ return String(value || '').replace(/\s+/g,' ').replace(/^website design for\s+/i,'').replace(/^webact website design(?: by| for)?\s+/i,'').replace(/ website design screenshot$/i,'').trim(); }
    function slug(value){ return clean(value).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
    const anchors = [...document.querySelectorAll('a[href*="website.webact.com/preview/"], a[href*="/portfolio/"]')];
    const seen = new Set();
    const rows = [];
    for (const a of anchors) {
      const href = a.href || '';
      const card = a.closest('article, li, .dmRespCol, .photoGalleryThumbs, .dmPhotoGallery, div') || a;
      const img = card.querySelector('img');
      if (!img) continue;
      const src = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || '';
      if (!src || seen.has(src)) continue;
      seen.add(src);
      const possible = [card.querySelector('h3'), card.querySelector('h2'), card.querySelector('.caption-title'), a].map(el => clean(el && el.textContent)).filter(Boolean);
      rows.push({ href, nameCandidates: possible, imgSrc: src, imgAlt: img.alt || '', slugs: [...new Set([...possible.map(slug), slug(img.alt || '')])].filter(Boolean) });
    }
    return rows;
  });

  console.log(`Found ${cards.length} portfolio page image cards.`);
  let captured = 0;
  let matched = 0;
  for (const card of cards) {
    const match = card.slugs.map(s => bySlug.get(s)).find(Boolean);
    if (!match || !card.imgSrc || captured >= limit) continue;
    matched++;
    const targetPath = path.join(imageDir, match.image);
    try {
      const response = await page.request.get(card.imgSrc, { timeout: 30000 });
      if (!response.ok()) throw new Error(`HTTP ${response.status()}`);
      fs.writeFileSync(targetPath, await response.body());
      captured++;
      console.log(`Saved ${match.name} -> ${match.image}`);
    } catch (err) {
      console.warn(`Failed ${match.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`Matched ${matched} cards to portfolio data.`);
  console.log(`Saved ${captured} portfolio page images.`);
  console.log('Run node scripts/audit-portfolio-images.js, then commit Resources/images.');
}

main().catch(err => { console.error(err); process.exit(1); });
