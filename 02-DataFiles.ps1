$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Path ".\assets\data" -Force | Out-Null

@'
{
  "sections": [
    {
      "key": "design",
      "title": "Design",
      "description": "Website, logo, graphics, and brand systems.",
      "links": [
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
    }
  ]
}
'@ | Set-Content ".\assets\data\navigation.json" -NoNewline

@'
[]
'@ | Set-Content ".\assets\data\industries.json" -NoNewline

@'
[]
'@ | Set-Content ".\assets\data\portfolio.json" -NoNewline

Write-Host "Data files created." -ForegroundColor Green