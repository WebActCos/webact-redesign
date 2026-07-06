$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path ".\tools\audit\reports" -Force | Out-Null

$filesToCheck = @(
  "includes\header.html",
  "includes\footer.html",
  "assets\js\includes.js",
  "assets\js\navigation.js",
  "styles.css",
  "assets\css\webact-promodo-nav.css",
  "assets\css\webact-footer.css"
)

Write-Host "=== Shared File Check ===" -ForegroundColor Cyan

$fileResults = foreach ($file in $filesToCheck) {
  [PSCustomObject]@{
    File = $file
    Exists = Test-Path $file
  }
}

$fileResults | Format-Table -AutoSize

Write-Host "`n=== Header/Footer Link Check ===" -ForegroundColor Cyan

$links = @()
$sharedHtmlFiles = @("includes\header.html", "includes\footer.html")

foreach ($file in $sharedHtmlFiles) {
  if (!(Test-Path $file)) { continue }

  $html = Get-Content $file -Raw

  $matches = [regex]::Matches($html, '(?is)(href|src)=["'']([^"'']+)["'']')

  foreach ($match in $matches) {
    $attr = $match.Groups[1].Value
    $url = $match.Groups[2].Value

    if ($url -match '^(https?:|mailto:|tel:|#|javascript:|data:)') {
      $exists = "External/Skip"
    } else {
      $clean = ($url -replace '\?.*$', '' -replace '#.*$', '')
      $path = $clean.TrimStart("/") -replace "/", "\"

      if ($clean -eq "/" -or $path -eq "") {
        $path = "index.html"
      }

      $exists = Test-Path $path
    }

    $links += [PSCustomObject]@{
      File = $file
      Attribute = $attr
      Url = $url
      Exists = $exists
    }
  }
}

$links | Format-Table -AutoSize
$links | Export-Csv ".\tools\audit\reports\shared-layout-links.csv" -NoTypeInformation

Write-Host "`nSaved: .\tools\audit\reports\shared-layout-links.csv" -ForegroundColor Green