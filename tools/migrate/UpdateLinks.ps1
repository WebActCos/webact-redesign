$map = Import-Csv ".\named-page-restructure-map.csv"

$files = Get-ChildItem -Recurse -Include *.html,*.js,*.css,*.xml,*.txt |
Where-Object { $_.FullName -notmatch "\\.git\\|\\node_modules\\" }

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $original = $content

    foreach ($row in $map) {
        $old = $row.OldPath -replace "\\", "/"
        $new = $row.NewPath -replace "\\", "/"

        $oldDir = $old -replace "/index\.html$", "/"
        $newPath = "/" + $new

        $content = $content.Replace("/$old", "/$new")
        $content = $content.Replace($old, $new)
        $content = $content.Replace($oldDir, "/" + $new)
    }

    if ($content -ne $original) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated links in $($file.FullName)"
    }
}
