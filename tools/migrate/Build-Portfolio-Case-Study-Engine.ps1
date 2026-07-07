$ErrorActionPreference = "Stop"

$contentJsPath = ".\assets\js\portfolio-content.js"
$casePath = ".\about\portfolio\case-study.html"

$contentJs = @'
window.webactPortfolioContentEngine = (function () {
  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
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
      s = Math.floor(s / 7) + 13;
    }
    return out;
  }

  const industryPlans = {
    restaurant: {
      audience: "local diners, catering customers, mobile searchers, and people comparing nearby restaurants",
      services: ["menu structure", "local SEO", "mobile directions", "online ordering support", "review visibility", "location-focused content"],
      goals: ["increase calls and directions", "make the menu easier to browse", "improve local discovery", "build dining confidence"]
    },
    dentist: {
      audience: "new patients, families, and people comparing dental providers",
      services: ["treatment pages", "appointment calls to action", "patient trust content", "local SEO", "Google Ads support", "review strategy"],
      goals: ["increase appointment requests", "explain treatments clearly", "build patient trust", "improve local dental visibility"]
    },
    dental: {
      audience: "patients researching dental care, treatment options, and trusted providers",
      services: ["service page structure", "patient education", "appointment paths", "local SEO", "mobile-friendly design", "content organization"],
      goals: ["clarify treatments", "support appointment requests", "build patient confidence", "improve search relevance"]
    },
    legal: {
      audience: "people researching legal services, attorney credibility, and consultation options",
      services: ["practice area pages", "consultation calls to action", "authority-focused copy", "local SEO", "content strategy", "lead generation"],
      goals: ["build credibility", "explain practice areas", "support consultation requests", "improve local legal visibility"]
    },
    construction: {
      audience: "homeowners, property managers, and commercial customers comparing contractors",
      services: ["project presentation", "estimate requests", "service area SEO", "trust-building content", "gallery organization", "lead generation"],
      goals: ["showcase work", "increase estimate requests", "build trust", "improve local search visibility"]
    },
    roofing: {
      audience: "homeowners and property owners needing roof repair, replacement, or inspections",
      services: ["roofing service pages", "emergency repair visibility", "estimate forms", "local SEO", "Google Ads support", "trust signals"],
      goals: ["increase roofing leads", "make services easy to understand", "support urgent inquiries", "improve local rankings"]
    },
    ecommerce: {
      audience: "online shoppers comparing products, pricing, categories, and purchase options",
      services: ["product presentation", "category structure", "mobile shopping flow", "conversion strategy", "SEO content", "advertising support"],
      goals: ["improve product browsing", "support more sales", "reduce friction", "strengthen ecommerce visibility"]
    },
    healthcare: {
      audience: "patients, families, caregivers, and referral sources researching care options",
      services: ["patient-friendly content", "service education", "appointment paths", "local SEO", "trust-focused design", "accessibility-minded layout"],
      goals: ["build trust", "explain services", "support appointment requests", "improve patient experience"]
    },
    "health care": {
      audience: "patients, families, caregivers, and referral sources researching care options",
      services: ["patient-friendly content", "service education", "appointment paths", "local SEO", "trust-focused design", "accessibility-minded layout"],
      goals: ["build trust", "explain services", "support appointment requests", "improve patient experience"]
    },
    hvac: {
      audience: "homeowners needing heating, cooling, repair, replacement, or maintenance",
      services: ["HVAC service pages", "seasonal content", "emergency calls to action", "local SEO", "Google Ads support", "mobile contact paths"],
      goals: ["increase service calls", "support emergency searches", "explain repair options", "improve local visibility"]
    },
    plumbing: {
      audience: "customers needing plumbing repair, installation, emergency service, or maintenance",
      services: ["plumbing service pages", "emergency visibility", "phone call paths", "local SEO", "Google Ads support", "trust-building copy"],
      goals: ["increase calls", "support urgent service requests", "clarify services", "build local trust"]
    },
    default: {
      audience: "customers researching services, comparing providers, and looking for a trusted business online",
      services: ["website design", "SEO structure", "content organization", "conversion planning", "local visibility", "digital marketing support"],
      goals: ["build trust", "explain services", "increase leads", "improve online visibility"]
    }
  };

  const extraServices = [
    "Google Ads campaign planning",
    "local listing optimization",
    "review and reputation support",
    "landing page strategy",
    "brand messaging",
    "content writing",
    "social advertising support",
    "conversion tracking",
    "website support and maintenance",
    "search engine optimization",
    "mobile experience improvements",
    "call-to-action planning"
  ];

  function getPlan(industry) {
    return industryPlans[String(industry || "").toLowerCase()] || industryPlans.default;
  }

  function generate(project) {
    const name = project.name;
    const industry = project.industry;
    const image = project.image;
    const seed = hashText(name + industry);
    const plan = getPlan(industry);
    const selectedServices = pick(plan.services.concat(extraServices), seed, 6);
    const selectedGoals = pick(plan.goals, seed + 19, 3);

    return {
      name,
      industry,
      image,
      title: name + " Website Design",
      category: industry + " Website Design Case Study",
      summary:
        name + " is a WebAct " + industry.toLowerCase() + " website design case study built for " + plan.audience + ". The project focused on " + selectedGoals.join(", ") + ", while supporting a stronger digital presence through " + selectedServices.slice(0, 3).join(", ") + ".",
      overview:
        "For " + name + ", WebAct created a website experience that matches how customers evaluate a " + industry.toLowerCase() + " business online. The project combines clear service presentation, responsive design, industry-focused messaging, and conversion paths that help visitors move from research to action.",
      cards: [
        {
          title: industry + " Website Strategy",
          text: name + " needed more than a basic website. The design was shaped around the expectations of " + industry.toLowerCase() + " customers, with content sections that explain the business, show value quickly, and support trust before a visitor reaches out."
        },
        {
          title: "Services Included",
          text: "This project included " + selectedServices.join(", ") + ". These services help the website support visibility, customer education, and stronger lead generation."
        },
        {
          title: "Industry-Specific SEO Content",
          text: "The case study content and page structure use relevant " + industry.toLowerCase() + " language so search engines and visitors can better understand the business category, services, and customer intent."
        },
        {
          title: "Customer Conversion Planning",
          text: "The layout helps guide visitors toward important actions such as calling, requesting information, scheduling, ordering, booking, or submitting a form depending on the business goal."
        },
        {
          title: "Mobile-Friendly User Experience",
          text: "The website presentation is designed for desktop, tablet, and mobile visitors, making it easier for customers to read content, browse services, and take action from any device."
        },
        {
          title: "Brand Trust and Credibility",
          text: name + " benefits from a polished online presence with clearer messaging, stronger visual consistency, and service-focused content that helps build confidence with potential customers."
        }
      ],
      relatedIntro:
        "Browse more WebAct website design projects connected to " + industry.toLowerCase() + " businesses and similar service categories."
    };
  }

  return { slugify, generate };
})();
'@

