$ErrorActionPreference = "Stop"

$portfolioRoot = ".\about\portfolio"
$outPath = ".\assets\data\portfolio.json"

New-Item -ItemType Directory -Path ".\assets\data" -Force | Out-Null

$projects = Get-ChildItem $portfolioRoot -Directory |
Where-Object {
    Test-Path (Join-Path $_.FullName "index.html")
} |
ForEach-Object {
    $slug = $_.Name
    $htmlPath = Join-Path $_.FullName "index.html"
    $html = Get-Content $htmlPath -Raw

    $title = (Get-Culture).TextInfo.ToTitleCase(($slug -replace "-", " "))

    if ($html -match '(?is)<title[^>]*>(.*?)</title>') {
        $title = (($Matches[1] -replace '\s+', ' ').Trim() -replace '\s*\|\s*WebAct.*$', '')
    }

    $description = "A WebAct portfolio project for $title."

    if ($html -match '(?is)<meta\s+name=["'']description["'']\s+content=["'']([^"'']+)["'']') {
        $description = ($Matches[1] -replace '\s+', ' ').Trim()
    }

    $image = ""

    if ($html -match '(?is)<img[^>]+src=["'']([^"'']+)["'']') {
        $image = $Matches[1]
    }

    $category = "Portfolio"

    if ($slug -match 'roof') { $category = "Roofing" }
    elseif ($slug -match 'dental|dentist|smile') { $category = "Dental" }
    elseif ($slug -match 'restaurant|pizza|zaika|sushi|cuisine|brew') { $category = "Restaurant" }
    elseif ($slug -match 'law|legal|attorney') { $category = "Legal" }
    elseif ($slug -match 'hvac|heating|air') { $category = "HVAC" }
    elseif ($slug -match 'water|kinetico') { $category = "Water Treatment" }
    elseif ($slug -match 'home|care|health') { $category = "Healthcare" }

    [PSCustomObject]@{
        slug = $slug
        title = $title
        category = $category
        description = $description
        image = $image
        url = "/about/portfolio/$slug/index.html"
        caseStudyUrl = "/about/portfolio/case-study.html?project=$slug"
        services = @("Website Design", "SEO", "Digital Marketing")
    }
}

$projects |
Sort-Object title |
ConvertTo-Json -Depth 8 |
Set-Content $outPath -NoNewline

Write-Host "Generated portfolio data: $outPath" -ForegroundColor Green
Write-Host "Projects found: $($projects.Count)" -ForegroundColor Cyan