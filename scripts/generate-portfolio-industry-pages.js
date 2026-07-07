const fs = require('fs');
const path = require('path');

const root = process.cwd();
const portfolioDir = path.join(root, 'about', 'portfolio');
const masterPath = path.join(portfolioDir, 'portfolio-master-data.js');
const industryRoot = path.join(portfolioDir, 'industry');

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

function readMasterData() {
  const text = fs.readFileSync(masterPath, 'utf8');
  const json = text
    .replace(/^window\.webactPortfolioMaster\s*=\s*/, '')
    .replace(/;\s*$/, '');

  return JSON.parse(json);
}

function industryIntro(industry, count) {
  const intros = {
    'Restaurant': `Explore WebAct restaurant website design projects built to showcase menus, locations, food photography, and local search visibility.`,
    'Dental': `Explore dental website design examples focused on patient trust, service pages, appointment calls to action, and local SEO.`,
    'Legal': `Explore law firm and legal website design projects built to communicate trust, practice areas, and client inquiry paths.`,
    'Home Services': `Explore home services website design projects for contractors, repair companies, remodelers, inspectors, and service-area businesses.`,
    'Healthcare': `Explore healthcare website design projects focused on trust, clarity, service education, and patient inquiry paths.`,
    'Pet Services': `Explore pet service website design projects for breeders, groomers, trainers, boarding companies, and animal-focused businesses.`,
    'Professional Services': `Explore professional services website design projects built for consulting, insurance, sales, finance, and business service companies.`,
    'Nonprofit': `Explore nonprofit website design projects focused on mission clarity, community trust, events, and donation-ready messaging.`,
    'Technology': `Explore technology website design projects built to explain products, services, platforms, and customer value clearly.`,
    'Driving School': `Explore driving school website design projects built for program details, enrollment paths, local visibility, and student trust.`,
    'Water Treatment': `Explore water treatment website design projects focused on product education, service credibility, and lead generation.`,
    'Printing & Graphics': `Explore printing and graphics website design projects built to showcase services, portfolios, signs, wraps, and quote requests.`,
    'Electrical': `Explore electrical website design projects built for service-area visibility, trust, and estimate requests.`,
    'Energy': `Explore energy website design projects focused on sustainability, services, education, and lead generation.`,
    'Pest Control': `Explore pest control website design projects built for local SEO, service pages, trust, and estimate requests.`
  };

  return intros[industry] || `Explore ${count} WebAct ${industry} website design projects built to help businesses present their services clearly and generate customer inquiries.`;
}

function servicesForIndustry(projects) {
  const set = new Set();

  projects.forEach(project => {
    (project.services || []).forEach(service => set.add(service));
  });

  return Array.from(set).slice(0, 8);
}

function card(project) {
  return `
<a class="industry-card" href="../case-study.html?project=${project.slug}">
  <div class="industry-browser">
    <div class="industry-bar"><i></i><i></i><i></i><span>webact portfolio</span></div>
    <img src="../${project.image.replace('../../', '')}" alt="${escapeHtml(project.name)} website design screenshot" loading="lazy">
  </div>
  <div class="industry-card-body">
    <span>${escapeHtml(project.industry)}</span>
    <h3>${escapeHtml(project.name)}</h3>
    <p>${escapeHtml(project.description)}</p>
    <strong>View Case Study â†’</strong>
  </div>
</a>`;
}

