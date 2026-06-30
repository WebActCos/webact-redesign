const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const SITE = 'https://www.webact.com';
const SITEMAP = process.argv[2] || `${SITE}/sitemap.xml?dTs=1780962103`;
const root = process.cwd();
const outDir = path.join(root, 'Resources', 'images');
const portfolioDir = path.join(root, 'about', 'portfolio');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(portfolioDir, { recursive: true });

function get(url, asBuffer = false, redirects = 0) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.get(url, { headers: { 'User-Agent': 'WebActPortfolioRecovery/1.0' } }, res => {
      if ([301,302,303,307,308].includes(res.statusCode) && res.headers.location && redirects < 5) {
        const next = new URL(res.headers.location, url).href;
        res.resume();
        return resolve(get(next, asBuffer, redirects + 1));
      }
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`${res.statusCode} ${url}`));
      }
      const chunks = [];
      res.on('data', d => chunks.push(d));
      res.on('end', () => {
        const buf = Buffer.concat(chunks);
        resolve(asBuffer ? buf : buf.toString('utf8'));
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => req.destroy(new Error(`Timeout ${url}`)));
  });
}

function clean(s) {
  return String(s || '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function slugFile(name) {
  return clean(name).toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-1920w.png';
}

function classify(name) {
  const n = name.toLowerCase();
  const rules = [
    ['Restaurant', ['pizza','cuisine','restaurant','zaika','sushi','tadka','mehak','deli','donuts','coffee','cream','caesars']],
    ['Driving School', ['driving','traffic school','instructor']],
    ['Pet Services', ['pet','dog','pup','k9','labradoodle','papillon']],
    ['Healthcare', ['dental','medical','health','wellness','derm','dentures','implants','hospice','care']],
    ['Home Care', ['home care','senior','atlee','jpl cares','stanleyview']],
    ['HVAC', ['hvac','heating','air']],
    ['Plumbing', ['plumbing','sewer']],
    ['Legal', ['law','legal','attorney']],
    ['Transportation', ['transport','towing','shuttle','moving','transit']],
    ['Construction', ['construction','contracting','machinery','shower','gutters','remodel','installations','homes','landscape','crane']],
    ['Water Treatment', ['water','kinetico','nola']],
    ['Technology', ['epleyer','wireless','gaming','esports','cell phone','localnexus']],
    ['Retail', ['boutique','retail','products','parts','suits']],
    ['Salon & Beauty', ['salon','hair','lashes']],
    ['Nonprofit', ['foundation','fair','children','airshow']],
    ['Financial Services', ['insurance','benefits','investments','capital']],
    ['Automotive', ['auto','carwash','truck','bumper','tire']],
    ['Education', ['college','kids','education']],
    ['Art & Creative', ['photo','photography','art','graphics','designs']]
  ];
  for (const [industry, words] of rules) if (words.some(w => n.includes(w))) return industry;
  return 'Professional Services';
}

function services(industry) {
  if (['Restaurant','Pet Services','Home Care','Healthcare','Driving School','HVAC','Plumbing','Pest Control','Locksmith','Roofing','Salon & Beauty','Automotive'].includes(industry)) return ['Website Design', industry, 'Local SEO'];
  if (['Construction','Transportation','Water Treatment'].includes(industry)) return ['Website Design', 'Local SEO', 'Lead Generation'];
  if (industry === 'Nonprofit') return ['Website Design', 'Nonprofit', 'Content'];
  return ['Website Design', 'Content', 'Lead Generation'];
}

function extractUrls(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(Boolean);
}

function imageCandidates(html) {
  const urls = [];
  const patterns = [
    /(?:src|data-src|content)=["']([^"']*Resources\/images\/[^"']+?\.(?:png|jpg|jpeg|webp))(?:\?[^"']*)?["']/gi,
    /url\(([^)]*Resources\/images\/[^)]+?\.(?:png|jpg|jpeg|webp))(?:\?[^)]*)?\)/gi
  ];
  for (const pattern of patterns) {
    for (const m of html.matchAll(pattern)) urls.push(m[1].replace(/^['"]|['"]$/g, ''));
  }
  return [...new Set(urls)].map(u => new URL(u, SITE).href);
}

function titleFromHtml(html, url) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return clean(h1[1]);
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) return clean(title[1]).replace(/\s*\|.*$/,'').replace(/\s*-\s*WebAct.*$/,'');
  return decodeURIComponent(new URL(url).pathname.split('/').filter(Boolean).pop() || 'Portfolio Project').replace(/[-_]+/g, ' ');
}

async function main() {
  console.log(`Reading sitemap: ${SITEMAP}`);
  const xml = await get(SITEMAP);
  let urls = extractUrls(xml).filter(u => /portfolio|preview|webact/i.test(u));
  if (!urls.includes(`${SITE}/portfolio`)) urls.unshift(`${SITE}/portfolio`);
  urls = [...new Set(urls)];
  console.log(`Checking ${urls.length} possible portfolio URLs...`);

  const projects = [];
  const seen = new Set();
  for (const url of urls) {
    try {
      const html = await get(url);
      if (!/Resources\/images|photoGallery|portfolio|website\.webact\.com\/preview/i.test(html)) continue;
      const imgs = imageCandidates(html).filter(src => /1920w|webact|portfolio|preview|screenshot/i.test(src));
      const blocks = html.split(/photoGalleryThumbs|portfolio-card|dmRespCol/i);
      if (blocks.length > 3) {
        for (const block of blocks) {
          const nameMatch = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>|alt=["']([^"']+?)(?: website design screenshot)?["']/i);
          const img = imageCandidates(block)[0];
          if (!nameMatch || !img) continue;
          const name = clean(nameMatch[1] || nameMatch[2]).replace(/ website design screenshot$/i, '');
          if (!name || seen.has(name.toLowerCase())) continue;
          seen.add(name.toLowerCase());
          const fileName = path.basename(new URL(img).pathname);
          projects.push({ name, industry: classify(name), src: img, fileName, url });
        }
      } else if (imgs.length) {
        const name = titleFromHtml(html, url);
        if (!seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          projects.push({ name, industry: classify(name), src: imgs[0], fileName: path.basename(new URL(imgs[0]).pathname), url });
        }
      }
    } catch (err) {
      console.warn(`Skipped ${url}: ${err.message}`);
    }
  }

  console.log(`Recovered ${projects.length} portfolio projects.`);
  let downloaded = 0;
  for (const p of projects) {
    const localName = p.fileName || slugFile(p.name);
    const localPath = path.join(outDir, localName);
    if (!fs.existsSync(localPath)) {
      try {
        const data = await get(p.src, true);
        fs.writeFileSync(localPath, data);
        downloaded++;
      } catch (err) {
        console.warn(`Image failed for ${p.name}: ${err.message}`);
      }
    }
    p.img = `../../Resources/images/${encodeURIComponent(localName).replace(/%2F/g,'/')}`;
    p.services = services(p.industry);
    p.desc = `${p.industry} website design case study for ${p.name}, focused on clear messaging, professional presentation, visitor trust, and customer inquiry paths.`;
  }

  const js = 'window.webactPortfolioProjects=' + JSON.stringify(projects.map(p => ({ name:p.name, industry:p.industry, desc:p.desc, services:p.services, img:p.img, url:p.url })), null, 2) + ';\n';
  fs.writeFileSync(path.join(portfolioDir, 'portfolio-data-recovered.js'), js);
  console.log(`Downloaded ${downloaded} images.`);
  console.log('Wrote about/portfolio/portfolio-data-recovered.js');
}

main().catch(err => { console.error(err); process.exit(1); });
