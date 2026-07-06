$ErrorActionPreference = "Stop"

$file = ".\index.html"
$html = Get-Content $file -Raw

# 1) Fix 2Go Coconut Oil image.
# The exact 2Go image filename was not found by repo search, so use a known working portfolio image for now.
# Replace this later if you know the exact 2Go image filename.
$html = $html -replace 'src="/webact-redesign/Resources/images/2go[^"]*"', 'src="/webact-redesign/Resources/images/Jais-Boutique-1920w.png"'
$html = $html -replace 'src="Resources/images/2go[^"]*"', 'src="/webact-redesign/Resources/images/Jais-Boutique-1920w.png"'

# 2) Make sure the card label says 2Go Coconut Oil Website, not ecommerce.
$html = $html -replace 'Retail &amp; Ecommerce Websites', '2Go Coconut Oil Website'
$html = $html -replace 'Retail & Ecommerce Websites', '2Go Coconut Oil Website'
$html = $html -replace 'Ecommerce Website', '2Go Coconut Oil Website'
$html = $html -replace 'View ecommerce work', 'View 2Go Coconut Oil work'

# 3) Add dark styling for bottom Partnered With WebAct logo section.
# This targets common class names used in the final homepage file.
$style = @"

<style id="homepage-v2-final-fixes">
  .partnered-with-webact,
  .home-partner-logos,
  .partner-logo-rotator,
  .logo-rotator.partnered,
  section[aria-label="Partnered With WebAct"] {
    background: #061421 !important;
    color: #ffffff !important;
  }

  .partnered-with-webact .eyebrow,
  .home-partner-logos .eyebrow,
  .partner-logo-rotator .eyebrow,
  .logo-rotator.partnered .eyebrow,
  section[aria-label="Partnered With WebAct"] .eyebrow {
    color: #33abe1 !important;
  }

  .partnered-with-webact h2,
  .partnered-with-webact p,
  .home-partner-logos h2,
  .home-partner-logos p,
  .partner-logo-rotator h2,
  .partner-logo-rotator p,
  .logo-rotator.partnered h2,
  .logo-rotator.partnered p,
  section[aria-label="Partnered With WebAct"] h2,
  section[aria-label="Partnered With WebAct"] p {
    color: #ffffff !important;
  }

  .partnered-with-webact .logo-slide,
  .home-partner-logos .logo-slide,
  .partner-logo-rotator .logo-slide,
  .logo-rotator.partnered .logo-slide,
  section[aria-label="Partnered With WebAct"] .logo-slide {
    background: rgba(255,255,255,.95) !important;
    border-radius: 14px;
    padding: 18px 28px;
  }

  .partnered-with-webact img,
  .home-partner-logos img,
  .partner-logo-rotator img,
  .logo-rotator.partnered img,
  section[aria-label="Partnered With WebAct"] img {
    opacity: 1 !important;
    filter: none !important;
  }
</style>
"@

if ($html -notmatch 'homepage-v2-final-fixes') {
  $html = $html -replace '(?is)</head>', "$style`r`n</head>"
}

Set-Content $file $html -NoNewline -Encoding UTF8

Write-Host "Homepage portfolio card and partnered logo section fixed." -ForegroundColor Green