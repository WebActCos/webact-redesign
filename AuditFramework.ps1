$ErrorActionPreference = "Stop"

$files = Get-ChildItem -Recurse -Include *.html |
Where-Object { $_.FullName -notmatch "\\.git\\|\\node_modules\\" }

$results = foreach ($file in $files) {
  $html = Get-Content $file.FullName -Raw

  [PSCustomObject]@{
    File = $file.FullName.Replace((Get-Location).Path + "\", "")
    Header = $html -match '<div id="webact-header"></div>'
    Footer = $html -match '<div id="webact-footer"></div>'
    Routes = $html -match '/assets/js/routes.js'
    Navigation = $html -match '/assets/js/navigation.js'
    Includes = $html -match '/assets/js/includes.js'
    OldHeader = $html -match 'wa-promodo-header'
    OldFooter = $html -match 'wa-global-footer'
  }
}

$results | Export-Csv ".\tools\audit\framework-audit.csv" -NoTypeInformation
$results | Format-Table -AutoSize