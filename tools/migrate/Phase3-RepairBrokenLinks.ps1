$ErrorActionPreference = "Stop"

$files = Get-ChildItem -Recurse -Include *.html |
Where-Object {
    $_.FullName -notmatch "\\.git\\|\\node_modules\\|\\tools\\audit\\reports\\"
}

foreach ($file in $files) {
    $html = Get-Content $file.FullName -Raw
    $original = $html

    # Normalize contact links
    $html = $html -replace 'href="contact/"', 'href="/contact/index.html"'
    $html = $html -replace 'href="\.\./contact/index\.html"', 'href="/contact/index.html"'
    $html = $html -replace 'href="\.\./\.\./contact/index\.html"', 'href="/contact/index.html"'

    # Normalize portfolio links
    $html = $html -replace 'href="about/portfolio\.html"', 'href="/about/portfolio.html"'
    $html = $html -replace 'href="\.\./about/portfolio\.html"', 'href="/about/portfolio.html"'
    $html = $html -replace 'href="\.\./\.\./about/portfolio\.html"', 'href="/about/portfolio.html"'

    # Fix malformed portfolio paths
    $html = $html -replace 'about/portfolio\.htmlindustry/', 'about/portfolio/industry/'
    $html = $html -replace 'about/portfolio\.htmlbest-', 'about/portfolio/best-'

    # Normalize main section links
    $html = $html -replace 'href="/about/"', 'href="/about/index.html"'
    $html = $html -replace 'href="/design/"', 'href="/design/index.html"'
    $html = $html -replace 'href="/marketing/"', 'href="/marketing/index.html"'
    $html = $html -replace 'href="/digital-ads/"', 'href="/digital-ads/index.html"'
    $html = $html -replace 'href="/pricing/"', 'href="/pricing/index.html"'
    $html = $html -replace 'href="/addons/"', 'href="/addons/index.html"'
    $html = $html -replace 'href="/industries/"', 'href="/industries/index.html"'

    # Normalize privacy / terms
    $html = $html -replace 'href="/privacy-policy/"', 'href="/privacy-policy/index.html"'
    $html = $html -replace 'href="/terms/"', 'href="/terms/index.html"'

    if ($html -ne $original) {
        Set-Content $file.FullName $html -NoNewline
        Write-Host "Updated: $($file.FullName)"
    }
}

Write-Host "Broken link repair pass complete."