Set-Content $contentJsPath $contentJs -NoNewline -Encoding UTF8

$case = Get-Content $casePath -Raw

# Add portfolio-content.js after portfolio-data-all.js
if ($case -notmatch 'portfolio-content\.js') {
  $case = $case -replace '<script src="/webact-redesign/assets/js/portfolio-data-all\.js"></script>',
  '<script src="/webact-redesign/assets/js/portfolio-data-all.js"></script>
<script src="/webact-redesign/assets/js/portfolio-content.js"></script>'
}

$renderer = @'
<script id="case-study-renderer">
(function(){
  const rows = window.webactPortfolioRows || [];
  const engine = window.webactPortfolioContentEngine;
  if (!engine || !rows.length) return;

  const params = new URLSearchParams(window.location.search);
  const projectSlug = params.get("project") || "";

  const row = rows.find(r => engine.slugify(r[0]) === projectSlug) || rows[0];
  if (!row) return;

  const project = {
    name: row[0] || "Portfolio Project",
    industry: row[1] || "Business",
    image: row[2] || "/webact-redesign/Resources/images/placeholder.png"
  };

  const content = engine.generate(project);

  document.title = content.name + " " + content.industry + " Website Design Case Study | WebAct";
  document.getElementById("case-category").textContent = content.category;
  document.getElementById("case-title").textContent = content.title;
  document.getElementById("case-summary").textContent = content.summary;
  document.getElementById("case-overview").textContent = content.overview;
  document.getElementById("case-image").src = content.image;
  document.getElementById("case-image").alt = content.name + " " + content.industry + " website design";

  const projectHeading = document.querySelector(".section.soft .heading h2");
  if (projectHeading) projectHeading.textContent = content.name + " project overview.";

  const projectEyebrow = document.querySelector(".section.soft .heading .eyebrow");
  if (projectEyebrow) projectEyebrow.textContent = "Project Strategy";

  const stats = document.querySelectorAll(".stat span");
  if (stats.length >= 4) {
    stats[0].textContent = content.industry + " Website Design";
    stats[1].textContent = "SEO and Content Structure";
    stats[2].textContent = "Marketing Support";
    stats[3].textContent = "Conversion Planning";
  }

  const serviceEyebrow = document.querySelector(".section:not(.soft) .heading .eyebrow");
  if (serviceEyebrow) serviceEyebrow.textContent = "Website Services";

  const serviceHeading = document.querySelector(".section:not(.soft) .heading h2");
  if (serviceHeading) serviceHeading.textContent = "Website, SEO, and marketing services for " + content.name + ".";

  const cards = document.querySelectorAll(".feature-card");
  content.cards.forEach(function(card, index){
    if (!cards[index]) return;
    const h3 = cards[index].querySelector("h3");
    const p = cards[index].querySelector("p");
    if (h3) h3.textContent = card.title;
    if (p) p.textContent = card.text;
  });

  const relatedHeading = document.querySelector(".section.soft:nth-of-type(3) .heading p");
  if (relatedHeading) relatedHeading.textContent = content.relatedIntro;

  const relatedGrid = document.getElementById("related-grid");
  if (relatedGrid) {
    relatedGrid.innerHTML = "";
    const related = rows
      .filter(r => r[1] === content.industry && engine.slugify(r[0]) !== engine.slugify(content.name))
      .slice(0, 6);

    related.forEach(function(r){
      const a = document.createElement("a");
      a.className = "related-card";
      a.href = "/webact-redesign/about/portfolio/case-study.html?project=" + engine.slugify(r[0]);
      a.innerHTML =
        '<img loading="lazy" src="' + r[2] + '" alt="' + r[0].replace(/"/g, "&quot;") + ' ' + r[1].replace(/"/g, "&quot;") + ' website design">' +
        '<div class="related-copy"><span>' + r[1] + '</span><h3>' + r[0] + '</h3></div>';
      relatedGrid.appendChild(a);
    });

    if (!related.length) {
      relatedGrid.innerHTML = '<p style="color:#4b5b66;font-size:18px;text-align:center;grid-column:1/-1">More related ' + content.industry.toLowerCase() + ' website design examples will be added soon.</p>';
    }
  }
})();
</script>
'@

# Replace any existing case-study dynamic script block after data script
$case = [regex]::Replace(
  $case,
  '(?s)<script id="case-study[^"]*">.*?</script>',
  $renderer,
  1
)

if ($case -notmatch 'case-study-renderer') {
  $case = $case -replace '</body>', "$renderer`r`n</body>"
}

Set-Content $casePath $case -NoNewline -Encoding UTF8

git add assets/js/portfolio-content.js about/portfolio/case-study.html tools/migrate/Build-Portfolio-Case-Study-Engine.ps1
git commit -m "Create portfolio case study content engine"
git push origin main