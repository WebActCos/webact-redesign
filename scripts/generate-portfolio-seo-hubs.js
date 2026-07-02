const fs = require('fs');
const path = require('path');

const root = process.cwd();
const portfolioDir = path.join(root, 'about', 'portfolio');
const masterPath = path.join(portfolioDir, 'portfolio-master-data.js');
const rowsPath = path.join(portfolioDir, 'portfolio-data-all.js');
const overridesPath = path.join(portfolioDir, 'industry-overrides.js');

function slug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function normalizeName(value) {
  return String(value || '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function lookupByName(table, name) {
  if (!table) return null;
  return table[String(name || '')] || table[normalizeName(name)] || null;
}

function readWindowAssignment(filePath, globalName) {
  if (!fs.existsSync(filePath)) return [];

  const text = fs.readFileSync(filePath, 'utf8');
  const pattern = new RegExp(
    'window\\.' + globalName + '\\s*=\\s*([\\s\\S]*?);\\s*$'
  );

  const match = text.match(pattern);
  if (!match) return [];

  return Function('return ' + match[1])();
}

function readOverrides(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      projectOverrides: {},
      industryOverrides: {},
      nameOverrides: {},
      featuredProjects: []
    };
  }

  const sandbox = { window: {} };
  const code = fs.readFileSync(filePath, 'utf8');

  Function('window', code)(sandbox.window);

  return {
    projectOverrides: sandbox.window.webactPortfolioOverrides || {},
    industryOverrides: sandbox.window.webactIndustryOverrides || {},
    nameOverrides: sandbox.window.webactPortfolioNameOverrides || {},
    featuredProjects: sandbox.window.webactFeaturedProjects || []
  };
}

function legacyServices(industry) {
  const known = [
    'Restaurant',
    'Pet Services',
    'Home Care',
    'Healthcare',
    'Health Care',
    'Driving School',
    'HVAC',
    'Plumbing',
    'Pest Control',
    'Locksmith',
    'Roofing',
    'Salon & Beauty',
    'Automotive',
    'Dental',
    'Dentist',
    'Legal',
    'Electrical',
    'Water Treatment',
    'Printing & Graphics',
    'Energy',
    'Security',
    'Travel',
    'Retail',
    'Real Estate',
    'Education',
    'Technology',
    'Nonprofit',
    'Non Profit',
    'Professional Services',
    'Home Services',
    'Business',
    'Ecommerce',
    'Investors',
    'Transportation',
    'Artist',
    'Wedding',
    'Tattoo Shop',
    'Phone Repair',
    'Interior Design',
    'Glass Repair',
    'Construction',
    'Community',
    'Fair',
    'Investigation',
    'Fitness',
    'Home Inspection',
    'Design',
    'Golf',
    'Bookkeeping',
    'Photography',
    'Photographer',
    'Portfolio'
  ];

  return known.includes(industry)
    ? ['Website Design', industry, 'Local SEO']
    : ['Website Design', 'Content', 'Lead Generation'];
}

function imagePathForHub(imagePath) {
  return String(imagePath || '').replace('../../', '../');
}

function getDisplayName(projectName, overrides) {
  const projectOverride = lookupByName(overrides.projectOverrides, projectName);
  if (projectOverride && projectOverride.name) return projectOverride.name;

  const nameOverride = lookupByName(overrides.nameOverrides, projectName);
  if (nameOverride) return nameOverride;

  return projectName;
}

function getIndustry(projectName, existingIndustry, overrides) {
  const projectOverride = lookupByName(overrides.projectOverrides, projectName);
  if (projectOverride && projectOverride.industry) return projectOverride.industry;

  const industryOverride = lookupByName(overrides.industryOverrides, projectName);
  if (industryOverride) return industryOverride;

  return existingIndustry || 'Business';
}

