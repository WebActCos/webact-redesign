$ErrorActionPreference = "Stop"

$root = Get-Location

$output = ".\assets\data\image-index.json"

$imageExtensions = @(
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.webp",
    "*.gif",
    "*.svg",
    "*.avif"
)

$images = @()

foreach ($ext in $imageExtensions) {

    Get-ChildItem -Recurse -Include $ext |
    Where-Object {
        $_.FullName -notmatch "\\.git\\|\\node_modules\\"
    } |
    ForEach-Object {

        $relative = $_.FullName.Replace($root.Path + "\", "") -replace "\\","/"

        $images += [PSCustomObject]@{
            file = $_.Name
            path = "/" + $relative
        }

    }

}

$images |
Sort-Object file |
ConvertTo-Json -Depth 4 |
Set-Content $output -NoNewline

Write-Host ""
Write-Host "Indexed $($images.Count) images." -ForegroundColor Green
Write-Host ""
Write-Host $output