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

const INDUSTRY_OVERRIDES = {
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
  "NOLA Water": "Water Treatment",
  "Little Caesars": "Restaurant",
  "Mountain West Law Group": "Legal",
  "Evans Legal Group": "Legal",
  "Kramarz Law": "Legal",
  "Summit Graphics": "Printing & Graphics",
  "Superior Showers": "Home Services",
  "US Green": "Energy",
  "Tadka Indian Cuisine": "Restaurant",
  "Zaika Colorado Springs": "Restaurant"
};

function guessIndustry(name) {
  if (INDUSTRY_OVERRIDES[name]) return INDUSTRY_OVERRIDES[name];

  const n = name.toLowerCase();

  if (/(consulting|coach|agency|business|sales|marketing|executive|capital|benefits|insurance|group|partners)/.test(n)) return 'Professional Services';
  if (/(dental|dentist|orthodont|implant|smile|dentures)/.test(n)) return 'Dental';
  if (/(law|legal|attorney|defender|creditor)/.test(n)) return 'Legal';
  if (/(restaurant|cuisine|pizza|sushi|zaika|mehak|haveli|tadka|nirvana|sage)/.test(n)) return 'Restaurant';
  if (/(pest|lawn|landscap|roof|hvac|heating|plumbing|electric|construction|remodel|shower|glass|home|inspection)/.test(n)) return 'Home Services';
  if (/(driving|traffic|school)/.test(n)) return 'Driving School';
  if (/(care|health|medical|hospice|wellness|fitness|bodywork|skin)/.test(n)) return 'Healthcare';
  if (/(dog|pet|k9|papillon|labradoodle|equine)/.test(n)) return 'Pet Services';
  if (/(fair|festival|charity|foundation|nonprofit|children)/.test(n)) return 'Nonprofit';
  if (/(wireless|cell|technology|app|esports|gaming)/.test(n)) return 'Technology';

  return 'Business';
}

function servicesForIndustry(industry) {
  const base = ['Website Design', 'Content Strategy', 'Lead Generation'];

  const serviceMap = {
    'Restaurant': ['Website Design', 'Menu Presentation', 'Local SEO'],
    'Pet Services': ['Website Design', 'Local SEO', 'Trust Building'],
    'Home Care': ['Website Design', 'Healthcare Messaging', 'Lead Generation'],
    'Healthcare': ['Website Design', 'Patient Trust', 'Local SEO'],
    'Driving School': ['Website Design', 'Enrollment Flow', 'Local SEO'],
    'Dental': ['Website Design', 'Patient Conversion', 'Local SEO'],
    'Legal': ['Website Design', 'Client Intake', 'Local SEO'],
    'Home Services': ['Website Design', 'Service Area SEO', 'Lead Generation'],
    'Professional Services': ['Website Design', 'Content Strategy', 'Lead Generation'],
    'Technology': ['Website Design', 'Product Positioning', 'Lead Generation'],
    'Nonprofit': ['Website Design', 'Donation Messaging', 'Community Trust'],
    'Electrical': ['Website Design', 'Service Area SEO', 'Lead Generation'],
    'Pest Control': ['Website Design', 'Local SEO', 'Lead Generation'],
    'Water Treatment': ['Website Design', 'Product Education', 'Lead Generation'],
    'Printing & Graphics': ['Website Design', 'Portfolio Showcase', 'Local SEO'],
    'Energy': ['Website Design', 'Sustainability Messaging', 'Lead Generation']
  };

  return serviceMap[industry] || base;
}

function featuresForIndustry(industry) {
  const base = ['Mobile Responsive', 'Fast Loading Pages', 'Clear Calls To Action', 'Contact Forms', 'SEO-Friendly Structure'];

  const featureMap = {
    'Restaurant': ['Mobile Responsive', 'Menu Sections', 'Location Information', 'Online Ordering Ready', 'Local SEO'],
    'Pet Services': ['Mobile Responsive', 'Service Pages', 'Photo Gallery', 'Trust Signals', 'Contact Forms'],
    'Home Care': ['Mobile Responsive', 'Care Service Pages', 'Trust Signals', 'Inquiry Forms', 'Local SEO'],
    'Healthcare': ['Mobile Responsive', 'Service Pages', 'Patient Trust Signals', 'Appointment CTA', 'Local SEO'],
    'Driving School': ['Mobile Responsive', 'Program Pages', 'Enrollment CTA', 'Instructor Information', 'Local SEO'],
    'Dental': ['Mobile Responsive', 'Service Pages', 'Appointment CTA', 'Patient Trust Signals', 'Local SEO'],
    'Legal': ['Mobile Responsive', 'Practice Area Pages', 'Consultation CTA', 'Attorney Trust Signals', 'Local SEO'],
    'Home Services': ['Mobile Responsive', 'Service Area Pages', 'Request Estimate CTA', 'Photo Gallery', 'Local SEO'],
    'Professional Services': ['Mobile Responsive', 'Service Pages', 'Lead Capture', 'Brand Positioning', 'SEO-Friendly Structure'],
    'Technology': ['Mobile Responsive', 'Product Messaging', 'Feature Sections', 'Lead Capture', 'SEO-Friendly Structure'],
    'Nonprofit': ['Mobile Responsive', 'Mission Messaging', 'Donation CTA', 'Community Content', 'SEO-Friendly Structure'],
    'Electrical': ['Mobile Responsive', 'Service Pages', 'Request Estimate CTA', 'Service Area SEO', 'Contact Forms'],
    'Pest Control': ['Mobile Responsive', 'Pest Service Pages', 'Request Estimate CTA', 'Local SEO', 'Trust Signals'],
    'Water Treatment': ['Mobile Responsive', 'Product Education', 'Contact Forms', 'Service Area SEO', 'Trust Signals'],
    'Printing & Graphics': ['Mobile Responsive', 'Portfolio Gallery', 'Quote Request CTA', 'Service Pages', 'Local SEO'],
    'Energy': ['Mobile Responsive', 'Sustainability Messaging', 'Service Pages', 'Lead Capture', 'SEO-Friendly Structure']
  };

  return featureMap[industry] || base;
}