function makeDescription(project, index) {
  const name = project.name || 'this project';
  const industry = project.industry || 'Business';
  const services = (project.services || []).filter(Boolean);
  const serviceText = services.length
    ? services.slice(0, 2).join(' and ')
    : 'website design';

  const focusWords = [
    'trust',
    'clarity',
    'local visibility',
    'visitor confidence',
    'lead generation',
    'mobile usability',
    'professional presentation',
    'brand credibility',
    'service discovery',
    'conversion flow',
    'customer education',
    'online growth'
  ];

  const focus = focusWords[index % focusWords.length];

  const variations = [
    `${name} presents a ${industry.toLowerCase()} website experience centered on ${focus}, simple navigation, and practical next steps for visitors.`,
    `For ${name}, WebAct organized the message around ${serviceText.toLowerCase()}, helping visitors understand the business quickly and move toward contact.`,
    `This ${industry.toLowerCase()} example gives ${name} a stronger digital presence with focused content, polished visuals, and a layout built for real customer action.`,
    `${name} uses a tailored page structure to explain services, support ${focus}, and make the business easier to evaluate on desktop and mobile.`,
    `The ${name} project shows how a ${industry.toLowerCase()} brand can communicate value with cleaner content, stronger first impressions, and clear calls to action.`,
    `WebAct shaped ${name} around a more useful visitor journey, combining ${serviceText.toLowerCase()} with design choices that support confidence and inquiries.`,
    `This portfolio example highlights ${name} with industry-specific messaging, organized service details, and a website presentation built to feel credible from the first visit.`,
    `${name} is designed to help visitors understand the offer, compare the business more easily, and take the next step without confusion.`,
    `The website direction for ${name} balances brand personality with practical conversion goals, giving the ${industry.toLowerCase()} project a more complete online presence.`,
    `For this ${industry.toLowerCase()} case study, WebAct focused on making ${name} easier to find, easier to understand, and easier to contact.`,
    `${name} demonstrates a cleaner approach to ${industry.toLowerCase()} web design, using concise sections, relevant service language, and a layout that supports action.`,
    `This project gives ${name} a more polished online showcase while emphasizing ${focus}, customer understanding, and a smoother path to inquiry.`
  ];

  return variations[index % variations.length];
}

function normalizeProject(rawProject, index, overrides) {
  const originalName = rawProject.name || '';
  const projectOverride = lookupByName(overrides.projectOverrides, originalName) || {};

  const name = projectOverride.name || getDisplayName(originalName, overrides);
  const industry = projectOverride.industry || getIndustry(originalName, rawProject.industry, overrides);
  const services =
    rawProject.services && rawProject.services.length
      ? rawProject.services
      : legacyServices(industry);

  const description =
    projectOverride.description ||
    rawProject.description ||
    rawProject.desc ||
    makeDescription({ name, industry, services }, index);

  const seoTitle =
    projectOverride.seoTitle ||
    (projectOverride.seo && projectOverride.seo.title) ||
    `${name} Website Design Case Study | WebAct ${industry} Portfolio`;

  const seoDescription =
    projectOverride.seoDescription ||
    (projectOverride.seo && projectOverride.seo.description) ||
    `Explore the ${name} case study from WebAct, including ${industry.toLowerCase()} website strategy, services, features, and project details.`;

  const featured =
    Boolean(projectOverride.featured) ||
    overrides.featuredProjects.includes(name) ||
    overrides.featuredProjects.includes(normalizeName(name));

  return {
    ...rawProject,
    originalName,
    name,
    slug: rawProject.slug || slug(originalName),
    industry,
    image: rawProject.image || rawProject.img || '',
    previewUrl: rawProject.previewUrl || rawProject.url || '',
    liveUrl: rawProject.liveUrl || '',
    services,
    features:
      rawProject.features && rawProject.features.length
        ? rawProject.features
        : [
            'Mobile Responsive',
            'Clear Calls To Action',
            'Service-Focused Content',
            'Fast Loading Pages',
            'SEO-Friendly Structure'
          ],
    technologies:
      rawProject.technologies && rawProject.technologies.length
        ? rawProject.technologies
        : [
            'HTML5',
            'CSS3',
            'JavaScript',
            'Responsive Design',
            'Local SEO',
            'Performance Optimization'
          ],
    description,
    seoTitle,
    seoDescription,
    featured,
    override: projectOverride
  };
}

function loadProjects() {
  const overrides = readOverrides(overridesPath);
  const master = readWindowAssignment(masterPath, 'webactPortfolioMaster');
  const rows = readWindowAssignment(rowsPath, 'webactPortfolioRows');

  if (master && master.length) {
    return master.map((project, index) =>
      normalizeProject(project, index, overrides)
    );
  }

  if (rows && rows.length) {
    return rows.map((row, index) =>
      normalizeProject(
        {
          name: row[0],
          slug: slug(row[0]),
          industry: row[1],
          image: row[2],
          previewUrl: row[3],
          services: legacyServices(row[1])
        },
        index,
        overrides
      )
    );
  }

  return [];
}

