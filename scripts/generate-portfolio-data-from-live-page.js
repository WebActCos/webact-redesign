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
  "Advanced Business Systems": "Professional Services",
  "Aid The Children": "Nonprofit",
  "Air Techs HVAC": "HVAC",
  "All Concrete Works Landscaping": "Home Services",
  "All-Star Pizza": "Restaurant",
  "American Sewer": "Home Services",
  "Apex Denver Locksmith": "Locksmith",
  "Aspire Counseling": "Healthcare",
  "Aspire Hope For Kids": "Nonprofit",
  "Atlee Care": "Home Care",
  "Axel Medical Transportation": "Healthcare",
  "AY Home Health Care": "Home Care",
  "Bayou Solar": "Energy",
  "Beltway Home Inspections": "Home Services",
  "Benefits Matter": "Professional Services",
  "Board Game Republic": "Entertainment",
  "Brick House Salon": "Salon & Beauty",
  "Budget Control Services": "Professional Services",
  "Callahan Hayes": "Professional Services",
  "Carie's Posing Suits": "Retail",
  "Cass And Company Salon": "Salon & Beauty",
  "Castle Rock": "Home Services",
  "Century Tire Inc.": "Automotive",
  "Chutney Indian Cuisine": "Restaurant",
  "Coastal Homes": "Home Services",
  "College Planning Coach": "Education",
  "Colorado Creditor Bar Association": "Legal",
  "CoWest Insurance Group": "Professional Services",
  "CoWest Insurance Service": "Professional Services",
  "Crest Pest Control": "Pest Control",
  "CT Gasket": "Manufacturing",
  "Curved Glass Creations": "Home Services",
  "D And D Machinery Movers": "Industrial",
  "Dads Of Parker": "Nonprofit",
  "Deannas Papillons": "Pet Services",
  "Dental Arts": "Dental",
  "Dental Sleep Medicine": "Dental",
  "Denver Sign Factory": "Printing & Graphics",
  "Denver Towing": "Automotive",
  "DSS By Kat": "Salon & Beauty",
  "Ebony Equines": "Pet Services",
  "Einstein Plumbing": "Plumbing",
  "Emergency Locksmith Denver": "Locksmith",
  "Empathy Care": "Home Care",
  "Epic Ivy": "Education",
  "Epleyer": "Technology",
  "Esports Epleyer": "Technology",
  "Evans Legal Group": "Legal",
  "Extreme Autoworks": "Automotive",
  "Fine Arts Movement": "Arts & Entertainment",
  "Firm Group": "Professional Services",
  "Frameless Shower Door": "Home Services",
  "Front Range Dentures": "Dental",
  "G&G Driving School": "Driving School",
  "Gangle Law Firm": "Legal",
  "Genius Coaching": "Education",
  "Ghost Town Fitness": "Fitness",
  "Glass Act": "Home Services",
  "Good Water": "Water Treatment",
  "Granite State Labradoodles": "Pet Services",
  "Great Escape": "Entertainment",
  "Great West Restoration Colorado Agent": "Home Services",
  "Grin & Barrett Charity Ride": "Nonprofit",
  "Haveli Indian Cuisine": "Restaurant",
  "Heritage Roofing": "Roofing",
  "Home Pro Chesapeake": "Home Services",
  "Houston Energy Systems": "Energy",
  "Hydro Dynamics": "Water Treatment",
  "Implant Excellence": "Dental",
  "Inland Valley Driving School": "Driving School",
  "Inquiz Inspections": "Home Services",
  "Integration Design": "Professional Services",
  "Island Slider Guy": "Home Services",
  "Kasco HVAC": "HVAC",
  "Kenyon Homecare Consulting": "Home Care",
  "Kinetico Denver": "Water Treatment",
  "Kramarz Law": "Legal",
  "Lake Elsinore Driving School": "Driving School",
  "Liberty Lake Smile Source": "Dental",
  "Light Of Mine": "Nonprofit",
  "Little Caesars": "Restaurant",
  "Little Caesars Pueblo": "Restaurant",
  "Lower Lake Ranch": "Real Estate",
  "Manor House Apartments": "Real Estate",
  "Master Craft": "Home Services",
  "MDT Transit": "Transportation",
  "Meadow Hills": "Dental",
  "Meditouch": "Healthcare",
  "Mehak Denver": "Restaurant",
  "Mehak India's Aroma": "Restaurant",
  "Menifee Driving School": "Driving School",
  "Midwest Appliance And HVAC": "HVAC",
  "Mile High Books": "Retail",
  "Mindful Minds Psychiatry": "Healthcare",
  "Miyazaki Dental": "Dental",
  "Mountain West Law Group": "Legal",
  "Murrieta Driving School": "Driving School",
  "Nirvana Indian Cuisine": "Restaurant",
  "NOLA Water": "Water Treatment",
  "Onestop Home Health Care": "Home Care",
  "Optimal Homecare": "Home Care",
  "Optimal Hospice": "Healthcare",
  "Palm Bay Power Equipment": "Retail",
  "Pantera Homes": "Home Services",
  "Parkingboxx": "Technology",
  "Paw Power Agility Equipment": "Pet Services",
  "Peace Of Mind Pest Services": "Pest Control",
  "Peakview Dental": "Dental",
  "Pest Magic": "Pest Control",
  "Phase Contracting": "Home Services",
  "Pompano Glass": "Home Services",
  "Pork Chop's Truck And Auto": "Automotive",
  "Redline Construction": "Home Services",
  "Roof Ready": "Roofing",
  "Roots Brew": "Restaurant",
  "Rostron Dental": "Dental",
  "Sage Restaurant": "Restaurant",
  "Signal Driving Traffic Schools": "Driving School",
  "Skin Care Essentials": "Salon & Beauty",
  "Smart Cell Phone Parts": "Technology",
  "Smart Wireless Parts": "Technology",
  "Speak Clear Communications": "Healthcare",
  "Spector Law": "Legal",
  "Summit Graphics": "Printing & Graphics",
  "Superior Showers": "Home Services",
  "Tadka Indian Cuisine": "Restaurant",
  "Temecula Driving School": "Driving School",
  "Tipping Hat": "Professional Services",
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

  if (/(restaurant|cuisine|pizza|sushi|zaika|mehak|haveli|tadka|nirvana|sage|brew|cafe|grill|bar|food|deli|donuts)/.test(n)) return 'Restaurant';
  if (/(dental|dentist|orthodont|implant|smile|dentures|cranio|facial)/.test(n)) return 'Dental';
  if (/(law|legal|attorney|defender|creditor)/.test(n)) return 'Legal';
  if (/(driving|traffic|driver|instructor)/.test(n)) return 'Driving School';
  if (/(care|homecare|home health|hospice|medical|psychiatry|wellness|bodywork|therapy|skin|health)/.test(n)) return 'Healthcare';
  if (/(dog|pet|k9|papillon|labradoodle|equine|animal|puppy)/.test(n)) return 'Pet Services';
  if (/(pest|exterminator|bug|termite)/.test(n)) return 'Pest Control';
  if (/(roof|roofing)/.test(n)) return 'Roofing';
  if (/(hvac|heating|cooling|air tech|appliance)/.test(n)) return 'HVAC';
  if (/(plumb|sewer|drain)/.test(n)) return 'Plumbing';
  if (/(locksmith|lock)/.test(n)) return 'Locksmith';
  if (/(electric|electrical)/.test(n)) return 'Electrical';
  if (/(water|kinetico|hydro)/.test(n)) return 'Water Treatment';
  if (/(solar|energy|green|power)/.test(n)) return 'Energy';
  if (/(construction|contract|remodel|shower|glass|home|inspection|landscap|restoration|gutter|towing|transit|moving|machinery)/.test(n)) return 'Home Services';
  if (/(salon|beauty|spa|posing|skin)/.test(n)) return 'Salon & Beauty';
  if (/(auto|tire|truck|car|carwash|towing)/.test(n)) return 'Automotive';
  if (/(fair|festival|charity|foundation|nonprofit|children|community|cares)/.test(n)) return 'Nonprofit';
  if (/(wireless|cell|technology|app|esports|gaming|software|installations|network)/.test(n)) return 'Technology';
  if (/(apartment|real estate|homes|ranch|property)/.test(n)) return 'Real Estate';
  if (/(printing|graphics|sign|wrap|banner)/.test(n)) return 'Printing & Graphics';
  if (/(book|boutique|retail|equipment|parts)/.test(n)) return 'Retail';
  if (/(school|coach|education|training|academy)/.test(n)) return 'Education';
  if (/(consulting|agency|business|sales|marketing|executive|capital|benefits|insurance|group|partners|appraisal|communications)/.test(n)) return 'Professional Services';

  return 'Business';
}

