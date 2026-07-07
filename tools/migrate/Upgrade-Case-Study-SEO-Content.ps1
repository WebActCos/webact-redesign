$ErrorActionPreference = "Stop"

$pagePath = ".\about\portfolio\case-study.html"
$page = Get-Content $pagePath -Raw

$newScript = @'
<script src="/webact-redesign/assets/js/portfolio-data-all.js"></script>
<script id="case-study-dynamic-content">
(function(){
  const rows = window.webactPortfolioRows || [];
  const params = new URLSearchParams(window.location.search);
  const project = params.get('project') || '';

  function slugify(text){
    return String(text || '')
      .toLowerCase()
      .replace(/&/g,'and')
      .replace(/[^a-z0-9]+/g,'-')
      .replace(/^-+|-+$/g,'');
  }

  function sentenceIndustry(industry){
    return String(industry || 'business').toLowerCase();
  }

  function serviceSet(industry){
    const i = sentenceIndustry(industry);

    const map = {
      "restaurant": ["menu presentation", "location visibility", "online ordering support", "mobile-friendly dining pages", "local SEO"],
      "dentist": ["service page structure", "appointment-focused calls to action", "trust-building content", "mobile-friendly patient access", "local SEO"],
      "dental": ["treatment presentation", "patient education", "appointment-focused design", "local search visibility", "mobile-friendly pages"],
      "legal": ["practice area pages", "consultation calls to action", "attorney credibility", "local SEO", "clear intake paths"],
      "construction": ["project presentation", "service area visibility", "estimate requests", "trust-building design", "mobile-friendly layouts"],
      "roofing": ["roofing service pages", "estimate requests", "local SEO", "before-and-after presentation", "emergency service visibility"],
      "hvac": ["heating and cooling service pages", "repair and replacement calls to action", "seasonal service visibility", "local SEO", "mobile-friendly support"],
      "plumbing": ["service request paths", "emergency plumbing visibility", "local SEO", "service page structure", "mobile-friendly calls"],
      "healthcare": ["patient-friendly content", "service education", "trust-focused design", "appointment paths", "local SEO"],
      "health care": ["patient-friendly content", "service education", "trust-focused design", "appointment paths", "local SEO"],
      "ecommerce": ["product presentation", "shopping flow support", "category structure", "conversion-focused design", "mobile shopping experience"],
      "professional services": ["credibility-focused content", "service explanation", "lead generation", "brand positioning", "local visibility"],
      "pet services": ["service pages", "trust-building imagery", "booking paths", "local SEO", "mobile-friendly design"],
      "driving school": ["class information", "student enrollment paths", "local search visibility", "mobile-friendly schedules", "clear calls to action"],
      "real estate": ["property presentation", "location-focused content", "lead capture", "trust-building design", "mobile-friendly browsing"],
      "travel": ["destination presentation", "booking interest", "experience-focused content", "mobile browsing", "visual storytelling"],
      "technology": ["solution explanation", "feature presentation", "lead generation", "brand credibility", "conversion-focused pages"],
      "security": ["service credibility", "risk-focused messaging", "consultation paths", "local visibility", "trust-building presentation"],
      "non profit": ["mission storytelling", "donation paths", "community trust", "program presentation", "mobile-friendly content"],
      "nonprofit": ["mission storytelling", "donation paths", "community trust", "program presentation", "mobile-friendly content"]
    };

    return map[i] || ["professional presentation", "service clarity", "lead generation", "mobile-friendly design", "local SEO"];
  }

  function contentFor(name, industry){
    const i = sentenceIndustry(industry);
    const services = serviceSet(industry);

    return {
      summary: name + " is a WebAct " + i + " website design project built to help the business present services clearly, build trust with visitors, and create stronger paths for customer action. The project focuses on professional design, mobile usability, industry-focused messaging, and search-friendly structure.",

      overview: "For " + name + ", the website experience needed to support the way customers research and choose a " + i + " provider. WebAct structured the project around clear content sections, visible calls to action, helpful service information, and a layout that works across desktop, tablet, and mobile devices. The result is a stronger digital presence that helps visitors quickly understand who the company is, what it offers, and how to take the next step.",

      features: [
        {
          title: "Industry-Specific Website Strategy",
          text: name + " needed a website approach built around the " + i + " industry. The page structure, messaging, and visual presentation are designed to help visitors understand the business quickly and feel confident moving forward."
        },
        {
          title: "Service and Offer Presentation",
          text: "The project supports " + services[0] + ", " + services[1] + ", and " + services[2] + " so visitors can find the information they need without confusion."
        },
        {
          title: "Customer Action Paths",
          text: "The design helps guide visitors toward important actions such as calling, requesting information, scheduling, ordering, booking, or contacting the business depending on the goals of the website."
        },
        {
          title: "Mobile-Friendly Experience",
          text: "Because many customers visit from phones and tablets, the website presentation is built to keep content readable, navigation simple, and calls to action easy to access on smaller screens."
        },
        {
          title: "Search Visibility Foundation",
          text: "The project supports SEO value through clear headings, relevant industry language, organized service content, and a structure that helps search engines understand the business category."
        },
        {
          title: "Brand Trust and Credibility",
          text: "The design gives " + name + " a more polished online presence with consistent branding, clear messaging, and a professional layout that helps build trust before a visitor makes contact."
        }
      ],

      services: services
    };
  }

  const row = rows.find(r => slugify(r[0]) === project) || rows[0];
  if(!row) return;

  const name = row[0] || 'Portfolio Project';
  const industry = row[1] || 'Business';
  const image = row[2] || '/webact-redesign/Resources/images/placeholder.png';
  const c = contentFor(name, industry);

  document.title = name + ' ' + industry + ' Website Design Case Study | WebAct Portfolio';

  document.getElementById('case-category').textContent = industry + ' Website Design Case Study';
  document.getElementById('case-title').textContent = name + ' Website Design';
  document.getElementById('case-summary').textContent = c.summary;
  document.getElementById('case-overview').textContent = c.overview;
  document.getElementById('case-image').src = image;
  document.getElementById('case-image').alt = name + ' ' + industry + ' website design';

  document.querySelector('.section.soft .heading h2').textContent = name + ' project overview.';
  document.querySelector('.section.soft .heading p.eyebrow').textContent = 'Project Strategy';

  const stats = document.querySelectorAll('.stat span');
  if(stats.length >= 4){
    stats[0].textContent = industry + ' Website Design';
    stats[1].textContent = 'Mobile-Friendly Experience';
    stats[2].textContent = 'Customer Action Paths';
    stats[3].textContent = 'SEO-Ready Structure';
  }

  document.querySelector('.section:not(.soft) .heading .eyebrow').textContent = 'Website Services';
  document.querySelector('.section:not(.soft) .heading h2').textContent = 'Services and strategy used for ' + name + '.';

  const cards = document.querySelectorAll('.feature-card');
  c.features.forEach(function(feature, index){
    if(cards[index]){
      const h3 = cards[index].querySelector('h3');
      const p = cards[index].querySelector('p');
      if(h3) h3.textContent = feature.title;
      if(p) p.textContent = feature.text;
    }
  });

  const related = rows
    .filter(r => r[1] === industry && slugify(r[0]) !== slugify(name))
    .slice(0,6);

  const relatedGrid = document.getElementById('related-grid');
  relatedGrid.innerHTML = '';

  related.forEach(r => {
    const a = document.createElement('a');
    a.className = 'related-card';
    a.href = '/webact-redesign/about/portfolio/case-study.html?project=' + slugify(r[0]);
    a.innerHTML =
      '<img loading="lazy" src="' + r[2] + '" alt="' + r[0].replace(/"/g,'&quot;') + ' ' + r[1].replace(/"/g,'&quot;') + ' website design">' +
      '<div class="related-copy"><span>' + r[1] + '</span><h3>' + r[0] + '</h3></div>';
    relatedGrid.appendChild(a);
  });

  if(!related.length){
    relatedGrid.innerHTML = '<p style="color:#4b5b66;font-size:18px;text-align:center;grid-column:1/-1">More related ' + industry.toLowerCase() + ' website design examples will be added soon.</p>';
  }
})();
</script>
'@

$page = [regex]::Replace(
  $page,
  '(?s)<script src="/webact-redesign/assets/js/portfolio-data-all\.js"></script>\s*<script>\s*\(function\(\)\{.*?</script>',
  $newScript,
  1
)

Set-Content $pagePath $page -NoNewline -Encoding UTF8

git add about/portfolio/case-study.html tools/migrate/Upgrade-Case-Study-SEO-Content.ps1
git commit -m "Add unique SEO content to portfolio case studies"
git push origin main