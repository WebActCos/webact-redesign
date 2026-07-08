$ErrorActionPreference = "Stop"

$headerInclude = ".\includes\header.html"
if (!(Test-Path $headerInclude)) {
  throw "Missing universal header: $headerInclude"
}

$files = Get-ChildItem . -Recurse -Include *.html | Where-Object {
  $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\WebAct_Project_Docs\\|\\pages\\'
}

foreach ($file in $files) {
  $path = $file.FullName
  $html = Get-Content $path -Raw
  $original = $html

  $html = [regex]::Replace(
    $html,
    '(?is)<header[^>]*class="[^"]*wa-promodo-header[^"]*"[^>]*>.*?</header>',
    '<div id="webact-header"></div>',
    1
  )

  $html = [regex]::Replace(
    $html,
    '(?is)<header[^>]*class="[^"]*(site-header|main-header|header)[^"]*"[^>]*>.*?</header>',
    '<div id="webact-header"></div>',
    1
  )

  if ($html -notmatch 'id="webact-header"') {
    $insertHeader = "<body`$1>`r`n<div id=""webact-header""></div>"
    $html = $html -replace '(?i)<body([^>]*)>', $insertHeader
  }

  $html = [regex]::Replace(
    $html,
    '(?is)(<div id="webact-header"></div>)(\s*<div id="webact-header"></div>)+',
    '$1'
  )

  if ($html -notmatch 'webact-promodo-nav\.css') {
    $css = "  <link rel=""stylesheet"" href=""/webact-redesign/assets/css/webact-promodo-nav.css?v=main-layout-1"">`r`n</head>"
    $html = $html -replace '(?i)</head>', $css
  }

  if ($html -notmatch 'assets/js/routes\.js') {
    $script = "  <script src=""/webact-redesign/assets/js/routes.js?v=main-layout-1""></script>`r`n</body>"
    $html = $html -replace '(?i)</body>', $script
  }

  if ($html -notmatch 'assets/js/navigation\.js') {
    $script = "  <script src=""/webact-redesign/assets/js/navigation.js?v=main-layout-1""></script>`r`n</body>"
    $html = $html -replace '(?i)</body>', $script
  }

  if ($html -notmatch 'assets/js/includes\.js') {
    $script = "  <script src=""/webact-redesign/assets/js/includes.js?v=main-layout-1""></script>`r`n</body>"
    $html = $html -replace '(?i)</body>', $script
  }

  if ($html -ne $original) {
    Set-Content $path $html -NoNewline -Encoding UTF8
  }
}

$missing = Get-ChildItem . -Recurse -Include *.html | Where-Object {
  $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\WebAct_Project_Docs\\|\\pages\\'
} | Where-Object {
  (Get-Content $_.FullName -Raw) -notmatch 'id="webact-header"'
}

$missing | Select-Object FullName | Out-File .\universal-header-missing-report.txt

git add includes/header.html *.html about addons contact design digital-ads industries marketing pricing privacy-policy terms assets/js/includes.js assets/js/navigation.js assets/js/routes.js universal-header-missing-report.txt
git commit -m "Apply universal header across site pages"
git push origin main
