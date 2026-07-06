$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$reportDir = ".\tools\audit\reports\v2"
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

$siteIndexPath = ".\assets\data\website-index.json"
$linkLogPath = "$reportDir\phase3b-link-resolver-log.csv"

function Normalize-Key($path) {
    $p = $path -replace '\\','/'
    $p = $p -replace '^/',''
    $p = $p -replace '/index\.html$',''
    $p = $p -replace '\.html$',''
    return $p.Trim('/')
}

function Resolve-TargetKey($currentFile, $url) {
    $clean = ($url -replace '\?.*$', '' -replace '#.*$', '')
    if ([string]::IsNullOrWhiteSpace($clean)) { return $null }
    if ($clean -match '^(https?:|mailto:|tel:|#|javascript:|data:)') { return $null }

    if ($clean.StartsWith("/")) {
        $absolute = $clean.TrimStart("/")
    } else {
        $baseDir = Split-Path $currentFile -Parent
        $combined = Join-Path $baseDir ($clean -replace '/', '\')
        $absolute = Resolve-Path -LiteralPath $combined -ErrorAction SilentlyContinue

        if ($absolute) {
            $absolute = $absolute.Path.Replace($root + "\", "")
        } else {
            try {
    $absolute = [System.IO.Path]::GetFullPath($combined).Replace($root + "\", "")
} catch {
    return $null
}
        }
    }

    $absolute = $absolute -replace '\\','/'
    return Normalize-Key $absolute
}

function Preserve-Suffix($url) {
    $suffix = ""

    if ($url -match '(\?.*)') {
        $suffix = $Matches[1]
    }

    if ($url -match '(#.*)') {
        if ($suffix -notmatch '#') {
            $suffix += $Matches[1]
        }
    }

    return $suffix
}

# Build website index
$htmlFiles = Get-ChildItem -Recurse -Include *.html |
Where-Object {
    $_.FullName -notmatch "\\.git\\|\\node_modules\\|\\tools\\audit\\reports\\"
}

$index = [ordered]@{}

foreach ($file in $htmlFiles) {
    $relative = $file.FullName.Replace($root + "\", "") -replace '\\','/'
    $key = Normalize-Key $relative

    if (-not $index.Contains($key)) {
        $index[$key] = "/" + $relative
    }

    # Also index folder/index.html as folder
    if ($relative -match '/index\.html$') {
        $folderKey = Normalize-Key ($relative -replace '/index\.html$', '')
        if (-not $index.Contains($folderKey)) {
            $index[$folderKey] = "/" + $relative
        }
    }
}

$index | ConvertTo-Json -Depth 10 | Set-Content $siteIndexPath -NoNewline
Write-Host "Website index created: $siteIndexPath" -ForegroundColor Green
Write-Host "Indexed pages: $($index.Count)" -ForegroundColor Green

# Repair links using website index
$log = @()

foreach ($file in $htmlFiles) {
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

            if ($url -match '^(https?:|mailto:|tel:|#|javascript:|data:)') {
                return $match.Value
            }

            $targetKey = Resolve-TargetKey $relativeFile $url
            if (-not $targetKey) {
                return $match.Value
            }

            if ($index.Contains($targetKey)) {
                return $match.Value
            }

            # Try common old index-to-named-page fallback:
            # section/page/index -> section/page
            $fallbackKey = $targetKey -replace '/index$', ''

            if ($index.Contains($fallbackKey)) {
                $newUrl = $index[$fallbackKey] + (Preserve-Suffix $url)

                $script:log += [PSCustomObject]@{
                    File = $relativeFile
                    OldUrl = $url
                    NewUrl = $newUrl
                    ResolvedKey = $fallbackKey
                }

                return "$before$newUrl$after"
            }

            # Try named-page version from old folder/index structure
            if ($targetKey -match '^(.+)/([^/]+)/index$') {
                $namedKey = "$($Matches[1])/$($Matches[2])"

                if ($index.Contains($namedKey)) {
                    $newUrl = $index[$namedKey] + (Preserve-Suffix $url)

                    $script:log += [PSCustomObject]@{
                        File = $relativeFile
                        OldUrl = $url
                        NewUrl = $newUrl
                        ResolvedKey = $namedKey
                    }

                    return "$before$newUrl$after"
                }
            }

            return $match.Value
        }
    )

    if ($html -ne $originalHtml) {
        Set-Content $file.FullName $html -NoNewline
        Write-Host "Resolved links: $relativeFile" -ForegroundColor Green
    }
}

$log | Export-Csv $linkLogPath -NoTypeInformation

Write-Host "Phase 3B link resolver complete." -ForegroundColor Cyan
Write-Host "Resolved links: $($log.Count)"
Write-Host "Log: $linkLogPath"