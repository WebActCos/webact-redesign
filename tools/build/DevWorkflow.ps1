$ErrorActionPreference = "Stop"

Write-Host "=== WebAct Developer Workflow ===" -ForegroundColor Cyan

Write-Host "1. Running build..." -ForegroundColor Yellow
& ".\tools\build\BuildWebsite.ps1"

Write-Host "2. Installing core scripts..." -ForegroundColor Yellow
& ".\tools\migrate\Install-CoreScripts.ps1"

Write-Host "3. Auditing framework..." -ForegroundColor Yellow
& ".\tools\audit\AuditFramework.ps1"

Write-Host "4. Auditing links..." -ForegroundColor Yellow
& ".\tools\audit\AuditLinks.ps1"

Write-Host "5. Git status..." -ForegroundColor Yellow
git status

Write-Host "=== Workflow Complete ===" -ForegroundColor Green