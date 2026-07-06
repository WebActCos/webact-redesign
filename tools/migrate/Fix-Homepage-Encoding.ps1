$ErrorActionPreference = "Stop"

$html = Get-Content ".\index.html" -Raw

# Build corrupted character strings without typing them directly
$badArrow = [string]::Concat([char]0x00E2,[char]0x2020,[char]0x2019)
$badStar  = [string]::Concat([char]0x00E2,[char]0x02DC,[char]0x00A6)
$badApos  = [string]::Concat([char]0x00E2,[char]0x20AC,[char]0x2122)
$badBullet = [string]::Concat([char]0x00E2,[char]0x20AC,[char]0x00A2)

$html = $html.Replace($badArrow, "&rarr;")
$html = $html.Replace($badStar, "&#9733;")
$html = $html.Replace($badApos, "'")
$html = $html.Replace($badBullet, "&bull;")
$html = $html.Replace([string][char]0x2192, "&rarr;")
$html = $html.Replace([string][char]0x2605, "&#9733;")

# Replace service emoji icons with clean inline SVG icon markup
$icons = @(
'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v12H3zM8 21h8M10 17v4M14 17v4"/></svg>',
'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="M15 15l6 6"/></svg>',
'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.4 5 5.6.8-4 3.9.9 5.5L12 15.6 7.1 18.2l.9-5.5-4-3.9 5.6-.8z"/></svg>',
'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h17M8 16V9M13 16V6M18 16v-4"/></svg>',
'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l8 4v10l-8 4-8-4V7z"/></svg>',
'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="12" rx="2"/><path d="M9 21h6M12 17v4"/></svg>',
'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h4l8-5v10l-8-5H4zM19 9c1 1 1 5 0 6"/></svg>',
'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>'
)

$i = 0
$html = [regex]::Replace($html, '(?is)(<span class="icon">).*?(</span>)', {
  param($m)
  $icon = $icons[[Math]::Min($script:i, $icons.Count - 1)]
  $script:i++
  return $m.Groups[1].Value + $icon + $m.Groups[2].Value
})

# Clean wording
$html = $html.Replace("Five-star client feedback", "Five-Star Client Reviews")
$html = $html.Replace("Five-star client reviews", "Five-Star Client Reviews")

# Add SVG icon styling
$style = @'
<style id="homepage-icon-encoding-final">
  .service-card-v2 .icon svg {
    width: 26px;
    height: 26px;
    stroke: #061421;
    stroke-width: 2;
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
'@

if ($html -notmatch "homepage-icon-encoding-final") {
  $html = $html -replace "(?is)</head>", "$style`r`n</head>"
}

Set-Content ".\index.html" $html -NoNewline -Encoding UTF8

Write-Host "Homepage icons, arrows, stars, and encoding fixed." -ForegroundColor Green