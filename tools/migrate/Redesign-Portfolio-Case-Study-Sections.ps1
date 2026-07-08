$ErrorActionPreference = "Stop"

$casePath = ".\about\portfolio\case-study.html"
$case = Get-Content $casePath -Raw

# Replace CSS section styles with better case study layout styles
$case = $case -replace '\.case-section\{[^}]*\}', '.case-section{padding:88px min(6vw,72px)}'
$case = $case -replace '\.case-section\.alt\{[^}]*\}', '.case-section.alt{background:#f4f8fb}'
$case = $case -replace '\.case-copy\{[^}]*\}', '.case-copy{max-width:1180px;margin:0 auto}'
$case = $case -replace '\.case-copy \.eyebrow\{[^}]*\}', '.case-copy .eyebrow{color:#0c9bd2}'
$case = $case -replace '\.case-copy h2\{[^}]*\}', '.case-copy h2{font-size:clamp(34px,4.6vw,64px);line-height:.98;margin:10px 0 22px;letter-spacing:-.05em;color:#071421}'
$case = $case -replace '\.case-copy p\{[^}]*\}', '.case-copy p{font-size:19px;line-height:1.85;color:#4b5b66;margin:0}'

$extraCss = @'
<style id="case-study-premium-sections">
.case-overview-grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(320px,.55fr);gap:32px;align-items:start;max-width:1280px;margin:0 auto}
.case-summary-card{background:#fff;border:1px solid #e0ebf2;border-radius:28px;padding:30px;box-shadow:0 18px 42px rgba(7,20,33,.08);position:sticky;top:24px}
.case-summary-card h3{font-size:25px;margin:0 0 18px;color:#071421}
.case-summary-card dl{display:grid;gap:16px;margin:0}
.case-summary-card dt{font-weight:900;color:#0c9bd2;text-transform:uppercase;font-size:12px;letter-spacing:.08em}
.case-summary-card dd{margin:4px 0 0;color:#071421;font-weight:900;font-size:18px}
.strategy-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;max-width:1300px;margin:34px auto 0}
.strategy-card{background:#fff;border:1px solid #e0ebf2;border-radius:26px;padding:28px;box-shadow:0 18px 42px rgba(7,20,33,.08)}
.strategy-card span{display:flex;width:46px;height:46px;border-radius:15px;background:#33abe1;color:#061421;align-items:center;justify-content:center;font-weight:900;margin-bottom:18px}
.strategy-card h3{font-size:23px;line-height:1.12;margin:0 0 12px;color:#071421}
.strategy-card p{font-size:16px;line-height:1.7;color:#4b5b66;margin:0}
.dark-strategy{background:linear-gradient(135deg,#071421,#0b243a);color:#fff}
.dark-strategy .case-copy h2,.dark-strategy .case-copy p{color:#fff}
.dark-strategy .case-copy p{color:#d4e8f2}
.seo-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px;max-width:1300px;margin:34px auto 0}
.seo-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.16);border-radius:26px;padding:28px;color:#fff}
.seo-card h3{font-size:24px;margin:0 0 12px;color:#fff}
.seo-card p{font-size:16px;line-height:1.75;color:#d4e8f2;margin:0}
.marketing-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;max-width:1300px;margin:34px auto 0}
.marketing-card{background:#fff;border:1px solid #e0ebf2;border-radius:28px;padding:32px;box-shadow:0 18px 42px rgba(7,20,33,.08)}
.marketing-card h3{font-size:25px;line-height:1.12;margin:0 0 14px;color:#071421}
.marketing-card p{font-size:16px;line-height:1.75;color:#4b5b66;margin:0}
.services-pill-grid{display:flex;flex-wrap:wrap;gap:14px;max-width:1180px;margin:32px auto 0;justify-content:center}
.services-pill-grid span{background:#fff;border:1px solid #dcecf5;border-radius:999px;padding:14px 18px;font-weight:900;color:#071421;box-shadow:0 10px 24px rgba(7,20,33,.06)}
.results-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;max-width:1300px;margin:34px auto 0}
.result-card{background:#fff;border:1px solid #e0ebf2;border-radius:26px;padding:28px;box-shadow:0 18px 42px rgba(7,20,33,.08)}
.result-card h3{font-size:23px;margin:0 0 10px;color:#071421}
.result-card p{font-size:16px;line-height:1.7;color:#4b5b66;margin:0}
@media(max-width:1050px){
  .case-overview-grid,.strategy-grid,.seo-grid,.marketing-grid,.results-grid{grid-template-columns:1fr 1fr}
  .case-summary-card{position:relative;top:auto}
}
@media(max-width:680px){
  .case-overview-grid,.strategy-grid,.seo-grid,.marketing-grid,.results-grid{grid-template-columns:1fr}
}
</style>
'@

if ($case -notmatch 'case-study-premium-sections') {
  $case = $case -replace '</head>', "$extraCss`r`n</head>"
}

$renderer = @'
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
  sections.innerHTML = `
    <section class="case-section alt">
      <div class="case-overview-grid">
        <div class="case-copy">
          <p class="eyebrow">Project Overview</p>
          <h2>A stronger digital presence for ${c.name}.</h2>
          <p>${c.sections[0].text}</p>
          <br>
          <p>${c.sections[1].text}</p>
        </div>
        <aside class="case-summary-card">
          <h3>Project Snapshot</h3>
          <dl>
            <div><dt>Industry</dt><dd>${c.industry}</dd></div>
            <div><dt>Primary Focus</dt><dd>Website Design, SEO, Marketing</dd></div>
            <div><dt>Website Goal</dt><dd>Trust, Leads, Visibility</dd></div>
            <div><dt>Experience</dt><dd>Desktop, Tablet, Mobile</dd></div>
          </dl>
        </aside>
      </div>
    </section>

    <section class="case-section">
      <div class="case-copy">
        <p class="eyebrow">Website Strategy</p>
        <h2>Designed to help ${c.industry.toLowerCase()} customers choose with confidence.</h2>
        <p>${c.sections[2].text}</p>
      </div>
      <div class="strategy-grid">
        <article class="strategy-card"><span>01</span><h3>Website Planning</h3><p>The site structure helps visitors quickly understand the business, review key services, and move toward the next step.</p></article>
        <article class="strategy-card"><span>02</span><h3>User Experience</h3><p>Navigation, spacing, headings, and page flow are designed to make the website easier to use across devices.</p></article>
        <article class="strategy-card"><span>03</span><h3>Content Strategy</h3><p>Industry-specific language helps explain what the business offers and why customers should take action.</p></article>
        <article class="strategy-card"><span>04</span><h3>Responsive Design</h3><p>The design supports desktop, tablet, and mobile visitors so the brand looks professional everywhere.</p></article>
        <article class="strategy-card"><span>05</span><h3>Lead Generation</h3><p>Calls, forms, service sections, and conversion paths help turn interested visitors into real opportunities.</p></article>
        <article class="strategy-card"><span>06</span><h3>Brand Trust</h3><p>The visual direction helps ${c.name} look more credible, polished, and ready to compete online.</p></article>
      </div>
    </section>

    <section class="case-section dark-strategy">
      <div class="case-copy">
        <p class="eyebrow">SEO Strategy</p>
        <h2>Built for search visibility and long-term growth.</h2>
        <p>${c.sections[3].text}</p>
      </div>
      <div class="seo-grid">
        <article class="seo-card"><h3>Local SEO</h3><p>Location and service relevance help support search visibility for customers looking for ${c.industry.toLowerCase()} services nearby.</p></article>
        <article class="seo-card"><h3>Content Optimization</h3><p>Clear page structure, headings, and industry-focused content help search engines better understand the website.</p></article>
        <article class="seo-card"><h3>Search Intent</h3><p>The content is written around what customers need to know before they call, book, buy, or request information.</p></article>
      </div>
    </section>

    <section class="case-section alt">
      <div class="case-copy">
        <p class="eyebrow">Marketing and Advertising</p>
        <h2>Connecting the website to real growth services.</h2>
        <p>${c.sections[4].text}</p>
      </div>
      <div class="marketing-grid">
        <article class="marketing-card"><h3>Google Ads</h3><p>Paid search campaigns can help drive targeted visitors to high-intent pages when customers are actively looking for services.</p></article>
        <article class="marketing-card"><h3>Landing Pages</h3><p>Dedicated landing pages help match ads, offers, services, and locations to focused conversion paths.</p></article>
        <article class="marketing-card"><h3>Local Visibility</h3><p>Listings, reviews, search visibility, and consistent messaging help strengthen trust before a visitor contacts the business.</p></article>
      </div>
    </section>

    <section class="case-section">
      <div class="case-copy">
        <p class="eyebrow">Results Focus</p>
        <h2>Built to improve trust, usability, and customer action.</h2>
        <p>${c.sections[6].text}</p>
      </div>
      <div class="results-grid">
        <article class="result-card"><h3>Better First Impression</h3><p>A polished website helps the business look more established and trustworthy online.</p></article>
        <article class="result-card"><h3>Clearer Service Presentation</h3><p>Organized content helps visitors understand services faster and with less confusion.</p></article>
        <article class="result-card"><h3>Stronger Lead Opportunities</h3><p>Conversion-focused page flow helps visitors take the next step when they are ready.</p></article>
      </div>
    </section>
  `;

  document.getElementById("services-title").textContent = "Services connected to the " + c.name + " project.";
  document.getElementById("services-intro").textContent = "These are the types of website, SEO, marketing, and advertising services WebAct can use to support a " + c.industry.toLowerCase() + " website project.";
  document.getElementById("service-grid").outerHTML = '<div class="services-pill-grid" id="service-grid">' + c.services.map(function(s){return "<span>✓ " + s + "</span>";}).join("") + "</div>";

  document.getElementById("related-intro").textContent = "Browse additional WebAct portfolio examples related to " + c.industry.toLowerCase() + " websites and similar business categories.";
  const relatedGrid = document.getElementById("related-grid");
  relatedGrid.innerHTML = c.related.map(function(r){
    return '<a class="related-card" href="/webact-redesign/about/portfolio/case-study.html?project='+engine.slugify(r[0])+'"><img src="'+r[2]+'" alt="'+r[0]+' website design"><span>'+r[1]+'</span><h3>'+r[0]+'</h3></a>';
  }).join("") || '<p style="grid-column:1/-1;color:#4b5b66;font-size:18px;text-align:center">More related projects will be added soon.</p>';

  document.getElementById("cta-title").textContent = "Need a " + c.industry.toLowerCase() + " website like " + c.name + "?";
  document.getElementById("cta-text").textContent = "WebAct can help with website design, SEO, digital advertising, landing pages, branding, local visibility, and ongoing website support for businesses in this industry.";
})();
</script>
'@

$case = [regex]::Replace(
  $case,
  '(?s)<script>\s*\(function\(\)\{.*?</script>',
  $renderer,
  1
)

Set-Content $casePath $case -NoNewline -Encoding UTF8

git add about/portfolio/case-study.html tools/migrate/Redesign-Portfolio-Case-Study-Sections.ps1
git commit -m "Redesign portfolio case study sections"
git push origin main