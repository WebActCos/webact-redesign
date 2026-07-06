$ErrorActionPreference = "Stop"

$csv = ".\tools\audit\reports\v2\broken-links.csv"
$out = ".\tools\audit\reports\v2\broken-link-patterns.csv"

$rows = Import-Csv $csv

$patterns = foreach ($row in $rows) {
    $links = $row.BrokenLinks -split "\s*\|\s*"

    foreach ($link in $links) {
        if ([string]::IsNullOrWhiteSpace($link)) { continue }

        [PSCustomObject]@{
            Page = $row.File
            PageType = $row.Type
            BrokenLink = $link
            StartsWithSlash = $link.StartsWith("/")
            StartsWithDotDot = $link.StartsWith("../")
            ContainsIndex = $link -match "index\.html"
            ContainsPages = $link -match "^pages/"
            ContainsImages = $link -match "images|uploads|assets"
            FirstSegment = (($link.TrimStart("/") -split "/")[0])
        }
    }
}

$patterns |
Group-Object BrokenLink |
Sort-Object Count -Descending |
Select-Object Count, Name |
Export-Csv $out -NoTypeInformation

$patterns |
Group-Object FirstSegment |
Sort-Object Count -Descending |
Select-Object Count, Name |
Format-Table -AutoSize

Write-Host "Saved pattern report to $out" -ForegroundColor Green
notepad $out