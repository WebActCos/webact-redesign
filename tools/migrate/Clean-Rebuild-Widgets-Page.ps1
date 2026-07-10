$ErrorActionPreference = "Stop"

$page = ".\addons\widgets.html"
$html = Get-Content $page -Raw

# Extract only widget cards that have both Preview Demo and Pay buttons
$cardMatches = [regex]::Matches($html, '(?is)<article\b[^>]*>.*?</article>') | Where-Object {
  $_.Value -match 'Preview Demo' -and $_.Value -match 'Pay'
}

if ($cardMatches.Count -eq 0) {
  throw "No widget cards found. Stop before overwriting."
}

$cards = foreach ($m in $cardMatches) {
  $card = $m.Value

  $card = $card -replace '<article\b[^>]*>', '<article class="widget-card">'
  $card = $card -replace '<a([^>]*)>\s*Preview Demo\s*</a>', '<a$1 class="preview-demo-link" target="_blank" rel="noopener">Preview Demo</a>'
  $card = $card -replace '<a([^>]*)>\s*Pay ([^<]+)</a>', '<a$1 class="pay-widget-link">Pay $2</a>'

  $card
}

$cardsHtml = ($cards -join "`r`n")

$newHtml = @"
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Website Widgets | WebAct</title>
<meta name="description" content="Browse WebAct website widgets, preview live demos, compare pricing, and choose tools that add functionality to your website.">
<link rel="stylesheet" href="/webact-redesign/styles.css?v=main-layout-1">
<link rel="stylesheet" href="/webact-redesign/assets/css/webact-promodo-nav.css?v=main-layout-1">
<link rel="stylesheet" href="/webact-redesign/assets/css/webact-footer.css?v=main-layout-1">

