const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = process.cwd();
const outDir = path.join(root, 'about', 'portfolio');
const imageDir = path.join(root, 'Resources', 'images');
const portfolioUrl = 'https://www.webact.com/portfolio';

const EXTRA_PROJECTS = [
  { name: '2go Coconut', industry: 'Restaurant', image: '2goCoconut.png' },
  { name: 'Benton Dental', industry: 'Dental', image: 'benton+dental.png' },
  { name: 'Blackridge Defense', industry: 'Security', image: 'Blackridge-Defense.png' },
  { name: 'Building Better Breath', industry: 'Healthcare', image: 'building-better-Breath.png' },
  { name: 'By The Beach', industry: 'Travel', image: 'by+the+beach.png' },
  { name: 'Cancer With Courage', industry: 'Nonprofit', image: 'cancer+with+courage.png' },
  { name: 'Carlock Plumbing', industry: 'Plumbing', image: 'Carlock_Plumbing.png' },
  { name: 'Carwash Coupons', industry: 'Automotive', image: 'Carwash_Coupons.png' },
  { name: 'CellBlock', industry: 'Technology', image: 'cellBlock.png' },
  { name: 'Deaf Vacation Cruise', industry: 'Travel', image: 'deaf Vacation Cruise.png' },
  { name: 'Dig For Energy', industry: 'Energy', image: 'dig For Energy.png' },
  { name: 'Great West Real Estate', industry: 'Real Estate', image: 'great+west Real Estate.png' },
  { name: 'Island Cool Creams', industry: 'Restaurant', image: 'island+cool+creams.png' },
  { name: 'Marcoa', industry: 'Professional Services', image: 'marcoa.png' },
  { name: 'Net 2 Phone', industry: 'Technology', image: 'net+2+phone.png' },
  { name: 'New Era Dental', industry: 'Dental', image: 'new+era+dental.png' },
  { name: 'Simply Cupcakes Pasadena', industry: 'Restaurant', image: 'simply+cupcakes+pasadena.png' },
  { name: 'Sniper Security', industry: 'Security', image: 'sniper+security.png' },
  { name: 'The Chambers Of Tucson Mall', industry: 'Retail', image: 'the+chambers+of+tucson+mall.png' }
];

function clean(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function titleFromFileName(value) {
  return clean(
    String(value || '')
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/-1920w$/i, '')
      .replace(/[-_+]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  );
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

function findImageForExtra(baseName) {
  const files = fs.readdirSync(imageDir).filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));
  const normalizedTarget = clean(baseName).toLowerCase().replace(/[\s_+-]+/g, '');

  const exact = files.find(file => {
    const noExt = file.replace(/\.[a-z0-9]+$/i, '').replace(/-1920w$/i, '');
    return clean(noExt).toLowerCase().replace(/[\s_+-]+/g, '') === normalizedTarget;
  });

  if (exact) return exact;

  const partial = files.find(file => {
    const noExt = file.replace(/\.[a-z0-9]+$/i, '').replace(/-1920w$/i, '');
    const normalizedFile = clean(noExt).toLowerCase().replace(/[\s_+-]+/g, '');
    return normalizedFile.includes(normalizedTarget) || normalizedTarget.includes(normalizedFile);
  });

  return partial || '';
}

const INDUSTRY_OVERRIDES = {
  "2go Coconut": "Restaurant",
  "Benton Dental": "Dental",
  "Blackridge Defense": "Security",
  "Building Better Breath": "Healthcare",
  "By The Beach": "Travel",
  "Cancer With Courage": "Nonprofit",
  "Carlock Plumbing": "Plumbing",
  "Carwash Coupons": "Automotive",
  "Cellblock": "Technology",
  "Deaf Vacation Cruise": "Travel",
  "Dig For Energy": "Energy",
  "Great West Real Estate": "Real Estate",
  "Island Cool Creams": "Restaurant",
  "Marcoa": "Professional Services",
  "Net 2 Phone": "Technology",
  "New Era Dental": "Dental",
  "Simply Cupcakes Pasadena": "Restaurant",
  "Sniper Security": "Security",
  "The Chambers Of Tucson Mall": "Retail",

  "360 Sales Advantage": "Professional Services",
  "A Breed Apart Papillons": "Pet Services",
  "A CALIFORNIA Driving School": "Driving School",
  "A Dog's Day Out": "Pet Services",
  "A Pup's Valley": "Pet Services",
  "Abdul Electric": "Electrical",
  "Absolute Home Care": "Home Care",
  "Absolute Pest Control Services": "Pest Control",
  "Aces Driving School": "Driving School",
  "Ace Pet Services": "Pet Services",
  "Advanced Business Systems": "Professional Services",
  "Air Techs HVAC": "HVAC",
  "All-Star Pizza": "Restaurant",
  "Apex Denver Locksmith": "Locksmith",
  "Benefits Matter": "Professional Services",
  "Brick House Salon": "Salon & Beauty",
  "Budget Control Services": "Professional Services",
  "Century Tire Inc.": "Automotive",
  "Dental Sleep Medicine": "Dental",
  "Denver Sign Factory": "Printing & Graphics",
  "Evans Legal Group": "Legal",
  "Good Water": "Water Treatment",
  "Haveli Indian Cuisine": "Restaurant",
  "Kramarz Law": "Legal",
  "Little Caesars": "Restaurant",
  "Mountain West Law Group": "Legal",
  "NOLA Water": "Water Treatment",
  "Sage Restaurant": "Restaurant",
  "Spector Law": "Legal",
  "Summit Graphics": "Printing & Graphics",
  "Superior Showers": "Home Services",
  "Tadka Indian Cuisine": "Restaurant",
  "US Green": "Energy",
  "Zaika Colorado Springs": "Restaurant",
  "Zaika Broomfield": "Restaurant",
  "Zaika Castle Rock": "Restaurant",
  "Zaika Express": "Restaurant",
  "Zaika Littleton": "Restaurant"
};

