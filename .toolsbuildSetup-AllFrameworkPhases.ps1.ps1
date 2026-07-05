$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path ".\assets\data" -Force | Out-Null
New-Item -ItemType Directory -Path ".\assets\templates" -Force | Out-Null
New-Item -ItemType Directory -Path ".\tools\build" -Force | Out-Null
New-Item -ItemType Directory -Path ".\tools\audit" -Force | Out-Null

@'
{
  "sections": [
    {
      "key": "design",
      "title": "Design",
      "description": "Website, logo, graphics, and brand systems.",
      "links": [
        { "title": "Simple Editor", "url": "/design/simple-editor.html" },
        { "title": "Professional Editor", "url": "/design/professional-editor.html" },
        { "title": "Website Design", "url": "/design/website-design.html" },
        { "title": "Logo Design", "url": "/design/logo-design.html" },
        { "title": "Graphic Design", "url": "/design/graphic-design.html" },
        { "title": "Branding", "url": "/design/branding.html" }
      ]
    },
    {
      "key": "marketing",
      "title": "Marketing",
      "description": "SEO, local visibility, listings, and email marketing.",
      "links": [
        { "title": "National SEO", "url": "/marketing/national-seo.html" },
        { "title": "Local SEO", "url": "/marketing/local-seo.html" },
        { "title": "AEO", "url": "/marketing/aeo.html" },
        { "title": "GMB", "url": "/marketing/gmb.html" },
        { "title": "Local Listings", "url": "/marketing/local-listings.html" },
        { "title": "Email Marketing", "url": "/marketing/email-marketing.html" }
      ]
    },
    {
      "key": "pricing",
      "title": "Pricing",
      "description": "Design, marketing, advertising, and package pricing.",
      "links": [
        { "title": "Design Pricing", "url": "/pricing/design.html" },
        { "title": "Marketing Pricing", "url": "/pricing/marketing.html" },
        { "title": "Advertising Pricing", "url": "/pricing/advertising.html" },
        { "title": "Packages", "url": "/pricing/packages.html" }
      ]
    }
  ]
}
'@ | Set-Content ".\assets\data\navigation.json" -NoNewline

@'
[
  {
    "slug": "restaurants",
    "title": "Restaurant Website Design",
    "category": "Food & Beverage",
    "url": "/industries/restaurants/index.html"
  },
  {
    "slug": "roofing",
    "title": "Roofing Website Design",
    "category": "Home Services",
    "url": "/industries/roofing/index.html"
  },
  {
    "slug": "dentists",
    "title": "Dental Website Design",
    "category": "Healthcare",
    "url": "/industries/dentists/index.html"
  }
]
'@ | Set-Content ".\assets\data\industries.json" -NoNewline

@'
[
  {
    "slug": "kramarz-law",
    "title": "Kramarz Law",
    "industry": "Law Firm",
    "url": "/about/portfolio/kramarz-law/index.html",
    "tags": ["Website Design", "SEO", "Professional Services"]
  },
  {
    "slug": "esports-epleyer",
    "title": "ePleyer Esports",
    "industry": "Gaming",
    "url": "/about/portfolio/esports-epleyer/index.html",
    "tags": ["Website Design", "Platform", "Gaming"]
  }
]
'@ | Set-Content ".\assets\data\portfolio.json" -NoNewline

@'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>{{title}} | WebAct</title>
  <meta name="description" content="{{description}}">
</head>
<body>
  <div id="webact-header"></div>

  <main>
    <section class="wa-template-hero">
      <h1>{{title}}</h1>
      <p>{{description}}</p>
    </section>

    <section class="wa-template-content">
      {{content}}
    </section>
  </main>

  <div id="webact-footer"></div>

  <script src="/assets/js/routes.js"></script>
  <script src="/assets/js/navigation.js"></script>
  <script src="/assets/js/includes.js"></script>
</body>
</html>
'@ | Set-Content ".\assets\templates\landing-page.html" -NoNewline

@'
$ErrorActionPreference = "Stop"

$files = Get-ChildItem -Recurse -Include *.html |
Where-Object { $_.FullName -notmatch "\\.git\\|\\node_modules\\" }

$results = foreach ($file in $files) {
    $html = Get-Content $file.FullName -Raw

    [PSCustomObject]@{
        File = $file.FullName.Replace((Get-Location).Path + "\", "")
        HasHeaderPlaceholder = $html -match '<div id="webact-header"></div>'
        HasFooterPlaceholder = $html -match '<div id="webact-footer"></div>'
        HasRoutes = $html -match '/assets/js/routes.js'
        HasNavigation = $html -match '/assets/js/navigation.js'
        HasIncludes = $html -match '/assets/js/includes.js'
        HasOldHeader = $html -match 'wa-promodo-header'
        HasOldFooter = $html -match 'wa-global-footer'
    }
}

$results | Export-Csv ".\tools\audit\framework-audit.csv" -NoTypeInformation
$results | Format-Table -AutoSize
'@ | Set-Content ".\tools\audit\Audit-Framework.ps1" -NoNewline

@'
$ErrorActionPreference = "Stop"

Write-Host "Framework build placeholder created." -ForegroundColor Green
Write-Host "This script will later generate industries, portfolio, case studies, sitemap, and schema from assets/data." -ForegroundColor Cyan
Write-Host "No live pages are overwritten in this version." -ForegroundColor Yellow
'@ | Set-Content ".\tools\build\BuildWebsite.ps1" -NoNewline

Write-Host "Created framework data, templates, audit, and build scripts." -ForegroundColor Green

git status