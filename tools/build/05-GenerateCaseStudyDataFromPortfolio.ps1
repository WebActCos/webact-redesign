$ErrorActionPreference = "Stop"

$dataPath = ".\assets\data\case-studies.json"
$portfolioRoot = ".\about\portfolio"

New-Item -ItemType Directory -Path ".\assets\data" -Force | Out-Null

$projects = Get-ChildItem $portfolioRoot -Directory |
Where-Object {
    Test-Path (Join-Path $_.FullName "index.html")
} |
ForEach-Object {
    $slug = $_.Name
    $htmlPath = Join-Path $_.FullName "index.html"
    $html = Get-Content $htmlPath -Raw

    $title = $slug -replace "-", " "
    $title = (Get-Culture).TextInfo.ToTitleCase($title)

    if ($html -match '(?is)<title[^>]*>(.*?)</title>') {
        $pageTitle = ($Matches[1] -replace '\s+', ' ').Trim()
        if ($pageTitle) {
            $title = $pageTitle -replace '\s*\|\s*WebAct.*$', ''
        }
    }

    $summary = "A WebAct portfolio case study for $title."
    if ($html -match '(?is)<meta\s+name=["'']description["'']\s+content=["'']([^"'']+)["'']') {
        $summary = ($Matches[1] -replace '\s+', ' ').Trim()
    }

    $image = ""
    if ($html -match '(?is)<img[^>]+src=["'']([^"'']+)["'']') {
        $image = $Matches[1]
    }

    [PSCustomObject]@{
        slug = $slug
        title = $title
        industry = "Portfolio"
        summary = $summary
        services = @("Website Design", "SEO", "Digital Marketing")
        url = "/about/portfolio/$slug/index.html"
        image = $image
    }
}

$projects |
Sort-Object title |
ConvertTo-Json -Depth 8 |
Set-Content $dataPath -NoNewline

Write-Host "Generated case study data: $dataPath" -ForegroundColor Green
Write-Host "Projects found: $($projects.Count)" -ForegroundColor Cyan