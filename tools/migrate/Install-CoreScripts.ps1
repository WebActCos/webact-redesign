$ErrorActionPreference = "Stop"

$coreFiles = @(
"index.html","about\index.html","about\about-us.html","about\portfolio.html","about\faq.html","about\blog.html","about\login.html","about\how-to-videos.html","about\website-knowledge-base.html","about\widget-knowledge-base.html",
"design\index.html","design\branding.html","design\graphic-design.html","design\logo-design.html","design\professional-editor.html","design\simple-editor.html","design\website-design.html",
"marketing\index.html","marketing\aeo.html","marketing\email-marketing.html","marketing\gmb.html","marketing\local-listings.html","marketing\local-seo.html","marketing\national-seo.html","marketing\seo.html",
"digital-ads\index.html","digital-ads\amazon-advertising.html","digital-ads\google-advertising.html","digital-ads\local-services-advertising.html","digital-ads\microsoft-advertising.html","digital-ads\social-media-advertising.html","digital-ads\television-advertising.html",
"pricing\index.html","pricing\advertising.html","pricing\design.html","pricing\marketing.html","pricing\packages.html","pricing\widgets.html",
"addons\index.html","addons\domain-names.html","addons\professional-email.html","addons\website-app-store.html","addons\widgets.html","contact\index.html"
)

foreach ($file in $coreFiles) {
  if (!(Test-Path $file)) {
    Write-Host "Missing: $file" -ForegroundColor Yellow
    continue
  }

  $html = Get-Content $file -Raw
  $html = $html -replace '(?is)\s*<script src="/assets/js/routes\.js"></script>', ''
  $html = $html -replace '(?is)\s*<script src="/assets/js/navigation\.js"></script>', ''
  $html = $html -replace '(?is)\s*<script src="/assets/js/includes\.js"></script>', ''

  $scripts = @'
  <script src="/assets/js/routes.js"></script>
  <script src="/assets/js/navigation.js"></script>
  <script src="/assets/js/includes.js"></script>
'@

  $html = $html -replace '(?is)</body>', ($scripts + "`r`n</body>")
  Set-Content $file $html -NoNewline
  Write-Host "Updated scripts: $file" -ForegroundColor Green
}
