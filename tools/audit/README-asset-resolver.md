# WebAct Missing Asset Resolver

Scans production HTML files for missing image references and ranks similar image files already present in the repository.

The resolver does not automatically replace or copy anything.

## Run

```powershell
Set-Location "C:\Projects\webact.com"
powershell -ExecutionPolicy Bypass -File ".\tools\audit\run-missing-asset-resolver.ps1"
```

## Reports

```text
tools\audit\reports\asset-resolver\missing-asset-resolver.html
tools\audit\reports\asset-resolver\missing-asset-resolver.json
tools\audit\reports\asset-resolver\missing-asset-resolver.csv
```
