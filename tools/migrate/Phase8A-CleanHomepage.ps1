$ErrorActionPreference = "Stop"

$file = ".\index.html"
$html = Get-Content $file -Raw

# Remove old embedded Promodo header CSS from homepage
$html = $html -replace '(?is)<style id="webact-promodo-header-style">.*?</style>', ''

# Remove old homepage-only nav/footer CSS if universal CSS now handles them
$html = $html -replace '(?is)\s*<link rel="stylesheet" href="assets/css/webact-promodo-nav\.css">\s*', ''
$html = $html -replace '(?is)\s*<link rel="stylesheet" href="assets/css/webact-footer\.css">\s*', ''

# Make homepage links root-relative
$replacements = @{
  'href="contact/index.html"' = 'href="/contact/index.html"'
  'href="design/website-design.html"' = 'href="/design/website-design.html"'
  'href="marketing/local-seo.html"' = 'href="/marketing/local-seo.html"'
  'href="digital-ads/google-advertising.html"' = 'href="/digital-ads/google-advertising.html"'
  'href="marketing/aeo.html"' = 'href="/marketing/aeo.html"'
  'href="design/branding.html"' = 'href="/design/branding.html"'
  'href="digital-ads/television-advertising.html"' = 'href="/digital-ads/television-advertising.html"'
  'href="pricing/design.html"' = 'href="/pricing/design.html"'
  'href="about/portfolio/industry/index.html"' = 'href="/about/portfolio/industry/index.html"'
  'href="about/portfolio/best-restaurant-website-designs/index.html"' = 'href="/about/portfolio/best-restaurant-website-designs/index.html"'
  'href="about/portfolio/best-dental-website-designs/index.html"' = 'href="/about/portfolio/best-dental-website-designs/index.html"'
  'href="about/portfolio/best-law-firm-website-designs/index.html"' = 'href="/about/portfolio/best-law-firm-website-designs/index.html"'
  'href="about/portfolio/industry/driving-school/index.html"' = 'href="/about/portfolio/industry/driving-school/index.html"'
  'href="about/portfolio/industry/home-services/index.html"' = 'href="/about/portfolio/industry/home-services/index.html"'
  'href="about/portfolio/best-ecommerce-website-designs/index.html"' = 'href="/about/portfolio/best-ecommerce-website-designs/index.html"'
}

foreach ($old in $replacements.Keys) {
  $html = $html.Replace($old, $replacements[$old])
}

Set-Content $file $html -NoNewline

Write-Host "Homepage cleaned: index.html" -ForegroundColor Green