<style>
html,body{height:auto!important;overflow-x:hidden!important}
body{margin:0}
.widgets-page{background:#fff;color:#071421}

.widgets-hero{
  background:radial-gradient(circle at 14% 18%,rgba(51,171,225,.24),transparent 30%),linear-gradient(135deg,#061421,#0d2740 52%,#071421);
  color:#fff;
  padding:96px min(6vw,72px);
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(360px,.72fr);
  gap:54px;
  align-items:center;
}
.widgets-hero h1{font-size:clamp(44px,6vw,78px);line-height:.96;margin:14px 0 22px;letter-spacing:-.055em;color:#fff}
.widgets-hero p{font-size:20px;line-height:1.65;color:#d9edf8}
.eyebrow{letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#73d7ff}
.hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}
.button{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:220px!important;min-height:56px!important;padding:14px 24px!important;border-radius:14px!important;font-weight:900!important;text-decoration:none!important}
.button.primary{background:#33abe1!important;border:2px solid #33abe1!important;color:#061421!important}
.button.secondary{background:#fff!important;border:2px solid #fff!important;color:#071421!important}

.hero-form-card{background:rgba(255,255,255,.96);color:#071421;border-radius:28px;padding:28px;box-shadow:0 30px 80px rgba(0,0,0,.28);border:1px solid rgba(255,255,255,.22)}
.hero-form-card h2{font-size:28px;margin:0 0 8px;color:#071421}
.hero-form-card p{color:#4b5b66;font-size:16px;line-height:1.55;margin:0 0 18px}
.hero-form{display:grid;gap:0;margin:0;padding:0;background:transparent;box-shadow:none}
.hero-form label{display:grid;gap:7px;margin-bottom:12px;font-weight:800;font-size:14px;color:#203241}
.hero-form input,.hero-form select,.hero-form textarea{width:100%;box-sizing:border-box;border:1px solid #cddce7;border-radius:12px;padding:13px 14px;font:inherit;background:#fff;color:#071421}
.hero-form textarea{resize:vertical;min-height:92px}
.hero-form .button{width:100%;margin-top:6px}

.section{padding:88px min(6vw,72px)}
.soft{background:#f4f8fb}
.heading{max-width:980px;margin:0 auto 48px;text-align:center}
.heading .eyebrow{color:#0c9bd2}
.heading h2{font-size:clamp(34px,4.6vw,62px);line-height:1;margin:10px 0 18px;letter-spacing:-.045em}
.heading p{font-size:18px;line-height:1.65;color:#4b5b66}

.widget-search-panel{max-width:1500px;margin:0 auto 36px;background:#f4f8fb;border:1px solid #dcecf5;border-radius:28px;padding:28px;box-shadow:0 16px 42px rgba(7,20,33,.06);display:grid;grid-template-columns:minmax(260px,1fr) auto;gap:24px;align-items:end}
.widget-search-panel label{display:block;font-size:20px;font-weight:900;margin-bottom:12px;color:#071421}
.widget-search-panel input{width:100%;box-sizing:border-box;border:1px solid #cddce7;border-radius:16px;padding:17px 18px;font:inherit;background:#fff;color:#071421}
.widget-filter-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:flex-end}
.widget-filter-row button{border:1px solid #dcecf5;border-radius:14px;background:#fff;color:#071421;padding:14px 18px;font-weight:900;cursor:pointer;box-shadow:0 8px 18px rgba(7,20,33,.04)}
.widget-filter-row button.active{background:#33abe1;border-color:#33abe1;color:#061421}

.widget-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px;max-width:1500px;margin:0 auto}
.widget-card{display:flex;flex-direction:column;min-height:430px;background:#fff;border:1px solid #e0ebf2;border-radius:28px;padding:28px;box-shadow:0 18px 42px rgba(7,20,33,.08);transition:.22s ease}
.widget-card:hover{transform:translateY(-4px);border-color:#33abe1;box-shadow:0 26px 60px rgba(7,20,33,.13)}
.widget-card h3{font-size:26px;line-height:1.15;margin:14px 0 18px;color:#071421}
.widget-card p{color:#4b5b66;line-height:1.65;font-size:17px}
.widget-card .price,.widget-card [class*="price"]{color:#0c8fc4!important;font-size:42px!important;font-weight:900!important;margin-top:auto!important}
.widget-card a{display:flex;align-items:center;justify-content:center;text-align:center;border-radius:14px;min-height:54px;font-weight:900;text-decoration:none;margin-top:12px}
.widget-card .preview-demo-link{background:#071421!important;color:#fff!important;border:2px solid #33abe1!important}
.widget-card .pay-widget-link{background:#33abe1!important;color:#061421!important;border:2px solid #33abe1!important}

.purchase-note{max-width:1200px;margin:36px auto 0;color:#4b5b66;line-height:1.65}
.final-cta{background:linear-gradient(135deg,#0b243a,#071421);color:#fff;text-align:center;padding:88px min(6vw,72px)}
.final-cta h2{font-size:clamp(34px,5vw,64px);line-height:1;margin:0 0 16px}
.final-cta p{color:#d4e8f2;font-size:19px;line-height:1.6;max-width:780px;margin:0 auto}
.final-cta .hero-actions{justify-content:center}

@media(max-width:1080px){
  .widgets-hero{grid-template-columns:1fr}
  .widget-search-panel{grid-template-columns:1fr}
  .widget-filter-row{justify-content:flex-start}
  .widget-grid{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:700px){
  .widgets-hero,.section,.final-cta{padding:56px 20px}
  .widget-grid{grid-template-columns:1fr}
  .hero-actions .button{width:100%}
}
</style>
</head>

<body class="widgets-page">
<div id="webact-header"></div>

<main>
<section class="widgets-hero">
  <div>
    <p class="eyebrow">Widget Directory</p>
    <h1>Website widgets that add more power to your website.</h1>
    <p>Browse WebAct website widgets, preview live demos, compare pricing, and choose tools that add functionality to your website.</p>
    <div class="hero-actions">
      <a class="button primary" href="#widget-directory">Browse Widgets</a>
      <a class="button secondary" href="/webact-redesign/about/widget-knowledge-base.html">Knowledge Base</a>
    </div>
  </div>

  <aside class="hero-form-card">
    <h2>Need Help Choosing?</h2>
    <p>Tell us what you want your website to do and WebAct can recommend the right widget.</p>
    <form class="hero-form">
      <label>Full Name<input type="text"></label>
      <label>Email Address<input type="email"></label>
      <label>Interested In
        <select>
          <option>Website Widgets</option>
          <option>Custom Widget</option>
          <option>Widget Installation</option>
          <option>Widget Support</option>
        </select>
      </label>
      <label>How can we help?<textarea rows="4"></textarea></label>
      <a class="button primary" href="/webact-redesign/contact/index.html">Request Help</a>
    </form>
  </aside>
</section>

<section class="section soft">
  <div class="heading">
    <p class="eyebrow">Website Widget Library</p>
    <h2>Search by feature or filter by category.</h2>
    <p>Use the search and filters below to find widgets for reviews, calendars, payments, sliders, galleries, social media, navigation, business tools, and advanced website features.</p>
  </div>
</section>

<section class="section" id="widget-directory">
  <div class="widget-search-panel">
    <div>
      <label for="widgetSearch">Search widgets</label>
      <input id="widgetSearch" type="search" placeholder="Search reviews, calendar, Stripe, sliders...">
    </div>
    <div class="widget-filter-row">
      <button type="button" class="active" data-filter="all">All</button>
      <button type="button" data-filter="basic">Basic</button>
      <button type="button" data-filter="media">Media</button>
      <button type="button" data-filter="business">Business</button>
      <button type="button" data-filter="social">Social</button>
      <button type="button" data-filter="advance">Advance</button>
    </div>
  </div>

  <div class="widget-grid" id="widgetGrid">
$cardsHtml
  </div>

  <p class="purchase-note">Each widget is priced as a one-time purchase. WebAct can confirm Duda Widget Builder access, install the widget, and quote any custom changes before launch.</p>
</section>

<section class="final-cta">
  <h2>Need help choosing the right widget?</h2>
  <p>WebAct can help you choose, install, customize, and connect widgets that match your website goals.</p>
  <div class="hero-actions">
    <a class="button primary" href="/webact-redesign/contact/index.html">Ask WebAct</a>
    <a class="button secondary" href="/webact-redesign/about/widget-knowledge-base.html">Widget Knowledge Base</a>
  </div>
</section>
</main>

<div id="webact-footer"></div>

<script src="/webact-redesign/script.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/routes.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/navigation.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/includes.js?v=main-layout-1"></script>

<script>
(function(){
  const search = document.getElementById('widgetSearch');
  const buttons = document.querySelectorAll('[data-filter]');
  const cards = Array.from(document.querySelectorAll('.widget-card'));

  function getCategory(card){
    const text = card.textContent.toLowerCase();
    if(text.includes('media')) return 'media';
    if(text.includes('business')) return 'business';
    if(text.includes('social')) return 'social';
    if(text.includes('advance')) return 'advance';
    return 'basic';
  }

  function applyFilters(){
    const q = (search.value || '').toLowerCase();
    const active = document.querySelector('[data-filter].active')?.dataset.filter || 'all';

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const cat = getCategory(card);
      const matchesSearch = !q || text.includes(q);
      const matchesFilter = active === 'all' || cat === active;
      card.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener('click', function(){
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });

  if(search) search.addEventListener('input', applyFilters);
})();
</script>
</body>
</html>
"@

Set-Content $page $newHtml -Encoding UTF8 -NoNewline

git add addons/widgets.html
git commit -m "Clean rebuild widgets add-on page"
git push origin main