function guessIndustry(name) {
  if (INDUSTRY_OVERRIDES[name]) return INDUSTRY_OVERRIDES[name];

  const n = name.toLowerCase();

  if (/(restaurant|cuisine|pizza|sushi|zaika|mehak|haveli|tadka|nirvana|sage|brew|cafe|grill|bar|food|deli|donuts|cupcake|cream|coconut)/.test(n)) return 'Restaurant';
  if (/(dental|dentist|orthodont|implant|smile|dentures|breath)/.test(n)) return 'Dental';
  if (/(law|legal|attorney|defender|creditor)/.test(n)) return 'Legal';
  if (/(driving|traffic|driver|instructor)/.test(n)) return 'Driving School';
  if (/(care|homecare|home health|hospice|medical|psychiatry|wellness|bodywork|therapy|skin|health|cancer)/.test(n)) return 'Healthcare';
  if (/(dog|pet|k9|papillon|labradoodle|equine|animal|puppy)/.test(n)) return 'Pet Services';
  if (/(pest|exterminator|bug|termite)/.test(n)) return 'Pest Control';
  if (/(roof|roofing)/.test(n)) return 'Roofing';
  if (/(hvac|heating|cooling|air tech|appliance)/.test(n)) return 'HVAC';
  if (/(plumb|sewer|drain)/.test(n)) return 'Plumbing';
  if (/(locksmith|lock)/.test(n)) return 'Locksmith';
  if (/(electric|electrical)/.test(n)) return 'Electrical';
  if (/(water|kinetico|hydro)/.test(n)) return 'Water Treatment';
  if (/(solar|energy|green|power)/.test(n)) return 'Energy';
  if (/(security|defense|sniper)/.test(n)) return 'Security';
  if (/(vacation|cruise|travel|beach)/.test(n)) return 'Travel';
  if (/(construction|contract|remodel|shower|glass|home|inspection|landscap|restoration|gutter|towing|transit|moving|machinery)/.test(n)) return 'Home Services';
  if (/(salon|beauty|spa|posing|skin)/.test(n)) return 'Salon & Beauty';
  if (/(auto|tire|truck|car|carwash|towing)/.test(n)) return 'Automotive';
  if (/(fair|festival|charity|foundation|nonprofit|children|community|cares|courage)/.test(n)) return 'Nonprofit';
  if (/(wireless|cell|technology|app|esports|gaming|software|installations|network|phone)/.test(n)) return 'Technology';
  if (/(apartment|real estate|homes|ranch|property)/.test(n)) return 'Real Estate';
  if (/(printing|graphics|sign|wrap|banner)/.test(n)) return 'Printing & Graphics';
  if (/(book|boutique|retail|equipment|parts|mall|chambers)/.test(n)) return 'Retail';
  if (/(school|coach|education|training|academy)/.test(n)) return 'Education';
  if (/(consulting|agency|business|sales|marketing|executive|capital|benefits|insurance|group|partners|appraisal|communications|marcoa)/.test(n)) return 'Professional Services';

  return 'Business';
}

function servicesForIndustry(industry) {
  const serviceMap = {
    Restaurant: ['Website Design', 'Menu Presentation', 'Local SEO'],
    Dental: ['Website Design', 'Patient Conversion', 'Local SEO'],
    Legal: ['Website Design', 'Client Intake', 'Local SEO'],
    Healthcare: ['Website Design', 'Patient Trust', 'Local SEO'],
    'Home Services': ['Website Design', 'Service Area SEO', 'Lead Generation'],
    'Professional Services': ['Website Design', 'Content Strategy', 'Lead Generation'],
    Technology: ['Website Design', 'Product Positioning', 'Lead Generation'],
    Nonprofit: ['Website Design', 'Donation Messaging', 'Community Trust'],
    Plumbing: ['Website Design', 'Service Area SEO', 'Lead Generation'],
    Automotive: ['Website Design', 'Local SEO', 'Lead Generation'],
    Energy: ['Website Design', 'Sustainability Messaging', 'Lead Generation'],
    'Real Estate': ['Website Design', 'Property Presentation', 'Lead Generation'],
    Security: ['Website Design', 'Trust Building', 'Lead Generation'],
    Travel: ['Website Design', 'Experience Presentation', 'Lead Generation'],
    Retail: ['Website Design', 'Product Presentation', 'Local SEO']
  };

  return serviceMap[industry] || ['Website Design', 'Content Strategy', 'Lead Generation'];
}

