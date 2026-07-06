$ErrorActionPreference = "Stop"

# Fix image paths on main pages for GitHub Pages
$htmlFiles = Get-ChildItem -Recurse -Include *.html |
Where-Object {
  $_.FullName -notmatch "\\.git\\|\\node_modules\\|\\tools\\audit\\reports\\"
}

foreach ($file in $htmlFiles) {
  $html = Get-Content $file.FullName -Raw
  $original = $html

  # Prefix root-relative image paths for GitHub Pages
  $html = $html -replace 'src="/(Resources/)', 'src="/webact-redesign/$1'
  $html = $html -replace 'src="/(images/)', 'src="/webact-redesign/$1'
  $html = $html -replace 'src="/(assets/)', 'src="/webact-redesign/$1'

  # Fix common relative image paths that are too deep
  $html = $html -replace 'src="\.\./\.\./assets/', 'src="/webact-redesign/assets/'
  $html = $html -replace 'src="\.\./assets/', 'src="/webact-redesign/assets/'
  $html = $html -replace 'src="\.\./\.\./Resources/', 'src="/webact-redesign/Resources/'
  $html = $html -replace 'src="\.\./Resources/', 'src="/webact-redesign/Resources/'
  $html = $html -replace 'src="\.\./\.\./images/', 'src="/webact-redesign/images/'
  $html = $html -replace 'src="\.\./images/', 'src="/webact-redesign/images/'

  if ($html -ne $original) {
    Set-Content $file.FullName $html -NoNewline -Encoding UTF8
    Write-Host "Fixed images: $($file.FullName)"
  }
}

# Fix footer encoding characters
$footerPath = ".\includes\footer.html"
$footer = Get-Content $footerPath -Raw

$footer = $footer -replace '  2012 2026 WebAct', '&copy; 2012&ndash;2026 WebAct'
$footer = $footer -replace '© 2012–2026 WebAct', '&copy; 2012&ndash;2026 WebAct'
$footer = $footer -replace 'Website Design   SEO   AI Optimization   Digital Advertising   Ecommerce', 'Website Design &bull; SEO &bull; AI Optimization &bull; Digital Advertising &bull; Ecommerce'
$footer = $footer -replace 'Website Design • SEO • AI Optimization • Digital Advertising • Ecommerce', 'Website Design &bull; SEO &bull; AI Optimization &bull; Digital Advertising &bull; Ecommerce'
$footer = $footer -replace 'Privacy   Terms   Sitemap', 'Privacy &bull; Terms &bull; Sitemap'
$footer = $footer -replace '<span>•</span>', '<span>&bull;</span>'

Set-Content $footerPath $footer -NoNewline -Encoding UTF8

Write-Host "Fixed image paths and footer encoding." -ForegroundColor Green