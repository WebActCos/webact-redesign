& {
    Set-Location "C:\Projects\webact.com"

    $auditor = ".\tools\audit\webact-broken-internal-links-auditor.js"
    $report = ".\tools\audit\reports\broken-links\broken-internal-links.html"

    if (-not (Test-Path $auditor)) {
        Write-Host "Broken Internal Links Auditor was not found." -ForegroundColor Red
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
        Write-Host "Broken or empty internal links were found." -ForegroundColor Yellow
        Write-Host "No website files were changed." -ForegroundColor Yellow
        return
    }

    Write-Host ""
    Write-Host "No broken internal links were found." -ForegroundColor Green
}
