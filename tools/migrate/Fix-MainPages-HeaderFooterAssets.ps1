$ErrorActionPreference = "Stop"

$mainPages = @(
"index.html",
"about\index.html","about\about-us.html","about\portfolio.html","about\faq.html","about\blog.html","about\login.html","about\how-to-videos.html","about\website-knowledge-base.html","about\widget-knowledge-base.html",
"design\index.html","design\branding.html","design\graphic-design.html","design\logo-design.html","design\professional-editor.html","design\simple-editor.html","design\website-design.html",
"marketing\index.html","marketing\aeo.html","marketing\email-marketing.html","marketing\gmb.html","marketing\local-listings.html","marketing\local-seo.html","marketing\national-seo.html","marketing\seo.html",
"digital-ads\index.html","digital-ads\amazon-advertising.html","digital-ads\google-advertising.html","digital-ads\local-services-advertising.html","digital-ads\microsoft-advertising.html","digital-ads\social-media-advertising.html","digital-ads\television-advertising.html",
"pricing\index.html","pricing\advertising.html","pricing\design.html","pricing\marketing.html","pricing\packages.html","pricing\widgets.html",
"addons\index.html","addons\domain-names.html","addons\professional-email.html","addons\website-app-store.html","addons\widgets.html",
"contact\index.html"
)

foreach ($file in $mainPages) {
  if (!(Test-Path $file)) { continue }

  $html = Get-Content $file -Raw

  # Remove old inline duplicated header CSS
  $html = $html -replace '(?is)<style id="webact-promodo-header-style">.*?</style>', ''

  # Normalize CSS
  $html = $html -replace 'href="(\.\./)*styles\.css\?v=reviews-layout-fix"', 'href="/webact-redesign/styles.css?v=reviews-layout-fix"'
  $html = $html -replace 'href="(\.\./)*assets/css/webact-promodo-nav\.css"', 'href="/webact-redesign/assets/css/webact-promodo-nav.css"'
  $html = $html -replace 'href="(\.\./)*assets/css/webact-footer\.css"', 'href="/webact-redesign/assets/css/webact-footer.css"'

  # Normalize JS
  $html = $html -replace 'src="(\.\./)*script\.js\?v=reviews-layout-fix"', 'src="/webact-redesign/script.js?v=reviews-layout-fix"'
  $html = $html -replace 'src="(\.\./)*assets/js/webact-promodo-nav\.js"', 'src="/webact-redesign/assets/js/webact-promodo-nav.js"'
  $html = $html -replace 'src="(\.\./)*assets/js/routes\.js"', 'src="/webact-redesign/assets/js/routes.js"'
  $html = $html -replace 'src="(\.\./)*assets/js/navigation\.js"', 'src="/webact-redesign/assets/js/navigation.js"'
  $html = $html -replace 'src="(\.\./)*assets/js/includes\.js"', 'src="/webact-redesign/assets/js/includes.js"'

  # Ensure header/footer placeholders
  if ($html -notmatch '<div id="webact-header"></div>') {
    $html = $html -replace '(?is)<body([^>]*)>', '<body$1>' + "`r`n<div id=`"webact-header`"></div>"
  }

  if ($html -notmatch '<div id="webact-footer"></div>') {
    $html = $html -replace '(?is)</main>', '</main>' + "`r`n<div id=`"webact-footer`"></div>"
  }

  Set-Content $file $html -NoNewline
  Write-Host "Fixed: $file"
}

# Fix universal header logo + homepage link
$header = Get-Content .\includes\header.html -Raw
$header = $header -replace 'href="/"', 'href="/index.html"'
$header = $header -replace 'src="/assets/images/webact-logo.png"', 'src="/images/webact-logo.png"'
Set-Content .\includes\header.html $header -NoNewline

# Fix footer homepage link
$footer = Get-Content .\includes\footer.html -Raw
$footer = $footer -replace 'href="/"', 'href="/index.html"'
Set-Content .\includes\footer.html $footer -NoNewline

Write-Host "Main pages, header, and footer repaired." -ForegroundColor Green