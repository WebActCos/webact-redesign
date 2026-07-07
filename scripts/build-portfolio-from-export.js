const fs = require('fs');
const path = require('path');

const input = process.argv[2] || 'portfolio_export.html';
const repoRoot = process.cwd();
const sourcePath = path.resolve(repoRoot, input);

if (!fs.existsSync(sourcePath)) {
  console.error(`Could not find export file: ${sourcePath}`);
  console.error('Usage: node scripts/build-portfolio-from-export.js portfolio_export.html');
  process.exit(1);
}

const html = fs.readFileSync(sourcePath, 'utf8');

function clean(value) {
  return String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function classify(name, alt) {
  const n = `${name} ${alt || ''}`.toLowerCase();
  const rules = [
    ['Restaurant', ['pizza', 'cuisine', 'restaurant', 'zaika', 'haveli', 'sushi', 'tadka', 'mehak', 'sage', 'nirvana', 'sukoon', 'roots-brew', 'little caesars', 'cupcakes', 'coconut', 'island cool creams']],
    ['Driving School', ['driving', 'signal school', 'instructor classes']],
    ['Pet Services', ['papillon', 'dog', 'pup', 'pet', 'labradoodle', 'paw', 'equines']],
    ['Home Care', ['home care', 'hospice', 'senior', 'empathy care', 'optimal', 'stanleyview', 'atlee', 'ay home', 'onestop']],
    ['Healthcare', ['dental', 'dentures', 'medical', 'wellness', 'psychiatry', 'meditouch', 'implant', 'prosthodontic', 'cranio', 'sleep medicine', 'smilist', 'skincare', 'vitalderm', 'tala']],
    ['HVAC', ['hvac', 'heating', 'air tech', 'energy performance', 'wake heating', 'kasco']],
    ['Plumbing', ['plumbing', 'sewer', 'carlock', 'einstein']],
    ['Pest Control', ['pest', 'turf magic']],
    ['Locksmith', ['locksmith']],
    ['Roofing', ['roof', 'heritage']],
    ['Legal', ['law', 'legal', 'attorney', 'creditor bar']],
    ['Transportation', ['transport', 'transit', 'moving', 'towing', 'mdt']],
    ['Automotive', ['tire', 'auto', 'carwash', 'bumper', 'truck', 'autoworks']],
    ['Construction', ['construction', 'contracting', 'craftsman', 'remodel', 'glass', 'shower', 'homes', 'ranch', 'inspections', 'installations', 'machinery', 'concrete', 'landscaping']],
    ['Financial Services', ['benefits', 'capital', 'insurance', 'financial', 'credit', 'budget control']],
    ['Nonprofit', ['children', 'foundation', 'society', 'community', 'fair', 'airshow']],
    ['Retail', ['retail', 'sunglass', 'surf', 'store', 'shop', 'books', 'registration', 'parts', 'apparel', 'posing suits', 'board game', 'sales channels']],
    ['Salon & Beauty', ['salon', 'hair', 'style', 'beauty']],
    ['Education', ['college', 'school', 'coach']],
    ['Technology', ['epleyer', 'esports', 'gaming', 'software', 'wireless', 'systems', 'tech', 'api', 'dashboard', 'editor']],
    ['Real Estate', ['apartments', 'vacation rentals', 'home staging', 'property']],
    ['Art & Creative', ['art', 'photograph', 'graphics', 'designs']],
    ['Water Treatment', ['water', 'kinetico', 'kionics', 'hydro', 'nola']],
    ['Solar & Energy', ['solar', 'energy', 'power']]
  ];
  for (const [industry, keywords] of rules) {
    if (keywords.some(keyword => n.includes(keyword))) return industry;
  }
  return 'Professional Services';
}

function servicesFor(industry) {
  if (['Restaurant','Pet Services','Home Care','Healthcare','Driving School','HVAC','Plumbing','Pest Control','Locksmith','Roofing','Salon & Beauty','Automotive'].includes(industry)) {
    return ['Website Design', industry, 'Local SEO'];
  }
  if (['Construction','Transportation','Solar & Energy','Water Treatment'].includes(industry)) {
    return ['Website Design', 'Local SEO', 'Lead Generation'];
  }
  if (['Retail','Technology'].includes(industry)) return ['Website Design', industry, 'Content'];
  if (['Legal','Financial Services'].includes(industry)) return ['Website Design', industry, 'Lead Generation'];
  if (industry === 'Nonprofit') return ['Website Design', 'Nonprofit', 'Content'];
  return ['Website Design', 'Content', 'Lead Generation'];
}

const blocks = html.split('photoGalleryThumbs').slice(1);
const projects = [];
const seen = new Set();

for (const block of blocks) {
  const nameMatch = block.match(/<h3[^>]*class="[^"]*caption-title[^"]*"[^>]*>([\s\S]*?)<\/h3>/i);
  const imgMatch = block.match(/<img[^>]*(?:data-src|src)="([^"]*\/Resources\/images\/[^"]+)"[^>]*>/i);
  const hrefMatch = block.match(/href="(https:\/\/website\.webact\.com\/preview\/[^"]+)"/i);
  const altMatch = block.match(/<img[^>]*alt="([^"]*)"/i);
  if (!nameMatch || !imgMatch) continue;
  const name = clean(nameMatch[1]);
  if (!name || seen.has(name.toLowerCase())) continue;
  seen.add(name.toLowerCase());
  const src = imgMatch[1].replace(/^https?:\/\/www\.webact\.com/i, '').replace(/^\//, '');
  const industry = classify(name, altMatch ? clean(altMatch[1]) : '');
  projects.push({
    name,
    industry,
    desc: `${industry} website design case study for ${name}, focused on clear messaging, professional presentation, visitor trust, and customer inquiry paths.`,
    services: servicesFor(industry),
    img: `../../${src}`,
    url: hrefMatch ? hrefMatch[1] : ''
  });
}

const outFile = path.join(repoRoot, 'about', 'portfolio', 'portfolio-data.js');
const js = `window.webactPortfolioProjects=${JSON.stringify(projects, null, 2)};\n`;
fs.writeFileSync(outFile, js, 'utf8');
console.log(`Generated ${projects.length} portfolio projects in ${outFile}`);
