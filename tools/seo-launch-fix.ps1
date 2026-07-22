#requires -Version 5.1

[CmdletBinding()]
param(
    [string]$Root = (Get-Location).Path,
    [string]$ProductionDomain = 'https://www.webact.com',
    [string]$DefaultSocialImage = '',
    [switch]$Commit,
    [switch]$Push
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

Import-Module (Join-Path $PSScriptRoot 'WebActSeo.Common.psm1') -Force

if ($Push -and -not $Commit) {
    throw '-Push requires -Commit.'
}

function Set-HeadTag {
    param(
        [string]$Html,
        [string]$Pattern,
        [string]$Replacement
    )

    if ([regex]::IsMatch($Html, $Pattern, [Text.RegularExpressions.RegexOptions]::IgnoreCase)) {
        return [regex]::Replace(
            $Html,
            $Pattern,
            $Replacement,
            1,
            [Text.RegularExpressions.RegexOptions]::IgnoreCase
        )
    }

    return [regex]::Replace(
        $Html,
        '</head>',
        "    $Replacement`r`n</head>",
        1,
        [Text.RegularExpressions.RegexOptions]::IgnoreCase
    )
}

function ConvertTo-JsonForHtml {
    param([object]$Value)

    return ($Value | ConvertTo-Json -Depth 12)
}

function Get-BreadcrumbItems {
    param(
        [string]$RelativePath,
        [string]$PageTitle
    )

    $items = New-Object System.Collections.Generic.List[object]
    $items.Add([ordered]@{
        '@type' = 'ListItem'
        position = 1
        name = 'Home'
        item = "$ProductionDomain/"
    })

    $normalized = $RelativePath.Replace('\\','/').Replace('/index.html','').Replace('.html','').Trim('/')

    if (-not [string]::IsNullOrWhiteSpace($normalized)) {
        $parts = @($normalized.Split('/') | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
        $current = ''
        $position = 2

        for ($i = 0; $i -lt $parts.Count; $i++) {
            $current = if ($current) { "$current/$($parts[$i])" } else { $parts[$i] }
            $name = if ($i -eq ($parts.Count - 1)) {
                $PageTitle
            }
            else {
                (Get-Culture).TextInfo.ToTitleCase(($parts[$i] -replace '[-_]+',' '))
            }

            $items.Add([ordered]@{
                '@type' = 'ListItem'
                position = $position
                name = $name
                item = "$ProductionDomain/$current/"
            })

            $position++
        }
    }

    return @($items)
}

function Make-UniqueTitle {
    param(
        [string]$Title,
        [string]$Label
    )

    $base = ($Title -replace '\s*\|\s*WebAct\s*$','').Trim()
    $candidate = "$base - $Label | WebAct"

    if ($candidate.Length -gt 60) {
        $maxBase = 60 - (" - $Label | WebAct").Length
        if ($maxBase -lt 12) {
            $candidate = "$Label | WebAct"
        }
        else {
            $candidate = "$($base.Substring(0, [Math]::Min($base.Length, $maxBase)).Trim()) - $Label | WebAct"
        }
    }

    return $candidate
}

function Make-UniqueDescription {
    param(
        [string]$Description,
        [string]$Label
    )

    $suffix = " Learn more about $Label from WebAct."
    $candidate = ($Description.TrimEnd('.',' ') + '.' + $suffix)

    if ($candidate.Length -gt 160) {
        $allowed = 160 - $suffix.Length
        if ($allowed -lt 60) {
            return "Explore $Label services and information from WebAct. Learn how our website design, SEO, advertising, and digital marketing solutions help businesses grow."
        }

        $prefix = $Description.Substring(0, [Math]::Min($Description.Length, $allowed)).TrimEnd(' ',',',';','-','.')
        $candidate = $prefix + '.' + $suffix
    }

    return $candidate
}

$Root = [IO.Path]::GetFullPath($Root)
Set-Location $Root

$timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$backupRoot = Join-Path $Root "launch-audit\seo-launch-backup-$timestamp"
$reportRoot = Join-Path $Root 'launch-audit\seo-launch-fix'
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
New-Item -ItemType Directory -Path $reportRoot -Force | Out-Null

$trackedHtml = @(git ls-files '*.html' | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
if ($trackedHtml.Count -eq 0) {
    throw 'No Git-tracked HTML files were found.'
}

if ([string]::IsNullOrWhiteSpace($DefaultSocialImage)) {
    $homePath = Join-Path $Root 'index.html'
    if (Test-Path $homePath) {
        $homeHtml = Get-Content $homePath -Raw
        $DefaultSocialImage = Get-SeoFirstMatch $homeHtml '<meta\b(?=[^>]*\bproperty=["'']og:image["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    }
}

if ([string]::IsNullOrWhiteSpace($DefaultSocialImage)) {
    $DefaultSocialImage = "$ProductionDomain/assets/images/webact-social-share.jpg"
}

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' WebAct Focused Launch SEO Fix' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host "Pages discovered: $($trackedHtml.Count)"
Write-Host "Social image: $DefaultSocialImage"
Write-Host ''

$records = New-Object System.Collections.Generic.List[object]

for ($i = 0; $i -lt $trackedHtml.Count; $i++) {
    $path = $trackedHtml[$i]
    $fullPath = Join-Path $Root $path
    if (-not (Test-Path $fullPath)) { continue }

    Write-Progress -Activity 'Preparing launch SEO records' -Status "$($i+1) of $($trackedHtml.Count): $path" -PercentComplete ([math]::Floor((($i+1)/$trackedHtml.Count)*100))

    $html = Get-Content $fullPath -Raw
    $robots = Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bname=["'']robots["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $title = Get-SeoFirstMatch $html '<title[^>]*>([\s\S]*?)</title>'
    $description = Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bname=["'']description["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $canonical = Get-SeoFirstMatch $html '<link\b(?=[^>]*\brel=["'']canonical["''])[^>]*\bhref=["'']([^"'']*)["''][^>]*>'
    $expectedUrl = Convert-SeoFileToUrl $path $ProductionDomain

    if ([string]::IsNullOrWhiteSpace($canonical)) {
        $canonical = $expectedUrl
    }

    $records.Add([pscustomobject]@{
        Path = $path
        FullPath = $fullPath
        Indexable = ($robots -notmatch '(?i)\bnoindex\b')
        Title = $title
        Description = $description
        Canonical = $canonical
        ExpectedUrl = $expectedUrl
        Label = Get-SeoPageLabel $path $html
    })
}

Write-Progress -Activity 'Preparing launch SEO records' -Completed

$duplicateTitlePaths = New-Object System.Collections.Generic.HashSet[string]([StringComparer]::OrdinalIgnoreCase)
$duplicateDescriptionPaths = New-Object System.Collections.Generic.HashSet[string]([StringComparer]::OrdinalIgnoreCase)

$titleGroups = @($records | Where-Object { $_.Indexable -and -not [string]::IsNullOrWhiteSpace($_.Title) } | Group-Object Title | Where-Object { $_.Count -gt 1 })
foreach ($group in $titleGroups) {
    $ordered = @($group.Group | Sort-Object Path)
    for ($i = 1; $i -lt $ordered.Count; $i++) {
        [void]$duplicateTitlePaths.Add($ordered[$i].Path)
    }
}

$descriptionGroups = @($records | Where-Object { $_.Indexable -and -not [string]::IsNullOrWhiteSpace($_.Description) } | Group-Object Description | Where-Object { $_.Count -gt 1 })
foreach ($group in $descriptionGroups) {
    $ordered = @($group.Group | Sort-Object Path)
    for ($i = 1; $i -lt $ordered.Count; $i++) {
        [void]$duplicateDescriptionPaths.Add($ordered[$i].Path)
    }
}

$changedFiles = New-Object System.Collections.Generic.List[string]
$changeReport = New-Object System.Collections.Generic.List[object]

for ($i = 0; $i -lt $records.Count; $i++) {
    $record = $records[$i]
    $html = Get-Content $record.FullPath -Raw
    $original = $html
    $changes = New-Object System.Collections.Generic.List[string]

    $title = $record.Title
    $description = $record.Description
    $canonical = $record.ExpectedUrl

    if ($duplicateTitlePaths.Contains($record.Path)) {
        $title = Make-UniqueTitle $title $record.Label
        $html = [regex]::Replace(
            $html,
            '<title[^>]*>[\s\S]*?</title>',
            '<title>' + (ConvertTo-SeoAttribute $title) + '</title>',
            1,
            [Text.RegularExpressions.RegexOptions]::IgnoreCase
        )
        $changes.Add('Unique title')
    }

    if ($duplicateDescriptionPaths.Contains($record.Path)) {
        $description = Make-UniqueDescription $description $record.Label
        $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']description["''])[^>]*>' ('<meta name="description" content="' + (ConvertTo-SeoAttribute $description) + '">')
        $changes.Add('Unique description')
    }

    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:title["''])[^>]*>' ('<meta property="og:title" content="' + (ConvertTo-SeoAttribute $title) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:description["''])[^>]*>' ('<meta property="og:description" content="' + (ConvertTo-SeoAttribute $description) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:image["''])[^>]*>' ('<meta property="og:image" content="' + (ConvertTo-SeoAttribute $DefaultSocialImage) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:url["''])[^>]*>' ('<meta property="og:url" content="' + (ConvertTo-SeoAttribute $canonical) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bproperty=["'']og:type["''])[^>]*>' '<meta property="og:type" content="website">'

    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:card["''])[^>]*>' '<meta name="twitter:card" content="summary_large_image">'
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:title["''])[^>]*>' ('<meta name="twitter:title" content="' + (ConvertTo-SeoAttribute $title) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:description["''])[^>]*>' ('<meta name="twitter:description" content="' + (ConvertTo-SeoAttribute $description) + '">')
    $html = Set-HeadTag $html '<meta\b(?=[^>]*\bname=["'']twitter:image["''])[^>]*>' ('<meta name="twitter:image" content="' + (ConvertTo-SeoAttribute $DefaultSocialImage) + '">')

    $schema = Get-SeoJsonLdInformation $html
    $schemaBlocks = New-Object System.Collections.Generic.List[string]

    if (-not $schema.HasWebPage) {
        $webPageSchema = [ordered]@{
            '@context' = 'https://schema.org'
            '@type' = 'WebPage'
            '@id' = "$canonical#webpage"
            url = $canonical
            name = $title
            description = $description
            isPartOf = [ordered]@{
                '@type' = 'WebSite'
                '@id' = "$ProductionDomain/#website"
                url = "$ProductionDomain/"
                name = 'WebAct'
            }
        }
        $schemaBlocks.Add('<script type="application/ld+json">' + "`r`n" + (ConvertTo-JsonForHtml $webPageSchema) + "`r`n" + '</script>')
        $changes.Add('WebPage schema')
    }

    if ($record.Path -eq 'index.html' -and -not $schema.HasOrganization) {
        $organizationSchema = [ordered]@{
            '@context' = 'https://schema.org'
            '@type' = 'Organization'
            '@id' = "$ProductionDomain/#organization"
            name = 'WebAct'
            url = "$ProductionDomain/"
            logo = $DefaultSocialImage
        }
        $schemaBlocks.Add('<script type="application/ld+json">' + "`r`n" + (ConvertTo-JsonForHtml $organizationSchema) + "`r`n" + '</script>')
        $changes.Add('Organization schema')
    }

    if ($record.Path -ne 'index.html' -and $record.Indexable -and -not $schema.HasBreadcrumb) {
        $breadcrumbSchema = [ordered]@{
            '@context' = 'https://schema.org'
            '@type' = 'BreadcrumbList'
            itemListElement = Get-BreadcrumbItems $record.Path $record.Label
        }
        $schemaBlocks.Add('<script type="application/ld+json">' + "`r`n" + (ConvertTo-JsonForHtml $breadcrumbSchema) + "`r`n" + '</script>')
        $changes.Add('Breadcrumb schema')
    }

    if ($schemaBlocks.Count -gt 0) {
        $schemaMarkup = ($schemaBlocks -join "`r`n")
        $html = [regex]::Replace(
            $html,
            '</head>',
            "    $schemaMarkup`r`n</head>",
            1,
            [Text.RegularExpressions.RegexOptions]::IgnoreCase
        )
    }

    if ($html -ne $original) {
        $backupPath = Join-Path $backupRoot $record.Path
        New-Item -ItemType Directory -Path (Split-Path $backupPath -Parent) -Force | Out-Null
        Copy-Item $record.FullPath $backupPath -Force

        [IO.File]::WriteAllText($record.FullPath, $html, [Text.UTF8Encoding]::new($false))
        $changedFiles.Add($record.Path)

        $changeReport.Add([pscustomobject]@{
            Page = $record.Path
            Changes = ($changes -join '; ')
            FinalTitle = $title
            FinalDescription = $description
            Canonical = $canonical
        })
    }

    Write-Progress -Activity 'Applying launch SEO fixes' -Status "$($i+1) of $($records.Count): $($record.Path)" -PercentComplete ([math]::Floor((($i+1)/$records.Count)*100))
}

Write-Progress -Activity 'Applying launch SEO fixes' -Completed

$reportPath = Join-Path $reportRoot "seo-launch-fix-$timestamp.csv"
$changeReport | Export-Csv $reportPath -NoTypeInformation -Encoding UTF8

Write-Host ''
Write-Host '========================================' -ForegroundColor Green
Write-Host ' Focused Launch SEO Fix Complete' -ForegroundColor Green
Write-Host '========================================' -ForegroundColor Green
Write-Host "Changed files: $($changedFiles.Count)"
Write-Host "Duplicate title pages fixed: $($duplicateTitlePaths.Count)"
Write-Host "Duplicate description pages fixed: $($duplicateDescriptionPaths.Count)"
Write-Host "Backup: $backupRoot"
Write-Host "Report: $reportPath"
Write-Host ''

if ($changedFiles.Count -eq 0) {
    exit 0
}

if ($Commit) {
    $pathspecFile = Join-Path $reportRoot "changed-paths-$timestamp.txt"
    [IO.File]::WriteAllLines($pathspecFile, @($changedFiles), [Text.UTF8Encoding]::new($false))

    git add --pathspec-from-file=$pathspecFile
    git commit -m 'Fix duplicate metadata, social tags, and structured data for launch'
}

if ($Push) {
    git push origin main
}
