$ErrorActionPreference = "Stop"

$contentJsPath = ".\assets\js\portfolio-content.js"
$casePath = ".\about\portfolio\case-study.html"

$contentJs = @'
window.webactPortfolioContentEngine = (function () {
  function slugify(text) {
    return String(text || "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }

  function hashText(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
      h = ((h << 5) - h) + text.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function pick(list, seed, count) {
    const copy = list.slice();
    const out = [];
    let s = seed || 1;
    while (copy.length && out.length < count) {
      const index = s % copy.length;
      out.push(copy.splice(index, 1)[0]);
      s = Math.floor(s / 7) + 17;
    }
    return out;
  }

  const industryMap = {
    restaurant: {
      audience: "local diners, takeout customers, catering customers, tourists, and mobile users searching nearby",
      needs: "Restaurant websites need clear menus, location information, ordering options, strong food presentation, reviews, and fast mobile access.",
      services: ["restaurant website design", "menu organization", "local SEO", "Google Business Profile support", "online ordering strategy", "review visibility", "mobile-first design", "conversion-focused calls to action"]
    },
    dental: {
      audience: "new patients, families, emergency dental patients, and people comparing dental providers",
      needs: "Dental websites need patient trust, treatment education, appointment paths, local search visibility, and clear explanations of services.",
      services: ["dental website design", "local SEO", "treatment page planning", "appointment conversion paths", "patient education content", "Google Ads strategy", "review management", "mobile-friendly design"]
    },
    dentist: {
      audience: "new patients, families, emergency dental patients, and people comparing dental providers",
      needs: "Dentist websites need patient trust, treatment education, appointment paths, local search visibility, and clear explanations of services.",
      services: ["dentist website design", "local SEO", "treatment page planning", "appointment conversion paths", "patient education content", "Google Ads strategy", "review management", "mobile-friendly design"]
    },
    legal: {
      audience: "people comparing attorneys, researching practice areas, and looking for consultation options",
      needs: "Legal websites need authority, practice area clarity, trust-building content, consultation calls to action, and local SEO.",
      services: ["law firm website design", "practice area pages", "local SEO", "consultation conversion strategy", "attorney credibility content", "Google Ads support", "lead generation", "mobile-friendly design"]
    },
    roofing: {
      audience: "homeowners, property managers, storm damage leads, and customers needing repairs or replacement",
      needs: "Roofing websites need service area visibility, estimate requests, emergency repair messaging, project proof, and strong local SEO.",
      services: ["roofing website design", "local SEO", "estimate request forms", "storm damage landing pages", "Google Ads support", "service area content", "review strategy", "mobile call paths"]
    },
    construction: {
      audience: "homeowners, builders, commercial clients, property managers, and customers comparing contractors",
      needs: "Construction websites need project credibility, service explanations, estimate paths, galleries, local visibility, and trust signals.",
      services: ["construction website design", "project gallery planning", "estimate conversion paths", "local SEO", "service area pages", "Google Ads support", "brand messaging", "mobile-friendly design"]
    },
    healthcare: {
      audience: "patients, families, caregivers, referral partners, and people researching care options",
      needs: "Healthcare websites need trust, clarity, service education, appointment paths, accessible content, and a calm user experience.",
      services: ["healthcare website design", "patient-friendly content", "local SEO", "appointment conversion paths", "service education pages", "reputation support", "mobile-friendly design", "content organization"]
    },
    "health care": {
      audience: "patients, families, caregivers, referral partners, and people researching care options",
      needs: "Health care websites need trust, clarity, service education, appointment paths, accessible content, and a calm user experience.",
      services: ["health care website design", "patient-friendly content", "local SEO", "appointment conversion paths", "service education pages", "reputation support", "mobile-friendly design", "content organization"]
    },
    ecommerce: {
      audience: "online shoppers, repeat customers, product researchers, and mobile buyers",
      needs: "Ecommerce websites need product clarity, shopping confidence, category structure, conversion strategy, and mobile purchase paths.",
      services: ["ecommerce website design", "product page planning", "category structure", "shopping conversion strategy", "SEO content", "digital advertising support", "mobile shopping UX", "landing page planning"]
    },
    hvac: {
      audience: "homeowners needing heating, cooling, repair, maintenance, or emergency service",
      needs: "HVAC websites need seasonal service visibility, emergency calls, local SEO, repair pages, and fast mobile contact paths.",
      services: ["HVAC website design", "local SEO", "service area pages", "emergency call paths", "Google Ads support", "seasonal landing pages", "review strategy", "mobile-friendly design"]
    },
    plumbing: {
      audience: "customers needing plumbing repairs, installation, drain cleaning, or emergency service",
      needs: "Plumbing websites need urgent service visibility, phone call paths, local SEO, service pages, and trust-building proof.",
      services: ["plumbing website design", "local SEO", "emergency service pages", "Google Ads support", "phone call conversion paths", "service area content", "review visibility", "mobile-friendly design"]
    },
    default: {
      audience: "customers researching services, comparing providers, and looking for a trusted business online",
      needs: "Business websites need clear messaging, professional design, mobile usability, SEO structure, and conversion-focused calls to action.",
      services: ["website design", "responsive design", "local SEO", "content organization", "Google Ads support", "landing page planning", "brand messaging", "website support"]
    }
  };

  function getIndustry(industry) {
    return industryMap[String(industry || "").toLowerCase()] || industryMap.default;
  }

  function generate(row, allRows) {
    const name = row[0] || "Portfolio Project";
    const industry = row[1] || "Business";
    const image = row[2] || "/webact-redesign/Resources/images/placeholder.png";
    const seed = hashText(name + industry);
    const plan = getIndustry(industry);
    const services = pick(plan.services, seed, 6);

    const related = allRows
      .filter(r => r[1] === industry && slugify(r[0]) !== slugify(name))
      .slice(0, 6);

    return {
      name,
      industry,
      image,
      title: name + " Website Design Case Study",
      category: industry + " Website Design",
      summary: name + " is a WebAct " + industry.toLowerCase() + " website design case study built for " + plan.audience + ". The project highlights how WebAct uses website design, SEO, digital marketing, and customer-focused page strategy to help businesses create a stronger online presence.",
      sections: [
        {
          eyebrow: "Project Overview",
          title: "A stronger website presence for " + name + ".",
          text: "For " + name + ", WebAct focused on building a website experience that helps visitors quickly understand the business, its services, and the next step to take. In the " + industry.toLowerCase() + " industry, customers often compare several options before making contact, so the site needed to support credibility, clarity, and action. The project combines professional design, responsive layouts, organized content, and search-friendly page structure."
        },
        {
          eyebrow: "Industry Strategy",
          title: "Why " + industry.toLowerCase() + " businesses need a strong website.",
          text: plan.needs + " For " + name + ", the website needed to do more than look modern. It needed to communicate trust, organize service information, support mobile users, and give potential customers a clear reason to contact the business."
        },
        {
          eyebrow: "Website Design Services",
          title: "Website design built around customer action.",
          text: "WebAct planned the design around usability, brand trust, and conversion. The layout helps visitors move from the homepage into relevant content without confusion. Navigation, headings, visual hierarchy, page flow, and call-to-action placement were all considered so the site could support real business goals instead of simply acting as an online brochure."
        },
        {
          eyebrow: "SEO Strategy",
          title: "Search-friendly structure for long-term visibility.",
          text: "The SEO direction for " + name + " focuses on industry relevance, clear headings, service-focused language, internal page structure, and content that helps search engines understand what the business offers. For a " + industry.toLowerCase() + " business, this kind of foundation can support stronger local visibility, better indexing, and more useful search results over time."
        },
        {
          eyebrow: "Marketing and Advertising",
          title: "Digital marketing support beyond the website.",
          text: "This project can support additional growth services such as " + services.join(", ") + ". These services help connect the website to a broader marketing strategy, including search visibility, paid traffic, better landing pages, reputation signals, and clearer messaging for customers who are ready to take action."
        },
        {
          eyebrow: "Mobile Experience",
          title: "Designed for visitors on every device.",
          text: "Many visitors reach a business website from a phone. WebAct structured the " + name + " website experience so key information remains easy to read, service content is simple to browse, and important contact actions are accessible across desktop, tablet, and mobile screens."
        },
        {
          eyebrow: "Results Focus",
          title: "A better foundation for leads, trust, and growth.",
          text: "Rather than claiming fake performance numbers, this case study focuses on the practical improvements a stronger website can provide: clearer service presentation, improved professionalism, better mobile usability, stronger SEO structure, more visible calls to action, and a more trustworthy first impression for potential customers."
        }
      ],
      services,
      related
    };
  }

  return { slugify, generate };
})();
'@

Set-Content $contentJsPath $contentJs -NoNewline -Encoding UTF8

$caseHtml = @'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Portfolio Case Study | WebAct</title>
  <meta name="description" content="View a WebAct website design, SEO, marketing, and advertising case study.">
  <link rel="stylesheet" href="/webact-redesign/styles.css?v=main-layout-1">
  <link rel="stylesheet" href="/webact-redesign/assets/css/webact-promodo-nav.css?v=main-layout-1">
  <link rel="stylesheet" href="/webact-redesign/assets/css/webact-footer.css?v=main-layout-1">
  <style>
    html,body{height:auto!important;overflow-x:hidden!important;overflow-y:auto!important}
    body{margin:0}.case-page{background:#fff;color:#071421}
    .case-hero{background:radial-gradient(circle at 12% 18%,rgba(51,171,225,.24),transparent 30%),linear-gradient(135deg,#061421,#0d2740 52%,#071421);color:#fff;padding:100px min(6vw,72px);display:grid;grid-template-columns:minmax(0,1.05fr) minmax(360px,.85fr);gap:54px;align-items:center}
    .case-hero h1{font-size:clamp(42px,6vw,76px);line-height:.98;margin:12px 0 22px;letter-spacing:-.05em;color:#fff}.case-hero p{color:#d9edf8;font-size:20px;line-height:1.65}
    .eyebrow{letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#73d7ff}.case-media{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:30px;padding:14px;box-shadow:0 30px 80px rgba(0,0,0,.28)}
    .case-media img{width:100%;height:430px;object-fit:cover;border-radius:22px;display:block;background:#fff}
    .hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}.button{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:210px!important;min-height:56px!important;padding:14px 24px!important;border-radius:14px!important;font-weight:900!important;text-decoration:none!important}
    .button.primary{background:#33abe1!important;border:2px solid #33abe1!important;color:#061421!important}.button.secondary{background:#fff!important;border:2px solid #fff!important;color:#071421!important}
    .case-section{padding:78px min(6vw,72px)}.case-section.alt{background:#f4f8fb}
    .case-copy{max-width:1100px;margin:0 auto}.case-copy .eyebrow{color:#0c9bd2}.case-copy h2{font-size:clamp(32px,4vw,56px);line-height:1;margin:10px 0 20px;letter-spacing:-.04em}.case-copy p{font-size:19px;line-height:1.85;color:#4b5b66;margin:0}
    .service-grid,.related-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;max-width:1300px;margin:32px auto 0}.service-card,.related-card{background:#fff;border:1px solid #e0ebf2;border-radius:24px;padding:24px;box-shadow:0 18px 42px rgba(7,20,33,.08);text-decoration:none;color:#071421}.service-card h3,.related-card h3{margin:0;color:#071421;font-size:22px}
    .related-card img{width:100%;height:210px;object-fit:cover;border-radius:18px;margin-bottom:18px;background:#dcecf5}.related-card span{display:inline-block;margin-bottom:10px;background:#eaf8fe;color:#0c658c;border:1px solid #bfe8f7;border-radius:999px;padding:8px 12px;font-weight:900;font-size:12px;text-transform:uppercase}
    .final-cta{background:linear-gradient(135deg,#0b243a,#071421);color:#fff;text-align:center;padding:86px min(6vw,72px)}.final-cta h2{font-size:clamp(34px,5vw,62px);line-height:1;margin:0 0 16px}.final-cta p{color:#d4e8f2;font-size:19px;line-height:1.6;max-width:780px;margin:0 auto}.final-cta .hero-actions{justify-content:center}
    @media(max-width:1080px){.case-hero{grid-template-columns:1fr}.service-grid,.related-grid{grid-template-columns:1fr 1fr}.case-media img{height:auto}}
    @media(max-width:680px){.case-hero,.case-section,.final-cta{padding:56px 20px}.service-grid,.related-grid{grid-template-columns:1fr}.hero-actions .button{width:100%}}
  </style>
</head>
<body class="case-page">
<div id="webact-header"></div>
<main>
  <section class="case-hero">
    <div>
      <p class="eyebrow" id="case-category">Portfolio Case Study</p>
      <h1 id="case-title">Website Design Case Study</h1>
      <p id="case-summary"></p>
      <div class="hero-actions">
        <a class="button primary" href="/webact-redesign/contact/index.html">Start a Project</a>
        <a class="button secondary" href="/webact-redesign/about/portfolio.html">Back to Portfolio</a>
      </div>
    </div>
    <div class="case-media"><img id="case-image" src="/webact-redesign/Resources/images/placeholder.png" alt="WebAct portfolio project"></div>
  </section>
  <div id="case-sections"></div>
  <section class="case-section alt">
    <div class="case-copy">
      <p class="eyebrow">Services WebAct Can Provide</p>
      <h2 id="services-title">Website, SEO, and marketing services.</h2>
      <p id="services-intro"></p>
    </div>
    <div class="service-grid" id="service-grid"></div>
  </section>
  <section class="case-section">
    <div class="case-copy">
      <p class="eyebrow">Related Portfolio Work</p>
      <h2>More WebAct website design examples.</h2>
      <p id="related-intro"></p>
    </div>
    <div class="related-grid" id="related-grid"></div>
  </section>
  <section class="final-cta">
    <h2 id="cta-title">Need a website like this?</h2>
    <p id="cta-text"></p>
    <div class="hero-actions">
      <a class="button primary" href="/webact-redesign/contact/index.html">Contact WebAct</a>
      <a class="button secondary" href="/webact-redesign/design/index.html">View Design Services</a>
    </div>
  </section>
</main>
<div id="webact-footer"></div>
<script src="/webact-redesign/assets/js/portfolio-data-all.js"></script>
<script src="/webact-redesign/assets/js/portfolio-content.js"></script>
<script>
(function(){
  const rows = window.webactPortfolioRows || [];
  const engine = window.webactPortfolioContentEngine;
  if(!rows.length || !engine) return;
  const slug = new URLSearchParams(location.search).get("project") || "";
  const row = rows.find(r => engine.slugify(r[0]) === slug) || rows[0];
  const c = engine.generate(row, rows);

  document.title = c.name + " " + c.industry + " Website Design, SEO and Marketing Case Study | WebAct";
  document.getElementById("case-category").textContent = c.category;
  document.getElementById("case-title").textContent = c.title;
  document.getElementById("case-summary").textContent = c.summary;
  document.getElementById("case-image").src = c.image;
  document.getElementById("case-image").alt = c.name + " " + c.industry + " website design";

  const sections = document.getElementById("case-sections");
  c.sections.forEach(function(s,i){
    sections.insertAdjacentHTML("beforeend", '<section class="case-section '+(i%2?'alt':'')+'"><div class="case-copy"><p class="eyebrow">'+s.eyebrow+'</p><h2>'+s.title+'</h2><p>'+s.text+'</p></div></section>');
  });

  document.getElementById("services-title").textContent = "Services connected to the " + c.name + " project.";
  document.getElementById("services-intro").textContent = "These are the types of website, SEO, marketing, and advertising services WebAct can use to support a " + c.industry.toLowerCase() + " website project.";
  document.getElementById("service-grid").innerHTML = c.services.map(function(s){return '<article class="service-card"><h3>'+s+'</h3></article>';}).join("");

  document.getElementById("related-intro").textContent = "Browse additional WebAct portfolio examples related to " + c.industry.toLowerCase() + " websites and similar business categories.";
  const relatedGrid = document.getElementById("related-grid");
  relatedGrid.innerHTML = c.related.map(function(r){
    return '<a class="related-card" href="/webact-redesign/about/portfolio/case-study.html?project='+engine.slugify(r[0])+'"><img src="'+r[2]+'" alt="'+r[0]+' website design"><span>'+r[1]+'</span><h3>'+r[0]+'</h3></a>';
  }).join("") || '<p style="grid-column:1/-1;color:#4b5b66;font-size:18px;text-align:center">More related projects will be added soon.</p>';

  document.getElementById("cta-title").textContent = "Need a " + c.industry.toLowerCase() + " website like " + c.name + "?";
  document.getElementById("cta-text").textContent = "WebAct can help with website design, SEO, digital advertising, landing pages, branding, local visibility, and ongoing website support for businesses in this industry.";
})();
</script>
<script src="/webact-redesign/script.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/routes.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/navigation.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/includes.js?v=main-layout-1"></script>
</body>
</html>
'@

Set-Content $casePath $caseHtml -NoNewline -Encoding UTF8

git add assets/js/portfolio-content.js about/portfolio/case-study.html tools/migrate/Build-Advanced-Portfolio-Case-Studies.ps1
git commit -m "Build advanced portfolio case study engine"
git push origin main