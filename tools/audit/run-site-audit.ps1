Set-Location "C:\Projects\webact.com"

$auditor = "C:\Projects\webact.com\tools\audit\webact-site-auditor.js"

if (-not (Test-Path $auditor)) {
    Write-Host "WebAct Enterprise Site Auditor was not found." -ForegroundColor Red
}
else {
    node $auditor "C:\Projects\webact.com"

    $report = "C:\Projects\webact.com\tools\audit\reports\enterprise-site-audit.html"

    if (Test-Path $report) {
        Write-Host ""
        Write-Host "Opening audit dashboard..." -ForegroundColor Green
        Start-Process $report
    }

    Write-Host ""
    git status --short
}
