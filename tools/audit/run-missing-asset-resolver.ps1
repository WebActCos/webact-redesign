& {
    Set-Location "C:\Projects\webact.com"

    $resolver = ".\tools\audit\webact-missing-asset-resolver.js"
    $report = ".\tools\audit\reports\asset-resolver\missing-asset-resolver.html"

    if (-not (Test-Path $resolver)) {
        Write-Host "Missing Asset Resolver was not found." -ForegroundColor Red
        return
    }

    node $resolver "C:\Projects\webact.com"

    if (Test-Path $report) {
        Start-Process $report
    }

    Write-Host ""
    git status --short
}
