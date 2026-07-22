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

function New-CaseInsensitiveRegex {
    param([Parameter(Mandatory=$true)][string]$Pattern)
    return [System.Text.RegularExpressions.Regex]::new(
        $Pattern,
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
}

function Get-FirstMatch {
    param([string]$Text,[string]$Pattern)
    if ([string]::IsNullOrEmpty($Text)) { return '' }
    $rx = New-CaseInsensitiveRegex $Pattern
    $match = $rx.Match($Text)
    if (-not $match.Success) { return '' }
    return [Net.WebUtility]::HtmlDecode($match.Groups[1].Value.Trim())
}

function Encode-Attribute {
    param([AllowNull()][string]$Value)
    if ($null -eq $Value) { return '' }
    return [Net.WebUtility]::HtmlEncode($Value)
}

function Set-HeadTag {
    param([string]$Html,[string]$Pattern,[string]$Replacement)
    $rx = New-CaseInsensitiveRegex $Pattern
    if ($rx.IsMatch($Html)) { return $rx.Replace($Html,$Replacement,1) }
    $headRx = New-CaseInsensitiveRegex '</head>'
    if (-not $headRx.IsMatch($Html)) { return $Html }
    return $headRx.Replace($Html,"    $Replacement`r`n</head>",1)
}

function Add-BeforeHead {
    param([string]$Html,[string]$Markup)
    $headRx = New-CaseInsensitiveRegex '</head>'
    if (-not $headRx.IsMatch($Html)) { return $Html }
    return $headRx.Replace($Html,"    $Markup`r`n</head>",1)
}

function Convert-UrlToFile {
    param([string]$Url,[string]$Domain)
    $uri = New-Object System.Uri($Url)
    $domainUri = New-Object System.Uri($Domain)
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
    if ($name -eq 'index') {
        $parent = Split-Path $Path -Parent
        if ($parent) { $name = Split-Path $parent -Leaf }
    }
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
        if ($allowed -ge 12) {
            $candidate = $base.Substring(0,[Math]::Min($base.Length,$allowed)).Trim() + $suffix
        } else {
            $candidate = "$Label | WebAct"
        }
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
        if ($allowed -lt 50) {
            return "Explore $Label services and solutions from WebAct for website design, SEO, advertising, branding, and digital growth."
        }
        $base = $base.Substring(0,[Math]::Min($base.Length,$allowed)).TrimEnd(' ',',',';','-','.')
        $candidate = $base + '.' + $suffix
    }
    return $candidate
}

