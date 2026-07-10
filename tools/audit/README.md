# WebAct Enterprise Site Auditor

Runs a dependency-free audit across the static WebAct repository.

## Checks

- Broken internal links
- Missing CSS, JavaScript and image assets
- Empty `href` and `src` values
- Remaining `/webact-redesign/` paths
- Explicit `index.html` URLs
- Invalid root-relative `../` paths
- Missing or duplicate titles
- Missing or duplicate descriptions
- Canonical problems
- Missing or multiple H1 elements
- Missing viewport and language metadata
- Invalid JSON-LD
- Missing image alt text
- Image dimension and lazy-loading opportunities
- Header, footer and main landmark consistency
- Orphan pages
- Sitemap and robots presence

## Run locally

```powershell
Set-Location "C:\Projects\webact.com"
powershell -ExecutionPolicy Bypass -File ".\tools\audit\run-site-audit.ps1"
```

Reports are generated in:

- `tools/audit/reports/enterprise-site-audit.html`
- `tools/audit/reports/enterprise-site-audit.json`

The auditor exits with a nonzero status when errors exist, allowing GitHub Actions to block a failing pull request or deployment.