const hubDefinitions = [
  {
    industry: 'Restaurant',
    folder: 'best-restaurant-website-designs',
    title: 'Best Restaurant Website Designs',
    h1: 'Best Restaurant Website Designs',
    intro:
      'Explore restaurant website designs built to present menus, locations, ordering paths, brand personality, and customer confidence.',
    cta: 'Grow Your Restaurant Online'
  },
  {
    industry: 'Dentist',
    folder: 'best-dental-website-designs',
    title: 'Best Dental Website Designs',
    h1: 'Best Dental Website Designs',
    intro:
      'Browse dental website designs focused on patient trust, service clarity, appointment requests, and modern practice presentation.',
    cta: 'Build a Modern Dental Website'
  },
  {
    industry: 'Roofing',
    folder: 'best-roofing-website-designs',
    title: 'Best Roofing Website Designs',
    h1: 'Best Roofing Website Designs',
    intro:
      'Review roofing website designs created to build homeowner confidence, explain services, and generate qualified roofing leads.',
    cta: 'Generate More Roofing Leads'
  },
  {
    industry: 'Legal',
    folder: 'best-law-firm-website-designs',
    title: 'Best Law Firm Website Designs',
    h1: 'Best Law Firm Website Designs',
    intro:
      'See law firm website designs that communicate authority, practice focus, trust, and clear inquiry paths.',
    cta: 'Create a Law Firm Website'
  },
  {
    industry: 'Ecommerce',
    folder: 'best-ecommerce-website-designs',
    title: 'Best Ecommerce Website Designs',
    h1: 'Best Ecommerce Website Designs',
    intro:
      'Explore ecommerce and retail website designs built to present products, offers, customer value, and conversion-focused next steps.',
    cta: 'Launch a Better Ecommerce Website'
  }
];

function projectCard(project) {
  return `
    <article class="portfolio-card">
      <a href="../case-study.html?project=${escapeHtml(project.slug)}">
        <div class="portfolio-browser">
          <div class="browser-bar">
            <i class="browser-dot"></i>
            <i class="browser-dot"></i>
            <i class="browser-dot"></i>
            <span class="browser-url">webact portfolio</span>
          </div>
          <div class="portfolio-thumb">
            <img src="${escapeHtml(imagePathForHub(project.image))}" alt="${escapeHtml(project.name)} website design screenshot" loading="lazy">
          </div>
        </div>

        <div class="portfolio-card-body">
          <div class="portfolio-meta">
            <span>${escapeHtml(project.industry)}</span>
          </div>
          <h3>${escapeHtml(project.name)}</h3>
          <p>${escapeHtml(project.description)}</p>
          <div class="portfolio-actions">
            <strong>View Case Study</strong>
          </div>
        </div>
      </a>
    </article>`;
}

function relatedIndustryLinks(currentFolder) {
  return hubDefinitions
    .filter(hub => hub.folder !== currentFolder)
    .map(
      hub =>
        `<a href="../${hub.folder}/">${escapeHtml(hub.title)}</a>`
    )
    .join('');
}

function hubPage(definition, projects) {
  const cards = projects.map(projectCard).join('\n');

  const relatedLinks = relatedIndustryLinks(definition.folder);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(definition.title)} | WebAct Portfolio</title>
<meta name="description" content="${escapeHtml(definition.intro)}">
<link rel="canonical" href="https://www.webact.com/about/portfolio/${definition.folder}/">
<link rel="stylesheet" href="../../../styles.css?v=reviews-layout-fix">
<link rel="stylesheet" href="../../../assets/css/webact-promodo-nav.css">
<link rel="stylesheet" href="../portfolio-premium.css?v=seo-hubs-v2">
<style>
.seo-hub-intro{
  max-width:1220px;
  margin:0 auto;
  padding:42px 22px 0;
}

.seo-hub-intro-card{
  background:#fff;
  border:1px solid #dfe8ef;
  border-radius:24px;
  padding:30px;
  box-shadow:0 16px 48px rgba(7,25,39,.08);
}

.seo-hub-intro-card h2{
  margin:0 0 14px;
  font-size:34px;
  letter-spacing:-.03em;
}

.seo-hub-intro-card p{
  color:#4f6372;
  font-size:17px;
  line-height:1.7;
  margin:0;
}

.seo-hub-links{
  max-width:1220px;
  margin:0 auto 70px;
  padding:0 22px;
}

.seo-hub-links-card{
  background:#071927;
  color:#fff;
  border-radius:26px;
  padding:34px;
  box-shadow:0 28px 80px rgba(7,25,39,.14);
}

.seo-hub-links-card h2{
  margin:0 0 18px;
  font-size:34px;
  letter-spacing:-.03em;
}

.seo-hub-links-list{
  display:flex;
  flex-wrap:wrap;
  gap:12px;
}

.seo-hub-links-list a{
  display:inline-flex;
  border:1px solid rgba(255,255,255,.18);
  background:rgba(255,255,255,.08);
  color:#fff;
  border-radius:999px;
  padding:10px 14px;
  font-weight:900;
}
</style>
</head>