function technologiesForIndustry(industry) {
  return [
    'HTML5',
    'CSS3',
    'JavaScript',
    'Responsive Design',
    'Local SEO',
    'Performance Optimization',
    'Analytics Ready',
    'Secure Hosting'
  ];
}

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function descriptionFor(name, industry) {
  return `${industry} website design case study for ${name}, focused on clear messaging, professional presentation, visitor trust, and customer inquiry paths.`;
}

function seoTitleFor(name, industry) {
  return `${name} Website Design Case Study | WebAct ${industry} Portfolio`;
}

function seoDescriptionFor(name, industry) {
  return `Explore the ${name} website design case study from WebAct, including ${industry} website strategy, services, features, and portfolio screenshots.`;
}

function jsArray(rows, varName) {
  return `window.${varName} = [\n${rows
    .map(row => `  ${JSON.stringify(row)}`)
    .join(',\n')}\n];\n`;
}

function jsObject(rows, varName) {
  return `window.${varName} = ${JSON.stringify(rows, null, 2)};\n`;
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
    const industry = guessIndustry(name);
    const imagePath = normalizeImage(card.image);
    const fileName = imagePath.replace('../../Resources/images/', '');
    const localPath = path.join(imageDir, fileName);

    if (!fs.existsSync(localPath)) {
      console.warn(`Missing local image: ${name} -> ${fileName}`);
    }

    return [
      name,
      industry,
      imagePath,
      ''
    ];
  });

  const master = cards.map(card => {
    const name = clean(card.name);
    const industry = guessIndustry(name);
    const imagePath = normalizeImage(card.image);
    const projectSlug = slug(name);

    return {
      name,
      slug: projectSlug,
      industry,
      image: imagePath,
      previewUrl: '',
      liveUrl: '',
      services: servicesForIndustry(industry),
      features: featuresForIndustry(industry),
      technologies: technologiesForIndustry(industry),
      description: descriptionFor(name, industry),
      seoTitle: seoTitleFor(name, industry),
      seoDescription: seoDescriptionFor(name, industry),
      caseStudy: {
        overview: `WebAct created a professional website presence for ${name}, helping the business present its services clearly and build trust with visitors.`,
        challenge: `The project needed to communicate the value of ${name} quickly while guiding visitors toward the next step.`,
        solution: `WebAct focused on clean design, structured content, mobile-friendly presentation, and clear conversion paths.`,
        result: `The finished website gives ${name} a stronger online presence and a more polished way to showcase services to potential customers.`
      }
    };
  });

  fs.writeFileSync(
    path.join(outDir, 'portfolio-data-all.js'),
    jsArray(rows, 'webactPortfolioRows'),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'portfolio-master-data.js'),
    jsObject(master, 'webactPortfolioMaster'),
    'utf8'
  );

  const chunkSize = Math.ceil(rows.length / 4);

  for (let i = 0; i < 4; i++) {
    const chunk = rows.slice(i * chunkSize, (i + 1) * chunkSize);
    fs.writeFileSync(
      path.join(outDir, `portfolio-data-part${i + 1}.js`),
      jsArray(chunk, `webactPortfolioRowsPart${i + 1}`),
      'utf8'
    );
  }

  console.log(`Saved ${rows.length} old-format portfolio rows.`);
  console.log(`Saved ${master.length} master portfolio records.`);
  console.log('Wrote:');
  console.log('about/portfolio/portfolio-data-all.js');
  console.log('about/portfolio/portfolio-master-data.js');
  console.log('about/portfolio/portfolio-data-part1.js through portfolio-data-part4.js');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});