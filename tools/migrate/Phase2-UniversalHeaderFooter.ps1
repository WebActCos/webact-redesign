$ErrorActionPreference = "Stop"

$root = (Get-Location).Path

$files = Get-ChildItem -Recurse -Include *.html |
Where-Object {
    $_.FullName -notmatch "\\.git\\|\\node_modules\\|\\includes\\header\.html|\\includes\\footer\.html"
}

foreach ($file in $files) {
    $html = Get-Content $file.FullName -Raw
    $original = $html

    # Remove old WebAct/Promodo style header blocks
    $html = $html -replace '(?is)<header\b[^>]*wa-promodo-header[^>]*>.*?</header>', '<div id="webact-header"></div>'

    # Remove old global footer blocks
    $html = $html -replace '(?is)<footer\b[^>]*wa-global-footer[^>]*>.*?</footer>', '<div id="webact-footer"></div>'

    # If no header placeholder exists, add after body
    if ($html -notmatch '<div id="webact-header"></div>') {
        $html = $html -replace '(?is)<body([^>]*)>', "<body`$1>`r`n  <div id=`"webact-header`"></div>"
    }

    # If no footer placeholder exists, add before scripts/body close
    if ($html -notmatch '<div id="webact-footer"></div>') {
        $html = $html -replace '(?is)</body>', "  <div id=`"webact-footer`"></div>`r`n</body>"
    }

    # Remove duplicate header placeholders
    $html = [regex]::Replace(
        $html,
        '(?is)(<div id="webact-header"></div>)(\s*<div id="webact-header"></div>)+',
        '$1'
    )

    # Remove duplicate footer placeholders
    $html = [regex]::Replace(
        $html,
        '(?is)(<div id="webact-footer"></div>)(\s*<div id="webact-footer"></div>)+',
        '$1'
    )

    # Ensure core scripts exist once
    $scripts = @(
        '<script src="/assets/js/routes.js"></script>',
        '<script src="/assets/js/navigation.js"></script>',
        '<script src="/assets/js/includes.js"></script>'
    )

    foreach ($script in $scripts) {
        $src = ($script -replace '.*src="([^"]+)".*', '$1')
        $html = $html -replace "(?is)\s*<script[^>]+src=`"$([regex]::Escape($src))`"[^>]*></script>", ""
    }

    $scriptBlock = "`r`n  " + ($scripts -join "`r`n  ") + "`r`n"
    $html = $html -replace '(?is)</body>', "$scriptBlock</body>"

    if ($html -ne $original) {
        Set-Content -Path $file.FullName -Value $html -NoNewline
        Write-Host "Updated: $($file.FullName.Replace($root + '\',''))" -ForegroundColor Green
    }
}

Write-Host "Phase 2 universal header/footer migration complete." -ForegroundColor Cyan