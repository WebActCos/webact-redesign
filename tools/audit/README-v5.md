# WebAct Enterprise Site Auditor v5

This is the final auditor version before issue remediation begins.

## Improvements over v4

- Correctly resolves links to directories such as `../../../`, `../../`, and `/`.
- Decodes `%20`, `%26`, and other URL-encoded path characters before checking files.
- Resolves clean URLs to `index.html`.
- Supports route aliases for migrated legacy links.
- Tries collection-root and repository-root fallbacks for generated portfolio, industry, knowledge-base, app-store, and blog references.
- Recognizes more shared header and footer loading patterns.
- Condenses repeated canonical, layout, image-dimension, and repeated-link findings.
- Keeps representative files and expandable samples in the report.
- Reports actionable groups rather than thousands of repeated page-level warnings.

## Run

```powershell
Set-Location "C:\Projects\webact.com"
powershell -ExecutionPolicy Bypass -File ".\tools\audit\run-site-audit-v5.ps1"
```

## Reports

```text
tools\audit\reports\v5\webact-enterprise-audit-v5.html
tools\audit\reports\v5\webact-enterprise-audit-v5.json
tools\audit\reports\v5\webact-enterprise-audit-v5.csv
```