function servicesForIndustry(industry) {
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
    'Energy': ['Website Design', 'Sustainability Messaging', 'Lead Generation'],
    'HVAC': ['Website Design', 'Service Area SEO', 'Lead Generation'],
    'Plumbing': ['Website Design', 'Service Area SEO', 'Lead Generation'],
    'Locksmith': ['Website Design', 'Local SEO', 'Lead Generation'],
    'Roofing': ['Website Design', 'Service Area SEO', 'Lead Generation'],
    'Automotive': ['Website Design', 'Local SEO', 'Lead Generation'],
    'Salon & Beauty': ['Website Design', 'Service Presentation', 'Local SEO'],
    'Retail': ['Website Design', 'Product Presentation', 'Local SEO'],
    'Education': ['Website Design', 'Program Pages', 'Lead Generation'],
    'Real Estate': ['Website Design', 'Property Presentation', 'Lead Generation'],
    'Entertainment': ['Website Design', 'Event Presentation', 'Lead Generation'],
    'Arts & Entertainment': ['Website Design', 'Portfolio Showcase', 'Lead Generation'],
    'Manufacturing': ['Website Design', 'Product Presentation', 'Lead Generation'],
    'Industrial': ['Website Design', 'Service Presentation', 'Lead Generation'],
    'Transportation': ['Website Design', 'Service Area SEO', 'Lead Generation'],
    'Fitness': ['Website Design', 'Membership CTA', 'Local SEO']
  };

  return serviceMap[industry] || ['Website Design', 'Content Strategy', 'Lead Generation'];
}