function page(industry, projects) {
  const industrySlug = slug(industry);
  const count = projects.length;
  const intro = industryIntro(industry, count);
  const services = servicesForIndustry(projects);
  const featured = projects.slice(0, 3);
  const title = `${industry} Website Design Portfolio | WebAct Case Studies`;
  const description = `Explore ${count} WebAct ${industry} website design case studies with project screenshots, services, features, and related portfolio examples.`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<link rel="canonical" href="https://www.webact.com/about/portfolio/industry/${industrySlug}/">
<link rel="stylesheet" href="../../../../styles.css?v=reviews-layout-fix">
<link rel="stylesheet" href="../../../../assets/css/webact-promodo-nav.css">
<style>
:root{--blue:#27a8e0;--dark:#071927;--text:#4f6372;--muted:#6b7b88;--line:#dfe8ef;--soft:#f5fafd;--shadow:0 20px 60px rgba(7,25,39,.1)}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--dark);font-family:Inter,Arial,Helvetica,sans-serif;overflow-x:hidden}
a{color:inherit;text-decoration:none}
.industry-hero{background:linear-gradient(180deg,#eef8fd 0%,#fff 100%);border-bottom:1px solid var(--line)}
.industry-hero-inner{max-width:1180px;margin:0 auto;padding:76px 22px 58px;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:36px;align-items:end}
.eyebrow{margin:0 0 14px;color:var(--blue);font-weight:900;text-transform:uppercase;font-size:13px;letter-spacing:.08em}
.industry-hero h1{margin:0;font-size:clamp(42px,7vw,82px);line-height:.95;letter-spacing:-.05em}
.industry-hero p{margin:20px 0 0;color:var(--text);font-size:20px;line-height:1.6;max-width:760px}
.industry-stat{background:#fff;border:1px solid var(--line);border-radius:24px;padding:26px;box-shadow:var(--shadow)}
.industry-stat strong{display:block;color:var(--blue);font-size:54px;line-height:1}
.industry-stat span{display:block;margin-top:8px;color:var(--muted);font-weight:900}
.industry-main{max-width:1180px;margin:0 auto;padding:46px 22px 82px}
.industry-services{display:flex;flex-wrap:wrap;gap:10px;margin:0 0 36px}
.industry-services span{display:inline-flex;padding:10px 14px;border-radius:999px;background:#eef8fd;color:#0f7eb3;font-weight:900;font-size:13px}
.section-title{margin:0 0 22px;font-size:38px;letter-spacing:-.04em}
.industry-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:26px}
.industry-card{display:flex;flex-direction:column;min-height:520px;border:1px solid var(--line);border-radius:22px;overflow:hidden;background:#fff;box-shadow:0 16px 48px rgba(7,25,39,.08);transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease}
.industry-card:hover{transform:translateY(-8px);box-shadow:0 28px 70px rgba(7,25,39,.16);border-color:var(--blue)}
.industry-browser{background:#eef5f9}
.industry-bar{display:flex;align-items:center;gap:8px;padding:12px 16px;background:#e4edf3;border-bottom:1px solid #d6e2ea}
.industry-bar i{width:10px;height:10px;border-radius:50%;background:#c5d1da}
.industry-bar i:nth-child(1){background:#ff5f56}.industry-bar i:nth-child(2){background:#ffbd2e}.industry-bar i:nth-child(3){background:#27c93f}
.industry-bar span{margin-left:8px;color:#70818d;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.08em}
.industry-browser img{display:block;width:100%;height:220px;object-fit:cover;background:#f3f7fa}
.industry-card-body{display:flex;flex-direction:column;flex:1;padding:24px}
.industry-card-body span{display:inline-flex;width:max-content;margin-bottom:12px;background:#e8f8fe;color:#0f7eb3;padding:7px 12px;border-radius:999px;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:.06em}
.industry-card-body h3{margin:0;font-size:24px;line-height:1.18;letter-spacing:-.03em}
.industry-card-body p{margin:14px 0 18px;color:var(--text);line-height:1.65;font-size:15px;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}
.industry-card-body strong{margin-top:auto;color:var(--blue);font-size:14px;text-transform:uppercase;letter-spacing:.08em}
.industry-cta{margin-top:58px;background:linear-gradient(135deg,#071927 0%,#0d344d 100%);color:#fff;border-radius:28px;padding:46px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;box-shadow:var(--shadow)}
.industry-cta h2{margin:0;font-size:42px;letter-spacing:-.04em}
.industry-cta p{margin:12px 0 0;color:#c3d6e0;font-size:18px;line-height:1.6}
.btn{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:14px 20px;background:var(--blue);color:#fff;font-weight:900}
.site-footer{border-top:1px solid var(--line);background:#071927;color:#fff;padding:32px 22px;text-align:center}
.site-footer img{max-width:170px}.footer-links{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin-top:18px;font-weight:900}
@media(max-width:980px){.industry-hero-inner,.industry-cta{grid-template-columns:1fr}.industry-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.industry-grid{grid-template-columns:1fr}.industry-cta{padding:30px}.industry-cta h2{font-size:32px}}
</style>
</head>
<body>
<header class="wa-promodo-header" data-wa-nav><nav class="wa-promodo-nav" aria-label="Main navigation"><a class="wa-promodo-logo" href="../../../../index.html" aria-label="WebAct home"><img src="../../../../assets/images/webact-logo.png" alt="WebAct"></a><ul class="wa-promodo-menu" data-wa-menu><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../../design/website-design/index.html">Website Design</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../../digital-ads/index.html">Digital Ads</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../../marketing/index.html">Marketing</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../../industries/index.html">Industries</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../../pricing/index.html">Pricing</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../../contact/index.html">Contact Us</a></li></ul><div class="wa-promodo-actions"><a class="wa-promodo-cta" href="../../../../contact/index.html">Get Started</a><button class="wa-promodo-toggle" type="button" aria-label="Open navigation" aria-expanded="false" data-wa-menu-toggle><span></span></button></div></nav></header>

<section class="industry-hero">
  <div class="industry-hero-inner">
    <div>
      <p class="eyebrow">WebAct Portfolio by Industry</p>
      <h1>${escapeHtml(industry)} Website Design</h1>
      <p>${escapeHtml(intro)}</p>
    </div>
    <div class="industry-stat">
      <strong>${count}</strong>
      <span>${escapeHtml(industry)} portfolio projects</span>
    </div>
  </div>
</section>

<main class="industry-main">
  <div class="industry-services">${services.map(service => `<span>${escapeHtml(service)}</span>`).join('')}</div>

  <h2 class="section-title">Featured ${escapeHtml(industry)} Projects</h2>
  <section class="industry-grid">${featured.map(card).join('')}</section>

  <h2 class="section-title" style="margin-top:48px;">All ${escapeHtml(industry)} Case Studies</h2>
  <section class="industry-grid">${projects.map(card).join('')}</section>

  <section class="industry-cta">
    <div>
      <h2>Need a ${escapeHtml(industry)} website?</h2>
      <p>WebAct builds professional websites designed to help businesses look credible, explain services clearly, and generate more customer inquiries.</p>
    </div>
    <a class="btn" href="../../../../contact/index.html">Start Your Project</a>
  </section>
</main>

<footer class="site-footer"><img src="../../../../assets/logo.png" alt="WebAct"><p>Website design, advertising, marketing, widgets, domains, and email for small and medium-sized businesses.</p><div class="footer-links"><a href="../../../../design/index.html">Design</a><a href="../../../../digital-ads/index.html">Digital Ads</a><a href="../../../../marketing/index.html">Marketing</a><a href="../../../../pricing/index.html">Pricing</a><a href="../../../../addons/index.html">Add-ons</a></div></footer>
<script src="../../../../script.js?v=reviews-layout-fix"></script>
<script src="../../../../assets/js/webact-promodo-nav.js" defer></script>
</body>
</html>`;
}

function indexPage(groups) {
  const industries = Array.from(groups.keys()).sort();

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Portfolio Industries | WebAct Website Design Case Studies</title>
<meta name="description" content="Browse WebAct website design portfolio projects by industry, including legal, dental, restaurants, healthcare, home services, pet services, and more.">
<link rel="canonical" href="https://www.webact.com/about/portfolio/industry/">
<link rel="stylesheet" href="../../../styles.css?v=reviews-layout-fix">
<link rel="stylesheet" href="../../../assets/css/webact-promodo-nav.css">
<style>
:root{--blue:#27a8e0;--dark:#071927;--text:#4f6372;--line:#dfe8ef;--soft:#f5fafd}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--dark);font-family:Inter,Arial,Helvetica,sans-serif}
a{text-decoration:none;color:inherit}
.industry-index{max-width:1180px;margin:0 auto;padding:76px 22px}
.industry-index h1{font-size:clamp(42px,7vw,82px);line-height:.95;letter-spacing:-.05em;margin:0 0 18px}
.industry-index p{color:var(--text);font-size:20px;line-height:1.6;max-width:780px}
.industry-list{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:34px}
.industry-link{border:1px solid var(--line);border-radius:22px;padding:26px;background:#fff;box-shadow:0 14px 40px rgba(7,25,39,.08);transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease}
.industry-link:hover{transform:translateY(-6px);box-shadow:0 24px 60px rgba(7,25,39,.15);border-color:var(--blue)}
.industry-link span{color:var(--blue);font-size:44px;font-weight:900}
.industry-link h2{margin:10px 0 8px;font-size:26px}
.industry-link p{font-size:15px;margin:0}
@media(max-width:900px){.industry-list{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.industry-list{grid-template-columns:1fr}}
</style>
</head>
<body>
<header class="wa-promodo-header" data-wa-nav><nav class="wa-promodo-nav" aria-label="Main navigation"><a class="wa-promodo-logo" href="../../../index.html" aria-label="WebAct home"><img src="../../../assets/images/webact-logo.png" alt="WebAct"></a><ul class="wa-promodo-menu" data-wa-menu><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../design/website-design/index.html">Website Design</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../digital-ads/index.html">Digital Ads</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../marketing/index.html">Marketing</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../industries/index.html">Industries</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../pricing/index.html">Pricing</a></li><li class="wa-promodo-item"><a class="wa-promodo-direct" href="../../../contact/index.html">Contact Us</a></li></ul><div class="wa-promodo-actions"><a class="wa-promodo-cta" href="../../../contact/index.html">Get Started</a><button class="wa-promodo-toggle" type="button" aria-label="Open navigation" aria-expanded="false" data-wa-menu-toggle><span></span></button></div></nav></header>
<main class="industry-index">
  <h1>Portfolio by Industry</h1>
  <p>Explore WebAct website design case studies by business category. Each industry page includes related portfolio projects, services, screenshots, and links to case studies.</p>
  <section class="industry-list">
    ${industries.map(industry => `<a class="industry-link" href="./${slug(industry)}/"><span>${groups.get(industry).length}</span><h2>${escapeHtml(industry)}</h2><p>View ${groups.get(industry).length} ${escapeHtml(industry)} website design projects.</p></a>`).join('')}
  </section>
</main>
<script src="../../../script.js?v=reviews-layout-fix"></script>
<script src="../../../assets/js/webact-promodo-nav.js" defer></script>
</body>
</html>`;
}

function main() {
  const projects = readMasterData();
  const groups = new Map();

  projects.forEach(project => {
    if (!groups.has(project.industry)) groups.set(project.industry, []);
    groups.get(project.industry).push(project);
  });

  fs.rmSync(industryRoot, { recursive: true, force: true });
  fs.mkdirSync(industryRoot, { recursive: true });

  for (const [industry, projectsForIndustry] of groups.entries()) {
    const dir = path.join(industryRoot, slug(industry));
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), page(industry, projectsForIndustry), 'utf8');
    console.log(`Generated ${industry}: ${projectsForIndustry.length} projects`);
  }

  fs.writeFileSync(path.join(industryRoot, 'index.html'), indexPage(groups), 'utf8');

  console.log(`Generated ${groups.size} industry pages.`);
}

main();