function featuresForIndustry() {
  return ['Mobile Responsive', 'Fast Loading Pages', 'Clear Calls To Action', 'Contact Forms', 'SEO-Friendly Structure'];
}

function technologiesForIndustry() {
  return ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design', 'Local SEO', 'Performance Optimization', 'Analytics Ready', 'Secure Hosting'];
}

function slug(value) {
  return String(value || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function descriptionFor(name, industry) {
  return `${industry} website design case study for ${name}, focused on clear messaging, professional presentation, visitor trust, and customer inquiry paths.`;
}

function jsArray(rows, varName) {
  return `window.${varName} = [\n${rows.map(row => `  ${JSON.stringify(row)}`).join(',\n')}\n];\n`;
}

function jsObject(rows, varName) {
  return `window.${varName} = ${JSON.stringify(rows, null, 2)};\n`;
}

function makeProject(name, imagePath) {
  const industry = guessIndustry(name);

  return {
    row: [name, industry, imagePath, ''],
    master: {
      name,
      slug: slug(name),
      industry,
      image: imagePath,
      previewUrl: '',
      liveUrl: '',
      services: servicesForIndustry(industry),
      features: featuresForIndustry(industry),
      technologies: technologiesForIndustry(industry),
      description: descriptionFor(name, industry),
      seoTitle: `${name} Website Design Case Study | WebAct ${industry} Portfolio`,
      seoDescription: `Explore the ${name} website design case study from WebAct, including ${industry} website strategy, services, features, and portfolio screenshots.`,
      caseStudy: {
        overview: `WebAct created a professional website presence for ${name}, helping the business present its services clearly and build trust with visitors.`,
        challenge: `The project needed to communicate the value of ${name} quickly while guiding visitors toward the next step.`,
        solution: `WebAct focused on clean design, structured content, mobile-friendly presentation, and clear conversion paths.`,
        result: `The finished website gives ${name} a stronger online presence and a more polished way to showcase services to potential customers.`
      }
    }
  };
}

async function getLiveCards() {
  console.log(`Opening ${portfolioUrl}`);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });

  await page.goto(portfolioUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(5000);

  for (let i = 0; i < 60; i++) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(400);
  }

  const cards = await page.evaluate(() => {
    function text(el) {
      return el ? String(el.textContent || '').replace(/\s+/g, ' ').trim() : '';
    }

    return Array.from(document.querySelectorAll('.photoGalleryThumbs')).map((thumb, index) => {
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

  return cards;
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const liveCards = await getLiveCards();
  console.log(`Found ${liveCards.length} portfolio cards from live page.`);

  const projects = [];

  for (const card of liveCards) {
    const name = clean(card.name);
    const imagePath = normalizeImage(card.image);
    projects.push(makeProject(name, imagePath));
  }

for (const project of EXTRA_PROJECTS) {
    const imagePath = `../../Resources/images/${project.image}`;

    if (!fs.existsSync(path.join(imageDir, project.image))) {
      console.warn(`Missing extra image: ${project.name} -> ${project.image}`);
      continue;
    }

    projects.push(makeProject(project.name, imagePath));
    console.log(`Added extra project: ${project.name} -> ${project.image}`);
  }

  const seen = new Set();
  const deduped = projects.filter(project => {
    const key = slug(project.master.name);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const rows = deduped.map(project => project.row);
  const master = deduped.map(project => project.master);

  for (const row of rows) {
    const fileName = row[2].replace('../../Resources/images/', '');
    const localPath = path.join(imageDir, fileName);
    if (!fs.existsSync(localPath)) {
      console.warn(`Missing local image: ${row[0]} -> ${fileName}`);
    }
  }

  fs.writeFileSync(path.join(outDir, 'portfolio-data-all.js'), jsArray(rows, 'webactPortfolioRows'), 'utf8');
  fs.writeFileSync(path.join(outDir, 'portfolio-master-data.js'), jsObject(master, 'webactPortfolioMaster'), 'utf8');

  const chunkSize = Math.ceil(rows.length / 4);

  for (let i = 0; i < 4; i++) {
    const chunk = rows.slice(i * chunkSize, (i + 1) * chunkSize);
    fs.writeFileSync(path.join(outDir, `portfolio-data-part${i + 1}.js`), jsArray(chunk, `webactPortfolioRowsPart${i + 1}`), 'utf8');
  }

  const counts = rows.reduce((acc, row) => {
    acc[row[1]] = (acc[row[1]] || 0) + 1;
    return acc;
  }, {});

  console.log('Industry counts:');
  Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([industry, count]) => {
    console.log(`${industry}: ${count}`);
  });

  console.log(`Saved ${rows.length} portfolio rows.`);
  console.log(`Saved ${master.length} master portfolio records.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});