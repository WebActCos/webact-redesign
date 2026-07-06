$ErrorActionPreference = "Stop"

$html = Get-Content ".\index.html" -Raw

# Fix remaining corrupted stars/arrows
$html = $html.Replace("â˜…", "&#9733;")
$html = $html.Replace("â€¹", "&lsaquo;")
$html = $html.Replace("â€º", "&rsaquo;")

# Replace any remaining literal review stars with safe entity stars
$html = $html.Replace("★★★★★", "&#9733;&#9733;&#9733;&#9733;&#9733;")

# Replace bottom Partnered With WebAct logo track with correct partner names.
# Uses text-logo cards so we do not depend on missing image files.
$partnerTrack = @'
<div class="logo-track">
  <div class="logo-slide"><span class="partner-text-logo">vibe.co</span></div>
  <div class="logo-slide"><span class="partner-text-logo">Google</span></div>
  <div class="logo-slide"><span class="partner-text-logo">Microsoft</span></div>
  <div class="logo-slide"><span class="partner-text-logo">Meta</span></div>
  <div class="logo-slide"><span class="partner-text-logo">Amazon</span></div>
  <div class="logo-slide"><span class="partner-text-logo">vibe.co</span></div>
  <div class="logo-slide"><span class="partner-text-logo">Google</span></div>
  <div class="logo-slide"><span class="partner-text-logo">Microsoft</span></div>
  <div class="logo-slide"><span class="partner-text-logo">Meta</span></div>
  <div class="logo-slide"><span class="partner-text-logo">Amazon</span></div>
</div>
'@

$html = [regex]::Replace(
  $html,
  '(?is)(<section class="logo-rotator partner-rotator-v2"[^>]*>.*?<div class="logo-marquee">\s*)<div class="logo-track">.*?</div>(\s*</div>\s*</section>)',
  '$1' + $partnerTrack + '$2'
)

# Add styles for partner text logos and keep dark section matched to top logo card sizing.
$style = @'
<style id="homepage-partner-logo-text-fix">
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

  .partner-text-logo {
    color: #ffffff !important;
    font-size: 24px !important;
    font-weight: 900 !important;
    letter-spacing: .02em !important;
    white-space: nowrap !important;
    font-family: Inter, Arial, sans-serif !important;
  }
</style>
'@

if ($html -notmatch "homepage-partner-logo-text-fix") {
  $html = $html -replace "(?is)</head>", "$style`r`n</head>"
}

Set-Content ".\index.html" $html -NoNewline -Encoding UTF8

Write-Host "Fixed remaining stars, arrows, and partner logo scroll." -ForegroundColor Green