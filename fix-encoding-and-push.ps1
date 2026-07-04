$fixes = [ordered]@{
  "\u00e2\u2020\u0090" = "â†"
  "\u00e2\u2020\u0092" = "â†’"
  "\u00e2\u20ac\u2122" = "â€™"
  "\u00e2\u20ac\u0153" = "â€œ"
  "\u00e2\u20ac\u009d" = "â€"
  "\u00e2\u20ac\u201c" = "â€“"
  "\u00e2\u20ac\u201d" = "â€”"
  "\u00e2\u20ac\u00a2" = "â€¢"
  "\u00e2\u20ac\u00a6" = "â€¦"
  "\u00c2\u00a9" = "Â©"
  "\u00c2\u00ae" = "Â®"
  "\u00c2\u00b7" = "Â·"
  "\u00c2\u00a0" = " "
}

Get-ChildItem -Recurse -File -Include *.html,*.css,*.js |
Where-Object { $_.FullName -notmatch "\\.git\\" } |
ForEach-Object {
  $path = $_.FullName
  $content = Get-Content $path -Raw -Encoding UTF8
  $original = $content

  foreach ($bad in $fixes.Keys) {
    $badText = [regex]::Unescape($bad)
    $content = $content.Replace($badText, $fixes[$bad])
  }

  if ($content -ne $original) {
    Set-Content $path $content -Encoding UTF8
    Write-Host "Fixed: $path"
  }
}

git add -A
git status
git commit -m "Fix corrupted symbols and encoding artifacts"
git pull --rebase origin main
git push origin main
git status
