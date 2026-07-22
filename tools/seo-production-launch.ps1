#requires -Version 5.1
[CmdletBinding()]
param(
    [string]$Root = (Get-Location).Path,
    [string]$ProductionDomain = 'https://www.webact.com',
    [string]$SitemapPath = 'sitemap.xml',
    [string]$DefaultSocialImage = 'https://www.webact.com/assets/images/webact-social-share.jpg',
    [switch]$Commit,
    [switch]$Push
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

if ($Push -and -not $Commit) { throw '-Push requires -Commit.' }

function Get-FirstMatch {
    param([string]$Text,[string]$Pattern)
    $m = [regex]::Match($Text,$Pattern,[Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if ($m.Success) { return [Net.WebUtility]::HtmlDecode($m.Groups[1].Value.Trim()) }
    return ''
}

function Encode-Attribute {
    param([string]$Value)
    if ($null -eq $Value) { return '' }
    return [Net.WebUtility]::HtmlEncode($Value)
}

function New-Regex {
    param([string]$Pattern)
    return New-Object System.Text.RegularExpressions.Regex(
        $Pattern,
        [Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
}

function Set-HeadTag {
    param([string]$Html,[string]$Pattern,[string]$Replacement)
    $rx = New-Regex $Pattern
    if ($rx.IsMatch($Html)) { return $rx.Replace($Html,$Replacement,1) }
    $headRx = New-Regex '</head>'
    if (-not $headRx.IsMatch($Html)) { return $Html }
    return $headRx.Replace($Html,"    $Replacement`r`n</head>",1)
}

function Add-BeforeHead {
    param([string]$Html,[string]$Markup)
    $headRx = New-Regex '</head>'
    if (-not $headRx.IsMatch($Html)) { return $Html }
    return $headRx.Replace($Html,"    $Markup`r`n</head>",1)
}

function Convert-UrlToFile {
    param([string]$Url,[string]$Domain)
    $uri = [Uri]$Url
    $domainUri = [Uri]$Domain
    if ($uri.Host -ne $domainUri.Host) { return $null }
    $path = [Uri]::UnescapeDataString($uri.AbsolutePath).TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($path)) { return 'index.html' }
    if ($path.EndsWith('/')) { return ($path.TrimEnd('/') + '/index.html') }
    if ($path -match '\.[A-Za-z0-9]{1,8}$') { return $path }
    return ($path + '/index.html')
}

function Get-PageLabel {
    param([string]$Path,[string]$Html)
    $h1 = Get-FirstMatch $Html '<h1\b[^>]*>([\s\S]*?)</h1>'
    if ($h1) {
        $h1 = [regex]::Replace($h1,'<[^>]+>',' ')
        $h1 = [regex]::Replace([Net.WebUtility]::HtmlDecode($h1),'\s+',' ').Trim()
        if ($h1) { return $h1 }
    }
    $name = [IO.Path]::GetFileNameWithoutExtension($Path)
    if ($name -eq 'index') { $name = Split-Path (Split-Path $Path -Parent) -Leaf }
    if ([string]::IsNullOrWhiteSpace($name)) { return 'WebAct' }
    return (Get-Culture).TextInfo.ToTitleCase(($name -replace '[-_]+',' '))
}

function Make-UniqueTitle {
    param([string]$Title,[string]$Label)
    $base = ($Title -replace '\s*\|\s*WebAct\s*$','').Trim()
    if (-not $base) { $base = $Label }
    $candidate = "$base - $Label | WebAct"
    if ($candidate.Length -gt 60) {
        $suffix = " - $Label | WebAct"
        $allowed = 60 - $suffix.Length
        if ($allowed -ge 12) { $candidate = $base.Substring(0,[Math]::Min($base.Length,$allowed)).Trim() + $suffix }
        else { $candidate = "$Label | WebAct" }
    }
    return $candidate
}

function Make-UniqueDescription {
    param([string]$Description,[string]$Label)
    $suffix = " Learn more about $Label from WebAct."
    $base = $Description.TrimEnd(' ','.')
    $candidate = $base + '.' + $suffix
    if ($candidate.Length -gt 160) {
        $allowed = 160 - $suffix.Length - 1
        if ($allowed -lt 50) { return "Explore $Label services and solutions from WebAct for website design, SEO, advertising, branding, and digital growth." }
        $base = $base.Substring(0,[Math]::Min($base.Length,$allowed)).TrimEnd(' ',',',';','-','.')
        $candidate = $base + '.' + $suffix
    }
    return $candidate
}

function Has-SchemaType {
    param([string]$Html,[string]$Type)
    $escaped = [regex]::Escape($Type)
    return [regex]::IsMatch($Html,'"@type"\s*:\s*(?:"' + $escaped + '"|\[[^\]]*"' + $escaped + '")',[Text.RegularExpressions.RegexOptions]::IgnoreCase)
}

function Json-ForHtml {
    param([object]$Value)
    return ($Value | ConvertTo-Json -Depth 12)
}

$Root = [IO.Path]::GetFullPath($Root)
Set-Location $Root

$sitemapFullPath = Join-Path $Root $SitemapPath
if (-not (Test-Path $sitemapFullPath)) { throw "Sitemap not found: $sitemapFullPath" }

[xml]$sitemap = Get-Content $sitemapFullPath -Raw
$urls = @($sitemap.urlset.url | ForEach-Object { [string]$_.loc } | Where-Object { $_ })
if ($urls.Count -eq 0) { throw 'No URLs were found in the sitemap.' }

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $Root "launch-audit\seo-production-backup-$timestamp"
$reportRoot = Join-Path $Root 'launch-audit\seo-production-launch'
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
New-Item -ItemType Directory -Path $reportRoot -Force | Out-Null

$records = New-Object System.Collections.Generic.List[object]
$missingFiles = New-Object System.Collections.Generic.List[object]

for ($i=0; $i -lt $urls.Count; $i++) {
    $url = $urls[$i]
    $relative = Convert-UrlToFile $url $ProductionDomain
    if (-not $relative) { continue }
    $full = Join-Path $Root ($relative.Replace('/','\'))
    Write-Progress -Activity 'Reading production pages from sitemap' -Status "$($i+1) of $($urls.Count): $relative" -PercentComplete ([math]::Floor((($i+1)/$urls.Count)*100))
    if (-not (Test-Path $full)) {
        $missingFiles.Add([pscustomobject]@{Url=$url;ExpectedFile=$relative})
        continue
    }
    $html = Get-Content $full -Raw
    $robots = Get-FirstMatch $html '<meta\b(?=[^>]*\bname=["'']robots["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $title = Get-FirstMatch $html '<title[^>]*>([\s\S]*?)</title>'
    $description = Get-FirstMatch $html '<meta\b(?=[^>]*\bname=["'']description["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $records.Add([pscustomobject]@{
        Url=$url; Path=$relative; FullPath=$full; Html=$html;
        Indexable=($robots -notmatch '(?i)\bnoindex\b');
        Title=$title; Description=$description; Label=(Get-PageLabel $relative $html)
    })
}
Write-Progress -Activity 'Reading production pages from sitemap' -Completed

$dupTitlePaths = New-Object System.Collections.Generic.HashSet[string]([StringComparer]::OrdinalIgnoreCase)
$dupDescriptionPaths = New-Object System.Collections.Generic.HashSet[string]([StringComparer]::OrdinalIgnoreCase)

$titleGroups = @($records | Where-Object { $_.Indexable -and $_.Title } | Group-Object Title | Where-Object { $_.Count -gt 1 })
foreach ($g in $titleGroups) {
    $ordered = @($g.Group | Sort-Object Path)
    for ($j=1; $j -lt $ordered.Count; $j++) { [void]$dupTitlePaths.Add($ordered[$j].Path) }
}
$descriptionGroups = @($records | Where-Object { $_.Indexable -and $_.Description } | Group-Object Description | Where-Object { $_.Count -gt 1 })
foreach ($g in $descriptionGroups) {
    $ordered = @($g.Group | Sort-Object Path)
    for ($j=1; $j -lt $ordered.Count; $j++) { [void]$dupDescriptionPaths.Add($ordered[$j].Path) }
}

$changed = New-Object System.Collections.Generic.List[string]
$report = New-Object System.Collections.Generic.List[object]

for ($i=0; $i -lt $records.Count; $i++) {
    $r = $records[$i]
    Write-Progress -Activity 'Applying production SEO launch fixes' -Status "$($i+1) of $($records.Count): $($r.Path)" -PercentComplete ([math]::Floor((($i+1)/$records.Count)*100))
    $html = Get-Content $r.FullPath -Raw
    $original = $html
    $changes = New-Object System.Collections.Generic.List[string]
    $title = $r.Title
    $description = $r.Description

    if (-not $title -or -not $description) {
        $report.Add([pscustomobject]@{Page=$r.Path;Url=$r.Url;Changed=$false;Changes='Skipped: missing title or description'})
        continue
    }

    if ($dupTitlePaths.Contains($r.Path)) {
        $title = Make-UniqueTitle $title $r.Label
        $titleRx = New-Regex '<title[^>]*>[\s\S]*?</title>'
        $html = $titleRx.Replace($html,'<title>' + (Encode-Attribute $title) + '</title>',1)
        $changes.Add('Unique title')
    }
    if ($dupDescriptionPaths.Contains($r.Path)) {
        $description = Make-UniqueDescription $description $r.Label
        $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']description["''])[^>]*>' ('<meta name="description" content="' + (Encode-Attribute $description) + '">')
        $changes.Add('Unique description')
    }

    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:title["''])[^>]*>' ('<meta property="og:title" content="' + (Encode-Attribute $title) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:description["''])[^>]*>' ('<meta property="og:description" content="' + (Encode-Attribute $description) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:image["''])[^>]*>' ('<meta property="og:image" content="' + (Encode-Attribute $DefaultSocialImage) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:url["''])[^>]*>' ('<meta property="og:url" content="' + (Encode-Attribute $r.Url) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:type["''])[^>]*>' '<meta property="og:type" content="website">'
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:card["''])[^>]*>' '<meta name="twitter:card" content="summary_large_image">'
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:title["''])[^>]*>' ('<meta name="twitter:title" content="' + (Encode-Attribute $title) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:description["''])[^>]*>' ('<meta name="twitter:description" content="' + (Encode-Attribute $description) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:image["''])[^>]*>' ('<meta name="twitter:image" content="' + (Encode-Attribute $DefaultSocialImage) + '">')
    if ($html -ne $original) { $changes.Add('Social metadata') }

    $schemas = New-Object System.Collections.Generic.List[string]
    if (-not (Has-SchemaType $html 'WebPage')) {
        $webPage = [ordered]@{
            '@context'='https://schema.org'; '@type'='WebPage'; '@id'="$($r.Url)#webpage";
            url=$r.Url; name=$title; description=$description;
            isPartOf=[ordered]@{'@type'='WebSite';'@id'="$ProductionDomain/#website";url="$ProductionDomain/";name='WebAct'}
        }
        $schemas.Add('<script type="application/ld+json">' + "`r`n" + (Json-ForHtml $webPage) + "`r`n</script>")
        $changes.Add('WebPage schema')
    }
    if ($r.Path -eq 'index.html' -and -not (Has-SchemaType $html 'Organization')) {
        $org = [ordered]@{
            '@context'='https://schema.org';'@type'='Organization';'@id'="$ProductionDomain/#organization";
            name='WebAct';url="$ProductionDomain/";logo="$ProductionDomain/assets/images/webact-logo.png"
        }
        $schemas.Add('<script type="application/ld+json">' + "`r`n" + (Json-ForHtml $org) + "`r`n</script>")
        $changes.Add('Organization schema')
    }
    if ($r.Path -ne 'index.html' -and -not (Has-SchemaType $html 'BreadcrumbList')) {
        $segments = @(([Uri]$r.Url).AbsolutePath.Trim('/') -split '/' | Where-Object { $_ })
        $items = New-Object System.Collections.Generic.List[object]
        $items.Add([ordered]@{'@type'='ListItem';position=1;name='Home';item="$ProductionDomain/"})
        $current=''
        for ($j=0; $j -lt $segments.Count; $j++) {
            $current = if ($current) { "$current/$($segments[$j])" } else { $segments[$j] }
            $name = if ($j -eq $segments.Count-1) { $r.Label } else { (Get-Culture).TextInfo.ToTitleCase(($segments[$j] -replace '[-_]+',' ')) }
            $items.Add([ordered]@{'@type'='ListItem';position=($j+2);name=$name;item="$ProductionDomain/$current/"})
        }
        $crumb = [ordered]@{'@context'='https://schema.org';'@type'='BreadcrumbList';itemListElement=@($items)}
        $schemas.Add('<script type="application/ld+json">' + "`r`n" + (Json-ForHtml $crumb) + "`r`n</script>")
        $changes.Add('Breadcrumb schema')
    }
    if ($schemas.Count -gt 0) { $html = Add-BeforeHead $html ($schemas -join "`r`n    ") }

    if ($html -ne $original) {
        $backupFile = Join-Path $backupRoot ($r.Path.Replace('/','\'))
        New-Item -ItemType Directory -Path (Split-Path $backupFile -Parent) -Force | Out-Null
        Copy-Item $r.FullPath $backupFile -Force
        [IO.File]::WriteAllText($r.FullPath,$html,[Text.UTF8Encoding]::new($false))
        $changed.Add($r.Path)
        $report.Add([pscustomobject]@{Page=$r.Path;Url=$r.Url;Changed=$true;Changes=($changes | Select-Object -Unique) -join '; '})
    }
    else {
        $report.Add([pscustomobject]@{Page=$r.Path;Url=$r.Url;Changed=$false;Changes=''})
    }
}
Write-Progress -Activity 'Applying production SEO launch fixes' -Completed

$reportPath = Join-Path $reportRoot "production-seo-fix-$timestamp.csv"
$missingPath = Join-Path $reportRoot "sitemap-missing-files-$timestamp.csv"
$report | Export-Csv $reportPath -NoTypeInformation -Encoding UTF8
$missingFiles | Export-Csv $missingPath -NoTypeInformation -Encoding UTF8

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Production SEO Launch Fix Complete' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host "Sitemap URLs:        $($urls.Count)"
Write-Host "Existing HTML pages: $($records.Count)"
Write-Host "Changed pages:       $($changed.Count)"
Write-Host "Missing local files: $($missingFiles.Count)"
Write-Host "Backup:              $backupRoot"
Write-Host "Report:              $reportPath"

if ($Commit) {
    if ($changed.Count -eq 0) {
        Write-Host 'No HTML changes to commit.' -ForegroundColor Yellow
    }
    else {
        foreach ($file in $changed) { git add -- $file }
        git commit -m 'Add production social metadata and structured data'
        if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
        if ($Push) {
            git push origin main
            if ($LASTEXITCODE -ne 0) { throw 'Git push failed.' }
        }
    }
}
else {
    Write-Host 'Review with: git status --short and git diff --stat' -ForegroundColor Yellow
}
