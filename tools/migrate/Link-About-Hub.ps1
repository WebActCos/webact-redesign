$ErrorActionPreference = "Stop"

$headerPath = ".\includes\header.html"
$header = Get-Content $headerPath -Raw

# Remove any old duplicate About overview links
$header = $header -replace '\s*<a href="/about/index\.html">About Overview</a>', ''
$header = $header -replace '\s*<a href="/webact-redesign/about/index\.html">About Overview</a>', ''

# Make the About mega title clickable
$header = $header -replace `
'<h2 class="wa-promodo-mega-title">About</h2>', `
'<h2 class="wa-promodo-mega-title"><a href="/webact-redesign/about/index.html">About</a></h2>'

Set-Content $headerPath $header -NoNewline -Encoding UTF8

Write-Host "About hub linked successfully." -ForegroundColor Green