$ErrorActionPreference = "Stop"

$patterns = @(
  'portfolio\.htmlindustry',
  'portfolio\.htmlbest-',
  'href="pages/',
  'src="pages/',
  'href="contact/"',
  'href="privacy-policy/"',
  'href="terms/"'
)

$files = Get-ChildItem -Recurse -Include *.html |
Where-Object { $_.FullName -notmatch "\\.git\\|\\node_modules\\" }

$matches = foreach ($pattern in $patterns) {
  Select-String -Path $files.FullName -Pattern $pattern -ErrorAction SilentlyContinue
}

$matches | Select-Object Path, LineNumber, Line | Format-Table -AutoSize
