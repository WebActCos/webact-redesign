# WebAct Universal Header & Footer Auditor

Checks only:

- universal header detection
- universal footer detection
- links inside header/footer blocks
- links inside detected shared header/footer files
- empty header/footer href values

It ignores page-body links and all design assets.

Run:

```powershell
Set-Location "C:\Projects\webact.com"
powershell -ExecutionPolicy Bypass -File ".\tools\audit\run-header-footer-audit.ps1"
```
