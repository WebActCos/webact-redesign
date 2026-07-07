$ErrorActionPreference = "Stop"

$pagePath = ".\about\blog.html"
$page = Get-Content $pagePath -Raw

# Fix common blog/internal links
$page = $page -replace 'href="/index.html"', 'href="/webact-redesign/index.html"'
$page = $page -replace 'href="/contact/index.html"', 'href="/webact-redesign/contact/index.html"'
$page = $page -replace 'href="/pricing/index.html"', 'href="/webact-redesign/pricing/index.html"'
$page = $page -replace 'href="/about/blog/', 'href="/webact-redesign/about/blog/'
$page = $page -replace 'href="/blog/', 'href="/webact-redesign/about/blog/'
$page = $page -replace 'href="blog/', 'href="/webact-redesign/about/blog/'
$page = $page -replace 'href="\.\./blog/', 'href="/webact-redesign/about/blog/'
$page = $page -replace 'href="\.\./about/blog/', 'href="/webact-redesign/about/blog/'

# Remove visible dates from blog cards/posts
$page = $page -replace '(?is)<time\b[^>]*>.*?</time>', ''
$page = $page -replace '(?is)<p[^>]*class="[^"]*(date|post-date|blog-date|meta)[^"]*"[^>]*>.*?</p>', ''
$page = $page -replace '(?is)<span[^>]*class="[^"]*(date|post-date|blog-date|meta)[^"]*"[^>]*>.*?</span>', ''
$page = $page -replace '\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},\s+\d{4}\b', ''
$page = $page -replace '\b\d{1,2}/\d{1,2}/\d{2,4}\b', ''
$page = $page -replace '\b\d{4}-\d{2}-\d{2}\b', ''

