$ErrorActionPreference = "Stop"

$root = (Get-Location).Path
$indexPath = ".\assets\data\image-index.json"
$logPath = ".\tools\audit\reports\v2\phase7b-image-resolver-log.csv"

$images = Get-Content $indexPath -Raw | ConvertFrom-Json
$imageMap = @{}

foreach ($img in $images) {
    $key = $img.file.ToLower()
    if (-not $imageMap.ContainsKey($key)) {
        $imageMap[$key] = $img.path
    }
}

$log = @()

$htmlFiles = Get-ChildItem -Recurse -Include *.html |
Where-Object {
    $_.FullName -notmatch "\\.git\\|\\node_modules\\|\\tools\\audit\\reports\\"
}

foreach ($file in $htmlFiles) {
    $html = Get-Content $file.FullName -Raw
    $original = $html
    $relativeFile = $file.FullName.Replace($root + "\", "")

    $html = [regex]::Replace(
        $html,
        '(?is)(<img\b[^>]*\bsrc=["''])([^"'']+)(["''])',
        {
            param($match)

            $before = $match.Groups[1].Value
            $src = $match.Groups[2].Value
            $after = $match.Groups[3].Value

            if ($src -match '^(https?:|data:)') {
                return $match.Value
            }

            $clean = ($src -replace '\?.*$', '')
            $filename = [System.IO.Path]::GetFileName($clean).ToLower()

            if (-not $imageMap.ContainsKey($filename)) {
                return $match.Value
            }

            $targetPath = $imageMap[$filename]

            if ($src -eq $targetPath) {
                return $match.Value
            }

            $script:log += [PSCustomObject]@{
                File = $relativeFile
                OldSrc = $src
                NewSrc = $targetPath
                FileName = $filename
            }

            return "$before$targetPath$after"
        }
    )

    if ($html -ne $original) {
        Set-Content $file.FullName $html -NoNewline
        Write-Host "Updated images: $relativeFile" -ForegroundColor Green
    }
}

$log | Export-Csv $logPath -NoTypeInformation

Write-Host "Image resolver complete." -ForegroundColor Cyan
Write-Host "Updated image references: $($log.Count)"
Write-Host "Log: $logPath"