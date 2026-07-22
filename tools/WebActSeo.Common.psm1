Set-StrictMode -Version 2.0

function Get-SeoFirstMatch {
    param([string]$Html,[string]$Pattern)
    $m=[regex]::Match($Html,$Pattern,[Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if($m.Success){ return [Net.WebUtility]::HtmlDecode($m.Groups[1].Value.Trim()) }
    return ""
}

function Get-SeoAllMatches {
    param([string]$Html,[string]$Pattern)
    $values=@()
    foreach($m in [regex]::Matches($Html,$Pattern,[Text.RegularExpressions.RegexOptions]::IgnoreCase)){
        $values += [Net.WebUtility]::HtmlDecode($m.Groups[1].Value.Trim())
    }
    return $values
}

function Convert-SeoHtmlToText {
    param([string]$Html)
    $text=$Html
    $text=[regex]::Replace($text,'<script\b[^>]*>[\s\S]*?</script>',' ','IgnoreCase')
    $text=[regex]::Replace($text,'<style\b[^>]*>[\s\S]*?</style>',' ','IgnoreCase')
    $text=[regex]::Replace($text,'<noscript\b[^>]*>[\s\S]*?</noscript>',' ','IgnoreCase')
    $text=[regex]::Replace($text,'<[^>]+>',' ')
    $text=[Net.WebUtility]::HtmlDecode($text)
    return [regex]::Replace($text,'\s+',' ').Trim()
}

function Convert-SeoFileToUrl {
    param([string]$RelativePath,[string]$ProductionDomain)
    $path=$RelativePath.Replace('\','/')
    if($path -eq 'index.html'){ return "$ProductionDomain/" }
    if($path -match '/index\.html$'){
        $path=$path.Substring(0,$path.Length-'/index.html'.Length)
        return "$ProductionDomain/$path/"
    }
    return "$ProductionDomain/$path"
}

function Get-SeoPageLabel {
    param(
        [string]$RelativePath,
        [string]$Html
    )

    $h1=Get-SeoFirstMatch $Html '<h1\b[^>]*>([\s\S]*?)</h1>'
    if(-not [string]::IsNullOrWhiteSpace($h1)){
        $label=Convert-SeoHtmlToText $h1
        if(-not [string]::IsNullOrWhiteSpace($label)){
            return $label
        }
    }

    $title=Get-SeoFirstMatch $Html '<title[^>]*>([\s\S]*?)</title>'
    if(-not [string]::IsNullOrWhiteSpace($title)){
        $title=($title -replace '\s*\|\s*WebAct\s*$','').Trim()
        if(-not [string]::IsNullOrWhiteSpace($title)){
            return $title
        }
    }

    if($RelativePath -eq 'index.html'){
        return 'WebAct'
    }

    $normalized=$RelativePath.Replace('\','/').Trim('/')
    if($normalized.EndsWith('/index.html')){
        $normalized=$normalized.Substring(0,$normalized.Length-'/index.html'.Length)
    } elseif($normalized.EndsWith('.html')){
        $normalized=$normalized.Substring(0,$normalized.Length-'.html'.Length)
    }

    $parts=@($normalized.Split('/') | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if($parts.Count -eq 0){
        return 'WebAct'
    }

    $slug=$parts[$parts.Count-1] -replace '[-_]+',' '
    return (Get-Culture).TextInfo.ToTitleCase($slug)
}

function ConvertTo-SeoAttribute {
    param([AllowEmptyString()][string]$Value)
    if($null -eq $Value){ return '' }
    return [Net.WebUtility]::HtmlEncode($Value)
}

function Get-SeoJsonLdInformation {
    param([string]$Html)
    $blocks=[regex]::Matches($Html,'<script\b[^>]*type=["'']application/ld\+json["''][^>]*>([\s\S]*?)</script>','IgnoreCase')
    $types=New-Object Collections.Generic.List[string]
    $valid=0; $invalid=0
    foreach($block in $blocks){
        $raw=$block.Groups[1].Value.Trim()
        if(-not $raw){ $invalid++; continue }
        try{
            $json=$raw|ConvertFrom-Json -ErrorAction Stop
            $valid++
            $queue=New-Object Collections.Queue
            $queue.Enqueue($json)
            while($queue.Count -gt 0){
                $item=$queue.Dequeue()
                if($null -eq $item){ continue }
                if($item -is [Collections.IEnumerable] -and -not($item -is [string]) -and -not($item -is [pscustomobject])){
                    foreach($child in $item){ $queue.Enqueue($child) }
                    continue
                }
                if($item -is [pscustomobject]){
                    if($item.PSObject.Properties.Name -contains '@type'){
                        $tv=$item.'@type'
                        if($tv -is [Collections.IEnumerable] -and -not($tv -is [string])){
                            foreach($t in $tv){ if($t){ $types.Add([string]$t) } }
                        } elseif($tv){ $types.Add([string]$tv) }
                    }
                    foreach($p in $item.PSObject.Properties){
                        if($p.Value -is [pscustomobject] -or ($p.Value -is [Collections.IEnumerable] -and -not($p.Value -is [string]))){
                            $queue.Enqueue($p.Value)
                        }
                    }
                }
            }
        }catch{ $invalid++ }
    }
    [pscustomobject]@{
        BlockCount=$blocks.Count
        ValidCount=$valid
        InvalidCount=$invalid
        Types=(@($types|Sort-Object -Unique)-join '; ')
        HasOrganization=($types -contains 'Organization' -or $types -contains 'LocalBusiness' -or $types -contains 'ProfessionalService')
        HasWebSite=($types -contains 'WebSite')
        HasWebPage=($types -contains 'WebPage')
        HasService=($types -contains 'Service')
        HasArticle=($types -contains 'Article' -or $types -contains 'BlogPosting' -or $types -contains 'NewsArticle')
        HasBreadcrumb=($types -contains 'BreadcrumbList')
    }
}

Export-ModuleMember -Function *