function featuresForIndustry(industry) {
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

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

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

    return [name, industry, imagePath, ''];
  });

  const master = cards.map(card => {
    const name = clean(card.name);
    const industry = guessIndustry(name);
    const imagePath = normalizeImage(card.image);

    return {
      name,
      slug: slug(name),
      industry,
      image: imagePath,
      previewUrl: '',
      liveUrl: '',
      services: servicesForIndustry(industry),
      features: featuresForIndustry(industry),
      technologies: technologiesForIndustry(),
      description: descriptionFor(name, industry),
      seoTitle: `${name} Website Design Case Study | WebAct ${industry} Portfolio`,
      seoDescription: `Explore the ${name} website design case study from WebAct, including ${industry} website strategy, services, features, and portfolio screenshots.`,
      caseStudy: {
        overview: `WebAct created a professional website presence for ${name}, helping the business present its services clearly and build trust with visitors.`,
        challenge: `The project needed to communicate the value of ${name} quickly while guiding visitors toward the next step.`,
        solution: `WebAct focused on clean design, structured content, mobile-friendly presentation, and clear conversion paths.`,
        result: `The finished website gives ${name} a stronger online presence and a more polished way to showcase services to potential customers.`
      }
    };
  });

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

  console.log(`Saved ${rows.length} old-format portfolio rows.`);
  console.log(`Saved ${master.length} master portfolio records.`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});