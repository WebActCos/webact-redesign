Set-Location "C:\webact.com"

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupRoot = Join-Path $PWD "backups\pagespeed-$timestamp"
$scriptTag = '<script src="/assets/js/pagespeed-boost.js?v=20260722" defer></script>'

Write-Host "Creating backup at $backupRoot"
New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null

$htmlFiles = Get-ChildItem -Path $PWD -Recurse -File -Include *.html,*.htm |
    Where-Object {
        $_.FullName -notmatch '[\\/]backups[\\/]' -and
        $_.FullName -notmatch '[\\/]node_modules[\\/]' -and
        $_.FullName -notmatch '[\\/]\.git[\\/]'
    }

$modifiedFiles = New-Object System.Collections.Generic.List[string]

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Substring($PWD.Path.Length).TrimStart('\','/')
    $backupPath = Join-Path $backupRoot $relativePath
    $backupDir = Split-Path $backupPath -Parent
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    Copy-Item $file.FullName $backupPath -Force

    $content = Get-Content $file.FullName -Raw
    $updated = $content

    if ($updated -notmatch 'assets/js/pagespeed-boost\.js') {
        if ($updated -match '(?i)</body>') {
            $updated = [regex]::Replace(
                $updated,
                '(?i)</body>',
                "  $scriptTag`r`n</body>",
                1
            )
        }
        elseif ($updated -match '(?i)</html>') {
            $updated = [regex]::Replace(
                $updated,
                '(?i)</html>',
                "$scriptTag`r`n</html>",
                1
            )
        }
    }

    # Add safe browser hints only when the attributes are missing.
    $updated = [regex]::Replace(
        $updated,
        '<img(?![^>]*\bdecoding=)([^>]*)>',
        '<img decoding="async"$1>',
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    $updated = [regex]::Replace(
        $updated,
        '<iframe(?![^>]*\bloading=)([^>]*)>',
        '<iframe loading="lazy"$1>',
        [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
    )

    if ($updated -ne $content) {
        [System.IO.File]::WriteAllText($file.FullName, $updated, [System.Text.UTF8Encoding]::new($false))
        $modifiedFiles.Add($relativePath)
        Write-Host "Optimized: $relativePath"
    }
}

if ($modifiedFiles.Count -eq 0) {
    Write-Host "No HTML files required changes."
    exit 0
}

Write-Host "`nValidating modified HTML files..."
foreach ($relativePath in $modifiedFiles) {
    $fullPath = Join-Path $PWD $relativePath
    $text = Get-Content $fullPath -Raw
    if ($text -notmatch 'assets/js/pagespeed-boost\.js') {
        throw "Validation failed: performance script missing from $relativePath"
    }
}

Write-Host "`nAdding only modified site files to Git..."
git add -- "assets/js/pagespeed-boost.js"
foreach ($relativePath in $modifiedFiles) {
    git add -- $relativePath
}

git status --short

git commit -m "Improve PageSpeed across all website pages without removing content"
git push origin main

Write-Host "`nComplete. Backup: $backupRoot"
Write-Host "Modified HTML files: $($modifiedFiles.Count)"
