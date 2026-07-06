$ErrorActionPreference = "Stop"

$html = Get-Content ".\index.html" -Raw

$replacements = @{
  "â€™" = "'"
  "â€œ" = '"'
  "â€" = '"'
  "â€¢" = "&bull;"
  "â€“" = "&ndash;"
  "â€”" = "&mdash;"
  "â†’" = "&rarr;"
  "â€¹" = "&lsaquo;"
  "â€º" = "&rsaquo;"
  "Ã©" = "é"
  "Â " = " "
}

foreach ($bad in $replacements.Keys) {
  $html = $html.Replace($bad, $replacements[$bad])
}

$iconMap = @{
  "💻" = "WEB"
  "🔎" = "SEO"
  "🤖" = "AI"
  "📈" = "ADS"
  "✨" = "BR"
  "📺" = "TV"
  "📣" = "SOC"
  "📍" = "MAP"
  "🛠️" = "SUP"
  "🛒" = "APP"
}

foreach ($emoji in $iconMap.Keys) {
  $html = $html.Replace($emoji, $iconMap[$emoji])
}

$html = $html.Replace(" →", " &rarr;")

$style = @'
<style id="homepage-icon-encoding-final">
  .service-card-v2 .icon {
    font-size: 13px !important;
    font-weight: 900 !important;
    letter-spacing: .04em !important;
    color: #061421 !important;
    font-family: Inter, Arial, sans-serif !important;
  }
</style>
'@

if ($html -notmatch "homepage-icon-encoding-final") {
  $html = $html -replace "(?is)</head>", "$style`r`n</head>"
}

Set-Content ".\index.html" $html -NoNewline -Encoding UTF8

Write-Host "Homepage encoding and icons fixed." -ForegroundColor Green