$ErrorActionPreference = "Stop"

$footerPath = ".\includes\footer.html"
$footer = Get-Content $footerPath -Raw

# Replace any existing Terms link
$footer = $footer -replace `
'href="[^"]*terms[^"]*"', `
'href="/webact-redesign/terms.html"'

# If Terms appears as plain text, wrap it in a link
$footer = $footer -replace `
'>\s*Terms\s*<', `
'><a href="/webact-redesign/terms.html">Terms</a><'

Set-Content $footerPath $footer -Encoding UTF8

Write-Host ""
Write-Host "Terms footer link updated." -ForegroundColor Green