function Has-SchemaType {
    param([string]$Html,[string]$Type)
    $escaped = [regex]::Escape($Type)
    $pattern = '"@type"\s*:\s*(?:"' + $escaped + '"|\[[^\]]*"' + $escaped + '")'
    return [regex]::IsMatch($Html,$pattern,[Text.RegularExpressions.RegexOptions]::IgnoreCase)
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

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' WebAct Production SEO Launch V2' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host "Sitemap URLs: $($urls.Count)"
Write-Host ''

$records = @()
$missingFiles = @()

for ($i=0; $i -lt $urls.Count; $i++) {
    $url = $urls[$i]
    $relative = Convert-UrlToFile $url $ProductionDomain
    if (-not $relative) { continue }
    $full = Join-Path $Root ($relative.Replace('/','\'))
    Write-Progress -Activity 'Reading production pages from sitemap' -Status "$($i+1) of $($urls.Count): $relative" -PercentComplete ([math]::Floor((($i+1)/$urls.Count)*100))
    if (-not (Test-Path $full)) {
        $missingFiles += [pscustomobject]@{Url=$url;ExpectedFile=$relative}
        continue
    }
    $html = Get-Content $full -Raw
    $robots = Get-FirstMatch $html '<meta\b(?=[^>]*\bname=["'']robots["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $title = Get-FirstMatch $html '<title[^>]*>([\s\S]*?)</title>'
    $description = Get-FirstMatch $html '<meta\b(?=[^>]*\bname=["'']description["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $records += [pscustomobject]@{
        Url=$url
        Path=$relative
        FullPath=$full
        Indexable=($robots -notmatch '(?i)\bnoindex\b')
        Title=$title
        Description=$description
        Label=(Get-PageLabel $relative $html)
    }
}
Write-Progress -Activity 'Reading production pages from sitemap' -Completed

$dupTitlePaths = @{}
$dupDescriptionPaths = @{}

$titleGroups = @($records | Where-Object { $_.Indexable -and $_.Title } | Group-Object Title | Where-Object { $_.Count -gt 1 })
foreach ($group in $titleGroups) {
    $ordered = @($group.Group | Sort-Object Path)
    for ($j=1; $j -lt $ordered.Count; $j++) { $dupTitlePaths[$ordered[$j].Path.ToLowerInvariant()] = $true }
}

$descriptionGroups = @($records | Where-Object { $_.Indexable -and $_.Description } | Group-Object Description | Where-Object { $_.Count -gt 1 })
foreach ($group in $descriptionGroups) {
    $ordered = @($group.Group | Sort-Object Path)
    for ($j=1; $j -lt $ordered.Count; $j++) { $dupDescriptionPaths[$ordered[$j].Path.ToLowerInvariant()] = $true }
}

$changed = @()
$report = @()

for ($i=0; $i -lt $records.Count; $i++) {
    $record = $records[$i]
    Write-Progress -Activity 'Applying production SEO launch fixes' -Status "$($i+1) of $($records.Count): $($record.Path)" -PercentComplete ([math]::Floor((($i+1)/$records.Count)*100))
    $html = Get-Content $record.FullPath -Raw
    $original = $html
    $changes = @()
    $title = $record.Title
    $description = $record.Description

    if (-not $title -or -not $description) {
        $report += [pscustomobject]@{Page=$record.Path;Url=$record.Url;Changed=$false;Changes='Skipped: missing title or description'}
        continue
    }

    $pathKey = $record.Path.ToLowerInvariant()
    if ($dupTitlePaths.ContainsKey($pathKey)) {
        $title = Make-UniqueTitle $title $record.Label
        $titleRx = New-CaseInsensitiveRegex '<title[^>]*>[\s\S]*?</title>'
        $html = $titleRx.Replace($html,('<title>' + (Encode-Attribute $title) + '</title>'),1)
        $changes += 'Unique title'
    }

    if ($dupDescriptionPaths.ContainsKey($pathKey)) {
        $description = Make-UniqueDescription $description $record.Label
        $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']description["''])[^>]*>' ('<meta name="description" content="' + (Encode-Attribute $description) + '">')
        $changes += 'Unique description'
    }

    $beforeSocial = $html
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:title["''])[^>]*>' ('<meta property="og:title" content="' + (Encode-Attribute $title) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:description["''])[^>]*>' ('<meta property="og:description" content="' + (Encode-Attribute $description) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:image["''])[^>]*>' ('<meta property="og:image" content="' + (Encode-Attribute $DefaultSocialImage) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:url["''])[^>]*>' ('<meta property="og:url" content="' + (Encode-Attribute $record.Url) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:type["''])[^>]*>' '<meta property="og:type" content="website">'
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:card["''])[^>]*>' '<meta name="twitter:card" content="summary_large_image">'
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:title["''])[^>]*>' ('<meta name="twitter:title" content="' + (Encode-Attribute $title) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:description["''])[^>]*>' ('<meta name="twitter:description" content="' + (Encode-Attribute $description) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:image["''])[^>]*>' ('<meta name="twitter:image" content="' + (Encode-Attribute $DefaultSocialImage) + '">')
    if ($html -ne $beforeSocial) { $changes += 'Social metadata' }

    $schemaBlocks = @()
    if (-not (Has-SchemaType $html 'WebPage')) {
        $webPage = [ordered]@{
            '@context'='https://schema.org'
            '@type'='WebPage'
            '@id'="$($record.Url)#webpage"
            url=$record.Url
            name=$title
            description=$description
            isPartOf=[ordered]@{
                '@type'='WebSite'
                '@id'="$ProductionDomain/#website"
                url="$ProductionDomain/"
                name='WebAct'
            }
        }
        $schemaBlocks += '<script type="application/ld+json">' + "`r`n" + (Json-ForHtml $webPage) + "`r`n</script>"
        $changes += 'WebPage schema'
    }

    if ($record.Path -eq 'index.html' -and -not (Has-SchemaType $html 'Organization')) {
        $organization = [ordered]@{
            '@context'='https://schema.org'
            '@type'='Organization'
            '@id'="$ProductionDomain/#organization"
            name='WebAct'
            url="$ProductionDomain/"
            logo="$ProductionDomain/assets/images/webact-logo.png"
        }
        $schemaBlocks += '<script type="application/ld+json">' + "`r`n" + (Json-ForHtml $organization) + "`r`n</script>"
        $changes += 'Organization schema'
    }

    if ($record.Path -ne 'index.html' -and -not (Has-SchemaType $html 'BreadcrumbList')) {
        $segments = @(((New-Object System.Uri($record.Url)).AbsolutePath.Trim('/') -split '/') | Where-Object { $_ })
        $items = @()
        $items += [ordered]@{'@type'='ListItem';position=1;name='Home';item="$ProductionDomain/"}
        $current = ''
        for ($j=0; $j -lt $segments.Count; $j++) {
            $current = if ($current) { "$current/$($segments[$j])" } else { $segments[$j] }
            $name = if ($j -eq ($segments.Count-1)) { $record.Label } else { (Get-Culture).TextInfo.ToTitleCase(($segments[$j] -replace '[-_]+',' ')) }
            $items += [ordered]@{'@type'='ListItem';position=($j+2);name=$name;item="$ProductionDomain/$current/"}
        }
        $breadcrumb = [ordered]@{
            '@context'='https://schema.org'
            '@type'='BreadcrumbList'
            itemListElement=$items
        }
        $schemaBlocks += '<script type="application/ld+json">' + "`r`n" + (Json-ForHtml $breadcrumb) + "`r`n</script>"
        $changes += 'Breadcrumb schema'
    }

    if ($schemaBlocks.Count -gt 0) {
        $html = Add-BeforeHead $html ($schemaBlocks -join "`r`n    ")
    }

    if ($html -ne $original) {
        $backupFile = Join-Path $backupRoot ($record.Path.Replace('/','\'))
        $backupParent = Split-Path $backupFile -Parent
        if ($backupParent) { New-Item -ItemType Directory -Path $backupParent -Force | Out-Null }
        Copy-Item $record.FullPath $backupFile -Force
        [IO.File]::WriteAllText($record.FullPath,$html,[Text.UTF8Encoding]::new($false))
        $changed += $record.Path
        $report += [pscustomobject]@{Page=$record.Path;Url=$record.Url;Changed=$true;Changes=(($changes | Select-Object -Unique) -join '; ')}
    } else {
        $report += [pscustomobject]@{Page=$record.Path;Url=$record.Url;Changed=$false;Changes=''}
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
    } else {
        foreach ($file in $changed) { git add -- $file }
        git commit -m 'Add production social metadata and structured data'
        if ($LASTEXITCODE -ne 0) { throw 'Git commit failed.' }
        if ($Push) {
            git push origin main
            if ($LASTEXITCODE -ne 0) { throw 'Git push failed.' }
        }
    }
} else {
    Write-Host 'Review with: git status --short and git diff --stat' -ForegroundColor Yellow
}
