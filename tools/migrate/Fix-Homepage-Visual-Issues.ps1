$ErrorActionPreference = "Stop"

$html = Get-Content .\index.html -Raw

# Remove old failed fix styles
$html = $html -replace '(?is)<style id="homepage-v2-final-fixes">.*?</style>', ''
$html = $html -replace '(?is)<style id="homepage-v2-clean-fixes">.*?</style>', ''
$html = $html -replace '(?is)<style id="homepage-v2-visual-fixes">.*?</style>', ''

# Find real image paths
$restaurant = Get-ChildItem .\Resources\images -Recurse -File | Where-Object { $_.Name -match 'Chutney|Restaurant|Cuisine' } | Select-Object -First 1
$twoGo = Get-ChildItem .\about\portfolio -Recurse -File | Where-Object { $_.Name -match '2go|coconut' -and $_.Extension -match 'png|jpg|jpeg|webp' } | Select-Object -First 1

if ($restaurant) {
  $restaurantPath = "/webact-redesign/" + ($restaurant.FullName.Replace((Get-Location).Path + "\", "") -replace "\\","/")
  $html = [regex]::Replace($html, '(?is)(<h3>Restaurant Websites</h3>.*?</article>)', {
    param($m)
    return [regex]::Replace($m.Value, 'src="[^"]+"', 'src="' + $restaurantPath + '"', 1)
  })
}

if ($twoGo) {
  $twoGoPath = "/webact-redesign/" + ($twoGo.FullName.Replace((Get-Location).Path + "\", "") -replace "\\","/")
  $html = [regex]::Replace($html, '(?is)(<article[^>]*>\s*<img\s+src=")[^"]+("[^>]*>.*?<h3>2Go Coconut Oil Website</h3>)', '$1' + $twoGoPath + '$2')
}

# Fix broken review stars/arrows
$html = [regex]::Replace($html, '(<div class="google-review-stars"[^>]*>).*?(</div>)', '$1★★★★★$2')
$html = [regex]::Replace($html, '(<button[^>]*data-google-review-prev[^>]*>).*?(</button>)', '$1&#8249;$2')
$html = [regex]::Replace($html, '(<button[^>]*data-google-review-next[^>]*>).*?(</button>)', '$1&#8250;$2')

# Fix broken service icon content more aggressively
$labels = @("WEB","SEO","AI","ADS","BR","TV","SOC","MAP")
$i = 0
$html = [regex]::Replace($html, '(?is)(<[^>]+class="[^"]*(?:service-icon|home-service-icon|icon)[^"]*"[^>]*>).*?(</[^>]+>)', {
  param($m)
  $label = $labels[[Math]::Min($script:i, $labels.Count - 1)]
  $script:i++
  return $m.Groups[1].Value + $label + $m.Groups[2].Value
})

# Make both logo scroll sections match dark style
$html = $html -replace '<section class="logo-rotator"', '<section class="logo-rotator webact-dark-logo-scroll"'

$style = @'
<style id="homepage-v2-visual-fixes">
  .service-icon,
  .home-service-icon,
  .home-service-card .icon,
  .service-card .icon {
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    width:58px!important;
    height:58px!important;
    border-radius:18px!important;
    background:#e9f8ff!important;
    color:#061421!important;
    font:900 14px/1 Inter,Arial,sans-serif!important;
    letter-spacing:.04em!important;
  }

  .webact-dark-logo-scroll {
    background:#061421!important;
    color:#fff!important;
    padding-top:80px!important;
    padding-bottom:80px!important;
  }

  .webact-dark-logo-scroll .eyebrow,
  .webact-dark-logo-scroll h2,
  .webact-dark-logo-scroll p,
  .webact-dark-logo-scroll .logo-section-copy {
    color:#fff!important;
  }

  .webact-dark-logo-scroll .logo-marquee,
  .webact-dark-logo-scroll .logo-track,
  .webact-dark-logo-scroll .logo-slide {
    background:transparent!important;
  }

  .webact-dark-logo-scroll .logo-slide {
    box-shadow:none!important;
    border:0!important;
  }

  .webact-dark-logo-scroll .logo-slide img {
    filter:brightness(0) invert(1)!important;
    opacity:1!important;
  }

  .google-review-stars {
    color:#f5a400!important;
  }
</style>
'@

$html = $html -replace '(?is)</head>', "$style`r`n</head>"

Set-Content .\index.html $html -NoNewline -Encoding UTF8

Write-Host "Homepage visual issues fixed." -ForegroundColor Green
if ($restaurant) { Write-Host "Restaurant image: $restaurantPath" }
if ($twoGo) { Write-Host "2Go image: $twoGoPath" } else { Write-Host "2Go image not found." -ForegroundColor Yellow }