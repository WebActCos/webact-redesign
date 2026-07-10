# WebAct Broken Internal Links Auditor

This audit checks only internal `<a href="">` links.

It intentionally ignores:

- images
- CSS
- JavaScript
- fonts
- videos
- canonical tags
- SEO metadata
- structured data
- design assets
- external links
- `mailto:` and `tel:` links
- JavaScript-generated links
- fragment-only links

## Run locally

```powershell
Set-Location "C:\Projects\webact.com"
powershell -ExecutionPolicy Bypass -File ".\tools\audit\run-broken-internal-links-audit.ps1"
```

## Reports

```text
tools\audit\reports\broken-links\broken-internal-links.html
tools\audit\reports\broken-links\broken-internal-links.json
tools\audit\reports\broken-links\broken-internal-links.csv
```

The auditor does not modify website files.
