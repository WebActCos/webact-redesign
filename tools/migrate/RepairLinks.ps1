$files = Get-ChildItem -Recurse -Include *.html

foreach ($file in $files) {

    $html = Get-Content $file.FullName -Raw
    $original = $html

    #
    # Portfolio repairs
    #

    $html = $html -replace 'about/portfolio\.htmlindustry/', 'about/portfolio/industry/'
    $html = $html -replace 'about/portfolio\.htmlbest-', 'about/portfolio/best-'

    #
    # Contact normalization
    #

    $html = $html -replace 'href="contact/"','href="/contact/index.html"'
    $html = $html -replace 'href="\.\./\.\./contact/index\.html"','href="/contact/index.html"'
    $html = $html -replace 'href="\.\./contact/index\.html"','href="/contact/index.html"'

    #
    # Privacy
    #

    $html = $html -replace 'href="privacy-policy/"','href="/privacy-policy/index.html"'

    #
    # Terms
    #

    $html = $html -replace 'href="terms/"','href="/terms/index.html"'

    #
    # Normalize sitemap
    #

    $html = $html -replace 'href="sitemap\.xml"','href="/sitemap.xml"'

    #
    # Collapse accidental double slashes
    #

    $html = $html -replace '(?<!https:)//','/'

    if($html -ne $original){
        Set-Content $file.FullName $html -NoNewline
        Write-Host "Updated $($file.FullName)"
    }

}