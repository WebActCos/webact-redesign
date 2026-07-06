$ErrorActionPreference = "Stop"

# -----------------------------
# Fix Header
# -----------------------------
$headerPath = ".\includes\header.html"
$header = Get-Content $headerPath -Raw

$old = '<button class="wa-promodo-link" type="button" aria-expanded="false" aria-controls="wa-mega-digital-ads">Digital Advertising</button>'

$new = '<a class="wa-promodo-link" href="/webact-redesign/digital-ads/index.html">Digital Advertising</a>'

$header = $header.Replace($old,$new)

$oldOverview = '<a href="/digital-ads/index.html">Digital Advertising Overview</a>'
$header = $header.Replace($oldOverview,'')

$googleLink = '<a href="/digital-ads/google-advertising.html">Google Advertising</a>'

$newLinks = @'
<a href="/webact-redesign/digital-ads/index.html">Digital Advertising Overview</a>
<a href="/digital-ads/google-advertising.html">Google Advertising</a>
'@

$header = $header.Replace($googleLink,$newLinks)

Set-Content $headerPath $header -Encoding UTF8

# -----------------------------
# Fix Digital Advertising Hero
# -----------------------------
$page = Get-Content ".\digital-ads\index.html" -Raw

$page = [regex]::Replace(
    $page,
    '(?s)<aside class="ad-hub-card".*?</aside>',
@'
<form class="hero-form">
<h2>Request Advertising Review</h2>

<p>Tell us about your advertising goals and we'll recommend the best strategy for your business.</p>

<label>Full Name
<input type="text">
</label>

<label>Email Address
<input type="email">
</label>

<label>Phone Number
<input type="tel">
</label>

<label>Interested In
<select>
<option>Google Advertising</option>
<option>Microsoft Advertising</option>
<option>Social Media Advertising</option>
<option>Local Services Advertising</option>
<option>Amazon Advertising</option>
<option>Television Advertising</option>
</select>
</label>

<label>How can we help?
<textarea rows="4"></textarea>
</label>

<button class="button primary">
Request Advertising Review
</button>

</form>
'@
)

Set-Content ".\digital-ads\index.html" $page -Encoding UTF8

Write-Host "Digital Advertising page updated successfully." -ForegroundColor Green