$ErrorActionPreference = "Stop"

$blogRoot = ".\about\blog"
$files = Get-ChildItem $blogRoot -Recurse -Filter "index.html"

foreach ($file in $files) {
  $path = $file.FullName
  $html = Get-Content $path -Raw

  # Remove dates / author metadata
  $html = $html -replace '(?is)<time\b[^>]*>.*?</time>', ''
  $html = $html -replace '(?is)<p[^>]*class="[^"]*(date|post-date|blog-date|meta|author|byline)[^"]*"[^>]*>.*?</p>', ''
  $html = $html -replace '(?is)<span[^>]*class="[^"]*(date|post-date|blog-date|meta|author|byline)[^"]*"[^>]*>.*?</span>', ''
  $html = $html -replace '\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},\s+\d{4}\b', ''
  $html = $html -replace '\b\d{1,2}/\d{1,2}/\d{2,4}\b', ''
  $html = $html -replace '\b\d{4}-\d{2}-\d{2}\b', ''

  # Fix common links
  $html = $html -replace 'href="/index.html"', 'href="/webact-redesign/index.html"'
  $html = $html -replace 'href="/contact/index.html"', 'href="/webact-redesign/contact/index.html"'
  $html = $html -replace 'href="/pricing/index.html"', 'href="/webact-redesign/pricing/index.html"'
  $html = $html -replace 'href="/about/blog.html"', 'href="/webact-redesign/about/blog.html"'
  $html = $html -replace 'href="/about/blog/', 'href="/webact-redesign/about/blog/'
  $html = $html -replace 'href="/blog/', 'href="/webact-redesign/about/blog/'
  $html = $html -replace '/webact-redesign/webact-redesign/', '/webact-redesign/'

  $css = @'
<style id="blog-post-cleanup-final">
html,body{height:auto!important;overflow-x:hidden!important;overflow-y:auto!important}
body{margin:0}
.blog-post-page{background:#fff;color:#071421}
.blog-post-page main{overflow:visible!important}
.blog-post-page .post-hero,
.blog-post-page .article-hero,
.blog-post-page .page-hero{
  background:radial-gradient(circle at 12% 18%,rgba(51,171,225,.24),transparent 30%),linear-gradient(135deg,#061421,#0d2740 52%,#071421)!important;
  color:#fff!important;
  padding:92px min(6vw,72px)!important;
  display:block!important;
}
.blog-post-page h1{
  font-size:clamp(42px,6vw,76px)!important;
  line-height:.98!important;
  letter-spacing:-.05em!important;
  max-width:1050px!important;
}
.blog-post-page .page-hero p,
.blog-post-page .post-hero p,
.blog-post-page .article-hero p{
  color:#d9edf8!important;
  font-size:20px!important;
  line-height:1.6!important;
  max-width:900px!important;
}
.blog-post-page .breadcrumb,
.blog-post-page .post-date,
.blog-post-page .blog-date,
.blog-post-page .date,
.blog-post-page .meta,
.blog-post-page .post-meta,
.blog-post-page .author,
.blog-post-page .byline,
.blog-post-page time{
  display:none!important;
}
.blog-post-page .post-wrap,
.blog-post-page .article-wrap,
.blog-post-page .blog-content,
.blog-post-page .post-content,
.blog-post-page article{
  max-width:980px!important;
  margin:0 auto!important;
  padding:72px min(6vw,72px)!important;
}
.blog-post-page .post-content img,
.blog-post-page .blog-content img,
.blog-post-page article img{
  max-width:100%!important;
  height:auto!important;
  border-radius:22px!important;
  box-shadow:0 18px 42px rgba(7,20,33,.10)!important;
}
.blog-post-page .post-content p,
.blog-post-page .blog-content p,
.blog-post-page article p,
.blog-post-page li{
  color:#4b5b66!important;
  font-size:18px!important;
  line-height:1.8!important;
}
.blog-post-page .post-content h2,
.blog-post-page .blog-content h2,
.blog-post-page article h2{
  font-size:clamp(30px,3.5vw,46px)!important;
  line-height:1.05!important;
  letter-spacing:-.035em!important;
  color:#071421!important;
  margin-top:46px!important;
}
.blog-post-page .post-content h3,
.blog-post-page .blog-content h3,
.blog-post-page article h3{
  font-size:26px!important;
  color:#071421!important;
  margin-top:34px!important;
}
.blog-post-page .blog-back-cta{
  background:linear-gradient(135deg,#0b243a,#071421);
  color:#fff;
  text-align:center;
  padding:72px min(6vw,72px);
}
.blog-post-page .blog-back-cta h2{
  font-size:clamp(34px,5vw,58px);
  line-height:1;
  margin:0 0 16px;
}
.blog-post-page .blog-back-cta p{
  color:#d4e8f2;
  font-size:19px;
  line-height:1.6;
  max-width:760px;
  margin:0 auto;
}
.blog-post-page .blog-back-cta .actions{
  display:flex;
  gap:14px;
  flex-wrap:wrap;
  justify-content:center;
  margin-top:28px;
}
.blog-post-page .button.primary{
  background:#33abe1!important;
  border:2px solid #33abe1!important;
  color:#061421!important;
}
.blog-post-page .button.secondary{
  background:#fff!important;
  border:2px solid #fff!important;
  color:#071421!important;
}
@media(max-width:680px){
  .blog-post-page .post-hero,
  .blog-post-page .article-hero,
  .blog-post-page .page-hero,
  .blog-post-page .post-wrap,
  .blog-post-page .article-wrap,
  .blog-post-page .blog-content,
  .blog-post-page .post-content,
  .blog-post-page article,
  .blog-post-page .blog-back-cta{
    padding:56px 20px!important;
  }
}
</style>
'@

  if ($html -notmatch 'blog-post-cleanup-final') {
    $html = $html -replace '</head>', "$css`r`n</head>"
  }

  if ($html -match '<body[^>]*class="([^"]*)"') {
    $html = $html -replace '<body([^>]*)class="([^"]*)"', '<body$1class="$2 blog-post-page"'
  } else {
    $html = $html -replace '<body>', '<body class="blog-post-page">'
  }

  $cta = @'
<section class="blog-back-cta">
  <h2>Want help improving your website or marketing?</h2>
  <p>WebAct can help with website design, SEO, local marketing, digital advertising, and ongoing website support.</p>
  <div class="actions">
    <a class="button primary" href="/webact-redesign/contact/index.html">Contact WebAct</a>
    <a class="button secondary" href="/webact-redesign/about/blog.html">Back to Blog</a>
  </div>
</section>
'@

  if ($html -notmatch 'blog-back-cta') {
    $html = $html -replace '</main>', "$cta`r`n</main>"
  }

  Set-Content $path $html -NoNewline -Encoding UTF8
}

git add about/blog
git commit -m "Clean and standardize all blog post pages"
git push origin main