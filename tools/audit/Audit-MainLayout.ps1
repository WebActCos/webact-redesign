$ErrorActionPreference = "Stop"

$pages = @(
"index.html",
"about\index.html","about\about-us.html","about\portfolio.html","about\faq.html","about\blog.html","about\login.html","about\how-to-videos.html","about\website-knowledge-base.html","about\widget-knowledge-base.html",
"design\index.html","design\branding.html","design\graphic-design.html","design\logo-design.html","design\professional-editor.html","design\simple-editor.html","design\website-design.html",
"marketing\index.html","marketing\aeo.html","marketing\email-marketing.html","marketing\gmb.html","marketing\local-listings.html","marketing\local-seo.html","marketing\national-seo.html","marketing\seo.html",
"digital-ads\index.html","digital-ads\amazon-advertising.html","digital-ads\google-advertising.html","digital-ads\local-services-advertising.html","digital-ads\microsoft-advertising.html","digital-ads\social-media-advertising.html","digital-ads\television-advertising.html",
"pricing\index.html","pricing\advertising.html","pricing\design.html","pricing\marketing.html","pricing\packages.html","pricing\widgets.html",
"addons\index.html","addons\domain-names.html","addons\professional-email.html","addons\website-app-store.html","addons\widgets.html",
"contact\index.html"
)

$results = foreach ($page in $pages) {
  if (!(Test-Path $page)) { continue }

  $html = Get-Content $page -Raw

  [PSCustomObject]@{
    Page = $page
    HeaderPlaceholder = $html -match '<div id="webact-header"></div>'
    FooterPlaceholder = $html -match '<div id="webact-footer"></div>'
    InlineOldHeaderCSS = $html -match 'webact-promodo-header-style'
    StylesCSS = $html -match 'styles\.css'
    HeaderCSS = $html -match 'webact-promodo-nav\.css'
    FooterCSS = $html -match 'webact-footer\.css'
    RoutesJS = $html -match 'routes\.js'
    NavigationJS = $html -match 'navigation\.js'
    IncludesJS = $html -match 'includes\.js'
    OldNavJS = $html -match 'webact-promodo-nav\.js'
    ScriptJS = $html -match 'script\.js'
  }
}

$results | Format-Table -AutoSize
$results | Export-Csv ".\tools\audit\reports\main-layout-audit.csv" -NoTypeInformation

Write-Host "Saved: .\tools\audit\reports\main-layout-audit.csv" -ForegroundColor Green