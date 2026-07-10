# WebAct Enterprise Site Auditor v2

A production-only static-site auditor for the WebAct redesign repository.

## What changed from v1

Version 2 excludes high-noise sources:

- `pages/`
- `tools/`
- `node_modules/`
- `includes/`
- shared include fragments
- templates
- backups
- baseline pages
- generated reports

It audits only deployable production HTML pages and groups findings by:

- Critical
- High
- Medium
- Low
- Informational

## Reports

- `tools/audit/reports/v2/webact-enterprise-audit-v2.html`
- `tools/audit/reports/v2/webact-enterprise-audit-v2.json`
- `tools/audit/reports/v2/webact-enterprise-audit-v2.csv`

## Run

```powershell
Set-Location "C:\Projects\webact.com"
powershell -ExecutionPolicy Bypass -File ".\tools\audit\run-site-audit-v2.ps1"
```

## Deployment gate

The process exits with a failing status only when Critical or High findings remain.

Change exclusions, shared-component signals, and severity levels in:

```text
tools/audit/webact-auditor.config.json
```