$css = @'
<style id="blog-redesign-final">
html,body{height:auto!important;overflow-x:hidden!important;overflow-y:auto!important}
body{margin:0}
.blog-page{color:#071421;background:#fff;overflow:visible!important}
.blog-page .blog-hero{
  background:radial-gradient(circle at 12% 18%,rgba(51,171,225,.24),transparent 30%),linear-gradient(135deg,#061421,#0d2740 52%,#071421);
  color:#fff;
  padding:92px min(6vw,72px);
  display:grid;
  grid-template-columns:minmax(0,1.05fr) minmax(340px,.72fr);
  gap:48px;
  align-items:center;
}
.blog-page .blog-hero h1{font-size:clamp(42px,6vw,78px);line-height:.96;margin:12px 0 22px;letter-spacing:-.05em}
.blog-page .blog-hero p{color:#d9edf8;font-size:20px;line-height:1.6}
.blog-page .eyebrow{letter-spacing:.12em;text-transform:uppercase;font-weight:900;color:#73d7ff}
.blog-proof{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 0}
.blog-proof span{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.08);border-radius:999px;padding:10px 14px;font-weight:800}
.blog-form{background:rgba(255,255,255,.96);color:#071421;border-radius:28px;padding:28px;box-shadow:0 30px 80px rgba(0,0,0,.28)}
.blog-form h2{font-size:28px;margin:0 0 8px}
.blog-form p{color:#4b5b66;font-size:16px;line-height:1.55}
.blog-form label{display:grid;gap:7px;margin-bottom:12px;font-weight:800;font-size:14px;color:#203241}
.blog-form input,.blog-form select,.blog-form textarea{width:100%;box-sizing:border-box;border:1px solid #cddce7;border-radius:12px;padding:13px 14px;font:inherit;background:#fff;color:#071421}
.blog-form textarea{resize:vertical;min-height:92px}
.blog-form .button{width:100%;border:0}
.blog-section{padding:84px min(6vw,72px)}
.blog-soft{background:#f4f8fb}
.blog-heading{max-width:980px;margin:0 auto 44px;text-align:center}
.blog-heading .eyebrow{color:#0c9bd2}
.blog-heading h2{font-size:clamp(32px,4vw,56px);line-height:1;margin:10px 0 16px;letter-spacing:-.04em}
.blog-heading p{font-size:18px;line-height:1.65;color:#4b5b66}
.blog-search-panel{max-width:1180px;margin:0 auto 36px;background:#fff;border:1px solid #e0ebf2;border-radius:28px;padding:28px;box-shadow:0 18px 42px rgba(7,20,33,.08)}
.blog-search-panel label{display:block;font-weight:900;font-size:22px;margin-bottom:12px}
.blog-search-panel input{width:100%;box-sizing:border-box;border:1px solid #cddce7;border-radius:16px;padding:17px 18px;font:inherit;background:#fff;color:#071421}
.blog-topic-row{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;margin:0 auto 38px;max-width:1100px}
.blog-topic-row a{background:#fff;border:1px solid #dcecf5;border-radius:999px;padding:12px 16px;text-decoration:none;color:#071421;font-weight:900;box-shadow:0 10px 24px rgba(7,20,33,.06)}
.blog-topic-row a:hover{border-color:#33abe1;color:#0c9bd2}
.blog-grid,
.blog-list,
.posts-grid,
.post-grid,
.article-grid,
.blog-card-grid{
  display:grid!important;
  grid-template-columns:repeat(3,minmax(0,1fr))!important;
  gap:24px!important;
  max-width:1400px!important;
  margin:0 auto!important;
}
.blog-card,
.post-card,
.article-card,
.blog-post,
.blog-list article,
.posts-grid article,
.post-grid article,
.article-grid article{
  background:#fff!important;
  border:1px solid #e0ebf2!important;
  border-radius:26px!important;
  overflow:hidden!important;
  box-shadow:0 18px 42px rgba(7,20,33,.08)!important;
  color:#071421!important;
}
.blog-card img,
.post-card img,
.article-card img,
.blog-post img,
.blog-list article img,
.posts-grid article img,
.post-grid article img,
.article-grid article img{
  width:100%!important;
  height:240px!important;
  object-fit:cover!important;
  display:block!important;
  background:#f4f8fb!important;
}
.blog-card a,
.post-card a,
.article-card a,
.blog-post a,
.blog-list article a,
.posts-grid article a,
.post-grid article a,
.article-grid article a{
  color:#071421;
  text-decoration:none;
}
.blog-card h2,.blog-card h3,
.post-card h2,.post-card h3,
.article-card h2,.article-card h3,
.blog-post h2,.blog-post h3,
.blog-list article h2,.blog-list article h3,
.posts-grid article h2,.posts-grid article h3,
.post-grid article h2,.post-grid article h3,
.article-grid article h2,.article-grid article h3{
  font-size:24px!important;
  line-height:1.12!important;
  margin:0 0 12px!important;
  color:#071421!important;
}
.blog-card p,
.post-card p,
.article-card p,
.blog-post p,
.blog-list article p,
.posts-grid article p,
.post-grid article p,
.article-grid article p{
  color:#4b5b66!important;
  line-height:1.65!important;
}
.blog-card > div,
.post-card > div,
.article-card > div,
.blog-post > div,
.blog-list article > div,
.posts-grid article > div,
.post-grid article > div,
.article-grid article > div{
  padding:24px!important;
}
.blog-page time,
.blog-page .date,
.blog-page .post-date,
.blog-page .blog-date,
.blog-page .meta,
.blog-page .post-meta{
  display:none!important;
}
.blog-final-cta{background:linear-gradient(135deg,#0b243a,#071421);color:#fff;text-align:center;padding:86px min(6vw,72px)}
.blog-final-cta h2{font-size:clamp(34px,5vw,62px);line-height:1;margin:0 0 16px}
.blog-final-cta p{color:#d4e8f2;font-size:19px;line-height:1.6;max-width:780px;margin:0 auto}
.blog-page .hero-actions,.blog-final-cta .hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}
.blog-final-cta .hero-actions{justify-content:center}
.blog-page .button.primary,.blog-form .button.primary{background:#33abe1!important;border:2px solid #33abe1!important;color:#061421!important}
.blog-page .button.secondary{background:#fff!important;border:2px solid #fff!important;color:#071421!important}
.blog-page .button.dark{background:#061421!important;border:2px solid #061421!important;color:#fff!important}
@media(max-width:1080px){
  .blog-page .blog-hero{grid-template-columns:1fr}
  .blog-grid,.blog-list,.posts-grid,.post-grid,.article-grid,.blog-card-grid{grid-template-columns:1fr!important}
}
@media(max-width:680px){
  .blog-page .blog-hero,.blog-section,.blog-final-cta{padding:56px 20px}
  .blog-page .hero-actions .button{width:100%;justify-content:center}
  .blog-proof span{width:100%;text-align:center}
}
</style>
'@

if ($page -notmatch 'blog-redesign-final') {
  $page = $page -replace '</head>', "$css`r`n</head>"
}

$page = $page -replace '<body>', '<body class="blog-page">'

$newHero = @'
<section class="blog-hero">
  <div>
    <p class="eyebrow">WebAct Blog</p>
    <h1>Website, SEO, marketing, and advertising insights for growing businesses.</h1>
    <p>Explore helpful WebAct articles designed to help business owners understand website design, search visibility, local marketing, digital advertising, branding, and online growth.</p>
    <div class="hero-actions">
      <a class="button primary" href="#blog-posts">Browse Articles</a>
      <a class="button secondary" href="/webact-redesign/contact/index.html">Ask WebAct</a>
    </div>
    <div class="blog-proof">
      <span>Website Tips</span>
      <span>SEO Insights</span>
      <span>Marketing Guides</span>
      <span>Business Growth</span>
    </div>
  </div>
  <form class="blog-form" aria-label="Blog help form">
    <h2>Need Help Applying This?</h2>
    <p>Tell us what you are trying to improve and WebAct can recommend the right next step.</p>
    <label>Full Name<input type="text" name="name"></label>
    <label>Email Address<input type="email" name="email"></label>
    <label>Topic
      <select name="topic">
        <option>Website Design</option>
        <option>SEO</option>
        <option>Local Marketing</option>
        <option>Digital Advertising</option>
        <option>Website Support</option>
      </select>
    </label>
    <label>Question<textarea rows="5"></textarea></label>
    <button class="button primary" type="button">Ask WebAct</button>
  </form>
</section>
'@

$page = $page -replace '(?s)<section class="page-hero">.*?</section>', $newHero

# Replace intro section if present
$intro = @'
<section class="blog-section blog-soft">
  <div class="blog-topic-row">
    <a href="#blog-posts">All Articles</a>
    <a href="/webact-redesign/design/index.html">Website Design</a>
    <a href="/webact-redesign/marketing/index.html">Marketing</a>
    <a href="/webact-redesign/digital-ads/index.html">Digital Advertising</a>
    <a href="/webact-redesign/about/faq.html">FAQ</a>
  </div>
  <div class="blog-heading">
    <p class="eyebrow">WebAct Resource Articles</p>
    <h2>Learn how to improve your website, visibility, and digital growth.</h2>
    <p>The WebAct blog is written for business owners who want practical guidance on websites, SEO, local marketing, advertising, online trust, and converting more visitors into customers.</p>
  </div>
</section>
'@

$page = $page -replace '(?s)<section class="section[^"]*blog[^"]*intro[^"]*">.*?</section>', $intro

# Make first main blog listing section identifiable
$page = $page -replace '<section class="section', '<section id="blog-posts" class="section'

# Add search panel before blog grid/list if not already there
$search = @'
<div class="blog-search-panel">
  <label for="blog-search">Search blog articles</label>
  <input id="blog-search" data-blog-search type="search" placeholder="Search website design, SEO, advertising, local marketing, branding...">
</div>
'@

if ($page -notmatch 'data-blog-search') {
  $page = $page -replace '(<section id="blog-posts" class="section[^>]*>)', "`$1`r`n$search"
}

# Add final CTA
$cta = @'
<section class="blog-final-cta">
  <h2>Want help turning ideas into results?</h2>
  <p>Use the blog for guidance, or contact WebAct if you want help improving your website, SEO, advertising, local visibility, or digital strategy.</p>
  <div class="hero-actions">
    <a class="button primary" href="/webact-redesign/contact/index.html">Contact WebAct</a>
    <a class="button secondary" href="/webact-redesign/about/portfolio.html">View Portfolio</a>
  </div>
</section>
'@

if ($page -notmatch 'blog-final-cta') {
  $page = $page -replace '</main>', "$cta`r`n</main>"
}

$script = @'
<script id="blog-search-script">
(function(){
  const input = document.querySelector('[data-blog-search]');
  const cards = Array.from(document.querySelectorAll('.blog-card,.post-card,.article-card,.blog-post,.blog-list article,.posts-grid article,.post-grid article,.article-grid article'));
  if(input){
    input.addEventListener('input', function(){
      const q = this.value.trim().toLowerCase();
      cards.forEach(card => {
        card.style.display = (!q || card.textContent.toLowerCase().includes(q)) ? '' : 'none';
      });
    });
  }
})();
</script>
'@

if ($page -notmatch 'blog-search-script') {
  $page = $page -replace '</body>', "$script`r`n</body>"
}

Set-Content $pagePath $page -NoNewline -Encoding UTF8

Write-Host "Blog page redesigned, dates removed, and links relinked." -ForegroundColor Green