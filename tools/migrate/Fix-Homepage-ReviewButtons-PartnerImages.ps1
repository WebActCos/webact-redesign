$ErrorActionPreference = "Stop"

$html = Get-Content ".\index.html" -Raw

# Force review buttons to clean entities
$html = [regex]::Replace(
  $html,
  '(<button[^>]*data-google-review-prev[^>]*>).*?(</button>)',
  '$1&lsaquo;$2'
)

$html = [regex]::Replace(
  $html,
  '(<button[^>]*data-google-review-next[^>]*>).*?(</button>)',
  '$1&rsaquo;$2'
)

# Find partner logo files in images folder
$logoNames = @(
  "logo-microsoft-partner",
  "logo-google-partner",
  "logo-amazon-ads",
  "logo-duda",
  "logo-meta-partner",
  "logo-duda-partner"
)

$slides = @()

foreach ($name in $logoNames) {
  $file = Get-ChildItem ".\images" -File | Where-Object {
    $_.BaseName -eq $name
  } | Select-Object -First 1

  if ($file) {
    $src = "/webact-redesign/images/$($file.Name)"
    $alt = ($name -replace "logo-", "" -replace "-", " ")
    $slides += '<div class="logo-slide"><img src="' + $src + '" alt="' + $alt + ' logo"></div>'
  } else {
    Write-Host "Missing logo file: $name" -ForegroundColor Yellow
  }
}

$partnerTrack = '<div class="logo-track">' + ($slides -join '') + ($slides -join '') + '</div>'

# Replace only bottom Partnered With WebAct logo track
$html = [regex]::Replace(
  $html,
  '(?is)(<section class="logo-rotator partner-rotator-v2"[^>]*>.*?<div class="logo-marquee">\s*)<div class="logo-track">.*?</div>(\s*</div>\s*</section>)',
  '$1' + $partnerTrack + '$2'
)

# Remove prior text-logo styling if present
$html = $html -replace '(?is)<style id="homepage-partner-logo-text-fix">.*?</style>', ''

# Add clean partner image styling
$style = @'
<style id="homepage-partner-logo-image-fix">
  .partner-rotator-v2 {
    background: #071421 !important;
    color: #ffffff !important;
  }

  .partner-rotator-v2 .logo-section-copy,
  .partner-rotator-v2 .eyebrow {
    color: #ffffff !important;
  }

  .partner-rotator-v2 .logo-slide {
    background: rgba(255,255,255,.08) !important;
    border: 1px solid rgba(255,255,255,.16) !important;
    box-shadow: none !important;
    border-radius: 16px !important;
    min-height: 78px !important;
    padding: 16px 34px !important;
    display: grid !important;
    place-items: center !important;
  }

  .partner-rotator-v2 .logo-slide img {
    max-height: 48px !important;
    max-width: 210px !important;
    object-fit: contain !important;
    filter: none !important;
    opacity: 1 !important;
  }

  .google-review-controls button {
    font-family: Arial, sans-serif !important;
    font-size: 34px !important;
    line-height: 1 !important;
  }
</style>
'@

if ($html -notmatch "homepage-partner-logo-image-fix") {
  $html = $html -replace "(?is)</head>", "$style`r`n</head>"
}

Set-Content ".\index.html" $html -NoNewline -Encoding UTF8

Write-Host "Fixed review buttons and bottom partner image logos." -ForegroundColor Green