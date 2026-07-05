$ErrorActionPreference = "Stop"

$root = (Get-Location).Path

$coreFiles = @(
    "index.html",
    "about\index.html",
    "about\about-us.html",
    "about\portfolio.html",
    "about\faq.html",
    "about\blog.html",
    "about\login.html",
    "about\how-to-videos.html",
    "about\website-knowledge-base.html",
    "about\widget-knowledge-base.html",
    "design\index.html",
    "design\branding.html",
    "design\graphic-design.html",
    "design\logo-design.html",
    "design\professional-editor.html",
    "design\simple-editor.html",
    "design\website-design.html",
    "marketing\index.html",
    "marketing\aeo.html",
    "marketing\email-marketing.html",
    "marketing\gmb.html",
    "marketing\local-listings.html",
    "marketing\local-seo.html",
    "marketing\national-seo.html",
    "marketing\seo.html",
    "digital-ads\index.html",
    "digital-ads\amazon-advertising.html",
    "digital-ads\google-advertising.html",
    "digital-ads\local-services-advertising.html",
    "digital-ads\microsoft-advertising.html",
    "digital-ads\social-media-advertising.html",
    "digital-ads\television-advertising.html",
    "pricing\index.html",
    "pricing\advertising.html",
    "pricing\design.html",
    "pricing\marketing.html",
    "pricing\packages.html",
    "pricing\widgets.html",
    "addons\index.html",
    "addons\domain-names.html",
    "addons\professional-email.html",
    "addons\website-app-store.html",
    "addons\widgets.html",
    "contact\index.html"
)

foreach ($relativePath in $coreFiles) {
    $path = Join-Path $root $relativePath

    if (!(Test-Path $path)) {
        Write-Host "Skipped missing file: $relativePath" -ForegroundColor Yellow
        continue
    }

    $html = Get-Content $path -Raw
    $original = $html

    # Remove bad misplaced include markup before body
    $html = $html -replace '(?is)\s*<div id="webact-footer"></div>\s*<script src="/assets/js/includes\.js"></script>\s*(?=<body)', "`r`n"

    # Replace hardcoded header with universal header placeholder
    $html = $html -replace '(?is)<header\b[^>]*class="[^"]*wa-promodo-header[^"]*"[^>]*>.*?</header>', '<div id="webact-header"></div>'
    $html = $html -replace '(?is)<header\b[^>]*data-wa-nav[^>]*>.*?</header>', '<div id="webact-header"></div>'

    # Replace hardcoded footer with universal footer placeholder
    $html = $html -replace '(?is)<footer\b[^>]*class="[^"]*wa-global-footer[^"]*"[^>]*>.*?</footer>', '<div id="webact-footer"></div>'

    # Remove old inline header script
    $html = $html -replace '(?is)\s*<script id="webact-promodo-header-script">.*?</script>', ''

    # Remove old nav script if present
    $html = $html -replace '(?is)\s*<script src="assets/js/webact-promodo-nav\.js" defer></script>', ''
    $html = $html -replace '(?is)\s*<script src="/assets/js/webact-promodo-nav\.js" defer></script>', ''

    # Ensure header placeholder is first inside body
    if ($html -notmatch '(?is)<div id="webact-header"></div>') {
        $html = $html -replace '(?is)<body([^>]*)>', '<body$1>' + "`r`n" + '<div id="webact-header"></div>'
    }

    # Ensure footer placeholder exists before scripts/body close
    if ($html -notmatch '(?is)<div id="webact-footer"></div>') {
        $html = $html -replace '(?is)</body>', '<div id="webact-footer"></div>' + "`r`n" + '</body>'
    }

    # Remove duplicate include loader scripts
    $html = $html -replace '(?is)\s*<script src="/assets/js/includes\.js"></script>', ''

    # Add include loader before closing body
    $html = $html -replace '(?is)</body>', ("  <script src=""/assets/js/includes.js""></script>" + "`r`n" + "</body>")

    # Clean accidental duplicated blank lines
    $html = $html -replace "(\r?\n){4,}", "`r`n`r`n"

    if ($html -ne $original) {
        Set-Content -Path $path -Value $html -NoNewline
        Write-Host "Converted: $relativePath" -ForegroundColor Green
    } else {
        Write-Host "No change: $relativePath" -ForegroundColor Gray
    }
}