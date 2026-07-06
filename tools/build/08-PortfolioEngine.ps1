$ErrorActionPreference = "Stop"

Write-Host "=== Phase 8 Portfolio Engine ===" -ForegroundColor Cyan

& ".\tools\build\06-GeneratePortfolioData.ps1"
Copy-Item ".\assets\data\portfolio.json" ".\assets\data\case-studies.json" -Force
& ".\tools\build\04-GenerateCaseStudies.ps1"
& ".\tools\build\07-GeneratePortfolioIndex.ps1"
& ".\tools\audit\SiteValidatorV2.ps1"

Write-Host "=== Portfolio Engine Complete ===" -ForegroundColor Green