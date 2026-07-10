# WebAct Enterprise Site Auditor v3

Version 3 is section-aware and removes the biggest remaining sources of noise from v2.

## Major improvements

- Treats the public marketing site, portfolio, knowledge base, app store, and legal pages differently.
- Allows JavaScript-generated `href` and `src` expressions.
- Allows dynamic portfolio query routes such as `case-study.html?project=...`.
- Uses route aliases for known migrated URLs.
- Excludes editor/embed template files.
- Uses `sitemap.xml` as part of orphan-page validation.
- Disables orphan checks for portfolio, knowledge-base, app-store, and legal collections.
- Keeps strict SEO length checks focused on the primary marketing and portfolio sections.
- Adds section filters and section counts to the HTML dashboard.

## Run

```powershell
Set-Location "C:\Projects\webact.com"
powershell -ExecutionPolicy Bypass -File ".\tools\audit\run-site-audit-v3.ps1"
```

## Reports

```text
tools\audit\reports\v3\webact-enterprise-audit-v3.html
tools\audit\reports\v3\webact-enterprise-audit-v3.json
tools\audit\reports\v3\webact-enterprise-audit-v3.csv
```

## Configuration

Edit:

```text
tools\audit\webact-auditor-v3.config.json
```

The configuration controls:

- page-section classification
- dynamic markup detection
- dynamic query routes
- migrated route aliases
- exclusions
- severity
- deployment failure levels
