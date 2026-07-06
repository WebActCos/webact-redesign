$ErrorActionPreference = "Stop"

$coreFiles = Get-ChildItem -Recurse -Include *.html |
Where-Object {
    $_.FullName -match "\\(about|design|marketing|digital-ads|pricing|addons|contact)\\" -or
    $_.Name -eq "index.html"
} |
Where-Object {
    $_.FullName -notmatch "\\about\\portfolio\\|\\about\\blog\\|\\about\\website-knowledge-base\\|\\about\\widget-knowledge-base\\|\\addons\\website-app-store\\|\\industries\\|\\.git\\|\\node_modules\\|\\tools\\audit\\reports\\"
}

$replacements = @{
    '../../index.html' = '/index.html'
    '../../pricing/index.html' = '/pricing/index.html'
    '../../about/portfolio.html' = '/about/portfolio.html'
    '../../about/faq.html' = '/about/faq.html'
    '../../about/blog.html' = '/about/blog.html'
    '../../about/website-knowledge-base.html' = '/about/website-knowledge-base.html'
    '../../about/widget-knowledge-base.html' = '/about/widget-knowledge-base.html'
    '../../about/how-to-videos.html' = '/about/how-to-videos.html'
    '../../pricing/design.html' = '/pricing/design.html'
    '../../pricing/marketing.html' = '/pricing/marketing.html'
    '../../pricing/advertising.html' = '/pricing/advertising.html'
    '../../pricing/packages.html' = '/pricing/packages.html'
    '../../pricing/widgets.html' = '/pricing/widgets.html'
    '../../design/website-design.html' = '/design/website-design.html'
    '../../design/professional-editor.html' = '/design/professional-editor.html'
    '../../design/simple-editor.html' = '/design/simple-editor.html'
    '../../addons/domain-names.html' = '/addons/domain-names.html'
    '../../addons/professional-email.html' = '/addons/professional-email.html'
    '../../addons/widgets.html' = '/addons/widgets.html'
    '../../addons/website-app-store.html' = '/addons/website-app-store.html'
    '../../marketing/national-seo.html' = '/marketing/national-seo.html'
    '../../marketing/local-seo.html' = '/marketing/local-seo.html'
    '../../marketing/email-marketing.html' = '/marketing/email-marketing.html'
    '../../marketing/aeo.html' = '/marketing/aeo.html'
    '../../marketing/gmb.html' = '/marketing/gmb.html'
    '../../marketing/local-listings.html' = '/marketing/local-listings.html'
    '../../marketing/seo.html' = '/marketing/seo.html'
    '../../digital-ads/index.html' = '/digital-ads/index.html'
    '../../digital-ads/google-advertising.html' = '/digital-ads/google-advertising.html'
    '../../industries/index.html' = '/industries/index.html'
}

foreach ($file in $coreFiles) {
    $html = Get-Content $file.FullName -Raw
    $original = $html

    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $html = $html.Replace($old, $new)
    }

    $html = $html -replace '\.\./google-advertising/index\.html', '/digital-ads/google-advertising.html'
    $html = $html -replace '\.\./social-media-advertising/index\.html', '/digital-ads/social-media-advertising.html'
    $html = $html -replace '\.\./microsoft-advertising/index\.html', '/digital-ads/microsoft-advertising.html'
    $html = $html -replace '\.\./local-services-advertising/index\.html', '/digital-ads/local-services-advertising.html'
    $html = $html -replace '\.\./website-design/index\.html', '/design/website-design.html'
    $html = $html -replace '\.\./logo-design/index\.html', '/design/logo-design.html'
    $html = $html -replace '\.\./graphic-design/index\.html', '/design/graphic-design.html'
    $html = $html -replace '\.\./national-seo/index\.html', '/marketing/national-seo.html'
    $html = $html -replace '\.\./local-seo/index\.html', '/marketing/local-seo.html'
    $html = $html -replace '\.\./email-marketing/index\.html', '/marketing/email-marketing.html'
    $html = $html -replace '\.\./aeo/index\.html', '/marketing/aeo.html'
    $html = $html -replace '\.\./gmb/index\.html', '/marketing/gmb.html'
    $html = $html -replace '\.\./local-listings/index\.html', '/marketing/local-listings.html'

    if ($html -ne $original) {
        Set-Content $file.FullName $html -NoNewline
        Write-Host "Updated core links: $($file.FullName)"
    }
}