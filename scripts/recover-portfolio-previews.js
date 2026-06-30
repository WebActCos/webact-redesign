const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = process.cwd();
const portfolioUrl = process.argv[2] || 'https://www.webact.com/portfolio';
const imageDir = path.join(root, 'Resources', 'images');
const portfolioDir = path.join(root, 'about', 'portfolio');
fs.mkdirSync(imageDir, { recursive: true });
fs.mkdirSync(portfolioDir, { recursive: true });

function clean(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/ website design screenshot$/i, '')
    .replace(/^website design for\s+/i, '')
    .replace(/^webact website design(?: by| for)?\s+/i, '')
    .trim();
}

function slug(value) {
  return clean(value)
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function isBadTitle(value) {
  const n = clean(value).toLowerCase();
  return !n ||
    n.length > 60 ||
    n.startsWith('a computer') ||
    n.startsWith('an ') ||
    n.startsWith('the ') && n.includes('website is displayed') ||
    n.includes('tablet') ||
    n.includes('cell phone') ||
    n.includes('monitor') ||
    n.includes('displaying a website') ||
    n.includes('shown on a white background');
}

function classify(name) {
  const n = name.toLowerCase();
  const rules = [
    ['Restaurant', ['pizza','cuisine','restaurant','zaika','sushi','tadka','mehak','deli','donuts','coffee','cream','caesars','pueblo']],
    ['Driving School', ['driving','traffic school','instructor']],
    ['Pet Services', ['pet','dog','pup','k9','labradoodle','papillon']],
    ['Home Care', ['home care','senior','atlee','jpl cares','stanleyview','lifesong']],
    ['Healthcare', ['dental','medical','health','wellness','derm','dentures','implants','hospice','care','sleep medicine','cranio']],
    ['HVAC', ['hvac','heating','air']],
    ['Plumbing', ['plumbing','sewer']],
    ['Pest Control', ['pest','turf magic']],
    ['Locksmith', ['locksmith']],
    ['Roofing', ['roofing']],
    ['Legal', ['law','legal','attorney','creditor bar']],
    ['Transportation', ['transport','towing','shuttle','moving','transit']],
    ['Construction', ['construction','contracting','machinery','shower','gutters','remodel','installations','homes','landscape','crane','glass']],
    ['Water Treatment', ['water','kinetico','nola']],
    ['Technology', ['epleyer','wireless','gaming','esports','cell phone','localnexus','ict','mobily']],
    ['Retail', ['boutique','retail','products','parts','suits','surf','board game']],
    ['Salon & Beauty', ['salon','hair','lashes','style']],
    ['Nonprofit', ['foundation','fair','children','airshow','society']],
    ['Financial Services', ['insurance','benefits','investments','capital']],
    ['Automotive', ['auto','carwash','truck','bumper','tire']],
    ['Education', ['college','kids','education','school']],
    ['Art & Creative', ['photo','photography','art','graphics','designs']]
  ];
  for (const [industry, words] of rules) if (words.some(word => n.includes(word))) return industry;
  return 'Professional Services';
}

function services(industry) {
  if (['Restaurant','Pet Services','Home Care','Healthcare','Driving School','HVAC','Plumbing','Pest Control','Locksmith','Roofing','Salon & Beauty','Automotive'].includes(industry)) return ['Website Design', industry, 'Local SEO'];
  if (['Construction','Transportation','Water Treatment'].includes(industry)) return ['Website Design', 'Local SEO', 'Lead Generation'];
  if (industry === 'Nonprofit') return ['Website Design', 'Nonprofit', 'Content'];
  return ['Website Design', 'Content', 'Lead Generation'];
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise(resolve => {
      let totalHeight = 0;
      const distance = 700;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 300);
    });
  });
  await page.waitForTimeout(1500);
}

async function main() {
  console.log(`Opening ${portfolioUrl}`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await page.goto(portfolioUrl, { waitUntil: 'networkidle', timeout: 90000 });
  await autoScroll(page);

  const cards = await page.evaluate(() => {
    const anchors = [...document.querySelectorAll('a[href*="website.webact.com/preview/"]')];
    const rows = [];
    const seen = new Set();
    function text(el){ return (el && el.textContent || '').replace(/\s+/g,' ').trim(); }
    for (const a of anchors) {
      const href = a.href;
      if (seen.has(href)) continue;
      seen.add(href);
      const card = a.closest('article, li, .dmRespCol, .photoGalleryThumbs, .portfolio-card, .dmPhotoGallery, div') || a;
      const candidates = [
        card.querySelector('h3.caption-title'),
        card.querySelector('.caption-title'),
        card.querySelector('h3'),
        card.querySelector('h2'),
        card.querySelector('h4'),
        card.querySelector('[class*="title"]'),
        a
      ];
      const names = candidates.map(text).filter(Boolean);
      const img = card.querySelector('img');
      rows.push({ titleCandidates: names, href, imgSrc: img ? (img.currentSrc || img.src || img.getAttribute('data-src') || '') : '', imgAlt: img ? (img.alt || '') : '' });
    }
    return rows;
  });

  console.log(`Found ${cards.length} preview links.`);
  const projects = [];
  const seenNames = new Set();

  for (const card of cards) {
    const bestTitle = card.titleCandidates.find(t => t && !isBadTitle(t)) || card.titleCandidates[0] || card.imgAlt || `Portfolio Project ${projects.length + 1}`;
    const name = clean(bestTitle);
    if (!name || seenNames.has(name.toLowerCase())) continue;
    seenNames.add(name.toLowerCase());
    const industry = classify(name);
    const fileName = `${slug(name)}-preview.png`;
    const filePath = path.join(imageDir, fileName);

    const previewPage = await context.newPage();
    try {
      await previewPage.goto(card.href, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await previewPage.waitForTimeout(2500);
      await previewPage.screenshot({ path: filePath, fullPage: false });
      console.log(`Captured ${name}`);
    } catch (err) {
      console.warn(`Preview failed for ${name}: ${err.message}`);
      if (card.imgSrc) {
        try {
          const response = await page.request.get(card.imgSrc);
          if (response.ok()) fs.writeFileSync(filePath, await response.body());
        } catch (_) {}
      }
    } finally {
      await previewPage.close();
    }

    projects.push({
      name,
      industry,
      desc: `${industry} website design case study for ${name}, focused on clear messaging, professional presentation, visitor trust, and customer inquiry paths.`,
      services: services(industry),
      img: `../../Resources/images/${fileName}`,
      url: card.href
    });
  }

  await browser.close();
  const out = path.join(portfolioDir, 'portfolio-data-recovered.js');
  fs.writeFileSync(out, 'window.webactPortfolioProjects=' + JSON.stringify(projects, null, 2) + ';\n');
  console.log(`Recovered ${projects.length} preview projects using portfolio card names.`);
  console.log(`Wrote ${out}`);
}

main().catch(error => { console.error(error); process.exit(1); });
