WebAct Framework Package

Extract/copy these folders into:
C:\Projects\webact.com

Then run from PowerShell:

cd C:\Projects\webact.com
.\tools\build\BuildWebsite.ps1
.\tools\migrate\Install-CoreScripts.ps1
.\tools\audit\AuditFramework.ps1
.\tools\audit\AuditLinks.ps1

git add .
git commit -m "Add WebAct modular build framework"
git push

Notes:
- BuildWebsite.ps1 creates/refreshes framework JS, data files, and templates.
- Install-CoreScripts.ps1 ensures the core pages load routes.js, navigation.js, and includes.js.
- AuditFramework.ps1 reports which pages use universal includes/scripts.
- AuditLinks.ps1 reports common broken-link patterns.
- This package does not overwrite industry, portfolio, or blog pages with generated content yet.
