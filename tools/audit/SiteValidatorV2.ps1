$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$reportDir = ".\tools\audit\reports\v2"
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

function Get-PageType($relativePath) {
    if ($relativePath -match '^includes\\') { return "Include" }
    if ($relativePath -match '^assets\\templates\\|^assets\\webact-template') { return "Template" }
    if ($relativePath -match '^about\\blog\\|^pages\\about-blog') { return "Blog" }
    if ($relativePath -match '^about\\portfolio\\|^pages\\about-portfolio') { return "Portfolio" }
    if ($relativePath -match '^industries\\|^pages\\industries') { return "Industry" }
    if ($relativePath -match '^about\\website-knowledge-base\\|^about\\widget-knowledge-base\\|^pages\\about-website-knowledge-base|^pages\\about-widget-knowledge-base') { return "KnowledgeBase" }
    if ($relativePath -match '^addons\\website-app-store\\|^pages\\addons-website-app-store') { return "AppStore" }
    if ($relativePath -match '^(about|design|marketing|digital-ads|pricing|addons|contact)\\|^index\.html$') { return "Core" }
    return "Other"
}

function Resolve-InternalPath($baseFile, $rawPath) {
    $clean = ($rawPath -replace '\?.*$', '' -replace '#.*$', '')
$clean = $clean -replace '^/webact-redesign/', '/'
    if ([string]::IsNullOrWhiteSpace($clean)) { return $null }

    if ($clean.StartsWith("/")) {
        $target = Join-Path $root ($clean.TrimStart("/") -replace "/", "\")
    } else {
        $target = Join-Path $baseFile.DirectoryName ($clean -replace "/", "\")
    }

    if ($clean.EndsWith("/")) {
        $target = Join-Path $target "index.html"
    }

    return $target
}

$htmlFiles = Get-ChildItem -Recurse -Include *.html |
Where-Object {
    $_.FullName -notmatch "\\.git\\|\\node_modules\\|\\tools\\audit\\reports\\"
}

$results = foreach ($file in $htmlFiles) {
    $html = Get-Content $file.FullName -Raw
    $relative = $file.FullName.Replace($root + "\", "")
    $type = Get-PageType $relative

    $skipPageFramework = $type -in @("Include","Template")

    $titleCount = ([regex]::Matches($html, '(?is)<title\b[^>]*>')).Count
    $h1Count = ([regex]::Matches($html, '(?is)<h1\b[^>]*>')).Count

    $links = [regex]::Matches($html, '(?is)<a\b[^>]*href=["'']([^"'']+)["'']') |
        ForEach-Object { $_.Groups[1].Value } |
        Where-Object {
            $_ -and $_ -notmatch '^(https?:|mailto:|tel:|#|javascript:|data:)'
        }

    $images = [regex]::Matches($html, '(?is)<img\b[^>]*src=["'']([^"'']+)["'']') |
        ForEach-Object { $_.Groups[1].Value } |
        Where-Object {
            $_ -and $_ -notmatch '^(https?:|data:)'
        }

    $brokenLinks = @()
    foreach ($link in $links) {
        $target = Resolve-InternalPath $file $link
        if ($target -and !(Test-Path $target)) {
            $brokenLinks += $link
        }
    }

    $missingImages = @()
    foreach ($img in $images) {
        $target = Resolve-InternalPath $file $img
        if ($target -and !(Test-Path $target)) {
            $missingImages += $img
        }
    }

    $frameworkPass = $true
    if (-not $skipPageFramework) {
        $frameworkPass = (
            ($html -match '<div id="webact-header"></div>') -and
            ($html -match '<div id="webact-footer"></div>') -and
            ($html -match '/assets/js/routes.js') -and
            ($html -match '/assets/js/navigation.js') -and
            ($html -match '/assets/js/includes.js') -and
            ($html -notmatch 'wa-promodo-header') -and
            ($html -notmatch 'wa-global-footer')
        )
    }

    $seoPass = $true
    if (-not $skipPageFramework) {
        $seoPass = (
            ($titleCount -eq 1) -and
            ($html -match '(?is)<meta\s+name=["'']description["'']') -and
            ($h1Count -le 1)
        )
    }

    $linksPass = $brokenLinks.Count -eq 0
    $imagesPass = $missingImages.Count -eq 0

    [PSCustomObject]@{
        File = $relative
        Type = $type
        FrameworkPass = $frameworkPass
        LinksPass = $linksPass
        ImagesPass = $imagesPass
        SeoPass = $seoPass
        Header = $html -match '<div id="webact-header"></div>'
        Footer = $html -match '<div id="webact-footer"></div>'
        Routes = $html -match '/assets/js/routes.js'
        Navigation = $html -match '/assets/js/navigation.js'
        Includes = $html -match '/assets/js/includes.js'
        TitleCount = $titleCount
        H1Count = $h1Count
        MetaDescription = $html -match '(?is)<meta\s+name=["'']description["'']'
        Canonical = $html -match '(?is)<link\s+rel=["'']canonical["'']'
        BrokenLinkCount = $brokenLinks.Count
        BrokenLinks = ($brokenLinks -join " | ")
        MissingImageCount = $missingImages.Count
        MissingImages = ($missingImages -join " | ")
        OverallPass = ($frameworkPass -and $linksPass -and $imagesPass -and $seoPass)
    }
}

$results | Export-Csv "$reportDir\site-validation-v2-all.csv" -NoTypeInformation
$results | Where-Object { -not $_.FrameworkPass } | Export-Csv "$reportDir\framework-failures.csv" -NoTypeInformation
$results | Where-Object { -not $_.LinksPass } | Export-Csv "$reportDir\broken-links.csv" -NoTypeInformation
$results | Where-Object { -not $_.ImagesPass } | Export-Csv "$reportDir\missing-images.csv" -NoTypeInformation
$results | Where-Object { -not $_.SeoPass } | Export-Csv "$reportDir\seo-failures.csv" -NoTypeInformation

$summary = $results |
Group-Object Type |
ForEach-Object {
    [PSCustomObject]@{
        Type = $_.Name
        Total = $_.Count
        Passed = ($_.Group | Where-Object { $_.OverallPass }).Count
        Failed = ($_.Group | Where-Object { -not $_.OverallPass }).Count
        FrameworkFailures = ($_.Group | Where-Object { -not $_.FrameworkPass }).Count
        BrokenLinkPages = ($_.Group | Where-Object { -not $_.LinksPass }).Count
        MissingImagePages = ($_.Group | Where-Object { -not $_.ImagesPass }).Count
        SeoFailures = ($_.Group | Where-Object { -not $_.SeoPass }).Count
    }
}

$summary | Export-Csv "$reportDir\summary.csv" -NoTypeInformation

$style = @"
<style>
body{font-family:Arial,sans-serif;background:#f6f8fb;color:#111;margin:30px}
h1{margin-bottom:6px}
.grid{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:14px;margin:22px 0}
.card{background:#fff;border-radius:12px;padding:18px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.card strong{font-size:13px;color:#555}
.card div{font-size:30px;font-weight:800;margin-top:8px}
table{width:100%;border-collapse:collapse;background:#fff;margin-top:18px}
th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left;font-size:13px}
th{background:#111;color:#fff}
.fail{color:#b00020;font-weight:bold}
.pass{color:green;font-weight:bold}
</style>
"@

$total = $results.Count
$passed = ($results | Where-Object { $_.OverallPass }).Count
$failed = ($results | Where-Object { -not $_.OverallPass }).Count
$frameworkFailures = ($results | Where-Object { -not $_.FrameworkPass }).Count
$linkFailures = ($results | Where-Object { -not $_.LinksPass }).Count
$imageFailures = ($results | Where-Object { -not $_.ImagesPass }).Count
$seoFailures = ($results | Where-Object { -not $_.SeoPass }).Count

$summaryRows = foreach ($s in $summary) {
    "<tr>
        <td>$($s.Type)</td>
        <td>$($s.Total)</td>
        <td><span class='pass'>$($s.Passed)</span></td>
        <td><span class='fail'>$($s.Failed)</span></td>
        <td>$($s.FrameworkFailures)</td>
        <td>$($s.BrokenLinkPages)</td>
        <td>$($s.MissingImagePages)</td>
        <td>$($s.SeoFailures)</td>
    </tr>"
}

@"
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>WebAct Site Validator V2</title>
$style
</head>
<body>
<h1>WebAct Site Validator V2</h1>
<p>Generated: $(Get-Date)</p>

<div class="grid">
  <div class="card"><strong>Total Files</strong><div>$total</div></div>
  <div class="card"><strong>Passed</strong><div>$passed</div></div>
  <div class="card"><strong>Failed</strong><div>$failed</div></div>
  <div class="card"><strong>Framework Failures</strong><div>$frameworkFailures</div></div>
  <div class="card"><strong>Broken Link Pages</strong><div>$linkFailures</div></div>
  <div class="card"><strong>Missing Image Pages</strong><div>$imageFailures</div></div>
  <div class="card"><strong>SEO Failures</strong><div>$seoFailures</div></div>
</div>

<h2>Summary by Page Type</h2>
<table>
<thead>
<tr>
<th>Type</th>
<th>Total</th>
<th>Passed</th>
<th>Failed</th>
<th>Framework</th>
<th>Links</th>
<th>Images</th>
<th>SEO</th>
</tr>
</thead>
<tbody>
$($summaryRows -join "`n")
</tbody>
</table>

<p>CSV reports created in: <strong>$reportDir</strong></p>
</body>
</html>
"@ | Set-Content "$reportDir\site-validation-v2.html" -NoNewline

Write-Host "Site Validator V2 complete." -ForegroundColor Green
Write-Host "Report: $reportDir\site-validation-v2.html"
Write-Host "Summary: $reportDir\summary.csv"
Write-Host "Broken links: $reportDir\broken-links.csv"
Write-Host "Missing images: $reportDir\missing-images.csv"
Write-Host "SEO failures: $reportDir\seo-failures.csv"

Start-Process "$reportDir\site-validation-v2.html"