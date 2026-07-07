$ErrorActionPreference = "Stop"

$pagePath = ".\about\website-knowledge-base.html"
$page = Get-Content $pagePath -Raw

# Fix incorrect relative/internal links
$page = $page -replace 'href="\.\./\.\./about/website-knowledge-base/', 'href="/webact-redesign/about/website-knowledge-base/'
$page = $page -replace 'href="\.\./\.\./about/', 'href="/webact-redesign/about/'
$page = $page -replace 'href="/contact/index.html"', 'href="/webact-redesign/contact/index.html"'
$page = $page -replace 'href="/pricing/index.html"', 'href="/webact-redesign/pricing/index.html"'
$page = $page -replace 'href="/index.html"', 'href="/webact-redesign/index.html"'

# Add redesigned CSS
$css = @'
<style id="kb-redesign-final">
body{margin:0}
.kb-page{color:#071421;background:#fff;overflow:hidden}
.kb-page .kb-hero{background:radial-gradient(circle at 12% 18%,rgba(51,171,225,.24),transparent 30%),linear-gradient(135deg,#061421,#0d2740 52%,#071421);color:#fff;padding:92px min(6vw,72px);display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.72fr);gap:48px;align-items:center}
.kb-page .kb-hero h1{font-size:clamp(42px,6vw,78px);line-height:.96;margin:12px 0 22px;letter-spacing:-.05em}
.kb-page .kb-hero p{color:#d9edf8;font-size:20px;line-height:1.6}
.kb-page .eyebrow{letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#73d7ff}
.kb-page .kb-proof{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 0}
.kb-page .kb-proof span{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);border-radius:999px;padding:10px 14px;font-weight:800}
.kb-help-form{background:rgba(255,255,255,.96);color:#071421;border-radius:28px;padding:28px;box-shadow:0 30px 80px rgba(0,0,0,.28)}
.kb-help-form h2{font-size:28px;margin:0 0 8px}
.kb-help-form p{color:#4b5b66;font-size:16px;line-height:1.55}
.kb-help-form label{display:grid;gap:7px;margin-bottom:12px;font-weight:800;font-size:14px;color:#203241}
.kb-help-form input,.kb-help-form select,.kb-help-form textarea{width:100%;box-sizing:border-box;border:1px solid #cddce7;border-radius:12px;padding:13px 14px;font:inherit;background:#fff;color:#071421}
.kb-help-form textarea{resize:vertical;min-height:92px}
.kb-help-form .button{width:100%;border:0}

.kb-page .website-design-intro,.kb-page .kb-search-section,.kb-page .website-metrics-section,.kb-page .kb-directory-section{padding:84px min(6vw,72px)}
.kb-page .website-design-intro,.kb-page .website-metrics-section{background:#f4f8fb}
.kb-page .website-design-copy,.kb-page .section-heading.compact{text-align:center;max-width:980px;margin:0 auto 44px}
.kb-page .website-design-copy .eyebrow,.kb-page .section-heading.compact .eyebrow{color:#0c9bd2}
.kb-page .website-design-copy h2,.kb-page .section-heading.compact h2{font-size:clamp(32px,4vw,56px);line-height:1;margin:10px 0 16px;letter-spacing:-.04em}
.kb-page .website-design-copy p,.kb-page .section-heading.compact p{font-size:18px;line-height:1.65;color:#4b5b66}
.kb-page .service-link-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:0 auto 36px;max-width:1100px}
.kb-page .service-link-row a{background:#fff;border:1px solid #dcecf5;border-radius:999px;padding:12px 16px;text-decoration:none;color:#071421;font-weight:900;box-shadow:0 10px 24px rgba(7,20,33,.06)}
.kb-page .service-link-row a:hover{border-color:#33abe1;color:#0c9bd2}

.kb-search-panel{max-width:1180px;margin:0 auto;background:#fff;border:1px solid #e0ebf2;border-radius:28px;padding:30px;box-shadow:0 18px 42px rgba(7,20,33,.08)}
.kb-search-panel label{display:block;font-weight:900;font-size:22px;margin-bottom:12px}
.kb-search-panel input{width:100%;box-sizing:border-box;border:1px solid #cddce7;border-radius:16px;padding:17px 18px;font:inherit;background:#fff;color:#071421}
.kb-filter-row{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.kb-filter-row button{border:1px solid #dcecf5;background:#f4f8fb;color:#071421;border-radius:999px;padding:11px 15px;font-weight:900;cursor:pointer}
.kb-filter-row button.active,.kb-filter-row button:hover{background:#33abe1;border-color:#33abe1;color:#061421}
.kb-search-panel p{color:#4b5b66;font-weight:800;margin:18px 0 0}

.kb-page .metric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;max-width:1100px;margin:0 auto}
.kb-page .metric-grid article{background:#fff;border:1px solid #e0ebf2;border-radius:24px;padding:28px;text-align:center;box-shadow:0 18px 42px rgba(7,20,33,.08)}
.kb-page .metric-grid strong{display:block;font-size:clamp(34px,4vw,56px);line-height:1;color:#0c9bd2}
.kb-page .metric-grid span{font-weight:900;color:#071421}

.kb-category-block{scroll-margin-top:120px;margin-bottom:72px}
.kb-section-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;max-width:1400px;margin:0 auto}
.kb-section-card{background:#fff;border:1px solid #e0ebf2;border-radius:26px;padding:24px;box-shadow:0 18px 42px rgba(7,20,33,.08)}
.kb-section-card-top .eyebrow{color:#0c9bd2;font-size:12px}
.kb-section-card h3{font-size:24px;margin:6px 0 16px;color:#071421}
.kb-section-card ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.kb-section-card li a{display:block;text-decoration:none;color:#203241;background:#f4f8fb;border:1px solid #e0ebf2;border-radius:12px;padding:11px 13px;font-weight:800;line-height:1.35}
.kb-section-card li a:hover{background:#e8f7fd;border-color:#33abe1;color:#071421}

.kb-final-cta{background:linear-gradient(135deg,#0b243a,#071421);color:#fff;text-align:center;padding:86px min(6vw,72px)}
.kb-final-cta h2{font-size:clamp(34px,5vw,62px);line-height:1;margin:0 0 16px}
.kb-final-cta p{color:#d4e8f2;font-size:19px;line-height:1.6;max-width:780px;margin:0 auto}
.kb-final-cta .hero-actions{display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:28px}
.kb-page .button.primary,.kb-help-form .button.primary{background:#33abe1!important;border:2px solid #33abe1!important;color:#061421!important}
.kb-page .button.secondary{background:#fff!important;border:2px solid #fff!important;color:#071421!important}

@media(max-width:1080px){
  .kb-page .kb-hero,.kb-section-grid{grid-template-columns:1fr}
  .kb-page .metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:680px){
  .kb-page .kb-hero,.kb-page .website-design-intro,.kb-page .kb-search-section,.kb-page .website-metrics-section,.kb-page .kb-directory-section,.kb-final-cta{padding:56px 20px}
  .kb-page .metric-grid{grid-template-columns:1fr}
  .kb-page .hero-actions .button{width:100%;justify-content:center}
  .kb-page .kb-proof span{width:100%;text-align:center}
}
</style>
'@

if ($page -notmatch 'kb-redesign-final') {
  $page = $page -replace '</head>', "$css`r`n</head>"
}

# Add body class
$page = $page -replace '<body>', '<body class="kb-page">'

# Replace old hero with premium hero/form
$newHero = @'
<section class="kb-hero">
  <div>
    <p class="eyebrow">Website Knowledge Base</p>
    <h1>Find website help, editor tutorials, publishing support, and site management answers.</h1>
    <p>Search WebAct's organized website support directory for editor, publishing, widget, ecommerce, dashboard, account, and site-management topics. Each article is linked inside the WebAct website.</p>
    <div class="hero-actions">
      <a class="button primary" href="#kb-search">Search Articles</a>
      <a class="button secondary" href="/webact-redesign/contact/index.html">Ask WebAct</a>
    </div>
    <div class="kb-proof">
      <span>211 Articles</span>
      <span>29 Support Sections</span>
      <span>5 Main Categories</span>
      <span>No Iframes</span>
    </div>
  </div>

  <form class="kb-help-form" aria-label="Website help request">
    <h2>Need Website Help?</h2>
    <p>Tell us what you are trying to update and WebAct can point you to the right article or support option.</p>
    <label>Full Name<input type="text" name="name"></label>
    <label>Email Address<input type="email" name="email"></label>
    <label>Help Topic
      <select name="topic">
        <option>Website Editor</option>
        <option>Publishing or DNS</option>
        <option>Pages and Popups</option>
        <option>Widgets</option>
        <option>Ecommerce</option>
        <option>Account or Dashboard</option>
      </select>
    </label>
    <label>Question<textarea rows="5"></textarea></label>
    <button class="button primary" type="button">Request Help</button>
  </form>
</section>
'@

$page = $page -replace '(?s)<section class="page-hero">.*?</section>', $newHero

# Add ID to search panel section if missing
$page = $page -replace '<section class="section kb-search-section">', '<section class="section kb-search-section" id="kb-search">'

# Add final CTA before closing main if not present
$cta = @'
<section class="kb-final-cta">
  <h2>Still need help with your website?</h2>
  <p>Search the knowledge base, watch tutorials, or contact WebAct if you need help with your editor, publishing, pages, widgets, ecommerce, or website dashboard.</p>
  <div class="hero-actions">
    <a class="button primary" href="/webact-redesign/contact/index.html">Contact WebAct</a>
    <a class="button secondary" href="/webact-redesign/about/how-to-videos.html">Watch How-To Videos</a>
  </div>
</section>
'@

if ($page -notmatch 'kb-final-cta') {
  $page = $page -replace '</main>', "$cta`r`n</main>"
}

Set-Content $pagePath $page -NoNewline -Encoding UTF8

Write-Host "Website Knowledge Base redesigned and links fixed." -ForegroundColor Green