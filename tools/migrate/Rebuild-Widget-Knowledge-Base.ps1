$ErrorActionPreference = "Stop"

$pagePath = ".\about\widget-knowledge-base.html"
$widgetRoot = ".\about\widget-knowledge-base"

$folders = Get-ChildItem $widgetRoot -Directory | Sort-Object Name

function Title-From-Slug($slug) {
  $title = $slug -replace "-", " "
  return (Get-Culture).TextInfo.ToTitleCase($title)
}

$cards = foreach ($folder in $folders) {
  $name = $folder.Name
  $title = Title-From-Slug $name
  $href = "/webact-redesign/about/widget-knowledge-base/$name/index.html"

@"
<a class="widget-kb-card" href="$href" data-widget-card data-title="$title">
  <div class="widget-kb-icon">W</div>
  <div>
    <h3>$title</h3>
    <p>Open this widget guide for setup help, usage tips, and support details for $title.</p>
    <span>View guide</span>
  </div>
</a>
"@
}

$cardsHtml = $cards -join "`r`n"

$html = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Widget Knowledge Base | WebAct Website Widgets</title>
  <meta name="description" content="Search WebAct widget guides for setup help, website features, forms, reviews, galleries, maps, buttons, business tools, and custom widgets.">
  <link rel="stylesheet" href="/webact-redesign/styles.css?v=main-layout-1">
  <link rel="stylesheet" href="/webact-redesign/assets/css/webact-promodo-nav.css?v=main-layout-1">
  <link rel="stylesheet" href="/webact-redesign/assets/css/webact-footer.css?v=main-layout-1">

  <style>
    html,body{height:auto!important;overflow-x:hidden!important;overflow-y:auto!important}
    body{margin:0}
    .widget-kb-page{color:#071421;background:#fff;overflow:visible!important}
    .widget-kb-hero{background:radial-gradient(circle at 12% 18%,rgba(51,171,225,.24),transparent 30%),linear-gradient(135deg,#061421,#0d2740 52%,#071421);color:#fff;padding:92px min(6vw,72px);display:grid;grid-template-columns:minmax(0,1.05fr) minmax(340px,.72fr);gap:48px;align-items:center}
    .widget-kb-hero h1{font-size:clamp(42px,6vw,78px);line-height:.96;margin:12px 0 22px;letter-spacing:-.05em}
    .widget-kb-hero p{color:#d9edf8;font-size:20px;line-height:1.6}
    .eyebrow{letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#73d7ff}
    .widget-kb-proof{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 0}
    .widget-kb-proof span{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);border-radius:999px;padding:10px 14px;font-weight:800}
    .widget-help-form{background:rgba(255,255,255,.96);color:#071421;border-radius:28px;padding:28px;box-shadow:0 30px 80px rgba(0,0,0,.28)}
    .widget-help-form h2{font-size:28px;margin:0 0 8px;color:#071421}
    .widget-help-form p{color:#4b5b66!important;font-size:16px;line-height:1.55}
    .widget-help-form label{display:grid;gap:7px;margin-bottom:12px;font-weight:800;font-size:14px;color:#203241}
    .widget-help-form input,.widget-help-form select,.widget-help-form textarea{width:100%;box-sizing:border-box;border:1px solid #cddce7;border-radius:12px;padding:13px 14px;font:inherit;background:#fff;color:#071421}
    .widget-help-form textarea{resize:vertical;min-height:92px}
    .widget-section{padding:84px min(6vw,72px)}
    .widget-soft{background:#f4f8fb}
    .widget-heading{max-width:980px;margin:0 auto 44px;text-align:center}
    .widget-heading .eyebrow{color:#0c9bd2}
    .widget-heading h2{font-size:clamp(32px,4vw,56px);line-height:1;margin:10px 0 16px;letter-spacing:-.04em}
    .widget-heading p{font-size:18px;line-height:1.65;color:#4b5b66}
    .widget-link-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:0 auto 38px;max-width:1100px}
    .widget-link-row a{background:#fff;border:1px solid #dcecf5;border-radius:999px;padding:12px 16px;text-decoration:none;color:#071421;font-weight:900;box-shadow:0 10px 24px rgba(7,20,33,.06)}
    .widget-link-row a:hover{border-color:#33abe1;color:#0c9bd2}
    .widget-search-panel{max-width:1180px;margin:0 auto 36px;background:#fff;border:1px solid #e0ebf2;border-radius:28px;padding:28px;box-shadow:0 18px 42px rgba(7,20,33,.08)}
    .widget-search-panel label{display:block;font-weight:900;font-size:22px;margin-bottom:12px}
    .widget-search-panel input{width:100%;box-sizing:border-box;border:1px solid #cddce7;border-radius:16px;padding:17px 18px;font:inherit;background:#fff;color:#071421}
    .widget-kb-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;max-width:1400px;margin:0 auto}
    .widget-kb-card{display:grid;grid-template-columns:58px 1fr;gap:18px;align-items:start;background:#fff;border:1px solid #e0ebf2;border-radius:26px;padding:24px;text-decoration:none;color:#071421;box-shadow:0 18px 42px rgba(7,20,33,.08);transition:.2s ease}
    .widget-kb-card:hover{transform:translateY(-3px);box-shadow:0 26px 60px rgba(7,20,33,.13);border-color:#33abe1}
    .widget-kb-icon{width:58px;height:58px;border-radius:18px;background:#33abe1;color:#061421;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:24px}
    .widget-kb-card h3{font-size:23px;margin:0 0 10px;color:#071421;line-height:1.15}
    .widget-kb-card p{color:#4b5b66;line-height:1.6;margin:0 0 12px}
    .widget-kb-card span{color:#0c9bd2;font-weight:900}
    .widget-empty{display:none;text-align:center;max-width:760px;margin:30px auto 0;color:#4b5b66;font-size:18px}
    .widget-final-cta{background:linear-gradient(135deg,#0b243a,#071421);color:#fff;text-align:center;padding:86px min(6vw,72px)}
    .widget-final-cta h2{font-size:clamp(34px,5vw,62px);line-height:1;margin:0 0 16px}
    .widget-final-cta p{color:#d4e8f2;font-size:19px;line-height:1.6;max-width:780px;margin:0 auto}
    .hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}
    .widget-final-cta .hero-actions{justify-content:center}
    .button{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:220px!important;min-height:56px!important;padding:14px 24px!important;border-radius:14px!important;font-weight:900!important;text-decoration:none!important;transition:.2s ease;cursor:pointer}
    .button.primary{background:#33abe1!important;border:2px solid #33abe1!important;color:#061421!important}
    .button.secondary{background:#fff!important;border:2px solid #fff!important;color:#071421!important}
    @media(max-width:1080px){.widget-kb-hero{grid-template-columns:1fr}.widget-kb-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:680px){.widget-kb-hero,.widget-section,.widget-final-cta{padding:56px 20px}.widget-kb-grid{grid-template-columns:1fr}.hero-actions .button{width:100%;justify-content:center}.widget-kb-proof span{width:100%;text-align:center}}
  </style>
</head>

<body class="widget-kb-page">
<div id="webact-header"></div>

<main>
  <section class="widget-kb-hero">
    <div>
      <p class="eyebrow">Widget Knowledge Base</p>
      <h1>Find help for WebAct widgets, setup, and website features.</h1>
      <p>Search the Widget Knowledge Base to find support guides for the tools and features that help make your website more useful, interactive, and easier for visitors to use.</p>
      <div class="hero-actions">
        <a class="button primary" href="#widget-guides">Search Widgets</a>
        <a class="button secondary" href="/webact-redesign/contact/index.html">Ask WebAct</a>
      </div>
      <div class="widget-kb-proof">
        <span>Widget Guides</span>
        <span>Setup Help</span>
        <span>Website Features</span>
        <span>WebAct Support</span>
      </div>
    </div>

    <form class="widget-help-form" aria-label="Widget help request">
      <h2>Need Widget Help?</h2>
      <p>Tell us which widget or website feature you are working with and WebAct can help point you in the right direction.</p>
      <label>Full Name<input type="text" name="name"></label>
      <label>Email Address<input type="email" name="email"></label>
      <label>Widget Topic
        <select name="topic">
          <option>Widget Setup</option>
          <option>Forms</option>
          <option>Reviews</option>
          <option>Design Widgets</option>
          <option>Business Tools</option>
          <option>Custom Widget</option>
        </select>
      </label>
      <label>Question<textarea rows="5"></textarea></label>
      <button class="button primary" type="button">Request Help</button>
    </form>
  </section>

  <section class="widget-section widget-soft">
    <div class="widget-link-row">
      <a href="#widget-guides">All Widget Guides</a>
      <a href="/webact-redesign/about/website-knowledge-base.html">Website Knowledge Base</a>
      <a href="/webact-redesign/about/how-to-videos.html">How-To Videos</a>
      <a href="/webact-redesign/about/faq.html">FAQ</a>
      <a href="/webact-redesign/contact/index.html">Contact WebAct</a>
    </div>
    <div class="widget-heading">
      <p class="eyebrow">WebAct Widget Support</p>
      <h2>Browse widget help by feature.</h2>
      <p>These guides are organized to help customers quickly find setup information, usage tips, and support for WebAct website widgets and interactive features.</p>
    </div>
  </section>

  <section class="widget-section" id="widget-guides">
    <div class="widget-heading">
      <p class="eyebrow">Searchable Widget Guides</p>
      <h2>Search or browse the widget library.</h2>
      <p>Use the search box below to find the widget or feature you need. Every card links to the matching guide page.</p>
    </div>

    <div class="widget-search-panel">
      <label for="widget-kb-search">Search widget guides</label>
      <input id="widget-kb-search" data-widget-search type="search" placeholder="Search forms, reviews, sliders, maps, galleries, buttons, social tools...">
    </div>

    <div class="widget-kb-grid">
      $cardsHtml
    </div>

    <p class="widget-empty" data-widget-empty>No matching widget guides found.</p>
  </section>

  <section class="widget-final-cta">
    <h2>Need help with a widget or website feature?</h2>
    <p>WebAct can help you find the right guide, troubleshoot setup issues, or recommend the right widget for your website goals.</p>
    <div class="hero-actions">
      <a class="button primary" href="/webact-redesign/contact/index.html">Contact WebAct</a>
      <a class="button secondary" href="/webact-redesign/about/website-knowledge-base.html">Website Knowledge Base</a>
    </div>
  </section>
</main>

<div id="webact-footer"></div>

<script>
(function(){
  const input = document.querySelector('[data-widget-search]');
  const cards = Array.from(document.querySelectorAll('[data-widget-card]'));
  const empty = document.querySelector('[data-widget-empty]');

  function runSearch(){
    const q = input ? input.value.trim().toLowerCase() : '';
    let shown = 0;

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const match = !q || text.includes(q) || title.includes(q);
      card.style.display = match ? '' : 'none';
      if(match) shown++;
    });

    if(empty) empty.style.display = shown ? 'none' : 'block';
  }

  if(input) input.addEventListener('input', runSearch);
})();
</script>

<script src="/webact-redesign/script.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/routes.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/navigation.js?v=main-layout-1"></script>
<script src="/webact-redesign/assets/js/includes.js?v=main-layout-1"></script>

</body>
</html>
"@

Set-Content $pagePath $html -Encoding UTF8 -NoNewline

git add about/widget-knowledge-base.html
git commit -m "Rebuild Widget Knowledge Base"
git push origin main
