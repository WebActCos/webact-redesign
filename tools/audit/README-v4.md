# WebAct Enterprise Site Auditor v4

Version 4 understands the WebAct project structure.

## Site areas

- Website
- Industries
- Portfolio
- Knowledge Base
- App Store
- Blog

## What changed

- Collection pages are no longer treated like ordinary marketing pages.
- Portfolio dynamic routes are allowed.
- Portfolio and Industry template problems are aggregated into one actionable issue.
- Duplicate titles and descriptions are grouped by collection instead of repeated on every page.
- Knowledge Base and App Store pages no longer generate image-dimension noise.
- Orphan checks are disabled for generated collections.
- GitHub Actions still fails on real Critical and High findings.

## Run

```powershell
Set-Location "C:\Projects\webact.com"
powershell -ExecutionPolicy Bypass -File ".\tools\audit\run-site-audit-v4.ps1"
```

## Reports

```text
tools\audit\reports\v4\webact-enterprise-audit-v4.html
tools\audit\reports\v4\webact-enterprise-audit-v4.json
tools\audit\reports\v4\webact-enterprise-audit-v4.csv
```
