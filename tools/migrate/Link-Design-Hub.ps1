$ErrorActionPreference = "Stop"

$headerPath = ".\includes\header.html"
$header = Get-Content $headerPath -Raw

# Remove any old Design Overview links
$header = $header -replace '\s*<a href="/design/index\.html">Design Overview</a>', ''
$header = $header -replace '\s*<a href="/webact-redesign/design/index\.html">Design Overview</a>', ''

# Make the mega menu title clickable
$header = $header -replace `
'<h2 class="wa-promodo-mega-title">Design</h2>', `
'<h2 class="wa-promodo-mega-title"><a href="/webact-redesign/design/index.html">Design</a></h2>'

Set-Content $headerPath $header -Encoding UTF8

Write-Host ""
Write-Host "Design hub linked successfully." -ForegroundColor Green