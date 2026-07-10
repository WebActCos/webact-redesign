& {
    Set-Location "C:\Projects\webact.com"

    $auditor = "C:\Projects\webact.com\tools\audit\webact-site-auditor-v3.js"
    $report = "C:\Projects\webact.com\tools\audit\reports\v3\webact-enterprise-audit-v3.html"

    if (-not (Test-Path $auditor)) {
        Write-Host "WebAct Enterprise Site Auditor v3 was not found." -ForegroundColor Red
        return
    }

    node $auditor "C:\Projects\webact.com"
    $auditExitCode = $LASTEXITCODE

    if (Test-Path $report) {
        Start-Process $report
    }

    Write-Host ""
    git status --short

    if ($auditExitCode -ne 0) {
        Write-Host ""
        Write-Host "Audit completed with Critical or High findings." -ForegroundColor Yellow
        Write-Host "Review the v3 report before committing website fixes." -ForegroundColor Yellow
        return
    }

    Write-Host ""
    Write-Host "Audit passed without Critical or High findings." -ForegroundColor Green
}
