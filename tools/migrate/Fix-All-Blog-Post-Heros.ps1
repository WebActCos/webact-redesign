cd C:\Projects\webact.com

@'
$ErrorActionPreference = "Stop"

$blogRoot = ".\about\blog"
$files = Get-ChildItem $blogRoot -Recurse -Filter "index.html"

function Fix-EncodingText($text) {
  $text = $text -replace [char]0x2019, "'"
  $text = $text -replace [char]0x2018, "'"
  $text = $text -replace [char]0x201C, '"'
  $text = $text -replace [char]0x201D, '"'
  $text = $text -replace [char]0x2013, "-"
  $text = $text -replace [char]0x2014, "-"
  $text = $text -replace [char]0x2026, "..."
  $text = $text -replace [char]0x00A0, " "
  $text = $text -replace [char]0x2122, "&trade;"

  # Remove the most common mojibake patterns without typing the bad symbols directly
  $text = $text -replace "Ã.", "'"
  $text = $text -replace "â..", "'"
  $text = $text -replace "â....", "'"
  $text = $text -replace "Â", ""
  return $text
}

foreach ($file in $files) {
  $path = $file.FullName
  $html = Get-Content $path -Raw
  $html = Fix-EncodingText $html

  # Remove / WEBACT and metadata labels
  $html = $html -replace '(?is)<p[^>]*class="[^"]*(breadcrumb|eyebrow|category|meta)[^"]*"[^>]*>\s*/?\s*WebAct\s*</p>', ''
  $html = $html -replace '(?is)<span[^>]*class="[^"]*(breadcrumb|eyebrow|category|meta)[^"]*"[^>]*>\s*/?\s*WebAct\s*</span>', ''
  $html = $html -replace '(?is)<div[^>]*class="[^"]*(breadcrumb|eyebrow|category|meta)[^"]*"[^>]*>\s*/?\s*WebAct\s*</div>', ''

  # Remove dates / author metadata
  $html = $html -replace '(?is)<time\b[^>]*>.*?</time>', ''
  $html = $html -replace '(?is)<p[^>]*class="[^"]*(date|post-date|blog-date|meta|author|byline)[^"]*"[^>]*>.*?</p>', ''
  $html = $html -replace '(?is)<span[^>]*class="[^"]*(date|post-date|blog-date|meta|author|byline)[^"]*"[^>]*>.*?</span>', ''
  $html = $html -replace '\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},\s+\d{4}\b', ''
  $html = $html -replace '\b\d{1,2}/\d{1,2}/\d{2,4}\b', ''
  $html = $html -replace '\b\d{4}-\d{2}-\d{2}\b', ''

  # Remove duplicate Read More
  $html = $html -replace '(?i)(Read More\s*){2,}', 'Read More '

  # Get title
  $title = ""
  $h1 = [regex]::Match($html, '(?is)<h1[^>]*>(.*?)</h1>')
  if ($h1.Success) {
    $title = ($h1.Groups[1].Value -replace '<[^>]+>', '').Trim()
  } else {
    $title = $file.Directory.Name -replace '-', ' '
    $title = (Get-Culture).TextInfo.ToTitleCase($title)
  }

  # Get first image
  $img = ""
  $imgMatch = [regex]::Match($html, '(?is)<img[^>]+src="([^"]+)"[^>]*>')
  if ($imgMatch.Success) {
    $img = $imgMatch.Groups[1].Value
  }
  if ([string]::IsNullOrWhiteSpace($img)) {
    $img = "/webact-redesign/assets/professional-editor.png"
  }

  # Get summary
  $summary = ""
  $paragraphs = [regex]::Matches($html, '(?is)<p[^>]*>(.*?)</p>')
  foreach ($p in $paragraphs) {
    $txt = ($p.Groups[1].Value -replace '<[^>]+>', ' ')
    $txt = [System.Net.WebUtility]::HtmlDecode($txt)
    $txt = Fix-EncodingText $txt
    $txt = $txt -replace '\s+', ' '
    $txt = $txt.Trim()

    if ($txt.Length -gt 80 -and $txt -notmatch 'Want help improving|Contact WebAct|Back to Blog|Read More') {
      $summary = $txt
      break
    }
  }

  if ($summary.Length -gt 360) {
    $summary = $summary.Substring(0, 360).Trim()
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

  if ($html -match '(?is)<section[^>]*class="[^"]*(page-hero|post-hero|article-hero|blog-post-hero)[^"]*"[^>]*>.*?</section>') {
    $html = [regex]::Replace($html, '(?is)<section[^>]*class="[^"]*(page-hero|post-hero|article-hero|blog-post-hero)[^"]*"[^>]*>.*?</section>', $newHero, 1)
  } else {
    $html = $html -replace '<main[^>]*>', ('$0' + "`r`n" + $newHero)
  }

  if ($html -notmatch 'id="article-content"') {
    $html = $html -replace '(?is)<(article|section|div)([^>]*class="[^"]*(post-content|blog-content|article-content|post-wrap|article-wrap)[^"]*"[^>]*)>', '<$1 id="article-content"$2>'
  }

  $css = @'
<style id="blog-post-hero-redesign">
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
.blog-post-page .post-wrap,.blog-post-page .article-wrap,.blog-post-page .blog-content,.blog-post-page .post-content,.blog-post-page article{max-width:980px!important;margin:0 auto!important;padding:72px min(6vw,72px)!important}
.blog-post-page .post-content p,.blog-post-page .blog-content p,.blog-post-page article p,.blog-post-page li{color:#4b5b66!important;font-size:18px!important;line-height:1.8!important}
.blog-post-page .post-content h2,.blog-post-page .blog-content h2,.blog-post-page article h2{font-size:clamp(30px,3.5vw,46px)!important;line-height:1.05!important;letter-spacing:-.035em!important;color:#071421!important;margin-top:46px!important}
.blog-post-page .blog-back-cta{background:linear-gradient(135deg,#0b243a,#071421);color:#fff;text-align:center;padding:72px min(6vw,72px)}
.blog-post-page .blog-back-cta h2{font-size:clamp(34px,5vw,58px);line-height:1;margin:0 0 16px}
.blog-post-page .blog-back-cta p{color:#d4e8f2;font-size:19px;line-height:1.6;max-width:760px;margin:0 auto}
.blog-post-page .blog-back-cta .actions{display:flex;gap:14px;flex-wrap:wrap;justify-content:center;margin-top:28px}
@media(max-width:980px){.blog-post-hero{grid-template-columns:1fr}.blog-post-hero-media img{height:auto}}
@media(max-width:680px){.blog-post-hero,.blog-post-page .post-wrap,.blog-post-page .article-wrap,.blog-post-page .blog-content,.blog-post-page .post-content,.blog-post-page article,.blog-post-page .blog-back-cta{padding:56px 20px!important}.blog-post-page .hero-actions .button{width:100%;justify-content:center}}
</style>
'@

  $html = $html -replace '(?is)<style id="blog-post-cleanup-final">.*?</style>', ''
  $html = $html -replace '(?is)<style id="blog-post-hero-redesign">.*?</style>', ''
  $html = $html -replace '</head>', "$css`r`n</head>"

  if ($html -match '<body[^>]*class="([^"]*)"') {
    if ($html -notmatch 'blog-post-page') {
      $html = $html -replace '<body([^>]*)class="([^"]*)"', '<body$1class="$2 blog-post-page"'
    }
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
git commit -m "Redesign all blog post heroes"
git push origin main
'@ | Set-Content .\tools\migrate\Fix-All-Blog-Post-Heros.ps1 -Encoding UTF8

.\tools\migrate\Fix-All-Blog-Post-Heros.ps1