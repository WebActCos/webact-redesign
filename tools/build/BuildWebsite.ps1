$ErrorActionPreference = "Stop"

Write-Host "=== WebAct Build Started ===" -ForegroundColor Cyan

& ".\tools\build\01-Framework.ps1"
& ".\tools\build\02-DataFiles.ps1"
& ".\tools\build\03-Templates.ps1"
& ".\tools\audit\AuditFramework.ps1"

Write-Host "=== WebAct Build Complete ===" -ForegroundColor Green
