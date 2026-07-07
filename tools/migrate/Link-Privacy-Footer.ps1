$ErrorActionPreference = "Stop"

$footerPath = ".\includes\footer.html"
$footer = Get-Content $footerPath -Raw

# Replace any existing Privacy link
$footer = $footer -replace `
'href="[^"]*privacy[^"]*"', `
'href="/webact-redesign/privacy.html"'

# If Privacy exists without a link, make it a link
$footer = $footer -replace `
'>\s*Privacy\s*<', `
'><a href="/webact-redesign/privacy.html">Privacy</a><'

Set-Content $footerPath $footer -Encoding UTF8

Write-Host ""
Write-Host "Privacy footer link updated." -ForegroundColor Green