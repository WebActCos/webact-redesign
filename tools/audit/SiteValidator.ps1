$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$reportDir = ".\tools\audit\reports"

New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

$htmlFiles = Get-ChildItem -Recurse -Include *.html |
Where-Object {
    $_.FullName -notmatch "\\.git\\|\\node_modules\\"
}

$results = foreach ($file in $htmlFiles) {
    $html = Get-Content $file.FullName -Raw
    $relative = $file.FullName.Replace($root + "\", "")

    $titleCount = ([regex]::Matches($html, '(?is)<title\b[^>]*>')).Count
    $h1Count = ([regex]::Matches($html, '(?is)<h1\b[^>]*>')).Count
    $metaDescription = $html -match '(?is)<meta\s+name=["'']description["'']'
    $canonical = $html -match '(?is)<link\s+rel=["'']canonical["'']'

    $links = [regex]::Matches($html, '(?is)<a\b[^>]*href=["'']([^"'']+)["'']') |
        ForEach-Object { $_.Groups[1].Value } |
        Where-Object {
            $_ -and
            $_ -notmatch '^(https?:|mailto:|tel:|#|javascript:)'
        }

    $images = [regex]::Matches($html, '(?is)<img\b[^>]*src=["'']([^"'']+)["'']') |
        ForEach-Object { $_.Groups[1].Value } |
        Where-Object {
            $_ -and $_ -notmatch '^https?:'
        }

    $brokenLinks = @()
    foreach ($link in $links) {
        $clean = ($link -replace '\?.*$', '' -replace '#.*$', '')

        if ($clean.StartsWith("/")) {
            $target = Join-Path $root ($clean.TrimStart("/") -replace "/", "\")
        } else {
            $target = Join-Path $file.DirectoryName ($clean -replace "/", "\")
        }

        if ($clean.EndsWith("/")) {
            $target = Join-Path $target "index.html"
        }

        if (!(Test-Path $target)) {
            $brokenLinks += $link
        }
    }

    $missingImages = @()
    foreach ($img in $images) {
        $clean = ($img -replace '\?.*$', '')

        if ($clean.StartsWith("/")) {
            $target = Join-Path $root ($clean.TrimStart("/") -replace "/", "\")
        } else {
            $target = Join-Path $file.DirectoryName ($clean -replace "/", "\")
        }

        if (!(Test-Path $target)) {
            $missingImages += $img
        }
    }

    [PSCustomObject]@{
        File = $relative
        HeaderInclude = $html -match '<div id="webact-header"></div>'
        FooterInclude = $html -match '<div id="webact-footer"></div>'
        RoutesJS = $html -match '/assets/js/routes.js'
        NavigationJS = $html -match '/assets/js/navigation.js'
        IncludesJS = $html -match '/assets/js/includes.js'
        OldHeader = $html -match 'wa-promodo-header'
        OldFooter = $html -match 'wa-global-footer'
        TitleCount = $titleCount
        H1Count = $h1Count
        MetaDescription = $metaDescription
        Canonical = $canonical
        BrokenLinkCount = $brokenLinks.Count
        BrokenLinks = ($brokenLinks -join " | ")
        MissingImageCount = $missingImages.Count
        MissingImages = ($missingImages -join " | ")
        Pass = (
            ($html -match '<div id="webact-header"></div>') -and
            ($html -match '<div id="webact-footer"></div>') -and
            ($html -match '/assets/js/routes.js') -and
            ($html -match '/assets/js/navigation.js') -and
            ($html -match '/assets/js/includes.js') -and
            ($html -notmatch 'wa-promodo-header') -and
            ($html -notmatch 'wa-global-footer') -and
            ($titleCount -eq 1) -and
            ($h1Count -le 1) -and
            ($brokenLinks.Count -eq 0) -and
            ($missingImages.Count -eq 0)
        )
    }
}

$csvPath = "$reportDir\site-validation-report.csv"
$htmlPath = "$reportDir\site-validation-report.html"

$results | Export-Csv $csvPath -NoTypeInformation

$failures = $results | Where-Object { $_.Pass -eq $false }

$style = @"
<style>
body{font-family:Arial,sans-serif;margin:30px;background:#f6f8fb;color:#111}
h1{margin-bottom:5px}
.summary{display:flex;gap:15px;margin:20px 0}
.card{background:#fff;padding:18px;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.pass{color:green;font-weight:bold}
.fail{color:#b00020;font-weight:bold}
table{width:100%;border-collapse:collapse;background:#fff}
th,td{padding:10px;border-bottom:1px solid #ddd;text-align:left;font-size:13px;vertical-align:top}
th{background:#111;color:#fff}
tr.failrow{background:#fff4f4}
</style>
"@

$rows = foreach ($r in $results) {
    $class = if ($r.Pass) { "" } else { "failrow" }
    $status = if ($r.Pass) { "<span class='pass'>PASS</span>" } else { "<span class='fail'>FAIL</span>" }

    "<tr class='$class'>
        <td>$status</td>
        <td>$($r.File)</td>
        <td>$($r.HeaderInclude)</td>
        <td>$($r.FooterInclude)</td>
        <td>$($r.RoutesJS)</td>
        <td>$($r.NavigationJS)</td>
        <td>$($r.IncludesJS)</td>
        <td>$($r.TitleCount)</td>
        <td>$($r.H1Count)</td>
        <td>$($r.BrokenLinkCount)</td>
        <td>$($r.MissingImageCount)</td>
    </tr>"
}

@"
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>WebAct Site Validation Report</title>
$style
</head>
<body>
<h1>WebAct Site Validation Report</h1>
<p>Generated: $(Get-Date)</p>

<div class="summary">
  <div class="card"><strong>Total Files</strong><br>$($results.Count)</div>
  <div class="card"><strong>Passed</strong><br>$(($results | Where-Object { $_.Pass }).Count)</div>
  <div class="card"><strong>Failed</strong><br>$($failures.Count)</div>
</div>

<table>
<thead>
<tr>
<th>Status</th>
<th>File</th>
<th>Header</th>
<th>Footer</th>
<th>Routes</th>
<th>Navigation</th>
<th>Includes</th>
<th>Title</th>
<th>H1</th>
<th>Broken Links</th>
<th>Missing Images</th>
</tr>
</thead>
<tbody>
$($rows -join "`n")
</tbody>
</table>
</body>
</html>
"@ | Set-Content $htmlPath -NoNewline

Write-Host "Validation complete." -ForegroundColor Green
Write-Host "CSV: $csvPath"
Write-Host "HTML: $htmlPath"
Write-Host "Failures: $($failures.Count)" -ForegroundColor Yellow

Start-Process $htmlPath