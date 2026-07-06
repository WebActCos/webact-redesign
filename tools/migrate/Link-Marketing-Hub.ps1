$ErrorActionPreference = "Stop"

$headerPath = ".\includes\header.html"
$header = Get-Content $headerPath -Raw

# Remove any previous Marketing Overview links
$header = $header -replace '\s*<a href="/marketing/index\.html">Marketing Overview</a>', ''
$header = $header -replace '\s*<a href="/webact-redesign/marketing/index\.html">Marketing Overview</a>', ''

# Make the Marketing mega title clickable
$header = $header -replace `
'<h2 class="wa-promodo-mega-title">Marketing</h2>',
'<h2 class="wa-promodo-mega-title"><a href="/webact-redesign/marketing/index.html">Marketing</a></h2>'

Set-Content $headerPath $header -NoNewline -Encoding UTF8

Write-Host ""
Write-Host "Marketing hub linked successfully." -ForegroundColor Green