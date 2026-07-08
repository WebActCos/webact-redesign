$ErrorActionPreference = "Stop"

$files = Get-ChildItem . -Recurse -Filter *.html | Where-Object {
    $_.FullName -notmatch '\\.git\\|\\node_modules\\|\\WebAct_Project_Docs\\|\\pages\\|\\includes\\|\\assets\\includes\\'
}

foreach ($file in $files){

    $html = Get-Content $file.FullName -Raw
    $original = $html

    if($html -notmatch '<div id="webact-header"></div>'){
        continue
    }

    $body = [regex]::Match($html,'(?is)<body[^>]*>(.*?)</body>')

    if(!$body.Success){
        continue
    }

    $content = $body.Groups[1].Value

    $headerIndex = $content.IndexOf('<div id="webact-header"></div>')

    if($headerIndex -lt 0){
        continue
    }

    $afterHeader = $content.Substring($headerIndex)

    $newBody = "<body>`r`n" + $afterHeader + "`r`n</body>"

    $html = [regex]::Replace(
        $html,
        '(?is)<body[^>]*>.*?</body>',
        $newBody,
        1
    )

    if($html -ne $original){
        Set-Content $file.FullName $html -Encoding UTF8 -NoNewline
        Write-Host "Cleaned $($file.Name)" -ForegroundColor Green
    }
}

git add .
git commit -m "Remove legacy headers after universal header migration"
git push origin main
