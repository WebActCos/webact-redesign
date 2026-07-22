#requires -Version 5.1
[CmdletBinding()]
param(
    [string]$Root=(Get-Location).Path,
    [string]$ProductionDomain='https://www.webact.com',
    [string]$OutputFolder='launch-audit\seo-phase1',
    [int]$ThinContentWordCount=250
)

$ErrorActionPreference='Stop'
Set-StrictMode -Version 2.0
Import-Module (Join-Path $PSScriptRoot 'WebActSeo.Common.psm1') -Force

$Root=[IO.Path]::GetFullPath($Root)
Set-Location $Root
$timestamp=Get-Date -Format 'yyyyMMdd-HHmmss'
$outputPath=Join-Path $Root $OutputFolder
New-Item -ItemType Directory -Path $outputPath -Force|Out-Null

$trackedHtml=@(git ls-files '*.html'|Where-Object{ -not [string]::IsNullOrWhiteSpace($_) })
if($trackedHtml.Count -eq 0){ throw 'No Git-tracked HTML files were found.' }

$results=New-Object Collections.Generic.List[object]

for($i=0;$i -lt $trackedHtml.Count;$i++){
    $trackedPath=$trackedHtml[$i]
    $relativePath=$trackedPath.Replace('/','\')
    $fullPath=Join-Path $Root $relativePath
    if(-not(Test-Path $fullPath)){ continue }

    Write-Progress -Activity 'Auditing WebAct SEO' -Status "$($i+1) of $($trackedHtml.Count): $relativePath" -PercentComplete ([math]::Floor((($i+1)/$trackedHtml.Count)*100))

    $html=Get-Content $fullPath -Raw
    $title=Get-SeoFirstMatch $html '<title[^>]*>([\s\S]*?)</title>'
    $description=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bname=["'']description["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $canonical=Get-SeoFirstMatch $html '<link\b(?=[^>]*\brel=["'']canonical["''])[^>]*\bhref=["'']([^"'']*)["''][^>]*>'
    $robots=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bname=["'']robots["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'

    $ogTitle=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bproperty=["'']og:title["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $ogDescription=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bproperty=["'']og:description["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $ogImage=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bproperty=["'']og:image["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $ogUrl=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bproperty=["'']og:url["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'

    $twitterCard=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bname=["'']twitter:card["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $twitterTitle=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bname=["'']twitter:title["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $twitterDescription=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bname=["'']twitter:description["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'
    $twitterImage=Get-SeoFirstMatch $html '<meta\b(?=[^>]*\bname=["'']twitter:image["''])[^>]*\bcontent=["'']([^"'']*)["''][^>]*>'

    $h1Values=@(Get-SeoAllMatches $html '<h1\b[^>]*>([\s\S]*?)</h1>'|ForEach-Object{ Convert-SeoHtmlToText $_ })
    $text=Convert-SeoHtmlToText $html
    $wordCount=if($text){ @($text -split '\s+'|Where-Object{ $_ -match '\w' }).Count }else{ 0 }
    $schema=Get-SeoJsonLdInformation $html
    $expectedUrl=Convert-SeoFileToUrl $relativePath $ProductionDomain
    $indexable=$robots -notmatch '(?i)\bnoindex\b'
    $issues=New-Object Collections.Generic.List[string]

    if(-not $title){$issues.Add('Missing title')}elseif($title.Length -lt 50){$issues.Add('Title under 50 characters')}elseif($title.Length -gt 60){$issues.Add('Title over 60 characters')}
    if(-not $description){$issues.Add('Missing meta description')}elseif($description.Length -lt 120){$issues.Add('Description under 120 characters')}elseif($description.Length -gt 160){$issues.Add('Description over 160 characters')}

    if(-not $canonical){$issues.Add('Missing canonical')}else{
        if($canonical -notmatch '^https://'){$issues.Add('Canonical is not HTTPS')}
        if($canonical -notmatch ('^'+[regex]::Escape($ProductionDomain)+'(/|$)')){$issues.Add('Canonical uses wrong domain')}
        if($canonical -match '[?#]'){$issues.Add('Canonical contains query or fragment')}
    }

    if(-not $robots){$issues.Add('Missing robots meta')}
    if($h1Values.Count -eq 0){$issues.Add('Missing H1')}elseif($h1Values.Count -gt 1){$issues.Add('Multiple H1 tags')}

    foreach($social in @(
        @{Name='og:title';Value=$ogTitle},
        @{Name='og:description';Value=$ogDescription},
        @{Name='og:image';Value=$ogImage},
        @{Name='og:url';Value=$ogUrl},
        @{Name='twitter:card';Value=$twitterCard},
        @{Name='twitter:title';Value=$twitterTitle},
        @{Name='twitter:description';Value=$twitterDescription},
        @{Name='twitter:image';Value=$twitterImage}
    )){ if(-not $social.Value){$issues.Add("Missing $($social.Name)")} }

    if($schema.BlockCount -eq 0 -and $indexable){$issues.Add('Missing JSON-LD')}
    if($schema.InvalidCount -gt 0){$issues.Add('Invalid JSON-LD')}

    $articlePage=($relativePath -match '(?i)(^|\\)(blog|news|tips)(\\|$)' -or $relativePath -match '(?i)about\\blog')
    if($articlePage -and -not $schema.HasArticle){$issues.Add('Article page missing Article schema')}
    if($relativePath -ne 'index.html' -and $indexable -and -not $schema.HasBreadcrumb){$issues.Add('Missing BreadcrumbList schema')}
    if($indexable -and $wordCount -lt $ThinContentWordCount){$issues.Add('Thin content')}

    $results.Add([pscustomobject]@{
        Page=$relativePath.Replace('\','/')
        ExpectedUrl=$expectedUrl
        Indexable=$indexable
        Robots=$robots
        Title=$title
        TitleLength=$title.Length
        Description=$description
        DescriptionLength=$description.Length
        Canonical=$canonical
        H1Count=$h1Values.Count
        H1=($h1Values -join ' | ')
        WordCount=$wordCount
        OGTitle=$ogTitle
        OGDescription=$ogDescription
        OGImage=$ogImage
        OGUrl=$ogUrl
        TwitterCard=$twitterCard
        TwitterTitle=$twitterTitle
        TwitterDescription=$twitterDescription
        TwitterImage=$twitterImage
        JsonLdBlocks=$schema.BlockCount
        ValidJsonLdBlocks=$schema.ValidCount
        InvalidJsonLdBlocks=$schema.InvalidCount
        JsonLdTypes=$schema.Types
        HasOrganizationSchema=$schema.HasOrganization
        HasWebSiteSchema=$schema.HasWebSite
        HasWebPageSchema=$schema.HasWebPage
        HasServiceSchema=$schema.HasService
        HasArticleSchema=$schema.HasArticle
        HasBreadcrumbSchema=$schema.HasBreadcrumb
        IssueCount=$issues.Count
        Issues=($issues -join '; ')
    })
}

Write-Progress -Activity 'Auditing WebAct SEO' -Completed

$mainReport=Join-Path $outputPath "metadata-audit-$timestamp.csv"
$results|Sort-Object @{Expression='IssueCount';Descending=$true},@{Expression='Page';Descending=$false}|Export-Csv $mainReport -NoTypeInformation -Encoding UTF8

$duplicateTitles=$results|Where-Object{ $_.Indexable -and -not [string]::IsNullOrWhiteSpace($_.Title) }|Group-Object Title|Where-Object{ $_.Count -gt 1 }|ForEach-Object{ foreach($page in $_.Group){ [pscustomobject]@{Title=$_.Name;DuplicateCount=$_.Count;Page=$page.Page} } }
$duplicateDescriptions=$results|Where-Object{ $_.Indexable -and -not [string]::IsNullOrWhiteSpace($_.Description) }|Group-Object Description|Where-Object{ $_.Count -gt 1 }|ForEach-Object{ foreach($page in $_.Group){ [pscustomobject]@{Description=$_.Name;DuplicateCount=$_.Count;Page=$page.Page} } }
$socialIssues=$results|Where-Object{ -not $_.OGTitle -or -not $_.OGDescription -or -not $_.OGImage -or -not $_.OGUrl -or -not $_.TwitterCard -or -not $_.TwitterTitle -or -not $_.TwitterDescription -or -not $_.TwitterImage }
$schemaIssues=$results|Where-Object{ $_.JsonLdBlocks -eq 0 -or $_.InvalidJsonLdBlocks -gt 0 -or ($_.Indexable -and $_.Page -ne 'index.html' -and -not $_.HasBreadcrumbSchema) }
$thinContent=$results|Where-Object{ $_.Indexable -and $_.WordCount -lt $ThinContentWordCount }

$duplicateTitles|Export-Csv (Join-Path $outputPath "duplicate-titles-$timestamp.csv") -NoTypeInformation -Encoding UTF8
$duplicateDescriptions|Export-Csv (Join-Path $outputPath "duplicate-descriptions-$timestamp.csv") -NoTypeInformation -Encoding UTF8
$socialIssues|Export-Csv (Join-Path $outputPath "social-metadata-$timestamp.csv") -NoTypeInformation -Encoding UTF8
$schemaIssues|Export-Csv (Join-Path $outputPath "schema-audit-$timestamp.csv") -NoTypeInformation -Encoding UTF8
$thinContent|Export-Csv (Join-Path $outputPath "thin-content-$timestamp.csv") -NoTypeInformation -Encoding UTF8

$summaryPath=Join-Path $outputPath "summary-$timestamp.txt"
$summary=@"
WebAct Phase 1 SEO Audit
Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Tracked HTML pages: $($results.Count)
Indexable pages: $(@($results|Where-Object{ $_.Indexable }).Count)
Noindex pages: $(@($results|Where-Object{ -not $_.Indexable }).Count)
Pages with issues: $(@($results|Where-Object{ $_.IssueCount -gt 0 }).Count)
Duplicate title pages: $(@($duplicateTitles).Count)
Duplicate description pages: $(@($duplicateDescriptions).Count)
Social metadata issue pages: $(@($socialIssues).Count)
Schema issue pages: $(@($schemaIssues).Count)
Thin-content pages: $(@($thinContent).Count)
Main report: $mainReport
"@
[IO.File]::WriteAllText($summaryPath,$summary,[Text.UTF8Encoding]::new($false))

Write-Host ''
Write-Host '========================================' -ForegroundColor Cyan
Write-Host ' Phase 1 SEO Audit Complete' -ForegroundColor Cyan
Write-Host '========================================' -ForegroundColor Cyan
Write-Host "Pages checked:               $($results.Count)"
Write-Host "Pages with issues:           $(@($results|Where-Object{ $_.IssueCount -gt 0 }).Count)"
Write-Host "Duplicate title pages:       $(@($duplicateTitles).Count)"
Write-Host "Duplicate description pages: $(@($duplicateDescriptions).Count)"
Write-Host "Social metadata issue pages: $(@($socialIssues).Count)"
Write-Host "Schema issue pages:          $(@($schemaIssues).Count)"
Write-Host "Thin-content pages:          $(@($thinContent).Count)"
Write-Host "Main report: $mainReport" -ForegroundColor Green
Write-Host "Summary: $summaryPath" -ForegroundColor Green
Write-Host 'No website files were changed.' -ForegroundColor Yellow