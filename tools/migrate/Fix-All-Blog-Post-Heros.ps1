$ErrorActionPreference = "Stop"

$blogRoot = ".\about\blog"
$files = Get-ChildItem $blogRoot -Recurse -Filter "index.html"

function Clean-Text($text) {
  if ($null -eq $text) { return "" }

  $text = [System.Net.WebUtility]::HtmlDecode($text)

  $text = $text -replace [char]0x2018, "'"
  $text = $text -replace [char]0x2019, "'"
  $text = $text -replace [char]0x201C, '"'
  $text = $text -replace [char]0x201D, '"'
  $text = $text -replace [char]0x2013, "-"
  $text = $text -replace [char]0x2014, "-"
  $text = $text -replace [char]0x2026, "..."
  $text = $text -replace [char]0x00A0, " "

  $text = $text -replace "â.{1,6}", "'"
  $text = $text -replace "Ã.{1,4}", "'"
  $text = $text -replace "Â", ""

  $text = $text -replace "\s+", " "
  return $text.Trim()
}

$css = @"
<style id="blog-post-redesign-v3">
html,body{height:auto!important;overflow-x:hidden!important;overflow-y:auto!important}
body{margin:0}
.blog-post-page{background:#fff;color:#071421}
.blog-post-hero{background:linear-gradient(135deg,#061421,#0d2740 52%,#071421);color:#fff;padding:92px min(6vw,72px);display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.8fr);gap:48px;align-items:center}
.blog-post-hero .eyebrow{color:#73d7ff;letter-spacing:.12em;text-transform:uppercase;font-weight:900;margin:0 0 18px}
.blog-post-hero h1{font-size:clamp(42px,6vw,76px);line-height:.98;letter-spacing:-.05em;margin:0 0 22px}
.blog-post-hero p{color:#d9edf8;font-size:20px;line-height:1.65;margin:0}
.blog-post-hero-media{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);border-radius:28px;padding:14px;box-shadow:0 30px 80px rgba(0,0,0,.28)}
.blog-post-hero-media img{width:100%;height:420px;object-fit:cover;border-radius:20px;display:block}
.blog-post-page .hero-actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:28px}
.blog-post-page .button{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:190px!important;min-height:54px!important;padding:13px 22px!important;border-radius:14px!important;font-weight:900!important;text-decoration:none!important}
.blog-post-page .button.primary{background:#33abe1!important;border:2px solid #33abe1!important;color:#061421!important}
.blog-post-page .button.secondary{background:#fff!important;border:2px solid #fff!important;color:#071421!important}
.blog-post-page .breadcrumb,.blog-post-page .post-date,.blog-post-page .blog-date,.blog-post-page .date,.blog-post-page .meta,.blog-post-page .post-meta,.blog-post-page .author,.blog-post-page .byline,.blog-post-page time{display:none!important}
.blog-post-page article,.blog-post-page .post-content,.blog-post-page .blog-content,.blog-post-page .article-content,.blog-post-page .post-wrap,.blog-post-page .article-wrap{max-width:980px!important;margin:0 auto!important;padding:72px min(6vw,72px)!important}
.blog-post-page article p,.blog-post-page .post-content p,.blog-post-page .blog-content p,.blog-post-page li{color:#4b5b66!important;font-size:18px!important;line-height:1.8!important}
.blog-post-page article h2,.blog-post-page .post-content h2,.blog-post-page .blog-content h2{font-size:clamp(30px,3.5vw,46px)!important;line-height:1.05!important;letter-spacing:-.035em!important;color:#071421!important;margin-top:46px!important}
.blog-post-page article img,.blog-post-page .post-content img,.blog-post-page .blog-content img{max-width:100%!important;height:auto!important;border-radius:22px!important;box-shadow:0 18px 42px rgba(7,20,33,.10)!important}
.blog-back-cta{background:linear-gradient(135deg,#0b243a,#071421);color:#fff;text-align:center;padding:72px min(6vw,72px)}
.blog-back-cta h2{font-size:clamp(34px,5vw,58px);line-height:1;margin:0 0 16px}
.blog-back-cta p{color:#d4e8f2;font-size:19px;line-height:1.6;max-width:760px;margin:0 auto}
.blog-back-cta .actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:28px}
@media(max-width:980px){.blog-post-hero{grid-template-columns:1fr}.blog-post-hero-media img{height:auto}}
@media(max-width:680px){.blog-post-hero,.blog-post-page article,.blog-post-page .post-content,.blog-post-page .blog-content,.blog-back-cta{padding:56px 20px!important}.blog-post-page .hero-actions .button{width:100%;justify-content:center}}
</style>
"@

foreach ($file in $files) {
  $path = $file.FullName
  $html = Get-Content $path -Raw

  $html = Clean-Text $html

  $titleMatch = [regex]::Match($html, '<h1[^>]*>(.*?)</h1>', 'IgnoreCase,Singleline')
  if ($titleMatch.Success) {
    $title = Clean-Text ($titleMatch.Groups[1].Value -replace '<[^>]+>', '')
  } else {
    $title = (Get-Culture).TextInfo.ToTitleCase(($file.Directory.Name -replace '-', ' '))
  }

  $imgMatch = [regex]::Match($html, '<img[^>]+src="([^"]+)"[^>]*>', 'IgnoreCase,Singleline')
  if ($imgMatch.Success) {
    $img = $imgMatch.Groups[1].Value
  } else {
    $img = "/webact-redesign/assets/professional-editor.png"
  }

  $summary = ""
  $paragraphs = [regex]::Matches($html, '<p[^>]*>(.*?)</p>', 'IgnoreCase,Singleline')
  foreach ($p in $paragraphs) {
    $txt = Clean-Text ($p.Groups[1].Value -replace '<[^>]+>', ' ')
    if ($txt.Length -gt 80 -and $txt -notmatch "Contact WebAct|Back to Blog|Read More|Want help") {
      $summary = $txt
      break
    }
  }

  if ($summary.Length -gt 360) {
    $summary = $summary.Substring(0,360)
    $summary = $summary -replace '\s+\S*$', ''
    $summary = $summary + "..."
  }

  if ([string]::IsNullOrWhiteSpace($summary)) {
    $summary = "Read this WebAct article for practical website, marketing, advertising, and business growth guidance."
  }

  $newHero = @"
<section class="blog-post-hero">
  <div class="blog-post-hero-copy">
    <p class="eyebrow">WebAct Blog</p>
    <h1>$title</h1>
    <p>$summary</p>
    <div class="hero-actions">
      <a class="button primary" href="#article-content">Read Article</a>
      <a class="button secondary" href="/webact-redesign/about/blog.html">Back to Blog</a>
    </div>
  </div>
  <div class="blog-post-hero-media">
    <img src="$img" alt="$title">
  </div>
</section>
"@

  $html = $html -replace '<style id="blog-post-cleanup-final">[\s\S]*?</style>', ''
  $html = $html -replace '<style id="blog-post-hero-redesign">[\s\S]*?</style>', ''
  $html = $html -replace '<style id="blog-post-redesign-v3">[\s\S]*?</style>', ''

  $html = $html -replace '(?is)<section[^>]*class="[^"]*(page-hero|post-hero|article-hero|blog-post-hero)[^"]*"[^>]*>[\s\S]*?</section>', $newHero

  $html = $html -replace '(?is)<time\b[^>]*>[\s\S]*?</time>', ''
  $html = $html -replace '(?is)<p[^>]*class="[^"]*(date|post-date|blog-date|meta|author|byline)[^"]*"[^>]*>[\s\S]*?</p>', ''
  $html = $html -replace '(?is)<span[^>]*class="[^"]*(date|post-date|blog-date|meta|author|byline)[^"]*"[^>]*>[\s\S]*?</span>', ''

  $html = $html -replace '(?i)(Read More\s*){2,}', 'Read More '

  if ($html -notmatch 'id="article-content"') {
    $html = $html -replace '(?is)<(article|section|div)([^>]*class="[^"]*(post-content|blog-content|article-content|post-wrap|article-wrap)[^"]*"[^>]*)>', '<$1 id="article-content"$2>'
  }

  if ($html -notmatch '<body[^>]*class="[^"]*blog-post-page') {
    if ($html -match '<body[^>]*class="([^"]*)"') {
      $html = $html -replace '<body([^>]*)class="([^"]*)"', '<body$1class="$2 blog-post-page"'
    } else {
      $html = $html -replace '<body>', '<body class="blog-post-page">'
    }
  }

  if ($html -notmatch 'blog-post-redesign-v3') {
    $html = $html -replace '</head>', "$css`r`n</head>"
  }

  if ($html -notmatch 'blog-back-cta') {
    $cta = '<section class="blog-back-cta"><h2>Want help improving your website or marketing?</h2><p>WebAct can help with website design, SEO, local marketing, digital advertising, and ongoing website support.</p><div class="actions"><a class="button primary" href="/webact-redesign/contact/index.html">Contact WebAct</a><a class="button secondary" href="/webact-redesign/about/blog.html">Back to Blog</a></div></section>'
    $html = $html -replace '</main>', "$cta`r`n</main>"
  }

  Set-Content $path $html -NoNewline -Encoding UTF8
}

git add about/blog
git commit -m "Fix blog post heroes and encoding"
git push origin main
