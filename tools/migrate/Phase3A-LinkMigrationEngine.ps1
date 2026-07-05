$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$reportDir = ".\tools\audit\reports\v2"
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

$log = @()

# Sections that were renamed from folder/index.html to folder.html
$flattenedSections = @(
    "about",
    "design",
    "marketing",
    "digital-ads",
    "pricing",
    "addons"
)

# Directory-based sections we should NOT flatten
$skipSections = @(
    "about/portfolio",
    "about/blog",
    "about/website-knowledge-base",
    "about/widget-knowledge-base",
    "industries",
    "addons/website-app-store"
)

function Should-Skip-Link($url) {
    $clean = ($url -replace '\?.*$', '' -replace '#.*$', '')
    $normalized = $clean -replace '\\', '/'
    $normalized = $normalized -replace '^\.\./', ''
    $normalized = $normalized -replace '^\./', ''
    $normalized = $normalized.TrimStart('/')

    foreach ($skip in $skipSections) {
        if ($normalized.StartsWith($skip + "/")) {
            return $true
        }
    }

    return $false
}

function Convert-OldIndexLink($url) {
    $original = $url

    if ($url -match '^(https?:|mailto:|tel:|#|javascript:|data:)') {
        return $url
    }

    if ($url -notmatch 'index\.html') {
        return $url
    }

    if (Should-Skip-Link $url) {
        return $url
    }

    $query = ""
    $hash = ""

    if ($url -match '#') {
        $parts = $url -split '#', 2
        $url = $parts[0]
        $hash = "#" + $parts[1]
    }

    if ($url -match '\?') {
        $parts = $url -split '\?', 2
        $url = $parts[0]
        $query = "?" + $parts[1]
    }

    $normalized = $url -replace '\\', '/'

    foreach ($section in $flattenedSections) {
        # Match paths like:
        # ../../marketing/local-seo/index.html
        # ../marketing/local-seo/index.html
        # /marketing/local-seo/index.html
        # marketing/local-seo/index.html
        $pattern = "((?:\.\./|/|\.\/)*)$([regex]::Escape($section))/([^/]+)/index\.html$"

        if ($normalized -match $pattern) {
            $prefix = $Matches[1]
            $slug = $Matches[2]
            return "$prefix$section/$slug.html$query$hash"
        }

        # Match section index:
        # ../../marketing/index.html -> ../../marketing/index.html stays because section landing pages still exist
    }

    return $original
}

$files = Get-ChildItem -Recurse -Include *.html |
Where-Object {
    $_.FullName -notmatch "\\.git\\|\\node_modules\\|\\tools\\audit\\reports\\"
}

foreach ($file in $files) {
    $html = Get-Content $file.FullName -Raw
    $originalHtml = $html
    $relativeFile = $file.FullName.Replace($root + "\", "")

    $html = [regex]::Replace(
        $html,
        '(?is)(href=["''])([^"'']+)(["''])',
        {
            param($match)

            $before = $match.Groups[1].Value
            $url = $match.Groups[2].Value
            $after = $match.Groups[3].Value

            $newUrl = Convert-OldIndexLink $url

            if ($newUrl -ne $url) {
                $script:log += [PSCustomObject]@{
                    File = $relativeFile
                    OldUrl = $url
                    NewUrl = $newUrl
                }
            }

            return "$before$newUrl$after"
        }
    )

    if ($html -ne $originalHtml) {
        Set-Content $file.FullName $html -NoNewline
        Write-Host "Migrated links: $relativeFile" -ForegroundColor Green
    }
}

$logPath = "$reportDir\phase3a-link-migration-log.csv"
$log | Export-Csv $logPath -NoTypeInformation

Write-Host "Phase 3A Link Migration Engine complete." -ForegroundColor Cyan
Write-Host "Changed links: $($log.Count)"
Write-Host "Log: $logPath"