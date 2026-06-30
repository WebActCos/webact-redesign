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
  await page.evaluate(async () => new Promise(resolve => {
    let total = 0;
    const timer = setInterval(() => {
      window.scrollBy(0, 900);
      total += 900;
      if (total > document.body.scrollHeight + 2000) { clearInterval(timer); resolve(); }
    }, 250);
  }));
  await page.waitForTimeout(1200);
}

async function main() {
  const rows = readRows();
  const bySlug = new Map(rows.map(row => [row.slug, row]));
  console.log(`Loaded ${rows.length} portfolio data rows.`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(portfolioUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await autoScroll(page);

  const cards = await page.evaluate(() => {
    function clean(value){ return String(value || '').replace(/\s+/g,' ').replace(/^website design for\s+/i,'').replace(/^webact website design(?: by| for)?\s+/i,'').replace(/ website design screenshot$/i,'').trim(); }
    function slug(value){ return clean(value).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }
    const anchors = [...document.querySelectorAll('a[href*="website.webact.com/preview/"]')];
    const seen = new Set();
    const rows = [];
    for (const a of anchors) {
      const href = a.href;
      if (seen.has(href)) continue;
      seen.add(href);
      const card = a.closest('article, li, .dmRespCol, .photoGalleryThumbs, .dmPhotoGallery, div') || a;
      const img = card.querySelector('img');
      const possible = [card.querySelector('h3'), card.querySelector('h2'), card.querySelector('.caption-title'), a].map(el => clean(el && el.textContent)).filter(Boolean);
      rows.push({ href, nameCandidates: possible, imgSrc: img ? (img.currentSrc || img.src || img.getAttribute('data-src') || '') : '', imgAlt: img ? img.alt : '' });
    }
    return rows.map(row => ({...row, slugs: [...new Set([...row.nameCandidates.map(slug), slug(row.imgAlt)])].filter(Boolean)}));
  });

  console.log(`Found ${cards.length} portfolio page image cards.`);
  let captured = 0;
  for (const card of cards) {
    const match = card.slugs.map(s => bySlug.get(s)).find(Boolean);
    if (!match || !card.imgSrc || captured >= limit) continue;
    const targetPath = path.join(imageDir, match.image);
    try {
      const response = await page.request.get(card.imgSrc);
      if (!response.ok()) throw new Error(`HTTP ${response.status()}`);
      fs.writeFileSync(targetPath, await response.body());
      captured++;
      console.log(`Saved ${match.name} -> ${match.image}`);
    } catch (err) {
      console.warn(`Failed ${match.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log(`Saved ${captured} portfolio page images.`);
  console.log('Run node scripts/audit-portfolio-images.js, then commit Resources/images.');
}

main().catch(err => { console.error(err); process.exit(1); });
