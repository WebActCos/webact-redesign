& {
    Set-Location "C:\Projects\webact.com"

    $auditor = ".\tools\audit\webact-header-footer-auditor.js"
    $report = ".\tools\audit\reports\header-footer\universal-header-footer-audit.html"

    if (-not (Test-Path $auditor)) {
        Write-Host "Universal Header & Footer Auditor was not found." -ForegroundColor Red
        return
    }

    node $auditor "C:\Projects\webact.com"

    if (Test-Path $report) {
        Start-Process $report
    }

    Write-Host ""
    git status --short
}