<body class="portfolio-page">
<header class="wa-promodo-header" data-wa-nav>
  <nav class="wa-promodo-nav" aria-label="Main navigation">
    <a class="wa-promodo-logo" href="../../../index.html" aria-label="WebAct home">
      <img src="../../../assets/images/webact-logo.png" alt="WebAct">
    </a>

    <ul class="wa-promodo-menu" data-wa-menu>
      <li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../design/website-design/index.html">Website Design</a></li>
      <li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../digital-ads/index.html">Digital Ads</a></li>
      <li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../marketing/index.html">Marketing</a></li>
      <li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../industries/index.html">Industries</a></li>
      <li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../pricing/index.html">Pricing</a></li>
      <li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../contact/index.html">Contact Us</a></li>
    </ul>

    <div class="wa-promodo-actions">
      <a class="wa-promodo-cta" href="../../../contact/index.html">Get Started</a>
      <button class="wa-promodo-toggle" type="button" aria-label="Open navigation" aria-expanded="false" data-wa-menu-toggle>
        <span></span>
      </button>
    </div>
  </nav>
</header>

<section class="portfolio-hero">
  <div class="portfolio-hero-inner">
    <div>
      <p class="eyebrow">WebAct SEO Portfolio Hub</p>
      <h1>${escapeHtml(definition.h1)}</h1>
      <p>${escapeHtml(definition.intro)} These examples are pulled from the WebAct top 250 website design portfolio.</p>

      <div class="hero-actions">
        <a class="explorer-btn" href="../">Back to Portfolio</a>
        <a class="explorer-btn explorer-btn-secondary" href="../../../contact/index.html">${escapeHtml(definition.cta)}</a>
      </div>
    </div>

    <div class="hero-panel">
      <strong>${projects.length}</strong>
      <span>${escapeHtml(definition.industry)} examples</span>
      <span>Case studies selected from WebAct portfolio data.</span>
    </div>
  </div>
</section>

<section class="seo-hub-intro">
  <div class="seo-hub-intro-card">
    <h2>${escapeHtml(definition.title)} from WebAct</h2>
    <p>
      This portfolio hub brings together WebAct examples for businesses in the ${escapeHtml(definition.industry)} category.
      Each case study connects visual presentation, service clarity, mobile-friendly structure, and conversion-focused website design.
    </p>
  </div>
</section>

<main class="portfolio-main">
  <div class="toolbar">
    <div>
      <h2>${escapeHtml(definition.industry)} Case Studies</h2>
      <p class="result-count">Showing ${projects.length} projects</p>
    </div>
  </div>

  <section class="portfolio-grid">
    ${cards || '<p>No projects found yet.</p>'}
  </section>
</main>

<section class="seo-hub-links">
  <div class="seo-hub-links-card">
    <h2>Explore More Website Design Examples</h2>
    <div class="seo-hub-links-list">
      ${relatedLinks}
      <a href="../">View All Portfolio Projects</a>
    </div>
  </div>
</section>

<footer class="site-footer">
  <img src="../../../assets/logo.png" alt="WebAct">
  <p>Website design, advertising, marketing, widgets, domains, and email for small and medium-sized businesses.</p>
  <div class="footer-links">
    <a href="../../../design/index.html">Design</a>
    <a href="../../../digital-ads/index.html">Digital Ads</a>
    <a href="../../../marketing/index.html">Marketing</a>
    <a href="../../../pricing/index.html">Pricing</a>
    <a href="../../../addons/index.html">Add-ons</a>
  </div>
</footer>

<script src="../../../script.js?v=reviews-layout-fix"></script>
<script src="../../../assets/js/webact-promodo-nav.js" defer></script>
</body>
</html>`;
}

function generateHub(definition, allProjects) {
  const selectedProjects = allProjects
    .filter(project => project.industry === definition.industry)
    .sort((a, b) => a.name.localeCompare(b.name));

  const folderPath = path.join(portfolioDir, definition.folder);

  fs.mkdirSync(folderPath, { recursive: true });

  const filePath = path.join(folderPath, 'index.html');

  fs.writeFileSync(
    filePath,
    hubPage(definition, selectedProjects),
    'utf8'
  );

  console.log(
    `Generated ${definition.title}: ${selectedProjects.length} projects`
  );
}

function generateAllHubs() {
  const projects = loadProjects();

  if (!projects.length) {
    console.warn('No portfolio projects found.');
    return;
  }

  hubDefinitions.forEach(definition => {
    generateHub(definition, projects);
  });

  console.log('Generated portfolio SEO hub pages.');
}

generateAllHubs();